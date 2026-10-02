import React, { useState, useEffect } from 'react';
import { Page, Order } from '../types';
import { InvoiceView } from '../components/InvoiceView';
import { TrackingModal } from '../components/TrackingModal';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  ShoppingBag,
  FileText,
  Clock,
  MapPin,
  Sparkles,
  User,
  Download,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (page: Page, slug?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading order:', err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#96281B] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#2C3E50]">Fetching your confirmed order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
          Order Not Found
        </h2>
        <p className="text-xs text-[#5D6D7E]">
          We could not locate this order. Please verify your order number or contact support.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 rounded-full bg-[#96281B] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isHaryana = order.deliveryState?.toLowerCase().includes('haryana');
  const deliveryEstimate = isHaryana
    ? '2 – 3 Business Days (Express Haryana Delivery)'
    : '4 – 6 Business Days (Standard Inter-State Delivery)';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl border border-[#E8E4D5] p-8 sm:p-12 text-center shadow-md space-y-4 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-[#2D5A27]/15 mx-auto flex items-center justify-center text-[#2D5A27] animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-full border border-[#2D5A27]/20">
            Payment Verified • Status: {order.paymentStatus}
          </span>
          <h1 className="font-serif italic font-bold text-3xl sm:text-5xl text-[#2C3E50]">
            Order Placed Successfully 🎉
          </h1>
          <p className="text-sm text-[#5D6D7E] max-w-lg mx-auto leading-relaxed">
            Thank you, <strong className="text-[#2C3E50]">{order.customer.fullName}</strong>! Your order for pure, traditionally crafted spices has been received and queued for immediate grinding and dispatch.
          </p>
        </div>

        {/* Order Number Badge */}
        <div className="inline-flex items-center gap-3 bg-[#FCFAF2] border border-[#E8E4D5] px-6 py-3 rounded-2xl">
          <span className="text-xs uppercase tracking-wider text-[#5D6D7E] font-bold">
            Order Reference:
          </span>
          <span className="font-serif font-bold text-2xl text-[#96281B]">
            #{order.orderNumber}
          </span>
        </div>

        {/* Actions Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setShowTrackingModal(true)}
            className="px-6 py-3 rounded-xl bg-[#96281B] hover:bg-[#7D2116] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#F1C40F]" />
            <span>Track Shipment (Live)</span>
          </button>

          <a
            href={`/api/orders/${order.id}/invoice-pdf`}
            download={`SpiceShahi-Invoice-${order.orderNumber}.pdf`}
            className="px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F1C40F]" />
            <span>Download Invoice (PDF)</span>
          </a>

          <button
            id="confirmation-view-invoice-btn"
            onClick={() => setShowInvoiceModal(true)}
            className="px-6 py-3 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#F1C40F]" />
            <span>View & Print Invoice</span>
          </button>

          <button
            onClick={() => onNavigate('account')}
            className="px-6 py-3 rounded-xl border border-[#96281B] text-[#96281B] hover:bg-[#96281B] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>View My Orders & Account</span>
          </button>

          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-3 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] hover:bg-stone-100 text-[#2C3E50] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delivery Status & Tracking Banner */}
      <div className="bg-[#F7F3E8] rounded-2xl border border-[#E8E4D5] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div
          onClick={() => setShowTrackingModal(true)}
          className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8E4D5] hover:border-[#96281B] transition-all cursor-pointer group shadow-2xs"
          title="Click to view live tracking timeline"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2D5A27]/10 group-hover:bg-[#2D5A27] group-hover:text-white border border-[#E8E4D5] flex items-center justify-center text-[#2D5A27] shrink-0 transition-colors">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="font-bold text-[#2C3E50] text-sm">Shipment Tracking</p>
              <span className="text-[10px] font-bold text-[#96281B] group-hover:underline">
                Live ↗
              </span>
            </div>
            <p className="text-[#5D6D7E] mt-0.5 leading-snug">
              {order.shiprocketEtd ? `Est: ${order.shiprocketEtd}` : deliveryEstimate}
            </p>
            {order.shiprocketAWB && (
              <span className="inline-block mt-1 font-mono text-[10px] font-bold bg-[#FCFAF2] px-2 py-0.5 rounded border border-[#E8E4D5] text-[#96281B]">
                AWB: {order.shiprocketAWB}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E4D5] flex items-center justify-center text-[#2D5A27] shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-[#2C3E50] text-sm">Fresh Milling Promise</p>
            <p className="text-[#5D6D7E] mt-0.5 leading-snug">
              Ground at sub-35°C without heating or added synthetic oils.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E4D5] flex items-center justify-center text-[#96281B] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-[#2C3E50] text-sm">Fulfillment Hub</p>
            <p className="text-[#5D6D7E] mt-0.5 leading-snug">
              SRS Global Enterprises, Bahadurgarh, Haryana.
            </p>
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items in Order */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E4D5] p-6 shadow-xs space-y-4">
          <h2 className="font-serif italic font-bold text-xl text-[#2C3E50] pb-3 border-b border-[#E8E4D5]">
            Purchased Spices ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
          </h2>

          <div className="divide-y divide-[#E8E4D5]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] p-1.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-sm text-[#2C3E50] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#5D6D7E] flex items-center gap-2 mt-0.5">
                      <span className="bg-[#F7F3E8] px-2 py-0.5 rounded font-semibold text-[#2C3E50] border border-[#E8E4D5]">
                        {item.packSize}
                      </span>
                      <span>Qty: {item.quantity}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-serif font-bold text-base text-[#2C3E50]">
                    ₹{item.price * item.quantity}
                  </span>
                  <p className="text-[11px] text-[#5D6D7E]">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Payment Breakdown & Delivery Address */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bill Summary */}
          <div className="bg-white rounded-3xl border border-[#E8E4D5] p-6 shadow-xs space-y-4 text-xs">
            <h2 className="font-serif italic font-bold text-xl text-[#2C3E50] pb-2 border-b border-[#E8E4D5]">
              Bill Summary
            </h2>

            <div className="space-y-2 text-[#5D6D7E]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-[#2C3E50]">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {isHaryana ? 'Haryana Delivery Rate:' : 'Standard Delivery:'}
                </span>
                <span className="font-semibold text-[#2C3E50]">₹{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2C3E50] pt-2 border-t border-[#E8E4D5]">
                <span>Grand Total Paid:</span>
                <span className="font-serif text-2xl text-[#96281B]">₹{order.grandTotal}</span>
              </div>
            </div>

            <div className="p-3 bg-[#2D5A27]/10 rounded-xl text-[#2D5A27] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Payment Method: {order.paymentMethod} (PAID)</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl border border-[#E8E4D5] p-6 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 font-serif italic font-bold text-base text-[#2C3E50] pb-2 border-b border-[#E8E4D5]">
              <MapPin className="w-4 h-4 text-[#96281B]" />
              Shipping Destination
            </div>
            <p className="font-bold text-sm text-[#2C3E50]">{order.customer.fullName}</p>
            <p className="text-[#5D6D7E] leading-relaxed">
              {order.customer.addressLine1}
              {order.customer.addressLine2 && `, ${order.customer.addressLine2}`}
              <br />
              {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </p>
            <p className="text-[#5D6D7E] pt-1">
              Phone: <strong className="text-[#2C3E50]">{order.customer.mobile}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Modal Popup */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200 flex justify-center items-start">
          <div className="w-full max-w-4xl">
            <InvoiceView order={order} onClose={() => setShowInvoiceModal(false)} />
          </div>
        </div>
      )}

      {/* Real-Time Tracking Modal */}
      {showTrackingModal && (
        <TrackingModal
          order={order}
          onClose={() => setShowTrackingModal(false)}
        />
      )}
    </div>
  );
};
