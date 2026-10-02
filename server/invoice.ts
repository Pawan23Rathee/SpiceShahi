import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Order } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INVOICES_DIR = path.resolve(__dirname, '../data/invoices');

export function getInvoiceFileName(orderNumber: string): string {
  return `SpiceShahi-Invoice-${orderNumber}.pdf`;
}

export function getInvoiceFilePath(orderNumber: string): string {
  return path.join(INVOICES_DIR, getInvoiceFileName(orderNumber));
}

/**
 * Generates a professional PDF invoice for an order.
 * Returns the PDF Buffer and optionally saves to disk in data/invoices/
 */
export async function generateInvoicePdf(order: Order, saveToDisk = true): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `SpiceShahi Invoice #${order.orderNumber}`,
          Author: 'SpiceShahi',
          Subject: `Tax Invoice for Order #${order.orderNumber}`,
          Keywords: 'SpiceShahi, Invoice, Spices, Tax Invoice',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        if (saveToDisk) {
          try {
            if (!fs.existsSync(INVOICES_DIR)) {
              fs.mkdirSync(INVOICES_DIR, { recursive: true });
            }
            const filePath = getInvoiceFilePath(order.orderNumber);
            fs.writeFileSync(filePath, pdfBuffer);
          } catch (writeErr) {
            console.error('Failed to write invoice PDF to disk:', writeErr);
          }
        }
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => reject(err));

      const primaryColor = '#96281B'; // Royal Burgundy
      const darkColor = '#2C3E50';
      const grayColor = '#5D6D7E';
      const lightBg = '#FCFAF2';
      const borderColor = '#E8E4D5';
      const greenColor = '#2D5A27';

      const leftMargin = 40;
      const pageWidth = 595.28;
      const contentWidth = pageWidth - leftMargin * 2; // 515.28

      // ==========================================
      // Header Section
      // ==========================================
      // Burgundy header bar
      doc.rect(leftMargin, 40, contentWidth, 70).fill(primaryColor);

      // Brand Title
      doc
        .fillColor('#FFFFFF')
        .font('Times-Bold')
        .fontSize(24)
        .text('SpiceShahi', leftMargin + 20, 52);

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#F1C40F')
        .text('PURE SPICES  •  REAL AROMA  •  COLD-GROUND', leftMargin + 20, 80);

      // Invoice Tag in Header (Right side)
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#FFFFFF')
        .text('TAX INVOICE', leftMargin + contentWidth - 170, 52, { width: 150, align: 'right' });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#E8E4D5')
        .text(`Original for Recipient`, leftMargin + contentWidth - 170, 72, {
          width: 150,
          align: 'right',
        });

      // ==========================================
      // Company & Invoice Meta Info
      // ==========================================
      let y = 125;

      // Company Info (Left)
      doc
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('SpiceShahi', leftMargin, y);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(grayColor)
        .text('SRS Global Enterprises', leftMargin, (y += 14))
        .text('FSSAI Lic No: 20826007001593', leftMargin, (y += 12))
        .text('Gali no 6, ward no 13, Arya nagar', leftMargin, (y += 12))
        .text('Bahadurgarh, Haryana - 124507', leftMargin, (y += 12))
        .fillColor(primaryColor)
        .text('contact@spiceshahi.in', leftMargin, (y += 12))
        .fillColor(grayColor)
        .text('Website: https://spiceshahi.in', leftMargin, (y += 12));

      // Invoice Details Meta Box (Right)
      const metaBoxX = leftMargin + 270;
      const metaBoxWidth = contentWidth - 270;
      let metaY = 125;

      doc
        .rect(metaBoxX, metaY - 5, metaBoxWidth, 90)
        .fillAndStroke(lightBg, borderColor);

      const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const drawMetaRow = (label: string, value: string, isHighlighted = false) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(grayColor)
          .text(label, metaBoxX + 10, metaY, { width: 105 });

        doc
          .font(isHighlighted ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(8.5)
          .fillColor(isHighlighted ? primaryColor : darkColor)
          .text(value, metaBoxX + 115, metaY, { width: metaBoxWidth - 125, align: 'left' });

        metaY += 14;
      };

      drawMetaRow('Invoice Number:', `INV-${order.orderNumber}`, true);
      drawMetaRow('Order ID:', `#${order.orderNumber}`);
      drawMetaRow('Invoice Date:', invoiceDate);
      drawMetaRow('Payment Method:', 'Razorpay (Online)');
      drawMetaRow('Payment Status:', order.paymentStatus === 'PAID' ? 'PAID' : order.paymentStatus);
      if (order.razorpayPaymentId) {
        drawMetaRow('Payment ID:', order.razorpayPaymentId);
      }

      // ==========================================
      // Customer Details (Billing & Shipping)
      // ==========================================
      y = 230;

      const addressBoxWidth = (contentWidth - 15) / 2;

      // Billing Address Box
      doc.rect(leftMargin, y, addressBoxWidth, 95).fillAndStroke(lightBg, borderColor);
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('CUSTOMER / BILL TO', leftMargin + 10, y + 8);

      let custY = y + 24;
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(darkColor)
        .text(order.customer.fullName || 'Valued Customer', leftMargin + 10, custY);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(grayColor)
        .text(`Email: ${order.customer.email}`, leftMargin + 10, (custY += 13))
        .text(`Mobile: ${order.customer.mobile}`, leftMargin + 10, (custY += 12))
        .text(`${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`, leftMargin + 10, (custY += 12))
        .text(order.customer.country || 'India', leftMargin + 10, (custY += 12));

      // Shipping Address Box
      const shipBoxX = leftMargin + addressBoxWidth + 15;
      doc.rect(shipBoxX, y, addressBoxWidth, 95).fillAndStroke(lightBg, borderColor);
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('SHIPPING ADDRESS', shipBoxX + 10, y + 8);

      let shipY = y + 24;
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(darkColor)
        .text(order.customer.fullName, shipBoxX + 10, shipY);

      const addressLine = [order.customer.addressLine1, order.customer.addressLine2]
        .filter(Boolean)
        .join(', ');

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(grayColor)
        .text(addressLine, shipBoxX + 10, (shipY += 13), { width: addressBoxWidth - 20 })
        .text(
          `${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
          shipBoxX + 10,
          (shipY += 18)
        )
        .text(`Contact: ${order.customer.mobile}`, shipBoxX + 10, (shipY += 12));

      // ==========================================
      // Itemized Products Table
      // ==========================================
      y = 340;

      // Table Header Bar
      doc.rect(leftMargin, y, contentWidth, 22).fill(darkColor);

      const col1 = leftMargin + 10; // Product (width: 175)
      const col2 = leftMargin + 185; // Pack Size (width: 65)
      const col3 = leftMargin + 250; // Qty (width: 45)
      const col4 = leftMargin + 295; // Unit Price (width: 65)
      const col5 = leftMargin + 360; // Discount (width: 65)
      const col6 = leftMargin + 425; // Subtotal (width: 80, align: right)

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#FFFFFF')
        .text('Product Description', col1, y + 6, { width: 170 })
        .text('Pack Size', col2, y + 6, { width: 60, align: 'center' })
        .text('Qty', col3, y + 6, { width: 40, align: 'center' })
        .text('Unit Price', col4, y + 6, { width: 60, align: 'right' })
        .text('Discount', col5, y + 6, { width: 60, align: 'right' })
        .text('Subtotal', col6, y + 6, { width: 80, align: 'right' });

      y += 22;

      // Table Rows
      order.items.forEach((item, index) => {
        const isEven = index % 2 === 0;
        const rowHeight = 24;

        if (isEven) {
          doc.rect(leftMargin, y, contentWidth, rowHeight).fill('#FDFBF7');
        } else {
          doc.rect(leftMargin, y, contentWidth, rowHeight).fill('#FFFFFF');
        }

        // Bottom border
        doc
          .moveTo(leftMargin, y + rowHeight)
          .lineTo(leftMargin + contentWidth, y + rowHeight)
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();

        const itemSubtotal = item.subtotal || item.price * item.quantity;

        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(darkColor)
          .text(item.name, col1, y + 7, { width: 170 });

        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(grayColor)
          .text(item.packSize, col2, y + 7, { width: 60, align: 'center' })
          .text(String(item.quantity), col3, y + 7, { width: 40, align: 'center' })
          .text(`Rs. ${item.price.toFixed(2)}`, col4, y + 7, { width: 60, align: 'right' })
          .text('Rs. 0.00', col5, y + 7, { width: 60, align: 'right' });

        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(darkColor)
          .text(`Rs. ${itemSubtotal.toFixed(2)}`, col6, y + 7, { width: 80, align: 'right' });

        y += rowHeight;
      });

      // ==========================================
      // Financial Calculation Breakdown
      // ==========================================
      y += 15;

      const summaryBoxX = leftMargin + 270;
      const summaryBoxWidth = contentWidth - 270;

      // Left note / purity certification
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text('SpiceShahi Quality Guarantee', leftMargin, y);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(grayColor)
        .text(
          '100% pure cold-ground spices crafted with traditional slow-milling. Free from artificial colors, fillers, and adulterants. Packed hygienically at sub-35°C to preserve authentic volatile essential oils.',
          leftMargin,
          y + 14,
          { width: 250, lineGap: 2 }
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(greenColor)
        .text('✓ FSSAI Certified Batch', leftMargin, y + 60);

      // Right calculation summary table
      let sumY = y;
      const drawSumRow = (label: string, amount: string, isTotal = false) => {
        doc
          .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isTotal ? 11 : 9)
          .fillColor(isTotal ? primaryColor : grayColor)
          .text(label, summaryBoxX, sumY, { width: 140 });

        doc
          .font('Helvetica-Bold')
          .fontSize(isTotal ? 11 : 9)
          .fillColor(isTotal ? primaryColor : darkColor)
          .text(amount, summaryBoxX + 140, sumY, {
            width: summaryBoxWidth - 140,
            align: 'right',
          });

        sumY += isTotal ? 22 : 16;
      };

      drawSumRow('Items Subtotal:', `Rs. ${order.subtotal.toFixed(2)}`);
      drawSumRow('Discount:', 'Rs. 0.00');

      const deliveryLabel = order.shippingProvider === 'shiprocket'
        ? `Shipping & Delivery (Shiprocket${order.shippingPincode ? ` - ${order.shippingPincode}` : ''}):`
        : 'Shipping & Delivery:';
      drawSumRow(deliveryLabel, `Rs. ${order.deliveryCharge.toFixed(2)}`);

      // Separator line
      doc
        .moveTo(summaryBoxX, sumY - 2)
        .lineTo(summaryBoxX + summaryBoxWidth, sumY - 2)
        .strokeColor(primaryColor)
        .lineWidth(1)
        .stroke();

      sumY += 4;
      drawSumRow('Grand Total:', `Rs. ${order.grandTotal.toFixed(2)}`, true);

      // Payment verified pill
      doc
        .rect(summaryBoxX, sumY, summaryBoxWidth, 20)
        .fillAndStroke('#E8F5E9', '#A5D6A7');

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(greenColor)
        .text('✓ PAID IN FULL VIA RAZORPAY', summaryBoxX, sumY + 6, {
          width: summaryBoxWidth,
          align: 'center',
        });

      // ==========================================
      // Footer & Authorized Signatory
      // ==========================================
      const footerY = 680;

      doc
        .moveTo(leftMargin, footerY)
        .lineTo(leftMargin + contentWidth, footerY)
        .strokeColor(borderColor)
        .lineWidth(0.75)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(grayColor)
        .text(
          'This is a computer-generated tax invoice and requires no physical signature. Goods once sold are backed by our 100% purity promise.',
          leftMargin,
          footerY + 10,
          { width: 310 }
        )
        .text(
          'For inquiries or support: contact@spiceshahi.in  |  SRS Global Enterprises, Bahadurgarh, Haryana',
          leftMargin,
          footerY + 28,
          { width: 310 }
        );

      // Signatory box
      const signX = leftMargin + contentWidth - 160;
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(darkColor)
        .text('For SRS Global Enterprises', signX, footerY + 10, { width: 160, align: 'center' });

      doc
        .font('Times-Italic')
        .fontSize(12)
        .fillColor(primaryColor)
        .text('SpiceShahi', signX, footerY + 30, { width: 160, align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(grayColor)
        .text('Authorized Signatory', signX, footerY + 46, { width: 160, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
