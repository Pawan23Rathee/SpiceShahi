import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { Order, StoreSettings, Customer, SavedAddress, DistributorEnquiry, DistributorEnquiryStatus } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const DISTRIBUTOR_ENQUIRIES_FILE = path.join(DATA_DIR, 'distributor_enquiries.json');

// In-memory password reset tokens: token -> { email, expiresAt }
export const passwordResetTokens = new Map<string, { email: string; expiresAt: number }>();

// Default initial store settings
export const DEFAULT_SETTINGS: StoreSettings = {
  haryanaDeliveryCharge: 50,
  outsideHaryanaDeliveryCharge: 100,
  freeDeliveryThreshold: 0, // 0 = disabled (always charge based on state)
  brandName: 'SpiceShahi Spices & Masalas',
  tagline: 'Pure Spices, Real Aroma',
  companyName: 'SRS Global Enterprises',
  fssaiNumber: '20826007001593',
  contactPhone: '+91 83072 15421',
  contactEmail: 'Contact@spiceshahi.in',
  address: 'Gali no 6, ward no 13, Arya nagar, Bahadurgarh, Haryana - 124507',
  enableSoundAlerts: true,
  adminNotificationPhone: '+91 83072 15421',
  testPaymentModeAllowed: true,
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// -------------------------------------------------------------
// Settings
// -------------------------------------------------------------
export function getSettings(): StoreSettings {
  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading settings file, fallback to default:', err);
  }
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: StoreSettings): StoreSettings {
  ensureDataDir();
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

// -------------------------------------------------------------
// Orders (Strictly REAL data only — ZERO fake seeding)
// -------------------------------------------------------------
export function getOrders(): Order[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

export function saveOrders(orders: Order[]): void {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find(
    (o) => o.id.toLowerCase() === id.toLowerCase() || o.orderNumber.toLowerCase() === id.toLowerCase()
  );
}

export function getOrdersByCustomer(customerId?: string, email?: string): Order[] {
  const orders = getOrders();
  const normEmail = email ? email.trim().toLowerCase() : '';
  return orders.filter((o) => {
    if (customerId && o.customerId === customerId) return true;
    if (normEmail && o.customer?.email?.trim().toLowerCase() === normEmail) return true;
    return false;
  });
}

export function saveNewOrder(order: Order): Order {
  const orders = getOrders();
  const existingIdx = orders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    orders[existingIdx] = order;
  } else {
    orders.unshift(order);
  }
  saveOrders(orders);
  return order;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | undefined {
  const orders = getOrders();
  const index = orders.findIndex(
    (o) => o.id.toLowerCase() === id.toLowerCase() || o.orderNumber.toLowerCase() === id.toLowerCase()
  );
  if (index === -1) return undefined;
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveOrders(orders);
  return orders[index];
}

export function clearTestOrders(): { clearedCount: number; remainingCount: number } {
  const orders = getOrders();
  // Filter out any known simulated test orders if admin triggers wipe
  // Keep real orders that have valid non-simulated customer data
  const realOrders = orders.filter((o) => {
    const isSimulated =
      o.razorpayOrderId?.startsWith('order_sim_') ||
      o.razorpayPaymentId?.startsWith('pay_test_') ||
      o.customer.fullName.toLowerCase().includes('test customer');
    return !isSimulated;
  });
  const clearedCount = orders.length - realOrders.length;
  saveOrders(realOrders);
  return { clearedCount, remainingCount: realOrders.length };
}

export function generateNextOrderId(): string {
  const orders = getOrders();
  const orderNums = orders
    .map((o) => {
      const match = o.orderNumber.match(/\d+/);
      return match ? parseInt(match[0], 10) : 1000;
    })
    .filter((n) => !isNaN(n));
  const maxNum = orderNums.length > 0 ? Math.max(...orderNums) : 1024;
  return `SS${maxNum + 1}`;
}

// -------------------------------------------------------------
// Customers & Authentication
// -------------------------------------------------------------
interface StoredCustomer extends Customer {
  passwordHash?: string;
}

export function getCustomers(): StoredCustomer[] {
  ensureDataDir();
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const data = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading customers file:', err);
  }
  return [];
}

export function saveCustomers(customers: StoredCustomer[]): void {
  ensureDataDir();
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), 'utf-8');
}

export function getCustomerById(id: string): StoredCustomer | undefined {
  const customers = getCustomers();
  return customers.find((c) => c.id === id);
}

export function getCustomerByEmail(email: string): StoredCustomer | undefined {
  const customers = getCustomers();
  const normalized = email.trim().toLowerCase();
  return customers.find((c) => c.email.trim().toLowerCase() === normalized);
}

export function getCustomerByGoogleId(googleId: string): StoredCustomer | undefined {
  const customers = getCustomers();
  return customers.find((c) => c.googleId === googleId);
}

// Secure PBKDF2 Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

export function createCustomer(data: {
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  googleId?: string;
  profilePhoto?: string;
}): StoredCustomer {
  const customers = getCustomers();
  const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newCustomer: StoredCustomer = {
    id,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    mobile: data.mobile.trim(),
    googleId: data.googleId,
    profilePhoto: data.profilePhoto,
    passwordHash: data.password ? hashPassword(data.password) : undefined,
    savedAddresses: [],
    createdAt: now,
    updatedAt: now,
  };

  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
}

export function updateCustomer(
  id: string,
  updates: Partial<Omit<StoredCustomer, 'id' | 'createdAt'>>
): StoredCustomer | undefined {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCustomers(customers);
  return customers[index];
}

// Saved Addresses Management
export function addCustomerAddress(
  customerId: string,
  address: Omit<SavedAddress, 'id' | 'createdAt'>
): SavedAddress | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;

  const newAddress: SavedAddress = {
    ...address,
    id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  // If set to default or this is the first address, unset others
  if (newAddress.isDefault || customer.savedAddresses.length === 0) {
    newAddress.isDefault = true;
    customer.savedAddresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  customer.savedAddresses.push(newAddress);
  updateCustomer(customerId, { savedAddresses: customer.savedAddresses });
  return newAddress;
}

export function updateCustomerAddress(
  customerId: string,
  addressId: string,
  updates: Partial<SavedAddress>
): SavedAddress | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;

  const addrIdx = customer.savedAddresses.findIndex((a) => a.id === addressId);
  if (addrIdx === -1) return undefined;

  if (updates.isDefault) {
    customer.savedAddresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  customer.savedAddresses[addrIdx] = {
    ...customer.savedAddresses[addrIdx],
    ...updates,
    id: addressId, // maintain id
  };

  updateCustomer(customerId, { savedAddresses: customer.savedAddresses });
  return customer.savedAddresses[addrIdx];
}

export function deleteCustomerAddress(customerId: string, addressId: string): boolean {
  const customer = getCustomerById(customerId);
  if (!customer) return false;

  const filtered = customer.savedAddresses.filter((a) => a.id !== addressId);
  if (filtered.length === customer.savedAddresses.length) return false;

  // If we deleted default address and others remain, make first one default
  if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
    filtered[0].isDefault = true;
  }

  updateCustomer(customerId, { savedAddresses: filtered });
  return true;
}

export function setDefaultAddress(customerId: string, addressId: string): boolean {
  const customer = getCustomerById(customerId);
  if (!customer) return false;

  let found = false;
  customer.savedAddresses.forEach((a) => {
    if (a.id === addressId) {
      a.isDefault = true;
      found = true;
    } else {
      a.isDefault = false;
    }
  });

  if (!found) return false;
  updateCustomer(customerId, { savedAddresses: customer.savedAddresses });
  return true;
}

// User-Specific Cart Persistence
export function getCustomerCart(customerId: string): any[] {
  const customer = getCustomerById(customerId);
  return (customer as any)?.cart || [];
}

export function saveCustomerCart(customerId: string, cart: any[]): void {
  updateCustomer(customerId, { cart } as any);
}

// -------------------------------------------------------------
// Distributor & Wholesale Enquiries Storage
// -------------------------------------------------------------
export function getDistributorEnquiries(): DistributorEnquiry[] {
  ensureDataDir();
  try {
    if (fs.existsSync(DISTRIBUTOR_ENQUIRIES_FILE)) {
      const data = fs.readFileSync(DISTRIBUTOR_ENQUIRIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading distributor enquiries file:', err);
  }
  return [];
}

export function saveDistributorEnquiries(enquiries: DistributorEnquiry[]): void {
  ensureDataDir();
  fs.writeFileSync(DISTRIBUTOR_ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf-8');
}

export function getDistributorEnquiryById(id: string): DistributorEnquiry | undefined {
  const enquiries = getDistributorEnquiries();
  return enquiries.find((e) => e.id.toLowerCase() === id.toLowerCase());
}

export function generateNextDistributorId(): string {
  const enquiries = getDistributorEnquiries();
  const currentMax = enquiries.reduce((max, e) => {
    const numPart = parseInt(e.id.replace(/\D/g, ''), 10);
    return !isNaN(numPart) && numPart > max ? numPart : max;
  }, 1000);
  return `DIST-${currentMax + 1}`;
}

export function createDistributorEnquiry(data: {
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  businessType: string;
  yearsInBusiness?: string;
  currentCategories?: string;
  monthlyRequirement?: string;
  preferredTerritory?: string;
  fmcgExperience: 'Yes' | 'No' | string;
  message?: string;
}): DistributorEnquiry {
  const enquiries = getDistributorEnquiries();
  const id = generateNextDistributorId();
  const now = new Date().toISOString();

  const newEnquiry: DistributorEnquiry = {
    id,
    name: data.name.trim(),
    businessName: data.businessName.trim(),
    mobile: data.mobile.trim(),
    email: data.email.trim().toLowerCase(),
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: data.pincode.trim(),
    businessType: data.businessType.trim(),
    yearsInBusiness: data.yearsInBusiness?.trim() || '',
    currentCategories: data.currentCategories?.trim() || '',
    monthlyRequirement: data.monthlyRequirement?.trim() || '',
    preferredTerritory: data.preferredTerritory?.trim() || data.city.trim(),
    fmcgExperience: data.fmcgExperience,
    message: data.message?.trim() || '',
    status: 'NEW',
    createdAt: now,
    updatedAt: now,
  };

  enquiries.unshift(newEnquiry); // newest first
  saveDistributorEnquiries(enquiries);
  return newEnquiry;
}

export function updateDistributorEnquiryStatus(
  id: string,
  status: DistributorEnquiryStatus,
  adminNotes?: string
): DistributorEnquiry | undefined {
  const enquiries = getDistributorEnquiries();
  const idx = enquiries.findIndex((e) => e.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) return undefined;

  enquiries[idx].status = status;
  enquiries[idx].updatedAt = new Date().toISOString();
  if (adminNotes !== undefined) {
    enquiries[idx].adminNotes = adminNotes;
  }

  saveDistributorEnquiries(enquiries);
  return enquiries[idx];
}
