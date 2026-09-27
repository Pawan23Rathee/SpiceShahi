import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { Order } from '../src/types.js';
import { generateInvoicePdf, getInvoiceFileName, getInvoiceFilePath } from './invoice.js';
import { updateOrder } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const EMAIL_LOG_FILE = path.join(DATA_DIR, 'sent_emails.log');

// In-flight dispatch set to prevent concurrent double-sends for the same order
const inFlightDispatches = new Set<string>();

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendMailOptions {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
}

/**
 * Returns configured Nodemailer transport if SMTP credentials are provided,
 * or null if in test/development simulation mode.
 */
function getMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
}

/**
 * Universal email dispatcher:
 * - Sends via real SMTP when configured in environment.
 * - Logs to data/sent_emails.log and data/invoices/ for transparent local auditing & simulation.
 */
export async function sendEmail(options: SendMailOptions): Promise<boolean> {
  const fromEmail = process.env.FROM_EMAIL || 'contact@spiceshahi.in';
  const fromName = process.env.FROM_NAME || 'SpiceShahi';
  const sender = options.from || `"${fromName}" <${fromEmail}>`;

  const timestamp = new Date().toISOString();
  const attachmentList = options.attachments
    ? options.attachments.map((a) => a.filename).join(', ')
    : 'None';

  const logEntry = `
================================================================================
[${timestamp}] TRANSACTIONAL EMAIL DISPATCH
FROM: ${sender}
TO: ${options.to}
SUBJECT: ${options.subject}
ATTACHMENTS: ${attachmentList}
--------------------------------------------------------------------------------
${options.text}
================================================================================
`;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(EMAIL_LOG_FILE, logEntry, 'utf-8');
  } catch (err) {
    console.error('[Email Service] Failed to write to email log:', err);
  }

  const transport = getMailTransport();

  if (transport) {
    try {
      console.log(`[Email Service] Delivering via SMTP server to: ${options.to} (${options.subject})`);
      await transport.sendMail({
        from: sender,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          path: att.path,
          contentType: att.contentType || 'application/pdf',
        })),
      });
      console.log(`[Email Service] Successfully dispatched to ${options.to}`);
      return true;
    } catch (err) {
      console.error(`[Email Service] SMTP dispatch error to ${options.to}:`, err);
      // Still return true for application flow since email was logged to disk
      return false;
    }
  } else {
    console.log(
      `[Email Service] Simulated email recorded in data/sent_emails.log for: ${options.to} (Attachments: ${attachmentList})`
    );
    return true;
  }
}

/**
 * Sends Customer Order Confirmation Email with attached PDF Invoice.
 * Follows exact user specifications for FROM header, subject, branding, and contents.
 */
export async function sendCustomerOrderConfirmationEmail(
  order: Order,
  pdfInvoiceBuffer: Buffer
): Promise<boolean> {
  if (!order.customer || !order.customer.email) {
    console.warn(`[Email Service] Cannot send customer confirmation: No email found for order ${order.orderNumber}`);
    return false;
  }

  const fromEmail = process.env.FROM_EMAIL || 'contact@spiceshahi.in';
  const fromName = process.env.FROM_NAME || 'SpiceShahi';
  const sender = `"${fromName}" <${fromEmail}>`;

  const orderId = order.orderNumber;
  const customerName = order.customer.fullName;
  const customerEmail = order.customer.email;
  const customerMobile = order.customer.mobile;
  const paymentStatus = order.paymentStatus;
  const razorpayPaymentId = order.razorpayPaymentId || 'N/A';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fullAddress = [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.landmark ? `Near ${order.customer.landmark}` : '',
    order.customer.city,
    order.customer.state + ' - ' + order.customer.pincode,
    order.customer.country || 'India',
  ]
    .filter(Boolean)
    .join(', ');

  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.name} (${item.packSize}) | Qty: ${item.quantity} | Unit Price: ₹${item.price} | Subtotal: ₹${
          item.subtotal || item.price * item.quantity
        }`
    )
    .join('\n');

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E8E4D5;">
        <td style="padding: 12px 10px; text-align: left; vertical-align: top;">
          <strong style="color: #2C3E50; font-size: 14px;">${item.name}</strong>
          ${item.hindiName ? `<br/><span style="font-size: 11px; color: #7F8C8D; font-style: italic;">${item.hindiName}</span>` : ''}
        </td>
        <td style="padding: 12px 10px; text-align: center; vertical-align: top;">
          <span style="background-color: #F7F3E8; padding: 3px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #E8E4D5; color: #2C3E50;">
            ${item.packSize}
          </span>
        </td>
        <td style="padding: 12px 10px; text-align: center; vertical-align: top; color: #2C3E50; font-weight: bold;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 10px; text-align: right; vertical-align: top; color: #5D6D7E; font-size: 13px;">
          ₹${item.price.toFixed(2)}
        </td>
        <td style="padding: 12px 10px; text-align: right; vertical-align: top; color: #2C3E50; font-weight: bold; font-size: 14px;">
          ₹${(item.subtotal || item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  // Plain Text Version
  const textBody = `Hello ${customerName},

Thank you for choosing SpiceShahi! Your order has been placed and payment has been verified successfully.

==================================================
ORDER CONFIRMATION: #${orderId}
==================================================
Customer Name: ${customerName}
Order ID: #${orderId}
Order Date: ${orderDate}
Payment Status: ${paymentStatus}
Razorpay Payment ID: ${razorpayPaymentId}
Customer Mobile: ${customerMobile}
Delivery Address: ${fullAddress}

--------------------------------------------------
PRODUCTS ORDERED:
--------------------------------------------------
${itemsText}

--------------------------------------------------
PAYMENT SUMMARY:
--------------------------------------------------
Product Subtotal: ₹${order.subtotal.toFixed(2)}
Discount: ₹0.00
Delivery Charge (${order.deliveryState}): ₹${order.deliveryCharge.toFixed(2)}
Final Total: ₹${order.grandTotal.toFixed(2)}

Payment Method: Razorpay (PAID)
Razorpay Payment ID: ${razorpayPaymentId}

Your official Tax Invoice (SpiceShahi-Invoice-${orderId}.pdf) has been attached to this email.

Need help or want to track your package?
Email us at: ${fromEmail}
Website: https://spiceshahi.in

SpiceShahi • SRS Global Enterprises
Pure Spices • Real Aroma • Cold-Ground
Bahadurgarh, Haryana - 124507
`;

  // Rich HTML Version
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmed — SpiceShahi Order #${orderId}</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FCFAF2; margin: 0; padding: 24px 10px; color: #2C3E50; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E8E4D5; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    <!-- Brand Header -->
    <tr style="background-color: #96281B;">
      <td style="padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-family: Georgia, serif; letter-spacing: 1px; color: #ffffff;">SpiceShahi</h1>
        <p style="margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #F1C40F; font-weight: bold;">
          Pure Spices • Real Aroma • Cold-Ground
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: #E8F5E9; color: #2D5A27; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 20px; border: 1px solid #A5D6A7; text-transform: uppercase; letter-spacing: 1px;">
            ✓ Payment Verified • Status: ${paymentStatus}
          </span>
          <h2 style="color: #96281B; margin: 16px 0 8px 0; font-size: 24px; font-family: Georgia, serif;">
            Order Confirmed!
          </h2>
          <p style="color: #5D6D7E; font-size: 14px; margin: 0;">
            Thank you, <strong>${customerName}</strong>. Your order has been confirmed and is being freshly ground and packed.
          </p>
        </div>

        <!-- Order Meta Card -->
        <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #FCFAF2; border: 1px solid #E8E4D5; border-radius: 10px; margin-bottom: 24px; font-size: 13px;">
          <tr>
            <td style="color: #5D6D7E; width: 45%;"><strong>Order Reference:</strong></td>
            <td style="text-align: right; color: #96281B; font-weight: bold; font-size: 15px;">#${orderId}</td>
          </tr>
          <tr style="border-top: 1px solid #E8E4D5;">
            <td style="color: #5D6D7E;"><strong>Order Date:</strong></td>
            <td style="text-align: right; color: #2C3E50;">${orderDate}</td>
          </tr>
          <tr style="border-top: 1px solid #E8E4D5;">
            <td style="color: #5D6D7E;"><strong>Payment Method:</strong></td>
            <td style="text-align: right; color: #2C3E50; font-weight: bold;">Razorpay (Online)</td>
          </tr>
          <tr style="border-top: 1px solid #E8E4D5;">
            <td style="color: #5D6D7E;"><strong>Razorpay Payment ID:</strong></td>
            <td style="text-align: right; font-family: monospace; font-size: 12px; color: #2C3E50;">${razorpayPaymentId}</td>
          </tr>
          <tr style="border-top: 1px solid #E8E4D5;">
            <td style="color: #5D6D7E;"><strong>Customer Mobile:</strong></td>
            <td style="text-align: right; color: #2C3E50; font-weight: bold;">${customerMobile}</td>
          </tr>
        </table>

        <!-- Products Table -->
        <h3 style="color: #2C3E50; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #E8E4D5; padding-bottom: 8px;">
          Products Ordered
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #2C3E50; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 10px; text-align: left; border-top-left-radius: 6px;">Product</th>
              <th style="padding: 10px; text-align: center;">Pack Size</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Unit Price</th>
              <th style="padding: 10px; text-align: right; border-top-right-radius: 6px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Pricing Breakdown -->
        <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 24px; font-size: 13px;">
          <tr>
            <td style="text-align: right; color: #5D6D7E;">Product Subtotal:</td>
            <td width="120" style="text-align: right; font-weight: bold; color: #2C3E50;">₹${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; color: #5D6D7E;">Discount:</td>
            <td width="120" style="text-align: right; font-weight: bold; color: #27AE60;">- ₹0.00</td>
          </tr>
          <tr>
            <td style="text-align: right; color: #5D6D7E;">Delivery Charge (${order.deliveryState}):</td>
            <td width="120" style="text-align: right; font-weight: bold; color: #2C3E50;">₹${order.deliveryCharge.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #96281B;">
            <td style="text-align: right; font-weight: bold; color: #96281B; font-size: 16px; padding-top: 10px;">Final Total Paid:</td>
            <td width="120" style="text-align: right; font-weight: bold; color: #96281B; font-size: 18px; padding-top: 10px;">₹${order.grandTotal.toFixed(2)}</td>
          </tr>
        </table>

        <!-- Delivery Address Box -->
        <div style="background-color: #FCFAF2; border-left: 4px solid #96281B; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px; font-size: 13px;">
          <h4 style="margin: 0 0 6px 0; color: #96281B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
            Delivery Address
          </h4>
          <p style="margin: 0; line-height: 1.6; color: #2C3E50;">
            <strong>${customerName}</strong><br/>
            ${fullAddress}<br/>
            Mobile: <strong>${customerMobile}</strong>
          </p>
        </div>

        <!-- Attachment Notice -->
        <div style="background-color: #F7F3E8; border: 1px dashed #D35400; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center; font-size: 13px;">
          <p style="margin: 0; color: #96281B; font-weight: bold;">
            📄 Attached: Official Tax Invoice (${getInvoiceFileName(orderId)})
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #5D6D7E;">
            Contains complete itemized breakdown, tax declaration, and FSSAI credentials.
          </p>
        </div>

        <!-- Footer Contact -->
        <div style="border-top: 1px solid #E8E4D5; padding-top: 20px; text-align: center; font-size: 12px; color: #7F8C8D;">
          <p style="margin: 0 0 4px 0;">
            Questions or instructions for delivery? Reach us at
            <a href="mailto:${fromEmail}" style="color: #96281B; font-weight: bold; text-decoration: none;">${fromEmail}</a>
          </p>
          <p style="margin: 0; line-height: 1.5;">
            SRS Global Enterprises • Arya Nagar, Bahadurgarh, Haryana - 124507<br/>
            FSSAI Lic No: 20826007001593 • Website: <a href="https://spiceshahi.in" style="color: #96281B; text-decoration: none;">spiceshahi.in</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    from: sender,
    to: customerEmail,
    subject: `Order Confirmed — SpiceShahi Order #${orderId}`,
    text: textBody,
    html: htmlBody,
    attachments: [
      {
        filename: getInvoiceFileName(orderId),
        content: pdfInvoiceBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

/**
 * Sends Admin Order Notification Email with attached PDF Invoice.
 * Sent to ADMIN_NOTIFICATION_EMAIL (contact@spiceshahi.in).
 */
export async function sendAdminOrderNotificationEmail(
  order: Order,
  pdfInvoiceBuffer: Buffer
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@spiceshahi.in';
  const fromEmail = process.env.FROM_EMAIL || 'contact@spiceshahi.in';
  const fromName = process.env.FROM_NAME || 'SpiceShahi';
  const sender = `"${fromName} Orders" <${fromEmail}>`;

  const orderId = order.orderNumber;
  const customerName = order.customer.fullName;
  const customerEmail = order.customer.email;
  const customerPhone = order.customer.mobile;
  const paymentStatus = order.paymentStatus;
  const razorpayPaymentId = order.razorpayPaymentId || 'N/A';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fullShippingAddress = [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.landmark ? `Near ${order.customer.landmark}` : '',
    order.customer.city,
    order.customer.state + ' - ' + order.customer.pincode,
    order.customer.country || 'India',
  ]
    .filter(Boolean)
    .join(', ');

  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.name} | Pack: ${item.packSize} | Qty: ${item.quantity} | Unit: ₹${item.price} | Total: ₹${
          item.subtotal || item.price * item.quantity
        }`
    )
    .join('\n');

  const textBody = `New SpiceShahi Order Alert

A new order has been paid and confirmed on SpiceShahi:

Customer Name: ${customerName}
Customer Email: ${customerEmail}
Customer Phone: ${customerPhone}
Order ID: #${orderId}
Order Date: ${orderDate}

Products:
${itemsList}

Subtotal: ₹${order.subtotal.toFixed(2)}
Delivery Charge: ₹${order.deliveryCharge.toFixed(2)}
Discount: ₹0.00
Grand Total: ₹${order.grandTotal.toFixed(2)}

Payment Status: ${paymentStatus}
Razorpay Payment ID: ${razorpayPaymentId}
Complete Shipping Address:
${fullShippingAddress}

Attached: ${getInvoiceFileName(orderId)}

Log into the admin portal to manage packing and dispatch.`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New SpiceShahi Order — #${orderId}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #FCFAF2; margin: 0; padding: 20px; color: #2C3E50;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E8E4D5; overflow: hidden;">
    <tr style="background: #2C3E50;">
      <td style="padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; color: #F1C40F;">🛒 New SpiceShahi Paid Order — #${orderId}</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #ECF0F1;">Grand Total: ₹${order.grandTotal.toFixed(2)} • Razorpay Verified</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; font-size: 13px; line-height: 1.6;">
        <table width="100%" cellpadding="6" cellspacing="0" style="background: #FCFAF2; border: 1px solid #E8E4D5; border-radius: 8px; margin-bottom: 18px;">
          <tr><td><strong>Customer Name:</strong></td><td>${customerName}</td></tr>
          <tr><td><strong>Customer Email:</strong></td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
          <tr><td><strong>Customer Phone:</strong></td><td><strong>${customerPhone}</strong></td></tr>
          <tr><td><strong>Order ID:</strong></td><td><strong>#${orderId}</strong></td></tr>
          <tr><td><strong>Order Date:</strong></td><td>${orderDate}</td></tr>
          <tr><td><strong>Payment Status:</strong></td><td><span style="color: #2D5A27; font-weight: bold;">${paymentStatus}</span></td></tr>
          <tr><td><strong>Razorpay Payment ID:</strong></td><td><code>${razorpayPaymentId}</code></td></tr>
        </table>

        <h3 style="color: #96281B; margin-top: 16px; border-bottom: 2px solid #E8E4D5; padding-bottom: 6px;">Products</h3>
        <pre style="background: #F7F3E8; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; overflow-x: auto;">${itemsList}</pre>

        <table width="100%" cellpadding="4" cellspacing="0" style="margin: 16px 0;">
          <tr><td style="text-align: right; color: #5D6D7E;">Subtotal:</td><td width="100" style="text-align: right; font-weight: bold;">₹${order.subtotal.toFixed(2)}</td></tr>
          <tr><td style="text-align: right; color: #5D6D7E;">Delivery Charge:</td><td width="100" style="text-align: right; font-weight: bold;">₹${order.deliveryCharge.toFixed(2)}</td></tr>
          <tr><td style="text-align: right; color: #5D6D7E;">Discount:</td><td width="100" style="text-align: right; font-weight: bold;">₹0.00</td></tr>
          <tr style="font-size: 15px; font-weight: bold; color: #96281B;"><td style="text-align: right;">Grand Total:</td><td width="100" style="text-align: right;">₹${order.grandTotal.toFixed(2)}</td></tr>
        </table>

        <div style="background: #FCFAF2; border-left: 4px solid #2C3E50; padding: 12px 16px; border-radius: 4px; margin-top: 16px;">
          <h4 style="margin: 0 0 6px 0; color: #2C3E50;">Complete Shipping Address</h4>
          <p style="margin: 0; line-height: 1.5;">${fullShippingAddress}</p>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #7F8C8D; text-align: center;">
          The official Tax Invoice PDF (<code>${getInvoiceFileName(orderId)}</code>) is attached.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    from: sender,
    to: adminEmail,
    subject: `New SpiceShahi Order — #${orderId}`,
    text: textBody,
    html: htmlBody,
    attachments: [
      {
        filename: getInvoiceFileName(orderId),
        content: pdfInvoiceBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

/**
 * High-level orchestration for verified paid orders:
 * 1. Verifies order is PAID (never sends for PENDING, FAILED, or CANCELLED)
 * 2. Checks duplicate protection (never sends if confirmationEmailSent is already true)
 * 3. Prevents race conditions with in-memory lock
 * 4. Generates PDF invoice
 * 5. Sends customer email with invoice attached
 * 6. Sends admin email with invoice attached
 * 7. Records sent timestamps and invoice generation state in persistent storage
 */
export async function dispatchOrderPaidEmails(
  order: Order
): Promise<{
  success: boolean;
  customerEmailSent: boolean;
  adminEmailSent: boolean;
  reason?: string;
}> {
  // Gate 1: Payment Verification Check
  if (order.paymentStatus !== 'PAID') {
    console.warn(
      `[Email Service] Skipping invoice/email for order ${order.orderNumber}: paymentStatus is ${order.paymentStatus}, not PAID`
    );
    return {
      success: false,
      customerEmailSent: false,
      adminEmailSent: false,
      reason: `Order is not marked as PAID (status: ${order.paymentStatus})`,
    };
  }

  // Gate 2: Duplicate Email Protection
  if (order.confirmationEmailSent) {
    console.warn(
      `[Email Service] Duplicate prevented: Confirmation email already sent for order ${order.orderNumber} at ${order.confirmationEmailSentAt}`
    );
    return {
      success: true,
      customerEmailSent: false,
      adminEmailSent: false,
      reason: 'Duplicate protection: confirmation email already dispatched',
    };
  }

  // Gate 3: In-flight race lock
  if (inFlightDispatches.has(order.id)) {
    console.warn(`[Email Service] In-flight email dispatch already active for order ${order.orderNumber}`);
    return {
      success: true,
      customerEmailSent: false,
      adminEmailSent: false,
      reason: 'Dispatch already in-flight',
    };
  }

  inFlightDispatches.add(order.id);

  try {
    console.log(`[Email Service] Generating PDF invoice for verified order #${order.orderNumber}...`);
    const invoicePdfBuffer = await generateInvoicePdf(order, true);
    const invoiceFileName = getInvoiceFileName(order.orderNumber);

    console.log(`[Email Service] Sending customer confirmation email to: ${order.customer.email}`);
    const customerSent = await sendCustomerOrderConfirmationEmail(order, invoicePdfBuffer);

    console.log(`[Email Service] Sending admin notification email with invoice...`);
    const adminSent = await sendAdminOrderNotificationEmail(order, invoicePdfBuffer);

    // Update order with persistence
    updateOrder(order.id, {
      confirmationEmailSent: true,
      confirmationEmailSentAt: new Date().toISOString(),
      adminEmailSent: true,
      adminEmailSentAt: new Date().toISOString(),
      invoiceGenerated: true,
      invoiceFileName: invoiceFileName,
    });

    console.log(`[Email Service] Order #${order.orderNumber} emails dispatched and saved successfully.`);

    return {
      success: true,
      customerEmailSent: customerSent,
      adminEmailSent: adminSent,
    };
  } catch (err: any) {
    console.error(`[Email Service] Error during invoice/email dispatch for #${order.orderNumber}:`, err);
    return {
      success: false,
      customerEmailSent: false,
      adminEmailSent: false,
      reason: err?.message || 'Error generating invoice or dispatching emails',
    };
  } finally {
    inFlightDispatches.delete(order.id);
  }
}
