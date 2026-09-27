import React, { useState, useEffect, useRef } from 'react';
import { Page, Order, OrderStatus, PaymentStatus, StoreSettings } from '../types';
import { InvoiceView } from '../components/InvoiceView';
import {
  ShieldCheck,
  Lock,
  LogOut,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  IndianRupee,
  Search,
  Filter,
  Eye,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  FileText,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: Page, slug?: string) => void;
}

// Audio Chime Synthesizer using Web Audio API
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('spiceshahi_admin_token') || sessionStorage.getItem('spiceshahi_admin_token');
  });
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Store Settings state
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Notification state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveNotification, setLiveNotification] = useState<{
    title: string;
    message: string;
    orderId?: string;
  } | null>(null);

  // Check login & load initial data
  useEffect(() => {
    if (!token) return;
    loadDashboardStats();
    loadOrders();
    loadSettings();

    // Setup Server-Sent Events (SSE) for real-time mobile/admin order notifications
    const eventSource = new EventSource('/api/admin/events');

    eventSource.addEventListener('new-order', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (soundEnabled) {
          playOrderChime();
        }
        setLiveNotification(payload);
        setTimeout(() => setLiveNotification(null), 9000);

        // Browser push notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.title || '🛒 New SpiceShahi Order', {
            body: payload.message || 'A new paid order has arrived!',
            icon: '/images/spiceshahi-logo.jpg',
          });
        }

        // Refresh stats & orders list
        loadDashboardStats();
        loadOrders();
      } catch (err) {
        console.error('Error handling SSE notification:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [token]);

  // Request browser notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const loadDashboardStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    }
  };

  const loadOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (paymentFilter !== 'ALL') params.append('paymentStatus', paymentFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load store settings', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setToken(data.token);
      localStorage.setItem('spiceshahi_admin_token', data.token);
      requestNotificationPermission();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('spiceshahi_admin_token');
    sessionStorage.removeItem('spiceshahi_admin_token');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        loadDashboardStats();
      }
    } catch (e) {
      console.error('Failed to update order status', e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settings) return;
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    } finally {
      setSavingSettings(false);
    }
  };

  const [clearDataStatus, setClearDataStatus] = useState<string | null>(null);
  const [isClearingData, setIsClearingData] = useState(false);

  const handleClearTestData = async () => {
    if (!token) return;
    if (!window.confirm('Clear all simulated and test orders? All real customer orders will remain completely untouched.')) return;
    setIsClearingData(true);
    try {
      const res = await fetch('/api/admin/clear-test-data', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClearDataStatus(data.message || 'Test data successfully removed.');
      loadDashboardStats();
      loadOrders();
      setTimeout(() => setClearDataStatus(null), 5000);
    } catch (e) {
      console.error('Failed to clear test data', e);
    } finally {
      setIsClearingData(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: '🛒 New SpiceShahi Order Alert',
          message: 'Order alert system operational • Sound & push alerts enabled',
          orderId: 'SYS_TEST',
        }),
      });
    } catch (e) {
      console.error('Failed to send test notification', e);
    }
  };

  // -------------------------------------------------------------
  // VIEW: Admin Login Screen
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E4D5] shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/images/spiceshahi-logo.jpg"
              alt="SpiceShahi Logo"
              className="w-16 h-16 rounded-full mx-auto object-cover border border-[#F39C12]/40 shadow-sm"
            />
            <h1 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
              SpiceShahi Admin Portal
            </h1>
            <p className="text-xs text-[#5D6D7E]">
              Secure order management, revenue analytics, and delivery settings
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider block mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:outline-hidden focus:ring-2 focus:ring-[#96281B]"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:outline-hidden focus:ring-2 focus:ring-[#96281B]"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-400 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Verifying...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="p-3 bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] text-[11px] text-[#5D6D7E] space-y-1">
            <p className="font-bold text-[#2C3E50]">Default Admin Access:</p>
            <p>Username: <code className="font-mono text-[#96281B]">admin</code></p>
            <p>Password: <code className="font-mono text-[#96281B]">SpiceShahi@2026</code></p>
            <p className="text-[10px] text-stone-400 pt-1">Credentials can be customized in .env</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Authenticated Dashboard
  // -------------------------------------------------------------
  const metrics = dashboardData?.metrics || {
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
  };

  const last7Days = dashboardData?.last7Days || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time Push Notification Floating Banner */}
      {liveNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm bg-white border-2 border-[#2D5A27] rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2D5A27]/20 flex items-center justify-center text-[#2D5A27] shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-[#2C3E50]">{liveNotification.title}</h4>
              <p className="text-xs text-[#5D6D7E] mt-0.5">{liveNotification.message}</p>
              {liveNotification.orderId && (
                <button
                  onClick={() => {
                    const found = orders.find((o) => o.id === liveNotification.orderId);
                    if (found) setSelectedOrder(found);
                    setLiveNotification(null);
                  }}
                  className="mt-2 text-[11px] font-bold text-[#96281B] hover:underline"
                >
                  View Order Details →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4D5]">
        <div className="flex items-center gap-3">
          <img
            src="/images/spiceshahi-logo.jpg"
            alt="SpiceShahi"
            className="w-12 h-12 rounded-full object-cover border border-[#F39C12]/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
                SpiceShahi Management Console
              </h1>
              <span className="text-[10px] bg-[#2D5A27]/10 text-[#2D5A27] font-bold px-2 py-0.5 rounded-full border border-[#2D5A27]/30">
                Live Server
              </span>
            </div>
            <p className="text-xs text-[#5D6D7E]">
              Bahadurgarh Central Hub • FSSAI 20826007001593
            </p>
          </div>
        </div>

        {/* Action Buttons: Sound, Test Notification, Logout */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-white border-[#E8E4D5] text-[#2D5A27]'
                : 'bg-stone-100 border-stone-300 text-stone-400'
            }`}
            title={soundEnabled ? 'Chime Alert Enabled' : 'Chime Alert Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSendTestNotification}
            className="px-3 py-2 bg-white border border-[#E8E4D5] hover:bg-[#FCFAF2] text-xs font-semibold text-[#2C3E50] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Trigger a test audio/push notification"
          >
            <Bell className="w-3.5 h-3.5 text-[#D35400]" />
            <span className="hidden md:inline">Test Alert</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#96281B] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E4D5] space-x-8 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#96281B] text-[#96281B]'
              : 'border-transparent text-[#5D6D7E] hover:text-[#2C3E50]'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => {
            setActiveTab('orders');
            loadOrders();
          }}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#96281B] text-[#96281B]'
              : 'border-transparent text-[#5D6D7E] hover:text-[#2C3E50]'
          }`}
        >
          Orders Management ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#96281B] text-[#96281B]'
              : 'border-transparent text-[#5D6D7E] hover:text-[#2C3E50]'
          }`}
        >
          Delivery & Brand Settings
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: OVERVIEW & METRICS
         ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5D6D7E]">
                Total Lifetime Revenue
              </span>
              <p className="font-serif italic font-bold text-3xl text-[#96281B]">
                ₹{metrics.totalRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#2D5A27] font-semibold">
                ✓ Verified via Razorpay
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5D6D7E]">
                Today's Revenue
              </span>
              <p className="font-serif italic font-bold text-3xl text-[#2C3E50]">
                ₹{metrics.todayRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#5D6D7E]">
                {metrics.todayOrders} orders placed today
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5D6D7E]">
                This Month's Revenue
              </span>
              <p className="font-serif italic font-bold text-3xl text-[#D35400]">
                ₹{metrics.thisMonthRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#5D6D7E]">Active billing period</p>
            </div>
          </div>

          {/* Order Status Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#5D6D7E] font-bold">Total</span>
              <p className="font-serif font-bold text-2xl text-[#2C3E50]">{metrics.totalOrders}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#D35400] font-bold">New</span>
              <p className="font-serif font-bold text-2xl text-[#D35400]">{metrics.pendingOrders}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#2D5A27] font-bold">Confirmed</span>
              <p className="font-serif font-bold text-2xl text-[#2D5A27]">{metrics.confirmedOrders}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Processing</span>
              <p className="font-serif font-bold text-2xl text-blue-600">{metrics.processingOrders || 0}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold">Shipped</span>
              <p className="font-serif font-bold text-2xl text-purple-600">{metrics.shippedOrders}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Delivered</span>
              <p className="font-serif font-bold text-2xl text-emerald-600">{metrics.deliveredOrders}</p>
            </div>
          </div>

          {/* 7-Day Sales Trend Visual Chart */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
                Last 7 Days Revenue Trend
              </h3>
              <span className="text-xs text-[#5D6D7E]">Daily Verified Sales</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-6 items-end h-44 border-b border-[#E8E4D5] pb-2">
              {last7Days.map((d: any, idx: number) => {
                const maxRev = Math.max(...last7Days.map((x: any) => x.revenue), 1000);
                const heightPercent = Math.max(10, Math.round((d.revenue / maxRev) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#96281B] opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{d.revenue}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] bg-[#96281B]/80 hover:bg-[#96281B] rounded-t-lg transition-all"
                    />
                    <span className="text-[11px] font-medium text-[#5D6D7E]">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Access to Recent Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
                Recent Orders
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#96281B] hover:underline uppercase tracking-wider"
              >
                View All Orders →
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E4D5] overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FCFAF2] border-b border-[#E8E4D5] text-[#5D6D7E] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4D5]">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FCFAF2]/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#96281B]">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#2C3E50]">
                        {ord.customer.fullName}
                        <span className="block text-[11px] text-[#5D6D7E]">{ord.customer.mobile}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5D6D7E]">
                        {ord.deliveryState}
                        <span className="block text-[10px]">₹{ord.deliveryCharge} fee</span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#2C3E50]">
                        ₹{ord.grandTotal}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D5A27]/10 text-[#2D5A27]">
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F39C12]/20 text-[#D35400]">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1 bg-[#2C3E50] text-white rounded-lg text-xs font-semibold hover:bg-[#1a252f] transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: ORDERS MANAGEMENT
         ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4D5] shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#5D6D7E] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by order #, name, mobile, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadOrders();
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#96281B]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-[#5D6D7E]">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTimeout(loadOrders, 50);
                }}
                className="text-xs bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl px-2.5 py-1.5 font-medium text-[#2C3E50]"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setTimeout(loadOrders, 50);
                }}
                className="text-xs bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl px-2.5 py-1.5 font-medium text-[#2C3E50]"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>

              <button
                onClick={loadOrders}
                className="p-2 text-[#5D6D7E] hover:text-[#2C3E50] hover:bg-[#FCFAF2] rounded-xl border border-[#E8E4D5]"
                title="Refresh Orders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-[#E8E4D5] overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FCFAF2] border-b border-[#E8E4D5] text-[#5D6D7E] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination State</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4D5]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FCFAF2]/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#96281B]">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#2C3E50]">
                      {ord.customer.fullName}
                      <span className="block text-[11px] text-[#5D6D7E]">{ord.customer.mobile}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5D6D7E]">
                      {ord.deliveryState}
                      <span className="block text-[10px] font-semibold text-[#2C3E50]">
                        ₹{ord.deliveryCharge} delivery
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5D6D7E]">
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} packs
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#2C3E50]">
                      ₹{ord.grandTotal}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.paymentStatus === 'PAID'
                          ? 'bg-[#2D5A27]/10 text-[#2D5A27]'
                          : ord.paymentStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="text-xs bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg px-2 py-1 font-semibold text-[#2C3E50] focus:outline-hidden"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[#5D6D7E]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 bg-[#2C3E50] hover:bg-[#1a252f] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setViewInvoiceOrder(ord)}
                        className="px-2.5 py-1 border border-[#E8E4D5] hover:bg-[#FCFAF2] text-[#2C3E50] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Print Invoice"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: SETTINGS (Configurable Delivery Charges & Brand Info)
         ------------------------------------------------------------- */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-[#E8E4D5] shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#E8E4D5]">
            <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
              Store & Delivery Settings
            </h2>
            <p className="text-xs text-[#5D6D7E] mt-1">
              Configure dynamic state shipping charges and store contact information
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 bg-green-50 border border-green-200 text-[#2D5A27] text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings saved successfully! Updated rates apply immediately to checkout.</span>
            </div>
          )}

          {/* Delivery Charges Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#96281B]">
              State Delivery Pricing:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#2C3E50] block mb-1">
                  Haryana Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={settings.haryanaDeliveryCharge}
                  onChange={(e) =>
                    setSettings({ ...settings, haryanaDeliveryCharge: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
                <p className="text-[10px] text-[#5D6D7E] mt-1">
                  Default: ₹50 for all Haryana addresses
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C3E50] block mb-1">
                  Outside Haryana Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={settings.outsideHaryanaDeliveryCharge}
                  onChange={(e) =>
                    setSettings({ ...settings, outsideHaryanaDeliveryCharge: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
                <p className="text-[10px] text-[#5D6D7E] mt-1">
                  Default: ₹100 for rest of India
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C3E50] block mb-1">
                Free Delivery Order Threshold (₹) <span className="text-[#5D6D7E] text-[10px] font-normal">(0 = disabled)</span>
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Brand Info */}
          <div className="space-y-4 pt-4 border-t border-[#E8E4D5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#96281B]">
              Brand & Company Credentials:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#2C3E50] block mb-1">
                  Company Name (Invoicing)
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C3E50] block mb-1">
                  FSSAI License Number
                </label>
                <input
                  type="text"
                  value={settings.fssaiNumber}
                  onChange={(e) => setSettings({ ...settings, fssaiNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C3E50] block mb-1">
                Store Dispatch Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] text-xs bg-[#FCFAF2] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="w-full py-3.5 px-6 rounded-xl bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
          >
            {savingSettings ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>

        {/* Database & Test Data Management */}
        <div className="bg-white rounded-3xl border border-[#E8E4D5] p-6 sm:p-8 space-y-4 shadow-xs mt-6">
          <div>
            <h3 className="font-serif italic font-bold text-lg text-[#2C3E50]">
              Database & Test Data Management
            </h3>
            <p className="text-xs text-[#5D6D7E] mt-1">
              Ensure only authentic customer orders populate the database and revenue counters.
            </p>
          </div>

          {clearDataStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{clearDataStatus}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#2C3E50]">Clear Simulated & Test Orders</p>
              <p className="text-[11px] text-[#5D6D7E] mt-0.5">
                Permanently wipes simulated test orders while strictly retaining all real customer transactions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearTestData}
              disabled={isClearingData}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearingData ? 'Clearing...' : 'Wipe Test Orders'}</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ORDER DETAILS
         ------------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8E4D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4D5]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#96281B]">
                  Order Details
                </span>
                <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
                  #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-[#2C3E50] text-sm font-bold p-2"
              >
                ✕
              </button>
            </div>

            {/* Customer & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D6D7E] block mb-1">
                  Customer Information:
                </span>
                <p className="font-bold text-[#2C3E50]">{selectedOrder.customer.fullName}</p>
                <p className="text-[#5D6D7E]">Phone: {selectedOrder.customer.mobile}</p>
                {selectedOrder.customer.email && (
                  <p className="text-[#5D6D7E]">Email: {selectedOrder.customer.email}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D6D7E] block mb-1">
                  Shipping Destination:
                </span>
                <p className="text-[#2C3E50]">{selectedOrder.customer.addressLine1}</p>
                {selectedOrder.customer.addressLine2 && (
                  <p className="text-[#2C3E50]">{selectedOrder.customer.addressLine2}</p>
                )}
                <p className="text-[#5D6D7E]">
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </p>
                <p className="text-[11px] font-semibold text-[#96281B]">
                  Delivery Charge: ₹{selectedOrder.deliveryCharge} ({selectedOrder.deliveryState})
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D6D7E] block">
                Purchased Spices:
              </span>
              <div className="divide-y divide-[#E8E4D5] border rounded-xl overflow-hidden">
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-bold text-[#2C3E50]">{i.name}</p>
                      <p className="text-[11px] text-[#5D6D7E]">
                        {i.packSize} • Qty: {i.quantity}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-[#2C3E50]">
                      ₹{i.price * i.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E8E4D5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2C3E50]">Update Status:</span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="text-xs bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl px-3 py-2 font-bold text-[#96281B] focus:outline-hidden"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewInvoiceOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-[#2C3E50] hover:bg-[#1a252f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#F1C40F]" />
                  <span>View Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: INVOICE PRINT VIEW
         ------------------------------------------------------------- */}
      {viewInvoiceOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex items-start justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-4xl">
            <InvoiceView order={viewInvoiceOrder} onClose={() => setViewInvoiceOrder(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
