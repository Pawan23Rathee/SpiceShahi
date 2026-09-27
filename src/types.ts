export type Page =
  | 'home'
  | 'about'
  | 'products'
  | 'product-detail'
  | 'gallery'
  | 'contact'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'admin'
  | 'invoice'
  | 'ai-sommelier'
  | 'login'
  | 'register'
  | 'account'
  | 'forgot-password';

export interface PackSize {
  size: string;
  weightInGrams: number;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  hindiName: string;
  category: 'single' | 'blend' | 'whole';
  categoryLabel: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  colorProfile: string;
  aromaNotes: string;
  culinaryUses: string[];
  qualityFeatures: string[];
  packSizes: PackSize[];
  heatLevel?: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = fiery
  aromaIntensity: 1 | 2 | 3 | 4 | 5;
  badge?: string;
  imageUrl: string;
  origin: string;
  inStock: boolean;
  featured?: boolean;
  curcuminOrOilContent?: string;
}

export interface InstagramReel {
  id: string;
  title: string;
  caption: string;
  category: 'farm' | 'recipe' | 'process' | 'packaging';
  categoryLabel: string;
  thumbnailUrl: string;
  views: string;
  likes: string;
  instagramUrl: string;
  duration: string;
  tag: string;
}

export interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}

// E-commerce Cart & Order Types
export interface CartItem {
  id: string; // unique key `${productId}-${packSize}`
  productId: string;
  productSlug: string;
  name: string;
  hindiName?: string;
  imageUrl: string;
  packSize: string;
  weightInGrams: number;
  price: number;
  originalPrice?: number;
  quantity: number;
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Office' | 'Other'
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  googleId?: string;
  profilePhoto?: string;
  savedAddresses: SavedAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetails {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  hindiName?: string;
  packSize: string;
  weightInGrams: number;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
}

export interface Order {
  id: string; // e.g. "SS1024"
  orderNumber: string;
  customerId?: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  deliveryState: string;
  grandTotal: number;
  paymentMethod: 'ONLINE_RAZORPAY' | 'COD' | 'TEST_GATEWAY';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  haryanaDeliveryCharge: number;
  outsideHaryanaDeliveryCharge: number;
  freeDeliveryThreshold: number; // 0 means disabled
  brandName: string;
  tagline: string;
  companyName: string;
  fssaiNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  enableSoundAlerts: boolean;
  adminNotificationPhone: string;
  testPaymentModeAllowed: boolean;
}

export interface AdminUser {
  username: string;
  token: string;
  expiresAt: number;
}
