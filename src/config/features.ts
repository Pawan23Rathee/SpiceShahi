/**
 * SpiceShahi Feature Flags & Configuration
 *
 * Centralized configuration for SpiceShahi platform.
 *
 * WhatsApp Ordering / Fallback UI:
 * - When ENABLE_WHATSAPP is false:
 *   All WhatsApp buttons, links, floating chat, and promotional text remain hidden.
 * - When ENABLE_WHATSAPP is true (or VITE_ENABLE_WHATSAPP=true in .env):
 *   WhatsApp ordering fallback and contact features are enabled.
 */

// Centralized WhatsApp business phone number
export const WHATSAPP_NUMBER: string =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_WHATSAPP_NUMBER ||
     (import.meta as any).env?.WHATSAPP_NUMBER)) ||
  '918307215421';

// Master feature flag for WhatsApp
export const ENABLE_WHATSAPP: boolean =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_ENABLE_WHATSAPP === 'true' ||
     (import.meta as any).env?.ENABLE_WHATSAPP === 'true')) ||
  false;

export interface WhatsAppOrderItem {
  name: string;
  packSize: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrderDetails {
  customerName?: string;
  customerMobile?: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  deliveryState?: string;
  deliveryCharge: number;
  grandTotal: number;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentPreference?: string;
}

export function buildWhatsAppOrderMessage(details: WhatsAppOrderDetails): string {
  const lines: string[] = [
    'Hello SpiceShahi,',
    '',
    'I want to place an order.',
    '',
    `Customer Name: ${details.customerName?.trim() || 'Valued Customer'}`,
    `Mobile: ${details.customerMobile?.trim() || 'Will provide on chat'}`,
    '',
    'Products:',
  ];

  details.items.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.name}`);
    lines.push(`   Pack: ${item.packSize}`);
    lines.push(`   Qty: ${item.quantity}`);
    lines.push(`   Price: ₹${item.price} each`);
    lines.push('');
  });

  lines.push(`Subtotal: ₹${details.subtotal}`);
  if (details.deliveryState) {
    lines.push(`Delivery State: ${details.deliveryState}`);
  }
  lines.push(`Delivery: ₹${details.deliveryCharge}`);
  lines.push(`Total: ₹${details.grandTotal}`);
  lines.push('');
  lines.push('Delivery Address:');
  lines.push(details.addressLine ? details.addressLine : 'Will provide on chat');
  if (details.city) lines.push(`City: ${details.city}`);
  if (details.state) lines.push(`State: ${details.state}`);
  if (details.pincode) lines.push(`Pincode: ${details.pincode}`);
  lines.push('');
  lines.push(`Payment preference: ${details.paymentPreference || 'Online Payment / COD if available'}`);
  lines.push('');
  lines.push('Please confirm my order.');

  return lines.join('\n');
}

export function buildDistributorWhatsAppMessage(details: {
  name: string;
  businessName: string;
  mobile?: string;
  city: string;
  state: string;
  businessType: string;
  monthlyRequirement?: string;
  preferredTerritory?: string;
}): string {
  const parts = [
    'Hello SpiceShahi,',
    '',
    'I am interested in becoming a SpiceShahi distributor.',
    '',
    `Name: ${details.name}`,
    `Business: ${details.businessName}`,
    details.mobile ? `Mobile: ${details.mobile}` : '',
    `City: ${details.city}`,
    `State: ${details.state}`,
    `Business Type: ${details.businessType}`,
    `Expected Monthly Requirement: ${details.monthlyRequirement || 'To be discussed'}`,
    `Preferred Territory: ${details.preferredTerritory || details.city}`,
    '',
    'Please share the distributor/wholesale details.',
  ];
  return parts.filter((p) => p !== '').join('\n');
}

export const WHATSAPP_CONFIG = {
  phoneNumber: WHATSAPP_NUMBER,
  displayPhone: '+91 83072 15421',
  defaultMessage: 'Hello SpiceShahi! I would like to inquire about your pure spices.',
  orderMessage: (productName: string, packSize: string, price: number) =>
    `Hello SpiceShahi! I would like to order: ${productName} (${packSize}) at ₹${price}. Please assist with my order.`,
  cartMessage: (totalItems: number, grandTotal: number) =>
    `Hello SpiceShahi! I would like to place an order for ${totalItems} item(s) totaling ₹${grandTotal}. Please confirm availability and delivery details.`,
  supportMessage: 'Hello SpiceShahi! I need assistance with my order / products.',
  getWhatsAppUrl: (message?: string) => {
    const text = encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  },
};

