/**
 * SpiceShahi Feature Flags & Configuration
 *
 * Use this file to enable or disable features across the entire SpiceShahi platform.
 *
 * WhatsApp Ordering / Contact UI:
 * - When ENABLE_WHATSAPP is false (default during testing):
 *   All WhatsApp buttons, links, floating chat, and promotional text are completely hidden
 *   from header, homepage, product cards, product details, cart, checkout, and footer.
 * - When ENABLE_WHATSAPP is set to true (or VITE_ENABLE_WHATSAPP=true in .env):
 *   All WhatsApp functionality is restored seamlessly without rebuilding the feature.
 */

// Master feature flag for WhatsApp
// Set to true to re-enable WhatsApp UI, or set VITE_ENABLE_WHATSAPP=true in .env
export const ENABLE_WHATSAPP: boolean =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_ENABLE_WHATSAPP === 'true') ||
  false;

export const WHATSAPP_CONFIG = {
  phoneNumber: '918307215421',
  displayPhone: '+91 83072 15421',
  defaultMessage: 'Hello SpiceShahi! I would like to inquire about your pure spices.',
  orderMessage: (productName: string, packSize: string, price: number) =>
    `Hello SpiceShahi! I would like to order: ${productName} (${packSize}) at ₹${price}. Please assist with my order.`,
  cartMessage: (totalItems: number, grandTotal: number) =>
    `Hello SpiceShahi! I would like to place an order for ${totalItems} item(s) totaling ₹${grandTotal}. Please confirm availability and delivery details.`,
  supportMessage: 'Hello SpiceShahi! I need assistance with my order / products.',
  getWhatsAppUrl: (message?: string) => {
    const text = encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage);
    return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${text}`;
  },
};
