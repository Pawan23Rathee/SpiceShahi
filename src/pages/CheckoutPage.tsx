import React, { useState, useEffect } from 'react';
import { Page, CustomerDetails, SavedAddress } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services';
import { INDIAN_STATES, getStateFromPincode } from '../data/indianStates';
import { ENABLE_WHATSAPP } from '../config/features';
import { WhatsAppCheckoutHelp } from '../components/WhatsAppComponents';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  Lock,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Plus,
  MapPin,
  User,
  Mail,
  Phone,
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: Page, slug?: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, totalItems, subtotal, clearCart, deliverySettings } = useCart();
  const { customer, token, isAuthenticated } = useAuth();

  // Selected saved address ID or 'new'
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: 'Haryana',
    pincode: '',
    label: 'Home',
    saveForFuture: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated modal for test mode when Razorpay live keys are not set
  const [testModalOrder, setTestModalOrder] = useState<any>(null);

  // Pre-fill from authenticated customer profile or default address
  useEffect(() => {
    if (customer) {
      if (customer.savedAddresses && customer.savedAddresses.length > 0) {
        const defaultAddr = customer.savedAddresses.find((a) => a.isDefault) || customer.savedAddresses[0];
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId('new');
        setAddressForm((prev) => ({
          ...prev,
          fullName: customer.fullName || '',
          mobile: customer.mobile || '',
        }));
      }
    }
  }, [customer]);

  // Load Razorpay Checkout Script
  useEffect(() => {
    const existingScript = document.getElementById('razorpay-checkout-js');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Determine current active delivery state and address details
  const getActiveAddress = (): {
    fullName: string;
    mobile: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  } => {
    const customerEmail = customer?.email || 'customer@spiceshahi.in';

    if (selectedAddressId !== 'new' && customer?.savedAddresses) {
      const saved = customer.savedAddresses.find((a) => a.id === selectedAddressId);
      if (saved) {
        return {
          fullName: saved.fullName,
          mobile: saved.mobile,
          email: customerEmail,
          addressLine1: saved.addressLine1,
          addressLine2: saved.addressLine2,
          landmark: saved.landmark,
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
          country: saved.country || 'India',
        };
      }
    }

    return {
      fullName: addressForm.fullName,
      mobile: addressForm.mobile,
      email: customerEmail,
      addressLine1: addressForm.addressLine1,
      addressLine2: addressForm.addressLine2,
      landmark: addressForm.landmark,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      country: 'India',
    };
  };

  const activeAddress = getActiveAddress();
  const isHaryana = (activeAddress.state || '').trim().toLowerCase() === 'haryana';
  const deliveryCharge =
    items.length === 0
      ? 0
      : isHaryana
      ? deliverySettings.haryana
      : deliverySettings.outsideHaryana;
  const grandTotal = subtotal + deliveryCharge;

  // Auto-detect state if pincode is typed in new address
  const handlePincodeChange = (pin: string) => {
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);
    const detectedState = getStateFromPincode(cleanPin);
    setAddressForm((prev) => ({
      ...prev,
      pincode: cleanPin,
      state: detectedState || prev.state,
    }));
    if (formErrors.pincode) {
      setFormErrors((prev) => ({ ...prev, pincode: '' }));
    }
  };

  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};

    if (selectedAddressId === 'new') {
      if (!addressForm.fullName.trim()) {
        errors.fullName = 'Full Name is required.';
      }
      const cleanMobile = addressForm.mobile.replace(/\D/g, '');
      if (!cleanMobile || cleanMobile.length < 10) {
        errors.mobile = 'Enter a valid 10-digit mobile number.';
      }
      if (!addressForm.addressLine1.trim()) {
        errors.addressLine1 = 'House/Flat No., Street or Colony is required.';
      }
      if (!addressForm.city.trim()) {
        errors.city = 'City/District is required.';
      }
      if (!addressForm.state.trim()) {
        errors.state = 'State is required.';
      }
      if (!addressForm.pincode || addressForm.pincode.length !== 6) {
        errors.pincode = 'Enter a valid 6-digit Indian PIN code.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // If user is not logged in, show mandatory login / registration prompt
  if (!isAuthenticated || !customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mx-auto flex items-center justify-center text-[#96281B] shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3E50]">
            Customer Sign-In Required
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D7E] max-w-md mx-auto">
            Please log in or create an account to proceed to checkout. Your delivery addresses, orders, and official invoices will be securely linked to your profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-sm mx-auto">
          <button
            onClick={() => onNavigate('login')}
            className="w-full py-3.5 px-6 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-colors cursor-pointer"
          >
            Sign In with Email / Google
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="w-full py-3.5 px-6 bg-white hover:bg-stone-50 border border-[#E8E4D5] text-[#2C3E50] rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
          >
            Register New Account
          </button>
        </div>

        <div className="pt-6 border-t border-[#E8E4D5] text-xs text-[#5D6D7E]">
          <button
            onClick={() => onNavigate('cart')}
            className="inline-flex items-center gap-1.5 hover:text-[#96281B] font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mx-auto flex items-center justify-center text-[#96281B]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#2C3E50]">Your Spice Basket is Empty</h2>
        <p className="text-xs text-[#5D6D7E]">
          Please add our cold-ground spices to your basket before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-full font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
        >
          Explore Handcrafted Spices
        </button>
      </div>
    );
  }

  const handleProceedToPayment = async () => {
    setErrorMessage(null);

    if (!validateAddress()) {
      setErrorMessage('Please correct the highlighted fields in your delivery address.');
      platformService.scrollTo(100);
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        customer: activeAddress,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          hindiName: i.hindiName,
          packSize: i.packSize,
          weightInGrams: i.weightInGrams,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
          imageUrl: i.imageUrl,
        })),
        saveAddress: selectedAddressId === 'new' && addressForm.saveForFuture,
        addressLabel: addressForm.label,
      };

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create payment order on server.');
      }

      const orderData = await res.json();

      // Check if Razorpay script is loaded and we have real key ID
      if (!orderData.isTestMode && window.Razorpay && orderData.keyId) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: 'INR',
          name: 'SpiceShahi Spices & Masalas',
          description: `Order #${orderData.orderNumber}`,
          image: '/images/spiceshahi-logo.jpg',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: activeAddress.fullName,
            email: activeAddress.email,
            contact: activeAddress.mobile,
          },
          theme: {
            color: '#96281B',
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                const vErr = await verifyRes.json();
                throw new Error(vErr.error || 'Payment signature verification failed.');
              }

              clearCart();
              onNavigate('order-confirmation', orderData.orderId);
            } catch (vErr: any) {
              setErrorMessage(`Payment verification failed: ${vErr.message}`);
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failedResp: any) => {
          setIsProcessing(false);
          setErrorMessage(
            failedResp.error?.description || 'Payment was unsuccessful or cancelled by user.'
          );
        });
        rzp.open();
      } else {
        // Fallback test mode simulation when live Razorpay keys are not in environment
        setTestModalOrder(orderData);
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!testModalOrder) return;
    setIsProcessing(true);
    try {
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: testModalOrder.orderId,
          razorpayOrderId: testModalOrder.razorpayOrderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_valid_sig',
          isTestBypass: true,
        }),
      });

      if (!verifyRes.ok) {
        throw new Error('Simulation verification failed');
      }

      clearCart();
      setTestModalOrder(null);
      onNavigate('order-confirmation', testModalOrder.orderId);
    } catch (e: any) {
      setErrorMessage(e.message || 'Payment simulation error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5D6D7E] hover:text-[#96281B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
        <span className="text-xs text-[#5D6D7E]">
          Secure Checkout • Authenticated as <strong>{customer.email}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Customer Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E4D5] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] flex items-center justify-center text-[#96281B]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2C3E50]">
                  Ordering as: <span className="text-[#96281B]">{customer.fullName}</span>
                </p>
                <p className="text-[11px] text-[#5D6D7E] flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{customer.email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('account')}
              className="text-xs font-bold text-[#96281B] hover:underline cursor-pointer"
            >
              My Account
            </button>
          </div>

          {/* Delivery Address Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4D5] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E4D5] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#96281B]/10 text-[#96281B] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#2C3E50]">
                    Select Delivery Address
                  </h2>
                  <p className="text-xs text-[#5D6D7E]">
                    Delivery: Haryana ₹50 • Rest of India ₹100
                  </p>
                </div>
              </div>
            </div>

            {/* Saved Addresses List */}
            {customer.savedAddresses && customer.savedAddresses.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50]">
                  Saved Addresses:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customer.savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const addrIsHaryana = addr.state.trim().toLowerCase() === 'haryana';
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                          isSelected
                            ? 'bg-[#FCFAF2] border-[#96281B] shadow-sm ring-2 ring-[#96281B]'
                            : 'bg-white border-[#E8E4D5] hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-[#E8E4D5] text-[#96281B]">
                            {addr.label || 'Home'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              addrIsHaryana
                                ? 'bg-green-50 text-green-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {addrIsHaryana ? 'Haryana (₹50)' : 'Other State (₹100)'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#2C3E50]">{addr.fullName}</p>
                        <p className="text-[11px] text-[#5D6D7E] leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </p>
                        <p className="text-[11px] text-[#5D6D7E]">
                          {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                        <p className="text-[11px] text-[#5D6D7E] mt-1">Phone: {addr.mobile}</p>
                      </div>
                    );
                  })}

                  {/* Add New Address Card Selector */}
                  <div
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      selectedAddressId === 'new'
                        ? 'bg-[#FCFAF2] border-[#96281B] text-[#96281B]'
                        : 'border-[#E8E4D5] text-[#5D6D7E] hover:border-stone-400'
                    }`}
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      + Deliver to a New Address
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* New Address Form (if selected or no saved addresses) */}
            {selectedAddressId === 'new' && (
              <div className="pt-4 border-t border-[#E8E4D5] space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C3E50]">
                    Enter New Shipping Details
                  </h3>
                  <div className="flex gap-2">
                    {['Home', 'Office', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressForm((p) => ({ ...p, label: lbl }))}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer border ${
                          addressForm.label === lbl
                            ? 'bg-[#96281B] text-white border-[#96281B]'
                            : 'bg-white text-[#2C3E50] border-[#E8E4D5]'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => {
                        setAddressForm((p) => ({ ...p, fullName: e.target.value }));
                        if (formErrors.fullName) setFormErrors((p) => ({ ...p, fullName: '' }));
                      }}
                      placeholder="e.g. Pawan Rathee"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2C3E50] bg-[#FCFAF2] ${
                        formErrors.fullName ? 'border-red-500' : 'border-[#E8E4D5]'
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Mobile Number (10 digits) *
                    </label>
                    <input
                      type="tel"
                      value={addressForm.mobile}
                      onChange={(e) => {
                        setAddressForm((p) => ({ ...p, mobile: e.target.value }));
                        if (formErrors.mobile) setFormErrors((p) => ({ ...p, mobile: '' }));
                      }}
                      placeholder="e.g. 9812345678"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2C3E50] bg-[#FCFAF2] ${
                        formErrors.mobile ? 'border-red-500' : 'border-[#E8E4D5]'
                      }`}
                    />
                    {formErrors.mobile && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.mobile}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                    Complete Address (House/Flat No., Street, Colony) *
                  </label>
                  <input
                    type="text"
                    value={addressForm.addressLine1}
                    onChange={(e) => {
                      setAddressForm((p) => ({ ...p, addressLine1: e.target.value }));
                      if (formErrors.addressLine1) setFormErrors((p) => ({ ...p, addressLine1: '' }));
                    }}
                    placeholder="House 107, Arya Nagar"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2C3E50] bg-[#FCFAF2] ${
                      formErrors.addressLine1 ? 'border-red-500' : 'border-[#E8E4D5]'
                    }`}
                  />
                  {formErrors.addressLine1 && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.addressLine1}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Address Line 2 (Apartment, Floor, Suite)
                    </label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))
                      }
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs text-[#2C3E50] bg-[#FCFAF2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.landmark}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, landmark: e.target.value }))
                      }
                      placeholder="Near Community Center"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs text-[#2C3E50] bg-[#FCFAF2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="124507"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2C3E50] bg-[#FCFAF2] ${
                        formErrors.pincode ? 'border-red-500' : 'border-[#E8E4D5]'
                      }`}
                    />
                    {formErrors.pincode && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.pincode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm((p) => ({ ...p, city: e.target.value }));
                        if (formErrors.city) setFormErrors((p) => ({ ...p, city: '' }));
                      }}
                      placeholder="Bahadurgarh"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2C3E50] bg-[#FCFAF2] ${
                        formErrors.city ? 'border-red-500' : 'border-[#E8E4D5]'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[10px] text-red-600 mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Delivery State *
                    </label>
                    <select
                      value={addressForm.state}
                      onChange={(e) => {
                        setAddressForm((p) => ({ ...p, state: e.target.value }));
                        if (formErrors.state) setFormErrors((p) => ({ ...p, state: '' }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs text-[#2C3E50] bg-[#FCFAF2]"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.name} {s.name === 'Haryana' ? '(Delivery: ₹50)' : '(Delivery: ₹100)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveForFuture"
                    checked={addressForm.saveForFuture}
                    onChange={(e) =>
                      setAddressForm((p) => ({ ...p, saveForFuture: e.target.checked }))
                    }
                    className="rounded border-[#E8E4D5] text-[#96281B] focus:ring-[#96281B]"
                  />
                  <label htmlFor="saveForFuture" className="text-xs text-[#2C3E50] cursor-pointer">
                    Save this address to my customer profile for future orders
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Payment */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4D5] shadow-xs space-y-6">
            <h2 className="text-base font-serif font-bold text-[#2C3E50] border-b border-[#E8E4D5] pb-4">
              Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-[#E8E4D5]/60">
              {items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-lg border border-[#E8E4D5] bg-[#FCFAF2] p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#2C3E50] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#5D6D7E]">
                        {item.packSize} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#2C3E50] shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8E4D5] text-xs">
              <div className="flex items-center justify-between text-[#5D6D7E]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#2C3E50]">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-[#5D6D7E]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#96281B]" />
                  <span>
                    Delivery ({activeAddress.state || 'Haryana'}):
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#2C3E50]">₹{deliveryCharge}</span>
                  <span className="text-[10px] text-[#96281B] block font-semibold">
                    {isHaryana ? 'Haryana Local Rate' : 'National Dispatch'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8E4D5] text-sm font-bold text-[#2C3E50]">
                <span>Grand Total</span>
                <span className="text-lg font-serif text-[#96281B]">₹{grandTotal}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button: Pay with Razorpay */}
            <button
              id="checkout-pay-razorpay-btn"
              onClick={handleProceedToPayment}
              disabled={isProcessing}
              className="w-full py-4 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Securing Payment Order...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{grandTotal} via Razorpay</span>
                </>
              )}
            </button>

            {/* Security Guarantee */}
            <div className="pt-2 text-center text-[11px] text-[#5D6D7E] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
              <span>100% Encrypted & Authenticated Transaction</span>
            </div>

            {ENABLE_WHATSAPP && (
              <WhatsAppCheckoutHelp className="mt-3" />
            )}
          </div>
        </div>
      </div>

      {/* Test Mode Simulation Modal (shown when live Razorpay keys are not in environment) */}
      {testModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E8E4D5] shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-tr from-[#96281B] to-[#D35400] text-white flex items-center justify-center shadow-md">
                <CreditCard className="w-6 h-6 text-[#F1C40F]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                  Razorpay Checkout Gateway
                </h3>
                <p className="text-[11px] text-[#5D6D7E]">
                  Order #{testModalOrder.orderNumber} • ₹{testModalOrder.grandTotal}
                </p>
              </div>
            </div>

            <div className="bg-[#FCFAF2] p-4 rounded-xl border border-[#E8E4D5] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5D6D7E]">Customer:</span>
                <span className="font-semibold">{activeAddress.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6D7E]">Receipt Email:</span>
                <span className="font-semibold">{activeAddress.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6D7E]">Delivery State:</span>
                <span className="font-semibold">{activeAddress.state} (₹{deliveryCharge})</span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#E8E4D5] pt-2 text-[#96281B]">
                <span>Total Payable:</span>
                <span>₹{testModalOrder.grandTotal}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#5D6D7E] text-center">
              (Live Razorpay credentials not active in environment. Confirm simulated payment to verify backend signature, invoice generation, and customer email dispatch.)
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTestModalOrder(null)}
                className="flex-1 py-3 rounded-xl border border-[#E8E4D5] text-xs font-semibold text-[#5D6D7E] hover:text-[#2C3E50] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              >
                {isProcessing ? 'Verifying...' : 'Simulate Success (PAID)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
