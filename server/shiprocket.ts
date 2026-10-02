/**
 * Shiprocket Logistics Integration Service for SpiceShahi
 * 
 * Handles:
 * 1. Secure token-based authentication (cached with auto-refresh)
 * 2. Real-time courier serviceability and dynamic shipping rate calculation
 * 3. Ad-hoc order creation upon payment verification
 * 4. Tracking and webhook status updates
 * 
 * Never exposes credentials or bearer tokens to the frontend.
 */

import { Order, OrderItem, TrackingActivity, ShipmentTrackingData } from '../src/types.js';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

interface CachedToken {
  token: string;
  expiresAt: number; // timestamp in ms
}

interface CourierOption {
  courierId: number | string;
  courierName: string;
  rate: number;
  estimatedDeliveryDays?: number | string;
  etd?: string;
  minWeight?: number;
}

export interface ShippingRateResult {
  serviceable: boolean;
  pincode: string;
  shippingCharge: number;
  courierOptions: CourierOption[];
  packageWeightKg?: number;
  error?: string;
  source?: 'shiprocket' | 'cache';
}

// In-memory token cache (valid up to 240 hours / 10 days)
let cachedAuth: CachedToken | null = null;

// In-memory rate query cache (TTL: 20 minutes)
interface RateCacheEntry {
  result: ShippingRateResult;
  timestamp: number;
}
const rateCache = new Map<string, RateCacheEntry>();
const RATE_CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Calculate total package weight from items in kg
 */
export function calculatePackageWeight(items?: { weightInGrams?: number; quantity?: number }[]): number {
  const defaultWeight = parseFloat(process.env.SHIPPING_DEFAULT_WEIGHT || '0.25');

  if (!items || !Array.isArray(items) || items.length === 0) {
    return defaultWeight;
  }

  let totalGrams = 0;
  for (const item of items) {
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const itemGrams = item.weightInGrams && item.weightInGrams > 0 ? item.weightInGrams : 250;
    totalGrams += itemGrams * qty;
  }

  const calculatedKg = parseFloat((totalGrams / 1000).toFixed(2));
  return calculatedKg > 0 ? calculatedKg : defaultWeight;
}

/**
 * Authenticate with Shiprocket and retrieve/cache Bearer token
 */
export async function getShiprocketToken(forceRefresh = false): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error('Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured.');
  }

  // Return cached token if still valid (keeping 2 hours margin before 240h expiry)
  const now = Date.now();
  if (!forceRefresh && cachedAuth && cachedAuth.expiresAt > now + 2 * 60 * 60 * 1000) {
    return cachedAuth.token;
  }

  console.log('[Shiprocket] Authenticating with Shiprocket API...');

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Shiprocket] Authentication failed:', response.status, errText);
    cachedAuth = null;
    throw new Error(`Shiprocket authentication failed with status ${response.status}. Please verify your SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.`);
  }

  const data = (await response.json()) as { token: string };
  if (!data.token) {
    throw new Error('Shiprocket login response did not contain an auth token.');
  }

  // Shiprocket tokens are valid for 240 hours
  const validityMs = 230 * 60 * 60 * 1000; // cache for 230 hours
  cachedAuth = {
    token: data.token,
    expiresAt: now + validityMs,
  };

  console.log('[Shiprocket] Authentication successful. Token cached.');
  return cachedAuth.token;
}

/**
 * Helper to make authenticated requests to Shiprocket with automatic retry on 401
 */
async function shiprocketFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = await getShiprocketToken();

  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  let response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired, force refresh once and retry
  if (response.status === 401) {
    console.warn('[Shiprocket] 401 Unauthorized encountered. Refreshing token...');
    token = await getShiprocketToken(true);
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
    response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  return response;
}

/**
 * Check courier serviceability and calculate dynamic shipping rate
 */
export async function getShippingRate(params: {
  deliveryPincode: string;
  items?: { weightInGrams?: number; quantity?: number }[];
  declaredValue?: number;
  isCod?: boolean;
}): Promise<ShippingRateResult> {
  const { deliveryPincode, items, declaredValue = 500, isCod = false } = params;
  const cleanPincode = (deliveryPincode || '').replace(/\D/g, '').slice(0, 6);

  if (cleanPincode.length !== 6) {
    return {
      serviceable: false,
      pincode: cleanPincode,
      shippingCharge: 0,
      courierOptions: [],
      error: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE?.trim() || '124507';
  const weight = calculatePackageWeight(items);
  const codFlag = isCod ? 1 : 0;

  // Check rate cache
  const cacheKey = `${pickupPostcode}_${cleanPincode}_${weight.toFixed(2)}_${codFlag}`;
  const cached = rateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < RATE_CACHE_TTL_MS) {
    return {
      ...cached.result,
      source: 'cache',
    };
  }

  console.log(`[Shiprocket] Checking serviceability for pincode ${cleanPincode} (pickup: ${pickupPostcode}, weight: ${weight}kg)`);

  try {
    const query = new URLSearchParams({
      pickup_postcode: pickupPostcode,
      delivery_postcode: cleanPincode,
      weight: weight.toString(),
      cod: codFlag.toString(),
      declared_value: Math.max(10, Math.round(declaredValue)).toString(),
    });

    const response = await shiprocketFetch(`/courier/serviceability/?${query.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Shiprocket] Serviceability API error ${response.status}:`, errText);
      return {
        serviceable: false,
        pincode: cleanPincode,
        shippingCharge: 0,
        courierOptions: [],
        error: `Could not retrieve shipping rates for pincode ${cleanPincode} (${response.statusText}).`,
      };
    }

    const resJson = await response.json();
    const availableCouriers: any[] = resJson?.data?.available_courier_companies || [];

    if (!availableCouriers || availableCouriers.length === 0) {
      console.log(`[Shiprocket] Pincode ${cleanPincode} is not serviceable by any courier.`);
      const result: ShippingRateResult = {
        serviceable: false,
        pincode: cleanPincode,
        shippingCharge: 0,
        courierOptions: [],
        error: 'Sorry, delivery is currently unavailable for this pincode.',
      };
      rateCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    // Map courier options and sort by rate ascending to offer the best price
    const courierOptions: CourierOption[] = availableCouriers
      .filter((c: any) => typeof c.rate === 'number' && c.rate > 0)
      .map((c: any) => ({
        courierId: c.courier_company_id,
        courierName: c.courier_name,
        rate: Math.ceil(c.rate),
        estimatedDeliveryDays: c.estimated_delivery_days ?? (c.etd ? `${c.etd}` : undefined),
        etd: c.etd,
        minWeight: c.min_weight,
      }))
      .sort((a, b) => a.rate - b.rate);

    if (courierOptions.length === 0) {
      return {
        serviceable: false,
        pincode: cleanPincode,
        shippingCharge: 0,
        courierOptions: [],
        error: 'Sorry, no valid courier delivery rate found for this pincode.',
      };
    }

    // Default rate is the most competitive available courier
    const bestRate = courierOptions[0].rate;
    console.log(`[Shiprocket] Shipping rate for ${cleanPincode}: ₹${bestRate} via ${courierOptions[0].courierName}`);

    const result: ShippingRateResult = {
      serviceable: true,
      pincode: cleanPincode,
      shippingCharge: bestRate,
      courierOptions,
      packageWeightKg: weight,
      source: 'shiprocket',
    };

    rateCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  } catch (err: any) {
    console.error(`[Shiprocket] Error checking serviceability for pincode ${cleanPincode}:`, err);
    return {
      serviceable: false,
      pincode: cleanPincode,
      shippingCharge: 0,
      courierOptions: [],
      error: err.message || 'Failed to connect to Shiprocket shipping service.',
    };
  }
}

/**
 * Create order in Shiprocket (POST /orders/create/adhoc)
 */
export async function createShiprocketOrder(order: Order): Promise<{
  success: boolean;
  orderId?: number | string;
  shipmentId?: number | string;
  status?: string;
  awbCode?: string;
  error?: string;
}> {
  try {
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION?.trim() || 'Primary';
    const packageWeightKg = calculatePackageWeight(order.items);
    const length = parseFloat(process.env.SHIPPING_DEFAULT_LENGTH || '14');
    const breadth = parseFloat(process.env.SHIPPING_DEFAULT_BREADTH || '7');
    const height = parseFloat(process.env.SHIPPING_DEFAULT_HEIGHT || '21');

    console.log(`[Shiprocket] Creating order ${order.orderNumber} for ${order.customer.fullName} (${order.customer.pincode})`);

    const orderDateStr = order.createdAt
      ? order.createdAt.replace('T', ' ').substring(0, 19)
      : new Date().toISOString().replace('T', ' ').substring(0, 19);

    const orderItems = order.items.map((i) => ({
      name: i.name,
      sku: `${i.productId}-${(i.packSize || 'pack').replace(/\s+/g, '')}`,
      units: i.quantity,
      selling_price: i.price,
      discount: 0,
      tax: 0,
      hsn: 91030, // standard spices HSN code
    }));

    const payload = {
      order_id: order.orderNumber || order.id,
      order_date: orderDateStr,
      pickup_location: pickupLocation,
      channel_id: '',
      comment: 'SpiceShahi Handcrafted Spices Order',
      billing_customer_name: order.customer.fullName,
      billing_last_name: '',
      billing_address: order.customer.addressLine1,
      billing_address_2: [order.customer.addressLine2, order.customer.landmark].filter(Boolean).join(', ') || '',
      billing_city: order.customer.city,
      billing_pincode: order.customer.pincode,
      billing_state: order.customer.state,
      billing_country: order.customer.country || 'India',
      billing_email: order.customer.email,
      billing_phone: order.customer.mobile,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      shipping_charges: order.deliveryCharge || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.subtotal,
      length,
      breadth,
      height,
      weight: packageWeightKg,
    };

    const response = await shiprocketFetch('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.status_code && data.status_code >= 400)) {
      const errMsg = data.message || data.error || `HTTP ${response.status}`;
      console.error(`[Shiprocket] Failed to create order ${order.orderNumber}:`, errMsg);
      return {
        success: false,
        error: typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg,
      };
    }

    console.log(`[Shiprocket] Order created successfully. Order ID: ${data.order_id}, Shipment ID: ${data.shipment_id}`);

    // If SHIPROCKET_AUTO_SHIP is enabled, assign AWB and request pickup
    const autoShip = process.env.SHIPROCKET_AUTO_SHIP === 'true';
    let awbCode: string | undefined = undefined;

    if (autoShip && data.shipment_id) {
      try {
        console.log(`[Shiprocket] SHIPROCKET_AUTO_SHIP is true. Requesting AWB for shipment ${data.shipment_id}...`);
        const awbRes = await shiprocketFetch('/courier/assign/awb', {
          method: 'POST',
          body: JSON.stringify({ shipment_id: data.shipment_id }),
        });
        const awbData = await awbRes.json();
        if (awbData?.response?.data?.awb_code) {
          awbCode = awbData.response.data.awb_code;
          console.log(`[Shiprocket] AWB assigned: ${awbCode}`);
        }
      } catch (awbErr) {
        console.warn('[Shiprocket] Auto-AWB assignment warning:', awbErr);
      }
    }

    return {
      success: true,
      orderId: data.order_id,
      shipmentId: data.shipment_id,
      status: data.status || 'NEW',
      awbCode,
    };
  } catch (err: any) {
    console.error(`[Shiprocket] Exception while creating order ${order.orderNumber}:`, err);
    return {
      success: false,
      error: err.message || 'Shiprocket order creation failed.',
    };
  }
}

/**
 * Track shipment via Shiprocket Tracking API
 * Official Endpoint: GET /v1/external/courier/track/awb/{awb_code}
 * Also supports fallback to order_id or shipment_id
 */
export async function trackShiprocketShipment(params: {
  awb?: string;
  orderId?: string | number;
  shipmentId?: string | number;
}): Promise<{
  success: boolean;
  currentStatus: string;
  currentStatusCode?: number | string;
  awbCode?: string;
  courierName?: string;
  etd?: string;
  origin?: string;
  destination?: string;
  trackUrl?: string;
  scans: TrackingActivity[];
  raw?: any;
  error?: string;
}> {
  try {
    const { awb, orderId, shipmentId } = params;

    let endpoint = '';
    if (awb && awb.trim()) {
      endpoint = `/courier/track/awb/${encodeURIComponent(awb.trim())}`;
    } else if (orderId) {
      endpoint = `/courier/track?order_id=${encodeURIComponent(String(orderId).trim())}`;
    } else if (shipmentId) {
      endpoint = `/courier/track/shipment/${encodeURIComponent(String(shipmentId).trim())}`;
    } else {
      return {
        success: false,
        currentStatus: 'UNKNOWN',
        scans: [],
        error: 'No AWB, Order ID, or Shipment ID provided for tracking.',
      };
    }

    console.log(`[Shiprocket Tracking] Calling ${endpoint}...`);
    const response = await shiprocketFetch(endpoint, { method: 'GET' });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Shiprocket Tracking] API returned status ${response.status}:`, errText);
      return {
        success: false,
        currentStatus: 'UNAVAILABLE',
        scans: [],
        error: `Shiprocket tracking returned HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[Shiprocket Tracking] Response received for tracking query');

    // Shiprocket tracking response structure:
    // { "tracking_data": { "track_status": 1, "shipment_track": [...], "shipment_track_activities": [...], "track_url": "..." } }
    // Or keyed by order_id: { "12345": { "tracking_data": ... } }
    let trackingData = data?.tracking_data;
    if (!trackingData && typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      if (firstKey && data[firstKey]?.tracking_data) {
        trackingData = data[firstKey].tracking_data;
      } else {
        trackingData = data;
      }
    }

    if (!trackingData) {
      return {
        success: false,
        currentStatus: 'PENDING_PICKUP',
        scans: [],
        error: 'No tracking data found in Shiprocket response.',
      };
    }

    const shipmentTrackList = Array.isArray(trackingData.shipment_track) ? trackingData.shipment_track : [];
    const mainTrack = shipmentTrackList[0] || {};

    const rawActivities = Array.isArray(trackingData.shipment_track_activities)
      ? trackingData.shipment_track_activities
      : Array.isArray(trackingData.scans)
      ? trackingData.scans
      : [];

    const scans: TrackingActivity[] = rawActivities.map((act: any) => ({
      date: act.date || act['activity-date'] || new Date().toISOString(),
      status: act.status || act.current_status || 'In Transit',
      activity: act.activity || act.description || act.status || 'Package in transit',
      location: act.location || act.city || '',
      srStatus: act['sr-status'] || act.sr_status || '',
    }));

    const currentStatus =
      mainTrack.current_status ||
      trackingData.current_status ||
      (scans.length > 0 ? scans[scans.length - 1].status : 'CONFIRMED');

    const courierName = mainTrack.courier_name || trackingData.courier_name || '';
    const awbCode = mainTrack.awb_code || trackingData.awb_code || awb || '';
    const etd = mainTrack.edd || mainTrack.etd || trackingData.etd || trackingData.edd || '';
    const origin = mainTrack.origin || 'Bahadurgarh, Haryana';
    const destination = mainTrack.destination || mainTrack.delivered_to || '';
    const trackUrl = trackingData.track_url || (awbCode ? `https://shiprocket.co//tracking/${awbCode}` : undefined);

    return {
      success: true,
      currentStatus,
      currentStatusCode: mainTrack.current_status_id || trackingData.shipment_status,
      awbCode,
      courierName,
      etd,
      origin,
      destination,
      trackUrl,
      scans,
      raw: trackingData,
    };
  } catch (err: any) {
    console.error('[Shiprocket Tracking] Exception while fetching tracking data:', err);
    return {
      success: false,
      currentStatus: 'ERROR',
      scans: [],
      error: err.message || 'Failed to communicate with Shiprocket tracking service.',
    };
  }
}

/**
 * Assign AWB to an existing shipment manually or on-demand
 */
export async function assignShiprocketAWB(
  shipmentId: number | string,
  courierId?: number | string
): Promise<{
  success: boolean;
  awbCode?: string;
  courierName?: string;
  error?: string;
}> {
  try {
    const payload: Record<string, any> = { shipment_id: shipmentId };
    if (courierId) {
      payload.courier_id = courierId;
    }

    console.log(`[Shiprocket] Assigning AWB for shipment ${shipmentId}...`);
    const response = await shiprocketFetch('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.status_code >= 400) {
      return {
        success: false,
        error: data.message || `Failed to assign AWB (HTTP ${response.status})`,
      };
    }

    const awbData = data?.response?.data || data?.data || data;
    const awbCode = awbData.awb_code;
    const courierName = awbData.courier_name || '';

    return {
      success: true,
      awbCode,
      courierName,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Exception while assigning AWB in Shiprocket.',
    };
  }
}

/**
 * Build rich tracking timeline for an order, merging live Shiprocket data
 * with order fulfillment milestones.
 */
export function buildOrderTrackingTimeline(
  order: Order,
  liveTracking?: {
    currentStatus?: string;
    currentStatusCode?: number | string;
    awbCode?: string;
    courierName?: string;
    etd?: string;
    origin?: string;
    destination?: string;
    trackUrl?: string;
    scans?: TrackingActivity[];
  }
): ShipmentTrackingData {
  const scans: TrackingActivity[] = [];

  // Milestone 1: Order Placement & Verification
  scans.push({
    date: order.createdAt,
    status: 'ORDER_PLACED',
    activity: `Order verified & paid via ${order.paymentMethod === 'ONLINE_RAZORPAY' ? 'Razorpay' : order.paymentMethod}.`,
    location: 'Bahadurgarh Hub, Haryana',
  });

  // Milestone 2: Grinding & Milling
  const millingDate = new Date(new Date(order.createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString();
  scans.push({
    date: millingDate,
    status: 'PROCESSING',
    activity: 'Pure spices ground under 35°C temperature control and sealed in nitrogen-flushed pouch.',
    location: 'SpiceShahi Processing Facility, Bahadurgarh',
  });

  // If live scans exist from Shiprocket, append them
  if (liveTracking?.scans && liveTracking.scans.length > 0) {
    for (const scan of liveTracking.scans) {
      // Avoid duplicate milestones
      const exists = scans.some((s) => s.date === scan.date && s.activity === scan.activity);
      if (!exists) {
        scans.push(scan);
      }
    }
  } else if (order.shiprocketActivities && order.shiprocketActivities.length > 0) {
    for (const scan of order.shiprocketActivities) {
      const exists = scans.some((s) => s.date === scan.date && s.activity === scan.activity);
      if (!exists) {
        scans.push(scan);
      }
    }
  } else {
    // If no live courier scans yet, add logical milestones matching current order status
    if (order.shiprocketAWB || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED') {
      const dispatchDate = new Date(new Date(order.createdAt).getTime() + 6 * 60 * 60 * 1000).toISOString();
      scans.push({
        date: dispatchDate,
        status: 'SHIPPED',
        activity: `Shipment handed over to ${order.shiprocketCourier || 'Courier Partner'}${order.shiprocketAWB ? ` (AWB: ${order.shiprocketAWB})` : ''}.`,
        location: 'SRS Global Logistics Center, Bahadurgarh',
      });
    }

    if (order.orderStatus === 'DELIVERED') {
      const deliverDate = new Date(new Date(order.createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString();
      scans.push({
        date: deliverDate,
        status: 'DELIVERED',
        activity: `Package delivered safely to ${order.customer.fullName}.`,
        location: `${order.customer.city}, ${order.customer.state}`,
      });
    }
  }

  // Determine current status
  const currentStatus =
    liveTracking?.currentStatus ||
    order.shiprocketStatus ||
    order.orderStatus ||
    'CONFIRMED';

  const awbCode = liveTracking?.awbCode || order.shiprocketAWB || undefined;
  const courierName = liveTracking?.courierName || order.shiprocketCourier || undefined;
  const etd = liveTracking?.etd || order.shiprocketEtd || undefined;
  const trackUrl = liveTracking?.trackUrl || order.shiprocketTrackUrl || (awbCode ? `https://shiprocket.co//tracking/${awbCode}` : undefined);

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    awbCode,
    courierName,
    currentStatus,
    currentStatusCode: liveTracking?.currentStatusCode || order.shiprocketStatusCode,
    etd,
    origin: liveTracking?.origin || 'Bahadurgarh, Haryana',
    destination: liveTracking?.destination || `${order.customer.city}, ${order.customer.state}`,
    scans,
    trackUrl,
    lastUpdated: new Date().toISOString(),
    isRealtime: Boolean(liveTracking && liveTracking.scans && liveTracking.scans.length > 0),
  };
}

/**
 * Health check / test endpoint helper
 */
export async function testShiprocketConnection(): Promise<{
  success: boolean;
  message: string;
  pickupPincode?: string;
}> {
  try {
    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD?.trim();

    if (!email || !password) {
      return {
        success: false,
        message: 'SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are not configured in environment variables.',
      };
    }

    await getShiprocketToken(true);
    return {
      success: true,
      message: 'Shiprocket authentication successful',
      pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || '124507',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Shiprocket authentication failed: ${err.message}`,
    };
  }
}

