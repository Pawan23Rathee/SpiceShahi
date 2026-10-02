import React, { useState, useEffect } from 'react';
import { ShipmentTrackingData, Order } from '../types';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  RefreshCw,
  X,
  Copy,
  Check,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface TrackingModalProps {
  order: Order;
  onClose: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ order, onClose }) => {
  const [tracking, setTracking] = useState<ShipmentTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/tracking`);
      if (!res.ok) {
        throw new Error(`Failed to load tracking data (${res.status})`);
      }
      const data = await res.json();
      if (data.tracking) {
        setTracking(data.tracking);
      }
    } catch (err: any) {
      console.error('Error fetching live tracking:', err);
      setError(err.message || 'Unable to load tracking details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [order.id]);

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  // Determine active milestone index (0 to 4)
  const getMilestoneStep = (status?: string): number => {
    if (!status) return 0;
    const s = status.toUpperCase();
    if (s.includes('DELIVERED')) return 4;
    if (s.includes('OUT FOR DELIVERY')) return 3;
    if (s.includes('IN TRANSIT') || s.includes('SHIPPED') || s.includes('REACHED')) return 2;
    if (s.includes('PROCESSING') || s.includes('AWB_ASSIGNED') || s.includes('MANIFEST')) return 1;
    return 0;
  };

  const activeStep = getMilestoneStep(tracking?.currentStatus || order.shiprocketStatus || order.orderStatus);

  const steps = [
    { title: 'Order Placed', subtitle: 'Verified & Confirmed' },
    { title: 'Fresh Milling', subtitle: 'Packed at Bahadurgarh' },
    { title: 'Dispatched', subtitle: 'With Courier Partner' },
    { title: 'Out for Delivery', subtitle: 'Arriving at Destination' },
    { title: 'Delivered', subtitle: 'Delivered to Doorstep' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-2.5 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl border border-[#E8E4D5] max-h-[92vh] overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E4D5]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#96281B]/10 text-[#96281B] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#96281B]">
                  Live Shipment Tracker
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Shiprocket Live
                </span>
              </div>
              <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#2C3E50]">
                Order #{order.orderNumber}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing || loading}
              className="p-2 text-[#5D6D7E] hover:text-[#2C3E50] hover:bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] transition-colors cursor-pointer"
              title="Refresh tracking status"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#96281B]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-[#2C3E50] p-2 text-xl font-bold transition-colors cursor-pointer"
              title="Close tracker"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#96281B] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#2C3E50]">Connecting to Shiprocket Tracking System...</p>
            <p className="text-xs text-[#5D6D7E]">Retrieving latest real-time dispatch updates and scan checkpoints</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{error} Showing latest verified SpiceShahi order state.</span>
              </div>
            )}

            {/* Courier & AWB Details Bar */}
            <div className="bg-[#FCFAF2] p-4 rounded-2xl border border-[#E8E4D5] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5D6D7E] tracking-wider block">
                  Courier Partner
                </span>
                <p className="font-bold text-sm text-[#2C3E50] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#96281B]" />
                  <span>{tracking?.courierName || order.shiprocketCourier || 'SpiceShahi Express Logistics'}</span>
                </p>
                <p className="text-[#5D6D7E] text-[11px]">
                  Fulfillment Hub: Bahadurgarh, Haryana
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#5D6D7E] tracking-wider block">
                  Waybill Number (AWB)
                </span>
                {tracking?.awbCode || order.shiprocketAWB ? (
                  <div className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-[#96281B] bg-white px-2.5 py-1 rounded-lg border border-[#E8E4D5]">
                    <span>{tracking?.awbCode || order.shiprocketAWB}</span>
                    <button
                      onClick={() => handleCopyAwb(tracking?.awbCode || order.shiprocketAWB || '')}
                      className="p-1 hover:text-[#2C3E50] text-[#5D6D7E] transition-colors cursor-pointer"
                      title="Copy AWB Number"
                    >
                      {copiedAwb ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="inline-block text-[11px] font-semibold text-[#5D6D7E] bg-white px-2.5 py-1 rounded-lg border border-[#E8E4D5]">
                    AWB Generation in Progress
                  </span>
                )}
                {tracking?.etd && (
                  <p className="text-[11px] text-[#2D5A27] font-semibold flex items-center sm:justify-end gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Est. Delivery: {tracking.etd}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] uppercase font-bold text-[#5D6D7E] tracking-wider block">
                Fulfillment Progress
              </span>

              <div className="grid grid-cols-5 gap-2 text-center">
                {steps.map((step, idx) => {
                  const isDone = idx <= activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <div key={idx} className="flex flex-col items-center space-y-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isDone
                            ? 'bg-[#2D5A27] text-white'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        } ${isCurrent ? 'ring-4 ring-[#2D5A27]/20 scale-110' : ''}`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-bold leading-tight ${
                          isDone ? 'text-[#2C3E50]' : 'text-stone-400'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[9px] text-[#5D6D7E] hidden sm:block">
                        {step.subtitle}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress track line */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2D5A27] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.max(12, ((activeStep + 1) / steps.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Route strip */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F7F3E8] border border-[#E8E4D5]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#96281B]" />
                <span className="font-semibold text-[#2C3E50]">Origin:</span>
                <span className="text-[#5D6D7E]">{tracking?.origin || 'Bahadurgarh, Haryana'}</span>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="font-semibold text-[#2C3E50]">Destination:</span>
                <span className="text-[#5D6D7E]">
                  {order.customer.city}, {order.customer.state} ({order.customer.pincode})
                </span>
              </div>
            </div>

            {/* Tracking History Scans Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#5D6D7E] tracking-wider block">
                  Scan Timeline & Status Updates ({tracking?.scans?.length || 0})
                </span>
                {tracking?.lastUpdated && (
                  <span className="text-[10px] text-[#5D6D7E] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Synced {new Date(tracking.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                )}
              </div>

              <div className="border border-[#E8E4D5] rounded-2xl overflow-hidden divide-y divide-[#E8E4D5] bg-white">
                {tracking?.scans && tracking.scans.length > 0 ? (
                  [...tracking.scans].reverse().map((scan, idx) => (
                    <div key={idx} className="p-3.5 flex items-start gap-3 hover:bg-[#FCFAF2]/50 transition-colors">
                      <div className="mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#96281B] ring-4 ring-[#96281B]/15" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="font-bold text-xs text-[#2C3E50]">{scan.activity}</p>
                          <span className="text-[10px] text-[#5D6D7E] shrink-0 font-medium">
                            {new Date(scan.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {scan.location && (
                            <span className="text-[11px] text-[#5D6D7E] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D35400]" />
                              <span>{scan.location}</span>
                            </span>
                          )}
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {scan.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#5D6D7E]">
                    Order confirmed. Waiting for first courier scan checkpoint.
                  </div>
                )}
              </div>
            </div>

            {/* External Tracking Link */}
            {(tracking?.trackUrl || tracking?.awbCode || order.shiprocketAWB) && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#5D6D7E]">
                  Official real-time tracking powered by Shiprocket Logistics API.
                </span>

                <a
                  href={
                    tracking?.trackUrl ||
                    `https://shiprocket.co//tracking/${tracking?.awbCode || order.shiprocketAWB}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#2C3E50] hover:bg-[#1a252f] text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <span>Track on Shiprocket Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#F1C40F]" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
