import React from 'react';
import { Order, StoreSettings } from '../types';
import { Printer, Download, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

interface InvoiceViewProps {
  order: Order;
  settings?: StoreSettings;
  onClose?: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, settings, onClose }) => {
  const isHaryana = order.deliveryState?.toLowerCase().includes('haryana');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-[#2C3E50] p-6 sm:p-10 rounded-3xl border border-[#E8E4D5] shadow-xl max-w-4xl mx-auto my-6 print:m-0 print:p-8 print:shadow-none print:border-none print:rounded-none">
      {/* Header Actions (hidden on print) */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E8E4D5] print:hidden">
        {onClose ? (
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5D6D7E] hover:text-[#2C3E50] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order Confirmation</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <a
            href={`/api/orders/${order.id}/invoice-pdf`}
            download={`SpiceShahi-Invoice-${order.orderNumber}.pdf`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2C3E50] hover:bg-[#1a252f] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F1C40F]" />
            <span>Download PDF</span>
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#96281B] hover:bg-[#7D2116] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Body */}
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#E8E4D5]">
          <div className="flex items-center gap-4">
            <img
              src="/images/spiceshahi-logo.jpg"
              alt="SpiceShahi Logo"
              className="w-16 h-16 rounded-full object-cover border border-[#F39C12]/50 shadow-sm"
            />
            <div>
              <h1 className="font-serif italic font-bold text-3xl text-[#96281B]">
                SpiceShahi
              </h1>
              <p className="text-xs uppercase tracking-widest text-[#5D6D7E] font-bold">
                Desi Khushboo Spices & Masalas
              </p>
              <p className="text-[11px] text-[#5D6D7E] mt-0.5">
                SRS Global Enterprises • FSSAI Lic: <strong>20826007001593</strong>
              </p>
              <p className="text-[11px] text-[#5D6D7E]">
                Arya Nagar, Bahadurgarh, Haryana - 124507
              </p>
              <p className="text-[11px] text-[#96281B] font-semibold mt-0.5">
                contact@spiceshahi.in • Website: https://spiceshahi.in
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-[#2D5A27]/10 text-[#2D5A27] font-bold text-xs uppercase tracking-wider rounded-md border border-[#2D5A27]/30">
              Tax Invoice / Receipt
            </span>
            <p className="font-serif font-bold text-lg text-[#2C3E50]">
              Invoice #{order.orderNumber}
            </p>
            <p className="text-xs text-[#5D6D7E]">
              Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-[#2D5A27] pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: {order.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Bill To & Ship To Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2">
          <div className="p-4 rounded-2xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#96281B] block mb-1">
              Billed & Shipped To:
            </span>
            <p className="font-bold text-sm text-[#2C3E50]">{order.customer.fullName}</p>
            <p className="text-[#5D6D7E]">{order.customer.addressLine1}</p>
            {order.customer.addressLine2 && (
              <p className="text-[#5D6D7E]">{order.customer.addressLine2}</p>
            )}
            <p className="text-[#5D6D7E]">
              {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </p>
            <p className="text-[#5D6D7E] pt-1">
              Phone: <strong className="text-[#2C3E50]">{order.customer.mobile}</strong>
            </p>
            {order.customer.email && (
              <p className="text-[#5D6D7E]">Email: {order.customer.email}</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#96281B] block mb-1">
              Payment & Dispatch Info:
            </span>
            <div className="flex justify-between">
              <span className="text-[#5D6D7E]">Payment Method:</span>
              <span className="font-bold text-[#2C3E50]">Online (Razorpay / UPI / Card)</span>
            </div>
            {order.razorpayOrderId && (
              <div className="flex justify-between">
                <span className="text-[#5D6D7E]">Razorpay Order:</span>
                <span className="font-mono text-[11px] text-[#2C3E50]">{order.razorpayOrderId}</span>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div className="flex justify-between">
                <span className="text-[#5D6D7E]">Transaction ID:</span>
                <span className="font-mono text-[11px] text-[#2C3E50]">{order.razorpayPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#5D6D7E]">Fulfillment Hub:</span>
              <span className="text-[#2C3E50]">Bahadurgarh Central Mill, Haryana</span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#2C3E50] text-[#FCFAF2] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 rounded-l-xl">No.</th>
                <th className="py-3 px-4">Spice Product</th>
                <th className="py-3 px-4">Pack Size</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D5]">
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FCFAF2]/60">
                  <td className="py-3.5 px-4 font-mono text-[#5D6D7E]">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-[#2C3E50]">
                    {item.name}
                    {item.hindiName && (
                      <span className="block text-[11px] font-normal italic text-[#5D6D7E]">
                        {item.hindiName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#F7F3E8] px-2 py-0.5 rounded border border-[#E8E4D5] text-[#2C3E50] font-semibold text-[11px]">
                      {item.packSize}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#2C3E50]">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-[#5D6D7E]">₹{item.price}</td>
                  <td className="py-3.5 px-4 text-right font-serif font-bold text-[#2C3E50]">
                    ₹{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-[#E8E4D5]">
          <div className="max-w-xs text-xs text-[#5D6D7E] space-y-1">
            <p className="font-bold text-[#2C3E50]">Declaration & Purity Seal:</p>
            <p className="leading-relaxed">
              We certify that this invoice shows the actual price of spices described and all particulars are true and pure. 100% pure, traditionally crafted with zero adulteration.
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-[#5D6D7E]">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-[#2C3E50]">₹{order.subtotal}</span>
            </div>

            <div className="flex justify-between py-1 text-[#5D6D7E]">
              <span>
                {isHaryana ? 'Haryana Delivery:' : 'Delivery Charges:'}
              </span>
              <span className="font-semibold text-[#2C3E50]">₹{order.deliveryCharge}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-[#2C3E50] text-sm font-bold text-[#2C3E50]">
              <span>Grand Total:</span>
              <span className="font-serif text-xl text-[#96281B]">₹{order.grandTotal}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#2D5A27]/10 text-center text-[#2D5A27] font-bold text-[11px]">
              Payment Verified & Paid in Full (₹{order.grandTotal})
            </div>
          </div>
        </div>

        {/* Signatures & Footer Note */}
        <div className="pt-8 border-t border-[#E8E4D5] flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-[#5D6D7E]">
          <div>
            <p>Thank you for choosing genuine purity from SpiceShahi.</p>
            <p className="font-serif italic text-[11px] text-[#96281B]">
              "Desi Khushboo, Sacred Purity."
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="font-serif font-bold text-[#2C3E50]">For SRS Global Enterprises</p>
            <div className="h-10"></div>
            <p className="text-[10px] uppercase tracking-wider text-[#5D6D7E] border-t border-[#E8E4D5] pt-1">
              Authorized Signatory • Bahadurgarh (Haryana)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
