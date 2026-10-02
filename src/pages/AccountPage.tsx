import React, { useState, useEffect } from 'react';
import { Page, Order, SavedAddress } from '../types';
import { useAuth } from '../context/AuthContext';
import { TrackingModal } from '../components/TrackingModal';
import {
  User,
  Package,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Printer,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  Clock,
  ChevronRight,
  Eye,
  Truck,
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (page: Page, slugOrId?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const {
    customer,
    token,
    isAuthenticated,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Address Modal/Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Haryana');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Profile Form State
  const [profName, setProfName] = useState('');
  const [profMobile, setProfMobile] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (customer) {
      setProfName(customer.fullName || '');
      setProfMobile(customer.mobile || '');
    }

    // Fetch customer's orders
    if (token) {
      setIsLoadingOrders(true);
      fetch('/api/customer/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : { orders: [] }))
        .then((data) => {
          setOrders(data.orders || []);
        })
        .catch((e) => console.error('Error loading customer orders:', e))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [isAuthenticated, token, customer]);

  if (!isAuthenticated || !customer) {
    return null;
  }

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrFullName(customer.fullName || '');
    setAddrMobile(customer.mobile || '');
    setAddrLine1('');
    setAddrLine2('');
    setAddrLandmark('');
    setAddrCity('');
    setAddrState('Haryana');
    setAddrPincode('');
    setAddrIsDefault(customer.savedAddresses.length === 0);
    setAddressError('');
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || 'Home');
    setAddrFullName(addr.fullName);
    setAddrMobile(addr.mobile);
    setAddrLine1(addr.addressLine1);
    setAddrLine2(addr.addressLine2 || '');
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrIsDefault(addr.isDefault);
    setAddressError('');
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!addrFullName || !addrMobile || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      setAddressError('Please fill in all required address fields.');
      return;
    }

    const payload = {
      label: addrLabel,
      fullName: addrFullName.trim(),
      mobile: addrMobile.trim(),
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim(),
      landmark: addrLandmark.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      country: 'India',
      isDefault: addrIsDefault,
    };

    if (editingAddressId) {
      const res = await updateAddress(editingAddressId, payload);
      if (!res.success) {
        setAddressError(res.error || 'Failed to update address.');
        return;
      }
    } else {
      const res = await addAddress(payload);
      if (!res.success) {
        setAddressError(res.error || 'Failed to save address.');
        return;
      }
    }

    setShowAddressModal(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsUpdatingProfile(true);

    const res = await updateProfile(profName, profMobile);
    setIsUpdatingProfile(false);

    if (res.success) {
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Account Hero Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#E8E4D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-linear-to-tr from-[#96281B] to-[#D35400] text-white flex items-center justify-center font-serif text-xl sm:text-2xl font-bold shadow-md shrink-0">
            {customer.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-[#2C3E50] truncate">
                {customer.fullName}
              </h1>
              {customer.googleId && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                  Google Linked
                </span>
              )}
            </div>
            <p className="text-xs text-[#5D6D7E] flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="truncate">{customer.email}</span>
              {customer.mobile && <span>• {customer.mobile}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E8E4D5] gap-2 sm:gap-8 overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#96281B] text-[#96281B]'
              : 'border-transparent text-[#5D6D7E] hover:text-[#2C3E50]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-[#96281B] text-[#96281B]'
              : 'border-transparent text-[#5D6D7E] hover:text-[#2C3E50]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({customer.savedAddresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#96281B] text-[#96281B]'
              : 'border-transparent text-[#5D6D7E] hover:text-[#2C3E50]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {isLoadingOrders ? (
            <div className="p-12 text-center text-xs text-[#5D6D7E] bg-white rounded-3xl border border-[#E8E4D5]">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E4D5] shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mx-auto flex items-center justify-center">
                <Package className="w-6 h-6 text-[#96281B]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C3E50]">No orders placed yet</h3>
                <p className="text-xs text-[#5D6D7E] max-w-sm mx-auto mt-1">
                  You haven’t placed any orders with SpiceShahi yet. Browse our pure spices and start your authentic culinary journey!
                </p>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-2.5 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Explore Spices
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E8E4D5] p-5 sm:p-6 shadow-xs hover:border-[#96281B]/40 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4D5]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="font-mono font-bold text-sm text-[#2C3E50]">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                          {order.paymentStatus}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {order.shiprocketStatus || order.orderStatus}
                        </span>
                        {order.shiprocketAWB && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-[#2C3E50] border border-stone-200 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-[#96281B]" />
                            <span>AWB: {order.shiprocketAWB}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5D6D7E] mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Placed on{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {order.shiprocketCourier && (
                          <span className="hidden sm:inline text-stone-400">• Via {order.shiprocketCourier}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2D5A27] text-white hover:bg-[#23471f] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Track Real-Time Delivery"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#F1C40F]" />
                        <span>Track Order</span>
                      </button>

                      <button
                        onClick={() => onNavigate('invoice', order.id)}
                        className="px-3.5 py-1.5 rounded-lg border border-[#E8E4D5] text-[#2C3E50] hover:bg-[#FCFAF2] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download / Print Official Invoice"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#96281B]" />
                        <span>Invoice</span>
                      </button>

                      <button
                        onClick={() =>
                          setSelectedOrderDetails(
                            selectedOrderDetails?.id === order.id ? null : order
                          )
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-[#96281B] text-white hover:bg-[#7D2116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{selectedOrderDetails?.id === order.id ? 'Close' : 'View'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#2C3E50]">
                    <div>
                      <span className="text-[#5D6D7E]">Items: </span>
                      <span className="font-semibold">
                        {order.items.map((i) => `${i.name} (${i.packSize}) × ${i.quantity}`).join(', ')}
                      </span>
                    </div>
                    <div className="text-right sm:text-right shrink-0">
                      <span className="text-[#5D6D7E]">Grand Total: </span>
                      <span className="font-bold text-sm text-[#96281B]">₹{order.grandTotal}</span>
                    </div>
                  </div>

                  {/* Expanded Order Details Modal / Drawer */}
                  {selectedOrderDetails?.id === order.id && (
                    <div className="pt-4 border-t border-[#E8E4D5] space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FCFAF2] p-4 rounded-xl border border-[#E8E4D5] text-xs">
                        <div>
                          <p className="font-bold text-[#96281B] uppercase tracking-wider text-[10px] mb-1">
                            Delivery Address
                          </p>
                          <p className="font-semibold">{order.customer.fullName}</p>
                          <p className="text-[#5D6D7E]">
                            {order.customer.addressLine1}
                            {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ''}
                          </p>
                          <p className="text-[#5D6D7E]">
                            {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                          </p>
                          <p className="text-[#5D6D7E] mt-1">Phone: {order.customer.mobile}</p>
                        </div>

                        <div>
                          <p className="font-bold text-[#96281B] uppercase tracking-wider text-[10px] mb-1">
                            Payment Details
                          </p>
                          <p>
                            <span className="text-[#5D6D7E]">Method: </span>
                            <span className="font-semibold">{order.paymentMethod}</span>
                          </p>
                          {order.razorpayPaymentId && (
                            <p>
                              <span className="text-[#5D6D7E]">Razorpay ID: </span>
                              <span className="font-mono text-[11px]">{order.razorpayPaymentId}</span>
                            </p>
                          )}
                          <p className="mt-1">
                            <span className="text-[#5D6D7E]">Delivery Rate: </span>
                            <span className="font-semibold">
                              {order.deliveryState} (₹{order.deliveryCharge})
                            </span>
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-[#96281B] uppercase tracking-wider text-[10px] mb-1">
                            Shipment & Live Tracking
                          </p>
                          <p>
                            <span className="text-[#5D6D7E]">Courier: </span>
                            <span className="font-semibold">{order.shiprocketCourier || 'Shiprocket Partner'}</span>
                          </p>
                          <p>
                            <span className="text-[#5D6D7E]">AWB: </span>
                            <span className="font-mono font-semibold text-[#96281B]">
                              {order.shiprocketAWB || 'Assigned after milling'}
                            </span>
                          </p>
                          <button
                            onClick={() => setTrackingOrder(order)}
                            className="mt-2 w-full py-1.5 px-3 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#F1C40F]" />
                            <span>View Live Tracking</span>
                          </button>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-stone-50 text-[10px] uppercase font-bold text-[#5D6D7E]">
                            <tr>
                              <th className="py-2 px-3">Item</th>
                              <th className="py-2 px-3 text-center">Pack</th>
                              <th className="py-2 px-3 text-center">Qty</th>
                              <th className="py-2 px-3 text-right">Price</th>
                              <th className="py-2 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8E4D5]">
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                                <td className="py-2.5 px-3 text-center text-[#5D6D7E]">{item.packSize}</td>
                                <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                                <td className="py-2.5 px-3 text-right">₹{item.price}</td>
                                <td className="py-2.5 px-3 text-right font-bold">₹{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#2C3E50]">Delivery Addresses</h2>
              <p className="text-xs text-[#5D6D7E]">
                Saved addresses autofill automatically during checkout for rapid 1-click orders.
              </p>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="px-4 py-2.5 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {customer.savedAddresses.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8E4D5] shadow-xs space-y-3">
              <MapPin className="w-8 h-8 text-[#96281B] mx-auto opacity-70" />
              <p className="text-sm font-semibold text-[#2C3E50]">No saved addresses yet</p>
              <p className="text-xs text-[#5D6D7E] max-w-sm mx-auto">
                Add your home or office address once, and you’ll never have to type it again during checkout!
              </p>
              <button
                onClick={handleOpenAddAddress}
                className="px-5 py-2 bg-[#96281B] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                + Add First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl border transition-all relative space-y-3 ${
                    addr.isDefault
                      ? 'bg-white border-[#96281B] shadow-sm ring-1 ring-[#96281B]'
                      : 'bg-white border-[#E8E4D5] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#96281B] bg-[#FCFAF2] px-2.5 py-0.5 rounded-md border border-[#E8E4D5]">
                      {addr.label || 'Address'}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-[#2D5A27] bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-0.5 text-[#2C3E50]">
                    <p className="font-bold text-sm">{addr.fullName}</p>
                    <p className="text-[#5D6D7E]">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    </p>
                    {addr.landmark && (
                      <p className="text-[#5D6D7E] italic">Landmark: {addr.landmark}</p>
                    )}
                    <p className="text-[#5D6D7E]">
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </p>
                    <p className="text-[#5D6D7E] pt-1">Phone: {addr.mobile}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E4D5] text-xs">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] font-semibold text-[#5D6D7E] hover:text-[#96281B] cursor-pointer"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#2D5A27] font-semibold">Primary Address</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-1.5 text-stone-500 hover:text-[#2C3E50] rounded cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1.5 text-stone-500 hover:text-red-600 rounded cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#2C3E50]">Personal Profile</h2>
            <p className="text-xs text-[#5D6D7E]">
              Update your basic information across all SpiceShahi orders.
            </p>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Registered Email (Permanent)
              </label>
              <input
                type="email"
                disabled
                value={customer.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-stone-100 text-xs text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-[#5D6D7E] mt-1 block">
                Verified account email for receipts and billing invoices.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={profMobile}
                onChange={(e) => setProfMobile(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="py-3 px-6 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Address Edit/Add Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E8E4D5] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D5]">
              <h3 className="text-base font-bold text-[#2C3E50]">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {addressError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="flex gap-2">
                {['Home', 'Office', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrLabel(lbl)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      addrLabel === lbl
                        ? 'bg-[#96281B] text-white border-[#96281B]'
                        : 'bg-[#FCFAF2] text-[#2C3E50] border-[#E8E4D5]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrMobile}
                    onChange={(e) => setAddrMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">
                  Address Line 1 (House/Flat/Street) *
                </label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="e.g. Haryana"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3E50] mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D5]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-default-addr"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded border-[#E8E4D5] text-[#96281B]"
                />
                <label htmlFor="modal-default-addr" className="text-xs text-[#2C3E50] cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8E4D5]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D6D7E] hover:text-[#2C3E50] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-Time Live Tracking Modal */}
      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </div>
  );
};
