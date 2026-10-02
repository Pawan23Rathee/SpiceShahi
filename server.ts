import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import {
  getSettings,
  saveSettings,
  getOrders,
  getOrderById,
  saveNewOrder,
  updateOrder,
  generateNextOrderId,
  getCustomers,
  getCustomerById,
  getCustomerByEmail,
  getCustomerByGoogleId,
  createCustomer,
  updateCustomer,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
  verifyPassword,
  hashPassword,
  passwordResetTokens,
  getOrdersByCustomer,
  clearTestOrders,
  getCustomerCart,
  saveCustomerCart,
  getDistributorEnquiries,
  getDistributorEnquiryById,
  createDistributorEnquiry,
  updateDistributorEnquiryStatus,
} from './server/storage.js';
import {
  dispatchOrderPaidEmails,
  sendCustomerOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendDistributorNotificationEmail,
  sendDistributorAcknowledgementEmail,
  sendPasswordResetEmail,
} from './server/email.js';
import {
  generateInvoicePdf,
  getInvoiceFileName,
  getInvoiceFilePath,
} from './server/invoice.js';
import { Order, OrderItem, CustomerDetails, OrderStatus, PaymentStatus, DistributorEnquiry, DistributorEnquiryStatus, TrackingActivity, ShipmentTrackingData } from './src/types.js';
import { ai, SYSTEM_INSTRUCTION, getFallbackResponse } from './server/ai.js';
import {
  getShippingRate,
  createShiprocketOrder,
  testShiprocketConnection,
  calculatePackageWeight,
  trackShiprocketShipment,
  assignShiprocketAWB,
  buildOrderTrackingTimeline,
} from './server/shiprocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SpiceShahi@2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'spiceshahi-super-secret-jwt-key-2026';
const CUSTOMER_SECRET = process.env.CUSTOMER_SECRET || 'spiceshahi-customer-jwt-secret-2026';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Initialize Razorpay SDK client safely with fallback to avoid crash when env vars are unset
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Server-Sent Events clients for real-time admin notifications
const sseClients: Response[] = [];

function broadcastToAdmin(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// Generate Admin Token
function generateAdminToken(username: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${username}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

// Verify Admin Token
function verifyAdminToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const raw = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString('utf-8');
    const [username, expiresAtStr, sig] = raw.split(':');
    if (!username || !expiresAtStr || !sig) return false;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return false;
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(`${username}:${expiresAt}`)
      .digest('hex');
    return sig === expectedSig && username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

// Generate Customer Token
function generateCustomerToken(customerId: string, email: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${customerId}:${email.toLowerCase()}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', CUSTOMER_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

// Verify Customer Token
function verifyCustomerToken(authHeader?: string): { customerId: string; email: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const raw = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString('utf-8');
    const [customerId, email, expiresAtStr, sig] = raw.split(':');
    if (!customerId || !email || !expiresAtStr || !sig) return null;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return null;
    const expectedSig = crypto
      .createHmac('sha256', CUSTOMER_SECRET)
      .update(`${customerId}:${email}:${expiresAt}`)
      .digest('hex');
    if (sig !== expectedSig) return null;
    return { customerId, email };
  } catch {
    return null;
  }
}

interface AuthRequest extends Request {
  customerUser?: { customerId: string; email: string };
}

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!verifyAdminToken(auth)) {
    return res.status(401).json({ error: 'Unauthorized. Admin session invalid or expired.' });
  }
  next();
}

// Customer Auth Middleware
function requireCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const verified = verifyCustomerToken(auth);
  if (!verified) {
    return res.status(401).json({ error: 'Please log in to continue with checkout or account operations.' });
  }
  req.customerUser = verified;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Fallback body parser if reverse proxy or external webhook sends raw string
  app.use((req, res, next) => {
    if (typeof req.body === 'string' && (req.body.trim().startsWith('{') || req.body.trim().startsWith('['))) {
      try {
        req.body = JSON.parse(req.body);
      } catch {}
    }
    next();
  });

  // -------------------------------------------------------------
  // API: Public Store Settings
  // -------------------------------------------------------------
  app.get('/api/settings', (req: Request, res: Response) => {
    const settings = getSettings();
    res.json({
      ...settings,
      razorpayKeyId: RAZORPAY_KEY_ID || null,
      isRazorpayLive: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
    });
  });

  // -------------------------------------------------------------
  // API: Admin Settings Update
  // -------------------------------------------------------------
  app.post('/api/settings', requireAdmin, (req: Request, res: Response) => {
    const updated = saveSettings(req.body);
    res.json(updated);
  });

  // -------------------------------------------------------------
  // API: Customer Authentication - Google Client Config
  // -------------------------------------------------------------
  app.get('/api/auth/google/config', (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    res.json({
      clientId,
      isConfigured: Boolean(clientId),
    });
  });

  // -------------------------------------------------------------
  // API: Customer Authentication - Register
  // -------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { fullName, email, mobile, password } = req.body;

      if (!fullName || !email || !mobile || !password) {
        return res.status(400).json({ error: 'Full name, email, mobile number, and password are required.' });
      }

      const emailTrim = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const cleanMobile = String(mobile).replace(/\D/g, '');
      const indianMobileRegex = /^[6-9]\d{9}$/;
      if (!indianMobileRegex.test(cleanMobile)) {
        return res.status(400).json({
          error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const existing = getCustomerByEmail(emailTrim);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
      }

      const newCustomer = createCustomer({
        fullName: fullName.trim(),
        email: emailTrim,
        mobile: cleanMobile,
        password,
      });

      const token = generateCustomerToken(newCustomer.id, newCustomer.email);

      // Return sanitized customer data without password hash
      const { passwordHash, ...sanitized } = newCustomer;
      res.json({
        token,
        customer: sanitized,
        message: 'Account created successfully!',
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  });

  // -------------------------------------------------------------
  // API: Customer Authentication - Login
  // -------------------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const customer = getCustomerByEmail(email.trim());
      if (!customer) {
        return res.status(401).json({ error: 'No account found with this email address.' });
      }

      if (!customer.passwordHash) {
        return res.status(401).json({
          error: 'This account was created with Google Sign-In. Please click "Continue with Google".',
        });
      }

      const isMatch = verifyPassword(password, customer.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const token = generateCustomerToken(customer.id, customer.email);
      const { passwordHash, ...sanitized } = customer;

      res.json({
        token,
        customer: sanitized,
        message: 'Login successful!',
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Login failed.' });
    }
  });

  // -------------------------------------------------------------
  // API: Customer Authentication - Google Login (Google Identity Services)
  // -------------------------------------------------------------
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { credential, googleId, email, fullName, profilePhoto, mobile } = req.body;

      let verifiedGoogleId = googleId;
      let verifiedEmail = email;
      let verifiedName = fullName;
      let verifiedPhoto = profilePhoto;

      // When Google Identity Services ID Token (credential) is supplied, cryptographically verify with Google
      if (credential) {
        try {
          const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
          const tokenRes = await fetch(verifyUrl);
          if (!tokenRes.ok) {
            return res.status(401).json({ error: 'Google credential token verification failed or expired.' });
          }

          const tokenData: any = await tokenRes.json();

          // Verify audience if GOOGLE_CLIENT_ID is configured
          const configuredClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
          if (configuredClientId && tokenData.aud && tokenData.aud !== configuredClientId) {
            console.warn('[Google Auth] Token audience mismatch:', tokenData.aud, 'expected:', configuredClientId);
            return res.status(401).json({ error: 'Google authentication client mismatch.' });
          }

          if (!tokenData.sub || !tokenData.email) {
            return res.status(400).json({ error: 'Incomplete user profile returned by Google Identity Services.' });
          }

          verifiedGoogleId = tokenData.sub;
          verifiedEmail = tokenData.email;
          verifiedName = tokenData.name || tokenData.given_name || verifiedName || 'Google Customer';
          verifiedPhoto = tokenData.picture || verifiedPhoto;
        } catch (verifyErr: any) {
          console.error('[Google Auth] Error verifying token with Google:', verifyErr);
          return res.status(500).json({ error: 'Could not communicate with Google verification servers.' });
        }
      }

      if (!verifiedEmail || !verifiedGoogleId) {
        return res.status(400).json({ error: 'Verified Google account details (email and ID) are required.' });
      }

      const emailTrim = verifiedEmail.trim().toLowerCase();
      let customer = getCustomerByGoogleId(verifiedGoogleId) || getCustomerByEmail(emailTrim);

      if (customer) {
        // Link Google ID and update photo if not present
        customer = updateCustomer(customer.id, {
          googleId: verifiedGoogleId,
          profilePhoto: verifiedPhoto || customer.profilePhoto,
          fullName: customer.fullName || verifiedName || 'SpiceShahi Customer',
        })!;
      } else {
        // Create new customer profile for first-time Google sign-in
        customer = createCustomer({
          fullName: (verifiedName || 'SpiceShahi Customer').trim(),
          email: emailTrim,
          mobile: (mobile || '').trim(),
          googleId: verifiedGoogleId,
          profilePhoto: verifiedPhoto,
        });
      }

      const token = generateCustomerToken(customer.id, customer.email);
      const { passwordHash, ...sanitized } = customer;

      res.json({
        token,
        customer: sanitized,
        message: 'Google login successful!',
      });
    } catch (err: any) {
      console.error('Google auth error:', err);
      res.status(500).json({ error: err.message || 'Google authentication failed.' });
    }
  });

  // -------------------------------------------------------------
  // API: Customer Authentication - Forgot Password
  // -------------------------------------------------------------
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const emailTrim = email.trim().toLowerCase();
      const customer = getCustomerByEmail(emailTrim);

      if (customer) {
        const resetToken = crypto.randomBytes(16).toString('hex');
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
        passwordResetTokens.set(resetToken, { email: customer.email, expiresAt });

        console.log(`[Password Reset] Generated reset token for ${customer.email}: ${resetToken}`);

        // Dispatch email via Nodemailer email service
        sendPasswordResetEmail(customer.email, customer.fullName, resetToken).catch((err) =>
          console.error('[Password Reset] Failed to dispatch email:', err)
        );
      }

      // Security requirement: do not expose whether an email exists in a way that leaks customer information
      return res.json({
        success: true,
        message: 'If an account exists with this email address, password reset instructions have been dispatched.',
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: err.message || 'Failed to process request.' });
    }
  });

  // -------------------------------------------------------------
  // API: Customer Authentication - Reset Password
  // -------------------------------------------------------------
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    try {
      const { email, resetToken, newPassword } = req.body;
      if (!email || !resetToken || !newPassword) {
        return res.status(400).json({ error: 'Email, reset token, and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const entry = passwordResetTokens.get(resetToken);
      if (!entry || entry.email.toLowerCase() !== email.trim().toLowerCase()) {
        return res.status(400).json({ error: 'Invalid or expired password reset token.' });
      }

      if (Date.now() > entry.expiresAt) {
        passwordResetTokens.delete(resetToken);
        return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
      }

      const customer = getCustomerByEmail(email.trim());
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found.' });
      }

      updateCustomer(customer.id, {
        passwordHash: hashPassword(newPassword),
      });

      passwordResetTokens.delete(resetToken);

      res.json({
        success: true,
        message: 'Your password has been successfully reset. Please log in with your new password.',
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: err.message || 'Failed to reset password.' });
    }
  });

  // -------------------------------------------------------------
  // API: Customer Profile - Get Current Customer
  // -------------------------------------------------------------
  app.get('/api/customer/me', requireCustomer, (req: AuthRequest, res: Response) => {
    const customer = getCustomerById(req.customerUser!.customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found.' });
    }
    const { passwordHash, ...sanitized } = customer;
    res.json(sanitized);
  });

  // -------------------------------------------------------------
  // API: Customer Profile - Update Info
  // -------------------------------------------------------------
  app.patch('/api/customer/profile', requireCustomer, (req: AuthRequest, res: Response) => {
    const { fullName, mobile } = req.body;
    const updates: any = {};
    if (fullName) updates.fullName = fullName.trim();
    if (mobile) updates.mobile = mobile.trim();

    const updated = updateCustomer(req.customerUser!.customerId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    const { passwordHash, ...sanitized } = updated;
    res.json(sanitized);
  });

  // -------------------------------------------------------------
  // API: Customer Saved Addresses - Add Address
  // -------------------------------------------------------------
  app.post('/api/customer/addresses', requireCustomer, (req: AuthRequest, res: Response) => {
    const { label, fullName, mobile, addressLine1, addressLine2, landmark, city, state, pincode, country, isDefault } =
      req.body;

    if (!fullName || !mobile || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Please fill in all required address fields.' });
    }

    const newAddress = addCustomerAddress(req.customerUser!.customerId, {
      label: label || 'Home',
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      landmark: (landmark || '').trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: country || 'India',
      isDefault: Boolean(isDefault),
    });

    if (!newAddress) {
      return res.status(404).json({ error: 'Could not save address. Customer not found.' });
    }

    const customer = getCustomerById(req.customerUser!.customerId);
    const { passwordHash, ...sanitized } = customer!;
    res.json({
      address: newAddress,
      customer: sanitized,
      message: 'Address saved successfully!',
    });
  });

  // -------------------------------------------------------------
  // API: Customer Saved Addresses - Update Address
  // -------------------------------------------------------------
  app.put('/api/customer/addresses/:addressId', requireCustomer, (req: AuthRequest, res: Response) => {
    const updated = updateCustomerAddress(req.customerUser!.customerId, req.params.addressId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Address not found or could not be updated.' });
    }
    const customer = getCustomerById(req.customerUser!.customerId);
    const { passwordHash, ...sanitized } = customer!;
    res.json({
      address: updated,
      customer: sanitized,
      message: 'Address updated successfully!',
    });
  });

  // -------------------------------------------------------------
  // API: Customer Saved Addresses - Delete Address
  // -------------------------------------------------------------
  app.delete('/api/customer/addresses/:addressId', requireCustomer, (req: AuthRequest, res: Response) => {
    const success = deleteCustomerAddress(req.customerUser!.customerId, req.params.addressId);
    if (!success) {
      return res.status(404).json({ error: 'Address not found.' });
    }
    const customer = getCustomerById(req.customerUser!.customerId);
    const { passwordHash, ...sanitized } = customer!;
    res.json({
      customer: sanitized,
      message: 'Address deleted successfully.',
    });
  });

  // -------------------------------------------------------------
  // API: Customer Saved Addresses - Set Default
  // -------------------------------------------------------------
  app.patch('/api/customer/addresses/:addressId/default', requireCustomer, (req: AuthRequest, res: Response) => {
    const success = setDefaultAddress(req.customerUser!.customerId, req.params.addressId);
    if (!success) {
      return res.status(404).json({ error: 'Address not found.' });
    }
    const customer = getCustomerById(req.customerUser!.customerId);
    const { passwordHash, ...sanitized } = customer!;
    res.json({
      customer: sanitized,
      message: 'Default address updated.',
    });
  });

  // -------------------------------------------------------------
  // API: Customer Cart - User-Specific Cart Persistence
  // -------------------------------------------------------------
  app.get('/api/customer/cart', requireCustomer, (req: AuthRequest, res: Response) => {
    const cart = getCustomerCart(req.customerUser!.customerId);
    res.json({ cart });
  });

  app.put('/api/customer/cart', requireCustomer, (req: AuthRequest, res: Response) => {
    const { cart } = req.body;
    saveCustomerCart(req.customerUser!.customerId, Array.isArray(cart) ? cart : []);
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // API: Customer Orders - List My Orders (Isolated to authenticated user)
  // -------------------------------------------------------------
  app.get('/api/customer/orders', requireCustomer, (req: AuthRequest, res: Response) => {
    const orders = getOrdersByCustomer(req.customerUser!.customerId, req.customerUser!.email);
    res.json({
      orders,
      total: orders.length,
    });
  });

  // -------------------------------------------------------------
  // API: Customer Orders - Get Single Order (Owner Verified)
  // -------------------------------------------------------------
  app.get('/api/customer/orders/:id', requireCustomer, (req: AuthRequest, res: Response) => {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const isOwner =
      (order.customerId && order.customerId === req.customerUser!.customerId) ||
      (order.customer?.email && order.customer.email.toLowerCase() === req.customerUser!.email.toLowerCase());

    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to view this order.' });
    }

    res.json(order);
  });

  // -------------------------------------------------------------
  // API: Shiprocket Health / Test Connection Endpoint
  // -------------------------------------------------------------
  app.get('/api/shipping/shiprocket-test', async (req: Request, res: Response) => {
    try {
      const result = await testShiprocketConnection();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Shiprocket test connection error.' });
    }
  });

  // -------------------------------------------------------------
  // API: Dynamic Shipping Rates (Shiprocket Courier Serviceability)
  // -------------------------------------------------------------
  const handleShippingRates = async (req: Request, res: Response) => {
    try {
      const pincode = (req.method === 'POST' ? req.body?.pincode : req.query?.pincode) as string;
      const items = (req.method === 'POST' ? req.body?.items : undefined) as OrderItem[] | undefined;
      const subtotalRaw = req.method === 'POST' ? req.body?.subtotal : req.query?.subtotal;
      const subtotal = subtotalRaw ? Number(subtotalRaw) : 500;
      const isCod = req.method === 'POST' ? Boolean(req.body?.isCod) : false;

      if (!pincode) {
        return res.status(400).json({
          serviceable: false,
          pincode: '',
          shippingCharge: 0,
          courierOptions: [],
          error: 'Pincode is required.',
        });
      }

      const cleanPincode = String(pincode).replace(/\D/g, '').slice(0, 6);
      if (cleanPincode.length !== 6) {
        return res.status(400).json({
          serviceable: false,
          pincode: cleanPincode,
          shippingCharge: 0,
          courierOptions: [],
          error: 'Please enter a valid 6-digit Indian PIN code.',
        });
      }

      const rateResult = await getShippingRate({
        deliveryPincode: cleanPincode,
        items,
        declaredValue: subtotal,
        isCod,
      });

      return res.json(rateResult);
    } catch (err: any) {
      console.error('Error calculating shipping rates:', err);
      return res.status(500).json({
        serviceable: false,
        pincode: req.query?.pincode || req.body?.pincode || '',
        shippingCharge: 0,
        courierOptions: [],
        error: err.message || 'Failed to calculate shipping rates.',
      });
    }
  };

  app.get('/api/shipping/rates', handleShippingRates);
  app.post('/api/shipping/rates', handleShippingRates);

  // -------------------------------------------------------------
  // API: Calculate Delivery Charges based on Pincode (Shiprocket Dynamic)
  // -------------------------------------------------------------
  app.post('/api/cart/calculate-delivery', async (req: Request, res: Response) => {
    try {
      const { pincode, subtotal = 0, items } = req.body;

      if (pincode && String(pincode).replace(/\D/g, '').length === 6) {
        const cleanPincode = String(pincode).replace(/\D/g, '').slice(0, 6);
        const rateResult = await getShippingRate({
          deliveryPincode: cleanPincode,
          items,
          declaredValue: subtotal,
        });

        if (rateResult.serviceable) {
          return res.json({
            deliveryCharge: rateResult.shippingCharge,
            serviceable: true,
            pincode: cleanPincode,
            courierOptions: rateResult.courierOptions,
            grandTotal: (subtotal || 0) + rateResult.shippingCharge,
            provider: 'shiprocket',
          });
        } else {
          return res.json({
            deliveryCharge: 0,
            serviceable: false,
            pincode: cleanPincode,
            courierOptions: [],
            grandTotal: subtotal || 0,
            error: rateResult.error || 'Delivery unavailable for this pincode.',
            provider: 'shiprocket',
          });
        }
      }

      // If pincode is not provided or incomplete
      return res.json({
        deliveryCharge: 0,
        serviceable: true,
        grandTotal: subtotal || 0,
        message: 'Enter 6-digit pincode to calculate dynamic shipping via Shiprocket.',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Delivery calculation error.' });
    }
  });

  // -------------------------------------------------------------
  // API: Create Razorpay Order (Standard & Cart Checkout with Shiprocket)
  // -------------------------------------------------------------
  const handleCreateOrder = async (req: Request, res: Response) => {
    try {
      const {
        amount,
        currency = 'INR',
        receipt,
        customer,
        items,
        saveAddress,
        addressLabel,
        notes = {},
      } = req.body;

      // Case 1: Shopping cart checkout with items & customer delivery address
      if (customer && items && Array.isArray(items)) {
        if (items.length === 0) {
          return res.status(400).json({ error: 'Order items cannot be empty.' });
        }
        if (!customer.fullName || !customer.mobile || !customer.addressLine1 || !customer.state || !customer.pincode) {
          return res.status(400).json({ error: 'Please fill in all required shipping address fields.' });
        }
        if (!customer.email || !customer.email.includes('@')) {
          return res.status(400).json({ error: 'Valid customer email address is required.' });
        }

        const cleanPincode = String(customer.pincode).replace(/\D/g, '').slice(0, 6);
        if (cleanPincode.length !== 6) {
          return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code for delivery.' });
        }

        // Check for authenticated customer
        const verifiedCustomer = verifyCustomerToken(req.headers.authorization);
        const customerId = verifiedCustomer ? verifiedCustomer.customerId : undefined;

        if (saveAddress && customerId) {
          try {
            addCustomerAddress(customerId, {
              label: addressLabel || 'Home',
              fullName: customer.fullName.trim(),
              mobile: customer.mobile.trim(),
              addressLine1: customer.addressLine1.trim(),
              addressLine2: (customer.addressLine2 || '').trim(),
              landmark: (customer.landmark || '').trim(),
              city: customer.city.trim(),
              state: customer.state.trim(),
              pincode: cleanPincode,
              country: customer.country || 'India',
              isDefault: false,
            });
          } catch (e) {
            console.warn('Could not auto-save address to customer account:', e);
          }
        }

        // Authoritative server-side subtotal calculation
        const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

        // Calculate dynamic shipping rate securely on backend via Shiprocket
        const rateResult = await getShippingRate({
          deliveryPincode: cleanPincode,
          items,
          declaredValue: subtotal,
          isCod: false,
        });

        if (!rateResult.serviceable) {
          return res.status(400).json({
            error: rateResult.error || `Delivery is currently unavailable for pincode ${cleanPincode}.`,
          });
        }

        const deliveryCharge = rateResult.shippingCharge;
        const grandTotal = subtotal + deliveryCharge;
        const amountInPaise = Math.round(grandTotal * 100);

        // Validation: minimum amount 100 paise
        if (amountInPaise < 100) {
          return res.status(400).json({ error: 'Minimum order amount must be at least 100 paise.' });
        }

        const orderId = generateNextOrderId();
        const rzpReceipt = receipt || orderId;

        let rzpOrder;
        try {
          rzpOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency,
            receipt: rzpReceipt,
            notes: {
              orderNumber: orderId,
              customerName: customer.fullName,
              mobile: customer.mobile,
              email: customer.email,
              state: customer.state,
              pincode: cleanPincode,
              shippingProvider: 'shiprocket',
              ...notes,
            },
          });
        } catch (rzpErr: any) {
          console.error('[Razorpay] Order creation error:', rzpErr);
          if (rzpErr?.statusCode === 401 || (rzpErr?.error?.code === 'BAD_REQUEST_ERROR' && rzpErr?.message?.includes('auth'))) {
            return res.status(401).json({ error: 'Razorpay authentication failed. Please check credentials.' });
          }
          return res.status(500).json({ error: rzpErr?.error?.description || rzpErr?.message || 'Failed to create Razorpay order.' });
        }

        // Save pending order in database with Shiprocket shipping details
        const newOrder: Order = {
          id: orderId,
          orderNumber: orderId,
          customerId,
          customer: {
            ...customer,
            pincode: cleanPincode,
          },
          items,
          subtotal,
          deliveryCharge,
          deliveryState: customer.state,
          grandTotal,
          paymentMethod: 'ONLINE_RAZORPAY',
          paymentStatus: 'PENDING',
          orderStatus: 'NEW',
          razorpayOrderId: rzpOrder.id,
          shippingProvider: 'shiprocket',
          shippingPincode: cleanPincode,
          shippingRate: deliveryCharge,
          shippingCharge: deliveryCharge,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveNewOrder(newOrder);

        return res.json({
          order_id: rzpOrder.id,
          orderId,
          orderNumber: orderId,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          receipt: rzpReceipt,
          key_id: RAZORPAY_KEY_ID,
          keyId: RAZORPAY_KEY_ID,
          isTestMode: false,
          subtotal,
          deliveryCharge,
          grandTotal,
          shippingProvider: 'shiprocket',
          customerName: customer.fullName,
          customerEmail: customer.email,
          customerMobile: customer.mobile,
        });
      }

      // Case 2: Direct API request with { amount (paise), currency, receipt }
      if (amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Amount is required.' });
      }

      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum < 100) {
        return res.status(400).json({ error: 'Minimum amount must be at least 100 paise.' });
      }

      const rzpReceipt = receipt || `rcpt_${Date.now()}`;

      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(amountNum),
          currency,
          receipt: rzpReceipt,
          notes: notes || {},
        });

        return res.json({
          order_id: rzpOrder.id,
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          receipt: rzpOrder.receipt,
          key_id: RAZORPAY_KEY_ID,
          keyId: RAZORPAY_KEY_ID,
        });
      } catch (rzpErr: any) {
        console.error('[Razorpay] Direct create-order error:', rzpErr);
        if (rzpErr?.statusCode === 401 || (rzpErr?.error?.code === 'BAD_REQUEST_ERROR' && rzpErr?.message?.includes('auth'))) {
          return res.status(401).json({ error: 'Razorpay authentication failed. Please check credentials.' });
        }
        return res.status(500).json({ error: rzpErr?.error?.description || rzpErr?.message || 'Failed to create Razorpay order.' });
      }
    } catch (err: any) {
      console.error('Error in create-order endpoint:', err);
      return res.status(500).json({ error: err.message || 'Internal server error while creating payment order.' });
    }
  };

  app.post('/api/create-order', handleCreateOrder);
  app.post('/api/payment/create-order', handleCreateOrder);

  // -------------------------------------------------------------
  // API: Verify Razorpay Signature & Mark Order as PAID
  // -------------------------------------------------------------
  const handleVerifyPayment = async (req: Request, res: Response) => {
    try {
      const order_id = req.body.order_id || req.body.razorpay_order_id || req.body.razorpayOrderId;
      const payment_id = req.body.payment_id || req.body.razorpay_payment_id || req.body.razorpayPaymentId;
      const signature = req.body.signature || req.body.razorpay_signature || req.body.razorpaySignature;
      const localOrderId = req.body.orderId;

      // Validate required verification fields
      if (!order_id || !payment_id || !signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing required payment verification fields. Both order_id, payment_id, and signature are required.',
        });
      }

      if (!RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          error: 'Razorpay key secret is not configured on the server.',
        });
      }

      // Compute HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      // Compare generated signature with razorpay_signature
      if (generatedSignature !== signature) {
        console.warn(`[Razorpay] Payment signature mismatch for order ${order_id}`);

        // Signature mismatch: do NOT mark as paid, mark as FAILED
        let order = localOrderId ? getOrderById(localOrderId) : null;
        if (!order) {
          const allOrders = getOrders();
          order = allOrders.find((o) => o.razorpayOrderId === order_id) || null;
        }

        if (order) {
          updateOrder(order.id, {
            paymentStatus: 'FAILED',
            razorpayPaymentId: payment_id,
          });
        }

        return res.status(400).json({
          success: false,
          error: 'Payment signature verification failed. Signature mismatch.',
        });
      }

      // Signatures match: mark order as PAID and CONFIRMED
      let order = localOrderId ? getOrderById(localOrderId) : null;
      if (!order) {
        const allOrders = getOrders();
        order = allOrders.find((o) => o.razorpayOrderId === order_id) || null;
      }

      let updatedOrder = null;
      if (order) {
        updatedOrder = updateOrder(order.id, {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          razorpayOrderId: order_id,
          razorpayPaymentId: payment_id,
          razorpaySignature: signature,
        });

        // Broadcast real-time SSE notification to connected admin console
        const notificationPayload = {
          title: '🛒 New SpiceShahi Order',
          message: `Order #${order.orderNumber} placed by ${order.customer.fullName} for ₹${order.grandTotal} (PAID via Razorpay)`,
          orderId: order.id,
          customer: order.customer.fullName,
          customerEmail: order.customer.email,
          amount: order.grandTotal,
          paymentStatus: 'PAID',
          timestamp: new Date().toISOString(),
        };

        broadcastToAdmin('new-order', notificationPayload);

        // Dispatch confirmation email with PDF invoice to customer & admin
        if (updatedOrder && updatedOrder.paymentStatus === 'PAID') {
          dispatchOrderPaidEmails(updatedOrder).catch((err) =>
            console.error('[Payment Verify] Failed to dispatch order paid emails & invoice:', err)
          );

          // Create Shiprocket order upon confirmed payment
          createShiprocketOrder(updatedOrder)
            .then((srRes) => {
              if (srRes.success && order) {
                updateOrder(order.id, {
                  shiprocketOrderId: srRes.orderId,
                  shiprocketShipmentId: srRes.shipmentId,
                  shiprocketStatus: srRes.status,
                  shiprocketAWB: srRes.awbCode,
                });
                console.log(`[Shiprocket] Order #${order.orderNumber} successfully booked with Shiprocket (Shipment ID: ${srRes.shipmentId})`);
              } else {
                console.warn(`[Shiprocket] Order sync deferred/notice for #${order.orderNumber}:`, srRes.error);
              }
            })
            .catch((srErr) => {
              console.error(`[Shiprocket] Exception syncing order #${order.orderNumber} to Shiprocket:`, srErr);
            });
        }
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully.',
        order_id,
        payment_id,
        orderId: order?.id,
        order: updatedOrder,
      });
    } catch (err: any) {
      console.error('Error in verify-payment endpoint:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to verify payment signature.',
      });
    }
  };

  app.post('/api/verify-payment', handleVerifyPayment);
  app.post('/api/payment/verify', handleVerifyPayment);

  // -------------------------------------------------------------
  // API: Shiprocket Webhook Diagnostic Health Endpoint
  // -------------------------------------------------------------
  const handleWebhookHealth = (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: 'Shiprocket webhook endpoint is reachable',
    });
  };

  app.get('/api/webhooks/shipment-status/health', handleWebhookHealth);
  app.get('/api/webhooks/shiprocket/health', handleWebhookHealth);
  app.options('/api/webhooks/shipment-status/health', handleWebhookHealth);
  app.options('/api/webhooks/shiprocket/health', handleWebhookHealth);

  // -------------------------------------------------------------
  // API: Shiprocket Webhook (Production Endpoint: /api/webhooks/shipment-status)
  // -------------------------------------------------------------
  const handleShiprocketWebhook = (req: Request, res: Response) => {
    try {
      console.log('[Shiprocket Webhook] Request received');
      console.log(`[Shiprocket Webhook] Method: ${req.method}`);
      console.log(`[Shiprocket Webhook] Content-Type: ${req.headers['content-type'] || 'application/json'}`);

      // Allow preflight / OPTIONS immediately
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, X-Api-Key, Authorization, x-shiprocket-secret');
        return res.status(200).end();
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      // 1. Webhook Security: Check x-api-key header against SHIPROCKET_WEBHOOK_SECRET
      const configuredSecret = process.env.SHIPROCKET_WEBHOOK_SECRET?.trim();
      let authStatus = 'valid';

      if (configuredSecret) {
        const receivedApiKey =
          (req.headers['x-api-key'] as string) ||
          (req.headers['X-Api-Key' as any] as string) ||
          (req.headers['x-shiprocket-secret'] as string) ||
          (req.headers['x-shiprocket-token'] as string) ||
          (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

        if (!receivedApiKey || receivedApiKey !== configuredSecret) {
          console.log('[Shiprocket Webhook] Authentication: invalid');
          return res.status(401).json({
            success: false,
            error: 'Unauthorized. Invalid x-api-key.',
          });
        }
        authStatus = 'valid';
      } else {
        authStatus = 'valid (secret not configured)';
      }

      console.log(`[Shiprocket Webhook] Authentication: ${authStatus}`);

      // 2. Validate payload is an object
      if (!req.body || typeof req.body !== 'object') {
        console.warn('[Shiprocket Webhook] Malformed payload received');
        return res.status(400).json({
          success: false,
          error: 'Malformed payload. JSON object expected.',
        });
      }

      console.log('[Shiprocket Webhook] Payload received');

      const {
        order_id,
        sr_order_id,
        shipment_id,
        awb,
        current_status,
        current_status_id,
        shipment_status,
        shipment_status_id,
        current_timestamp,
        courier_name,
        etd,
        scans,
      } = req.body;

      // Handle Shiprocket "Test Webhook" ping (e.g. empty object {} or { "test": true } or sample ping)
      if (!order_id && !shipment_id && !sr_order_id && !awb) {
        console.log('[Shiprocket Webhook] Test webhook ping acknowledged successfully');
        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        });
      }

      // 3. Find matching order in database idempotently
      const allOrders = getOrders();
      const order = allOrders.find((o) => {
        if (order_id && (o.orderNumber === order_id || o.id === order_id || String(o.shiprocketOrderId) === String(order_id))) {
          return true;
        }
        if (sr_order_id && String(o.shiprocketOrderId) === String(sr_order_id)) {
          return true;
        }
        if (shipment_id && String(o.shiprocketShipmentId) === String(shipment_id)) {
          return true;
        }
        if (awb && o.shiprocketAWB && String(o.shiprocketAWB) === String(awb)) {
          return true;
        }
        return false;
      });

      if (!order) {
        console.warn(`[Shiprocket Webhook] No matching SpiceShahi order found for: order_id=${order_id}, sr_order_id=${sr_order_id}, shipment_id=${shipment_id}, awb=${awb}`);
        // Return 200 so Shiprocket does not endlessly retry or report failure
        return res.status(200).json({
          success: true,
          message: 'Webhook received',
        });
      }

      const effectiveStatus = current_status || shipment_status || order.shiprocketStatus || 'IN TRANSIT';
      const effectiveStatusCode = current_status_id || shipment_status_id || order.shiprocketStatusCode;

      // Merge incoming scans with existing order tracking activities (avoid duplicates)
      const existingActivities = order.shiprocketActivities || [];
      const updatedActivities = [...existingActivities];

      if (Array.isArray(scans) && scans.length > 0) {
        for (const scan of scans) {
          const scanDate = scan.date || current_timestamp || new Date().toISOString();
          const scanAct = scan.activity || scan.status || effectiveStatus;
          const alreadyExists = updatedActivities.some(
            (act) => act.date === scanDate && act.activity === scanAct
          );
          if (!alreadyExists) {
            updatedActivities.push({
              date: scanDate,
              status: scan.status || effectiveStatus,
              activity: scanAct,
              location: scan.location || '',
              srStatus: scan['sr-status'] || scan.sr_status || '',
            });
          }
        }
      } else if (effectiveStatus) {
        const lastAct = updatedActivities[updatedActivities.length - 1];
        if (!lastAct || lastAct.status !== effectiveStatus) {
          updatedActivities.push({
            date: current_timestamp || new Date().toISOString(),
            status: effectiveStatus,
            activity: `Shipment status updated to: ${effectiveStatus}`,
            location: '',
          });
        }
      }

      const updates: Partial<Order> = {
        shiprocketStatus: effectiveStatus,
        shiprocketStatusCode: effectiveStatusCode,
        shiprocketAWB: awb || order.shiprocketAWB,
        shiprocketCourier: courier_name || order.shiprocketCourier,
        shiprocketEtd: etd || order.shiprocketEtd,
        shiprocketTrackUrl: awb ? `https://shiprocket.co//tracking/${awb}` : order.shiprocketTrackUrl,
        shiprocketActivities: updatedActivities,
        shiprocketLastSync: new Date().toISOString(),
      };

      // Map Shiprocket status to SpiceShahi orderStatus
      const normStatus = String(effectiveStatus).toUpperCase();
      if (normStatus.includes('DELIVERED')) {
        updates.orderStatus = 'DELIVERED';
      } else if (
        normStatus.includes('IN TRANSIT') ||
        normStatus.includes('OUT FOR DELIVERY') ||
        normStatus.includes('SHIPPED') ||
        normStatus.includes('PICKED UP') ||
        normStatus.includes('REACHED')
      ) {
        updates.orderStatus = 'SHIPPED';
      } else if (normStatus.includes('CANCELLED') || normStatus.includes('RTO')) {
        updates.orderStatus = 'CANCELLED';
      }

      updateOrder(order.id, updates);
      console.log(`[Shiprocket Webhook] Idempotently updated order #${order.orderNumber} status: ${effectiveStatus} (AWB: ${updates.shiprocketAWB})`);

      // Broadcast update to connected admin SSE clients
      broadcastToAdmin('order-status-update', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        shiprocketStatus: effectiveStatus,
        orderStatus: updates.orderStatus || order.orderStatus,
        awb: updates.shiprocketAWB,
        courier: updates.shiprocketCourier,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: 'Webhook received',
      });
    } catch (err: any) {
      console.error('[Shiprocket Webhook] Error processing webhook:', err);
      return res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  };

  // Register production and alias endpoints
  app.post('/api/webhooks/shipment-status', handleShiprocketWebhook);
  app.options('/api/webhooks/shipment-status', handleShiprocketWebhook);
  app.post('/api/webhooks/shiprocket', handleShiprocketWebhook);
  app.options('/api/webhooks/shiprocket', handleShiprocketWebhook);

  // -------------------------------------------------------------
  // API: Get Real-Time Order Tracking (Public / Order Confirmation)
  // -------------------------------------------------------------
  app.get('/api/orders/:id/tracking', async (req: Request, res: Response) => {
    try {
      const order = getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If order has an AWB or Shiprocket details, attempt live tracking sync
      if (order.shiprocketAWB || order.shiprocketOrderId || order.shiprocketShipmentId) {
        try {
          const liveResult = await trackShiprocketShipment({
            awb: order.shiprocketAWB,
            orderId: order.shiprocketOrderId,
            shipmentId: order.shiprocketShipmentId,
          });

          if (liveResult.success) {
            // Update order record with live synced tracking information
            const updates: Partial<Order> = {
              shiprocketStatus: liveResult.currentStatus || order.shiprocketStatus,
              shiprocketStatusCode: liveResult.currentStatusCode || order.shiprocketStatusCode,
              shiprocketAWB: liveResult.awbCode || order.shiprocketAWB,
              shiprocketCourier: liveResult.courierName || order.shiprocketCourier,
              shiprocketEtd: liveResult.etd || order.shiprocketEtd,
              shiprocketTrackUrl: liveResult.trackUrl || order.shiprocketTrackUrl,
              shiprocketLastSync: new Date().toISOString(),
            };

            // Merge scans if returned
            if (liveResult.scans && liveResult.scans.length > 0) {
              const existingActs = order.shiprocketActivities || [];
              const merged = [...existingActs];
              for (const sc of liveResult.scans) {
                if (!merged.some((m) => m.date === sc.date && m.activity === sc.activity)) {
                  merged.push(sc);
                }
              }
              updates.shiprocketActivities = merged;
            }

            // Sync orderStatus if delivered
            if (liveResult.currentStatus?.toUpperCase().includes('DELIVERED')) {
              updates.orderStatus = 'DELIVERED';
            } else if (
              liveResult.currentStatus?.toUpperCase().includes('IN TRANSIT') ||
              liveResult.currentStatus?.toUpperCase().includes('OUT FOR DELIVERY') ||
              liveResult.currentStatus?.toUpperCase().includes('SHIPPED')
            ) {
              updates.orderStatus = 'SHIPPED';
            }

            const refreshedOrder = updateOrder(order.id, updates) || order;
            const trackingTimeline = buildOrderTrackingTimeline(refreshedOrder, liveResult);

            return res.json({
              success: true,
              orderId: order.id,
              orderNumber: order.orderNumber,
              tracking: trackingTimeline,
            });
          }
        } catch (syncErr) {
          console.warn(`[Shiprocket Tracking] Live tracking sync deferred for #${order.orderNumber}:`, syncErr);
        }
      }

      // Fallback / standard milestone tracking representation
      const trackingTimeline = buildOrderTrackingTimeline(order);
      return res.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        tracking: trackingTimeline,
      });
    } catch (err: any) {
      console.error('[Tracking API] Error fetching tracking details:', err);
      return res.status(500).json({ error: err.message || 'Failed to fetch shipment tracking details.' });
    }
  });

  // -------------------------------------------------------------
  // API: Customer Orders - Real-Time Tracking (Owner Verified)
  // -------------------------------------------------------------
  app.get('/api/customer/orders/:id/tracking', requireCustomer, async (req: AuthRequest, res: Response) => {
    try {
      const order = getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      const isOwner =
        (order.customerId && order.customerId === req.customerUser!.customerId) ||
        (order.customer?.email && order.customer.email.toLowerCase() === req.customerUser!.email.toLowerCase());

      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden. You do not have permission to view tracking for this order.' });
      }

      // Check live Shiprocket tracking
      if (order.shiprocketAWB || order.shiprocketOrderId || order.shiprocketShipmentId) {
        try {
          const liveResult = await trackShiprocketShipment({
            awb: order.shiprocketAWB,
            orderId: order.shiprocketOrderId,
            shipmentId: order.shiprocketShipmentId,
          });

          if (liveResult.success) {
            const updates: Partial<Order> = {
              shiprocketStatus: liveResult.currentStatus || order.shiprocketStatus,
              shiprocketStatusCode: liveResult.currentStatusCode || order.shiprocketStatusCode,
              shiprocketAWB: liveResult.awbCode || order.shiprocketAWB,
              shiprocketCourier: liveResult.courierName || order.shiprocketCourier,
              shiprocketEtd: liveResult.etd || order.shiprocketEtd,
              shiprocketTrackUrl: liveResult.trackUrl || order.shiprocketTrackUrl,
              shiprocketLastSync: new Date().toISOString(),
            };

            const refreshedOrder = updateOrder(order.id, updates) || order;
            const trackingTimeline = buildOrderTrackingTimeline(refreshedOrder, liveResult);

            return res.json({
              success: true,
              orderId: order.id,
              orderNumber: order.orderNumber,
              tracking: trackingTimeline,
            });
          }
        } catch (syncErr) {
          console.warn(`[Shiprocket Tracking] Live tracking sync deferred for #${order.orderNumber}:`, syncErr);
        }
      }

      const trackingTimeline = buildOrderTrackingTimeline(order);
      return res.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        tracking: trackingTimeline,
      });
    } catch (err: any) {
      console.error('[Customer Tracking API] Error fetching tracking details:', err);
      return res.status(500).json({ error: err.message || 'Failed to fetch customer tracking details.' });
    }
  });

  // -------------------------------------------------------------
  // API: Admin - Assign / Generate AWB for Shipment
  // -------------------------------------------------------------
  app.post('/api/admin/orders/:id/assign-awb', requireAdmin, async (req: Request, res: Response) => {
    try {
      const order = getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      if (!order.shiprocketShipmentId) {
        return res.status(400).json({ error: 'Order does not have a Shiprocket shipment ID yet.' });
      }

      const { courierId } = req.body;
      const awbResult = await assignShiprocketAWB(order.shiprocketShipmentId, courierId);

      if (!awbResult.success || !awbResult.awbCode) {
        return res.status(400).json({ error: awbResult.error || 'Failed to assign AWB via Shiprocket.' });
      }

      const updatedOrder = updateOrder(order.id, {
        shiprocketAWB: awbResult.awbCode,
        shiprocketCourier: awbResult.courierName || order.shiprocketCourier,
        shiprocketStatus: 'AWB_ASSIGNED',
        orderStatus: 'SHIPPED',
        shiprocketTrackUrl: `https://shiprocket.co//tracking/${awbResult.awbCode}`,
        shiprocketLastSync: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: `AWB ${awbResult.awbCode} assigned successfully.`,
        order: updatedOrder,
      });
    } catch (err: any) {
      console.error('[Admin Assign AWB] Error assigning AWB:', err);
      return res.status(500).json({ error: err.message || 'Failed to assign AWB.' });
    }
  });

  // -------------------------------------------------------------
  // API: Admin Clear Test Data
  // -------------------------------------------------------------
  app.post('/api/admin/clear-test-data', requireAdmin, (req: Request, res: Response) => {
    const result = clearTestOrders();
    res.json({
      success: true,
      ...result,
      message: `Cleared ${result.clearedCount} test orders. ${result.remainingCount} production orders remain.`,
    });
  });

  // -------------------------------------------------------------
  // API: Get Public Order details by ID (for Confirmation / Invoice)
  // -------------------------------------------------------------
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // -------------------------------------------------------------
  // API: Download Official Tax Invoice PDF
  // -------------------------------------------------------------
  app.get('/api/orders/:id/invoice-pdf', async (req: Request, res: Response) => {
    try {
      const order = getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const fileName = getInvoiceFileName(order.orderNumber);
      const pdfBuffer = await generateInvoicePdf(order, true);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error('Error generating PDF invoice:', err);
      res.status(500).json({ error: 'Failed to generate PDF invoice.' });
    }
  });

  // -------------------------------------------------------------
  // API: Admin Authentication
  // -------------------------------------------------------------
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateAdminToken(username);
      return res.json({
        success: true,
        token,
        username,
        expiresIn: '7 days',
      });
    }
    return res.status(401).json({ error: 'Invalid admin username or password.' });
  });

  // -------------------------------------------------------------
  // API: Admin Dashboard Stats
  // -------------------------------------------------------------
  app.get('/api/admin/dashboard', requireAdmin, (req: Request, res: Response) => {
    const orders = getOrders();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');

    const totalOrders = orders.length;
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'NEW').length;
    const confirmedOrders = orders.filter((o) => o.orderStatus === 'CONFIRMED').length;
    const processingOrders = orders.filter((o) => o.orderStatus === 'PROCESSING').length;
    const shippedOrders = orders.filter((o) => o.orderStatus === 'SHIPPED').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'CANCELLED').length;

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const todayRevenue = paidOrders
      .filter((o) => o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.grandTotal, 0);
    const thisMonthRevenue = paidOrders
      .filter((o) => o.createdAt.startsWith(currentMonthStr))
      .reduce((sum, o) => sum + o.grandTotal, 0);

    // Sales by day (last 7 days)
    const last7Days: { date: string; label: string; orders: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const ds = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayOrders = paidOrders.filter((o) => o.createdAt.startsWith(ds));
      const dayRev = dayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      last7Days.push({
        date: ds,
        label: dayName,
        orders: dayOrders.length,
        revenue: dayRev,
      });
    }

    res.json({
      metrics: {
        totalOrders,
        todayOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        todayRevenue,
        thisMonthRevenue,
      },
      last7Days,
      recentOrders: orders.slice(0, 10),
    });
  });

  // -------------------------------------------------------------
  // API: Admin Orders List with Filter
  // -------------------------------------------------------------
  app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
    let orders = getOrders();
    const { status, paymentStatus, search } = req.query;

    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.orderStatus === status);
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      orders = orders.filter((o) => o.paymentStatus === paymentStatus);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.mobile.includes(q) ||
          o.customer.city.toLowerCase().includes(q) ||
          o.customer.state.toLowerCase().includes(q)
      );
    }

    res.json({ orders, total: orders.length });
  });

  // -------------------------------------------------------------
  // API: Admin Get Order by ID
  // -------------------------------------------------------------
  app.get('/api/admin/orders/:id', requireAdmin, (req: Request, res: Response) => {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // -------------------------------------------------------------
  // API: Admin Update Order Status
  // -------------------------------------------------------------
  app.patch('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { orderStatus, paymentStatus, notes } = req.body;
    const updates: Partial<Order> = {};
    if (orderStatus) updates.orderStatus = orderStatus as OrderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus as PaymentStatus;
    if (notes !== undefined) updates.notes = notes;

    const updated = updateOrder(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  });

  // -------------------------------------------------------------
  // API: Public Distributor Enquiry Submission
  // -------------------------------------------------------------
  app.post('/api/distributor/enquiry', async (req: Request, res: Response) => {
    try {
      const {
        name,
        businessName,
        mobile,
        email,
        city,
        state,
        pincode,
        businessType,
        yearsInBusiness,
        currentCategories,
        monthlyRequirement,
        preferredTerritory,
        fmcgExperience,
        message,
      } = req.body;

      // Validate required fields
      if (!name || !businessName || !mobile || !email || !city || !state || !pincode || !businessType) {
        return res.status(400).json({
          error: 'Please complete all required fields (Name, Business Name, Mobile, Email, City, State, PIN Code, and Business Type).',
        });
      }

      // Validate email format
      const emailTrim = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      // Validate mobile number (at least 10 digits)
      const cleanMobile = mobile.replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
      }

      // Create enquiry in storage with status NEW
      const newEnquiry = createDistributorEnquiry({
        name,
        businessName,
        mobile,
        email: emailTrim,
        city,
        state,
        pincode,
        businessType,
        yearsInBusiness,
        currentCategories,
        monthlyRequirement,
        preferredTerritory,
        fmcgExperience: fmcgExperience || 'No',
        message,
      });

      // Broadcast real-time SSE notification to connected admin console
      broadcastToAdmin('new-distributor-enquiry', {
        title: '💼 New Distributor Application',
        message: `${newEnquiry.businessName} (${newEnquiry.name}) applied for ${newEnquiry.city}, ${newEnquiry.state}`,
        enquiryId: newEnquiry.id,
        businessName: newEnquiry.businessName,
        city: newEnquiry.city,
        state: newEnquiry.state,
        timestamp: newEnquiry.createdAt,
      });

      // Send transactional emails: Admin Notification & Applicant Acknowledgement
      // (Using server-side email infrastructure, failures are caught gracefully)
      Promise.allSettled([
        sendDistributorNotificationEmail(newEnquiry),
        sendDistributorAcknowledgementEmail(newEnquiry),
      ]).then((results) => {
        results.forEach((r, idx) => {
          if (r.status === 'rejected') {
            console.error(`[Distributor Email] Dispatch failed (${idx === 0 ? 'Admin' : 'Applicant'}):`, r.reason);
          }
        });
      });

      res.status(201).json({
        success: true,
        enquiryId: newEnquiry.id,
        message: 'Your distributor enquiry has been submitted successfully! Our team will review your application and reach out within 24 to 48 hours.',
      });
    } catch (err: any) {
      console.error('Error submitting distributor enquiry:', err);
      res.status(500).json({ error: err.message || 'Failed to submit distributor enquiry.' });
    }
  });

  // -------------------------------------------------------------
  // API: Admin Distributor Enquiries List with Filters
  // -------------------------------------------------------------
  app.get('/api/admin/distributor-enquiries', requireAdmin, (req: Request, res: Response) => {
    let enquiries = getDistributorEnquiries();
    const { status, state, businessType, search } = req.query;

    if (status && status !== 'ALL') {
      enquiries = enquiries.filter((e) => e.status === status);
    }

    if (state && state !== 'ALL') {
      enquiries = enquiries.filter((e) => e.state.toLowerCase() === String(state).toLowerCase());
    }

    if (businessType && businessType !== 'ALL') {
      enquiries = enquiries.filter((e) => e.businessType.toLowerCase() === String(businessType).toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      enquiries = enquiries.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.businessName.toLowerCase().includes(q) ||
          e.mobile.includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.state.toLowerCase().includes(q) ||
          (e.preferredTerritory && e.preferredTerritory.toLowerCase().includes(q))
      );
    }

    res.json({
      enquiries,
      total: enquiries.length,
    });
  });

  // -------------------------------------------------------------
  // API: Admin Get Single Distributor Enquiry
  // -------------------------------------------------------------
  app.get('/api/admin/distributor-enquiries/:id', requireAdmin, (req: Request, res: Response) => {
    const enquiry = getDistributorEnquiryById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Distributor enquiry not found.' });
    }
    res.json(enquiry);
  });

  // -------------------------------------------------------------
  // API: Admin Update Distributor Enquiry Status
  // -------------------------------------------------------------
  app.patch('/api/admin/distributor-enquiries/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updated = updateDistributorEnquiryStatus(req.params.id, status as DistributorEnquiryStatus, adminNotes);
    if (!updated) {
      return res.status(404).json({ error: 'Distributor enquiry not found.' });
    }

    res.json({
      success: true,
      enquiry: updated,
      message: `Enquiry ${updated.id} status updated to ${updated.status}.`,
    });
  });

  // -------------------------------------------------------------
  // API: Push Notifications Trigger / Test
  // -------------------------------------------------------------
  app.post('/api/notifications/send', requireAdmin, (req: Request, res: Response) => {
    const { title, message, orderId } = req.body;
    const payload = {
      title: title || '🛒 New SpiceShahi Order Alert',
      message: message || 'Test notification from SpiceShahi Admin',
      orderId: orderId || 'TEST',
      timestamp: new Date().toISOString(),
    };
    broadcastToAdmin('new-order', payload);
    res.json({ success: true, message: 'Notification broadcast sent.' });
  });

  // -------------------------------------------------------------
  // API: SSE Stream for Real-time Admin Notifications
  // -------------------------------------------------------------
  app.get('/api/admin/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // -------------------------------------------------------------
  // API: Gemini AI Sommelier Chat with Search Grounding
  // -------------------------------------------------------------
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      // Offline fallback knowledge engine
      const fallback = getFallbackResponse(message, history || []);
      return res.json({
        text: fallback.text,
        sources: fallback.sources || [],
        modelUsed: 'SpiceShahi Knowledge Engine',
      });
    }

    try {
      // Build conversation contents preserving history
      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const h of history) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Use gemini-3.5-flash with googleSearch tool for search grounding
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web.title || c.web.uri,
          uri: c.web.uri,
        }));

      return res.json({
        text,
        sources,
        modelUsed: 'gemini-3.5-flash (Search Grounded)',
      });
    } catch (err: any) {
      console.error('Gemini chat error, fallback active:', err);
      const fallback = getFallbackResponse(message, history || []);
      return res.json({
        text: fallback.text,
        sources: fallback.sources || [],
        modelUsed: 'SpiceShahi Knowledge Engine (Fallback)',
      });
    }
  });

  // -------------------------------------------------------------
  // API: Gemini Audio Transcription (gemini-3.5-transcribe)
  // -------------------------------------------------------------
  app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
    const { audioBase64, mimeType } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.json({
        text: 'What are the authentic uses and benefits of SpiceShahi Turmeric and Coriander powder?',
        isSimulated: true,
      });
    }

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio base64 data required' });
    }

    try {
      const audioPart = {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: { parts: [audioPart, { text: 'Transcribe this spoken query accurately into text (in Hindi or English as spoken).' }] },
      });

      res.json({ text: response.text || '' });
    } catch (err: any) {
      console.error('Transcription error:', err);
      res.status(500).json({ error: err.message || 'Transcription failed' });
    }
  });

  // -------------------------------------------------------------
  // API: Gemini Text-to-Speech (gemini-3.8-flash-lite-tts)
  // -------------------------------------------------------------
  app.post('/api/ai/tts', async (req: Request, res: Response) => {
    const { text } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey || !text) {
      return res.status(400).json({ error: 'TTS requires GEMINI_API_KEY in environment' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 300),
                speechMetadata: {
                  style: 'Warm, hospitable royal Indian culinary chef',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audioBase64: base64Audio });
      } else {
        res.status(500).json({ error: 'No audio generated' });
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      res.status(500).json({ error: err.message || 'TTS generation failed' });
    }
  });

  // -------------------------------------------------------------
  // Vite Frontend Middleware / Static files
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SpiceShahi Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
