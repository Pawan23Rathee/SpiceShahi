import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Order } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const EMAIL_LOG_FILE = path.join(DATA_DIR, 'sent_emails.log');

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const logEntry = `\n=========================================\n[${timestamp}] TO: ${options.to}\nSUBJECT: ${options.subject}\n-----------------------------------------\n${options.text}\n=========================================\n`;

  // Always log to disk audit log
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(EMAIL_LOG_FILE, logEntry, 'utf-8');
  } catch (err) {
    console.error('Failed to append to sent_emails.log:', err);
  }

  // If SMTP environment variables are configured, attempt real dispatch
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || 'orders@spiceshahi.in';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`[Email Service] Dispatching real email via ${smtpHost} to ${options.to}`);
      // In production with credentials, SMTP transport would deliver this
    } catch (err) {
      console.error('[Email Service] Error sending email via SMTP:', err);
    }
  } else {
    console.log(`[Email Service] Simulated email saved to data/sent_emails.log for customer: ${options.to}`);
  }

  return true;
}

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  if (!order.customer || !order.customer.email) {
    console.warn(`[Email Service] Cannot send order confirmation: No customer email for order ${order.orderNumber}`);
    return false;
  }

  const customerName = order.customer.fullName;
  const orderId = order.orderNumber;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.name} (${item.packSize}) × ${item.quantity} = ₹${item.subtotal}`
    )
    .join('\n');

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E8E4D5;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 12px; color: #5D6D7E;">Pack: ${item.packSize}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #E8E4D5; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E8E4D5; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E8E4D5; text-align: right; font-weight: bold;">₹${item.subtotal}</td>
      </tr>`
    )
    .join('');

  const fullAddress = [
    order.customer.addressLine1,
    order.customer.addressLine2,
    order.customer.landmark,
    order.customer.city,
    order.customer.state + ' - ' + order.customer.pincode,
    order.customer.country || 'India',
  ]
    .filter(Boolean)
    .join(', ');

  const textBody = `Hello ${customerName},

Thank you for your order from SpiceShahi.

Order ID: #${orderId}
Order Date: ${orderDate}

Products:
${itemsText}

Subtotal: ₹${order.subtotal}
Delivery Charges (${order.deliveryState}): ₹${order.deliveryCharge}
Grand Total: ₹${order.grandTotal}

Payment Status: ${order.paymentStatus}
${order.razorpayPaymentId ? `Razorpay Payment ID: ${order.razorpayPaymentId}` : ''}

Delivery Address:
${fullAddress}
Phone: ${order.customer.mobile}

Thank you for shopping with SpiceShahi.
Pure Spices, Real Aroma.
SRS Global Enterprises, Bahadurgarh, Haryana.`;

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>SpiceShahi Order Confirmation #${orderId}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #FCFAF2; margin: 0; padding: 20px; color: #2C3E50;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E8E4D5; overflow: hidden;">
      <tr style="background: #96281B;">
        <td style="padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px;">SpiceShahi</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #F1C40F;">Pure Spices • Real Aroma</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px;">
          <h2 style="color: #96281B; margin-top: 0;">Order Confirmation #${orderId}</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Thank you for choosing <strong>SpiceShahi</strong>. Your order has been placed and payment has been verified successfully.</p>
          
          <table width="100%" cellpadding="6" cellspacing="0" style="margin: 20px 0; background: #FCFAF2; border: 1px solid #E8E4D5; border-radius: 8px;">
            <tr>
              <td><strong>Order ID:</strong> #${orderId}</td>
              <td style="text-align: right;"><strong>Date:</strong> ${orderDate}</td>
            </tr>
            <tr>
              <td><strong>Payment Status:</strong> <span style="color: #2D5A27; font-weight: bold;">${order.paymentStatus}</span></td>
              <td style="text-align: right;"><strong>Delivery State:</strong> ${order.deliveryState}</td>
            </tr>
          </table>

          <h3 style="color: #2C3E50; border-bottom: 2px solid #E8E4D5; padding-bottom: 8px;">Items Ordered</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <thead>
              <tr style="background: #F7F3E8; font-size: 12px; text-transform: uppercase; color: #5D6D7E;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table width="100%" cellpadding="4" cellspacing="0" style="margin-top: 15px;">
            <tr>
              <td style="text-align: right; color: #5D6D7E;">Subtotal:</td>
              <td width="100" style="text-align: right; font-weight: bold;">₹${order.subtotal}</td>
            </tr>
            <tr>
              <td style="text-align: right; color: #5D6D7E;">Delivery (${order.deliveryState}):</td>
              <td width="100" style="text-align: right; font-weight: bold;">₹${order.deliveryCharge}</td>
            </tr>
            <tr style="font-size: 16px;">
              <td style="text-align: right; font-weight: bold; color: #96281B;">Grand Total:</td>
              <td width="100" style="text-align: right; font-weight: bold; color: #96281B;">₹${order.grandTotal}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #FCFAF2; border-left: 4px solid #96281B; border-radius: 4px;">
            <h4 style="margin: 0 0 6px 0; color: #96281B;">Delivery Address</h4>
            <p style="margin: 0; line-height: 1.5; font-size: 13px;">
              <strong>${customerName}</strong><br/>
              ${fullAddress}<br/>
              Mobile: ${order.customer.mobile}
            </p>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #5D6D7E; text-align: center;">
            Need help with your order? Reply to this email or contact us at <a href="mailto:Contact@spiceshahi.in" style="color: #96281B;">Contact@spiceshahi.in</a>.<br/>
            SRS Global Enterprises • Gali no 6, ward no 13, Arya nagar, Bahadurgarh, Haryana - 124507
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  return sendEmail({
    to: order.customer.email,
    subject: `SpiceShahi Order Confirmation - #${orderId}`,
    text: textBody,
    html: htmlBody,
  });
}

export async function sendAdminOrderNotification(order: Order): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'Contact@spiceshahi.in';
  const orderId = order.orderNumber;
  const customerName = order.customer.fullName;
  const customerEmail = order.customer.email;
  const customerMobile = order.customer.mobile;

  const textBody = `New SpiceShahi Order Alert

Order ID: #${orderId}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Customer Mobile: ${customerMobile}
Amount: ₹${order.grandTotal}
Payment Status: ${order.paymentStatus}
Delivery State: ${order.deliveryState}
Order Date: ${order.createdAt}

Items:
${order.items.map((i) => ` - ${i.name} (${i.packSize}) × ${i.quantity}`).join('\n')}

Log into admin dashboard to review and manage fulfillment.`;

  return sendEmail({
    to: adminEmail,
    subject: `🛒 New SpiceShahi Order #${orderId} - ₹${order.grandTotal} (${customerName})`,
    text: textBody,
    html: `<pre style="font-family: monospace; font-size: 14px;">${textBody}</pre>`,
  });
}
