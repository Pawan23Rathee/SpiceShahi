import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
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
} from './server/storage.js';
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from './server/email.js';
import { Order, OrderItem, CustomerDetails, OrderStatus, PaymentStatus } from './src/types.js';
import { ai, SYSTEM_INSTRUCTION, getFallbackResponse } from './server/ai.js';

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
  app.use(express.json());

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
        mobile: mobile.trim(),
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
  // API: Customer Authentication - Google Login
  // -------------------------------------------------------------
  app.post('/api/auth/google', (req: Request, res: Response) => {
    try {
      const { googleId, email, fullName, profilePhoto, mobile } = req.body;
      if (!email || !googleId) {
        return res.status(400).json({ error: 'Google account details (email and ID) are required.' });
      }

      const emailTrim = email.trim().toLowerCase();
      let customer = getCustomerByGoogleId(googleId) || getCustomerByEmail(emailTrim);

      if (customer) {
        // Update customer with googleId and photo if needed
        customer = updateCustomer(customer.id, {
          googleId,
          profilePhoto: profilePhoto || customer.profilePhoto,
          fullName: customer.fullName || fullName || 'Google User',
        })!;
      } else {
        // Create new customer profile for first-time Google sign in
        customer = createCustomer({
          fullName: (fullName || 'SpiceShahi Customer').trim(),
          email: emailTrim,
          mobile: (mobile || '').trim(),
          googleId,
          profilePhoto,
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
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const customer = getCustomerByEmail(email.trim());
      if (!customer) {
        // Security best practice: don't reveal if email exists, return generic success
        return res.json({
          success: true,
          message: 'If an account exists with this email, password reset instructions have been dispatched.',
        });
      }

      const resetToken = crypto.randomBytes(16).toString('hex');
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
      passwordResetTokens.set(resetToken, { email: customer.email, expiresAt });

      console.log(`[Password Reset] Generated reset token for ${customer.email}: ${resetToken}`);

      res.json({
        success: true,
        resetToken, // Provided for user-friendly testing in UI
        message: `Password reset instructions have been generated for ${customer.email}.`,
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
  // API: Calculate Delivery Charges based on State
  // -------------------------------------------------------------
  app.post('/api/cart/calculate-delivery', (req: Request, res: Response) => {
    const { state, subtotal } = req.body;
    const settings = getSettings();
    const isHaryana = (state || '').trim().toLowerCase() === 'haryana';
    let deliveryCharge = isHaryana
      ? settings.haryanaDeliveryCharge
      : settings.outsideHaryanaDeliveryCharge;

    if (settings.freeDeliveryThreshold > 0 && (subtotal || 0) >= settings.freeDeliveryThreshold) {
      deliveryCharge = 0;
    }

    res.json({
      deliveryCharge,
      isHaryana,
      freeDeliveryApplied: deliveryCharge === 0 && (subtotal || 0) > 0,
      grandTotal: (subtotal || 0) + deliveryCharge,
    });
  });

  // -------------------------------------------------------------
  // API: Create Razorpay / Checkout Order
  // -------------------------------------------------------------
  app.post('/api/payment/create-order', async (req: Request, res: Response) => {
    try {
      const { customer, items, saveAddress, addressLabel } = req.body as {
        customer: CustomerDetails;
        items: OrderItem[];
        saveAddress?: boolean;
        addressLabel?: string;
      };

      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Customer details and non-empty items are required.' });
      }

      if (!customer.fullName || !customer.mobile || !customer.addressLine1 || !customer.state || !customer.pincode) {
        return res.status(400).json({ error: 'Please fill in all required shipping address fields.' });
      }

      if (!customer.email || !customer.email.includes('@')) {
        return res.status(400).json({ error: 'Valid customer email address is required.' });
      }

      // Check for authenticated customer
      const verifiedCustomer = verifyCustomerToken(req.headers.authorization);
      const customerId = verifiedCustomer ? verifiedCustomer.customerId : undefined;

      // If customer requested saving address and is authenticated, save it
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
            pincode: customer.pincode.trim(),
            country: customer.country || 'India',
            isDefault: false,
          });
        } catch (e) {
          console.warn('Could not auto-save address to customer account:', e);
        }
      }

      // Calculate authoritative server-side subtotal
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Determine delivery charge from state
      const settings = getSettings();
      const isHaryana = customer.state.trim().toLowerCase() === 'haryana';
      let deliveryCharge = isHaryana
        ? settings.haryanaDeliveryCharge
        : settings.outsideHaryanaDeliveryCharge;

      if (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold) {
        deliveryCharge = 0;
      }

      const grandTotal = subtotal + deliveryCharge;
      const orderId = generateNextOrderId();

      let razorpayOrderId = `order_sim_${Date.now()}`;
      let isTestMode = true;

      // If Razorpay production/test credentials are configured, create real order with Razorpay
      if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
        try {
          const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
          const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify({
              amount: Math.round(grandTotal * 100), // paise
              currency: 'INR',
              receipt: orderId,
              notes: {
                orderNumber: orderId,
                customerName: customer.fullName,
                mobile: customer.mobile,
                email: customer.email,
                state: customer.state,
              },
            }),
          });

          if (rzpResponse.ok) {
            const rzpData = (await rzpResponse.json()) as { id: string };
            razorpayOrderId = rzpData.id;
            isTestMode = false;
          } else {
            const errData = await rzpResponse.text();
            console.error('Razorpay order creation failed, falling back to simulated order:', errData);
          }
        } catch (rzpErr) {
          console.error('Error connecting to Razorpay API, falling back to test mode:', rzpErr);
        }
      }

      // Save pending order in database
      const newOrder: Order = {
        id: orderId,
        orderNumber: orderId,
        customerId,
        customer,
        items,
        subtotal,
        deliveryCharge,
        deliveryState: customer.state,
        grandTotal,
        paymentMethod: 'ONLINE_RAZORPAY',
        paymentStatus: 'PENDING',
        orderStatus: 'NEW',
        razorpayOrderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveNewOrder(newOrder);

      res.json({
        orderId,
        orderNumber: orderId,
        razorpayOrderId,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID || 'rzp_test_spiceshahi',
        isTestMode,
        subtotal,
        deliveryCharge,
        grandTotal,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerMobile: customer.mobile,
      });
    } catch (err: any) {
      console.error('Error in /api/payment/create-order:', err);
      res.status(500).json({ error: err.message || 'Failed to create payment order.' });
    }
  });

  // -------------------------------------------------------------
  // API: Verify Razorpay Signature & Mark Order as PAID
  // -------------------------------------------------------------
  app.post('/api/payment/verify', async (req: Request, res: Response) => {
    try {
      const {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        isTestBypass,
      } = req.body;

      const order = getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found in database.' });
      }

      let isValid = false;

      // Real signature verification if Razorpay secret is present
      if (RAZORPAY_KEY_SECRET && !isTestBypass) {
        const generatedSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        isValid = generatedSignature === razorpaySignature;
        if (!isValid) {
          console.warn(`Payment signature mismatch for order ${orderId}`);
          updateOrder(orderId, {
            paymentStatus: 'FAILED',
            razorpayPaymentId,
          });
          return res.status(400).json({ error: 'Payment signature verification failed.' });
        }
      } else {
        // Test mode verification
        isValid = true;
      }

      // Mark order as PAID and CONFIRMED
      const updated = updateOrder(orderId, {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        razorpayPaymentId: razorpayPaymentId || `pay_sim_${Date.now()}`,
        razorpaySignature: razorpaySignature || 'simulated_valid_sig',
      });

      // Broadcast instant notification to admin listeners
      const notificationPayload = {
        title: '🛒 New SpiceShahi Order',
        message: `Order #${order.orderNumber} placed by ${order.customer.fullName} for ₹${order.grandTotal} (PAID)`,
        orderId: order.id,
        customer: order.customer.fullName,
        customerEmail: order.customer.email,
        amount: order.grandTotal,
        paymentStatus: 'PAID',
        timestamp: new Date().toISOString(),
      };

      broadcastToAdmin('new-order', notificationPayload);

      // Send real order confirmation email to customer's registered email
      if (updated) {
        sendOrderConfirmationEmail(updated).catch((err) =>
          console.error('Failed to send order confirmation email:', err)
        );
        sendAdminOrderNotification(updated).catch((err) =>
          console.error('Failed to send admin order notification:', err)
        );
      }

      res.json({
        success: true,
        order: updated,
        notification: notificationPayload,
      });
    } catch (err: any) {
      console.error('Error in /api/payment/verify:', err);
      res.status(500).json({ error: err.message || 'Payment verification failed.' });
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
