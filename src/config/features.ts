/**
 * SpiceShahi Feature Flags & Configuration
 *
 * Centralized configuration for SpiceShahi platform.
 *
 * WhatsApp Support & Contact:
 * - Customer contact and support via WhatsApp (header, footer, contact page, distributor desk).
 * - Customer ordering is exclusively processed through standard online checkout
 *   (Cart -> Shipping Calculation -> Razorpay -> Order Confirmation -> Tracking).
 */

// Centralized WhatsApp business phone number
export const WHATSAPP_NUMBER: string =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_WHATSAPP_NUMBER ||
     (import.meta as any).env?.WHATSAPP_NUMBER)) ||
  '918307215421';

// Master feature flag for WhatsApp support & contact
export const ENABLE_WHATSAPP: boolean =
  (typeof import.meta !== 'undefined' &&
    ((import.meta as any).env?.VITE_ENABLE_WHATSAPP === 'true' ||
     (import.meta as any).env?.ENABLE_WHATSAPP === 'true')) ||
  true;

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
  supportMessage: 'Hello SpiceShahi! I need assistance with my order / products.',
  getWhatsAppUrl: (message?: string) => {
    const text = encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  },
};

