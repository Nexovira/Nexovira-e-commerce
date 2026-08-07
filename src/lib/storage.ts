import {
  UserProfile,
  Product,
  ProductCategory,
  Order,
  CartItem,
  WalletTransaction,
  WithdrawalRequest,
  ReferralRecord,
  StoreSettings,
  ShippingZone,
  PaymentRecord,
  WebhookLog,
  AuditLog,
  EmailNotificationLog,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_SHIPPING_ZONES } from '../data/initialData';
import { realtimeSync, supabase } from './supabaseClient';

let memoryProductsCache: Product[] | null = null;

const KEYS = {
  USER: 'nexovira_user_session',
  REGISTERED_USERS: 'nexovira_registered_users',
  PRODUCTS: 'nexovira_products_catalog',
  CATEGORIES: 'nexovira_categories_list',
  CART: 'nexovira_shopping_cart',
  WISHLIST: 'nexovira_wishlist_ids',
  ORDERS: 'nexovira_orders_history',
  TRANSACTIONS: 'nexovira_wallet_transactions',
  PAYMENTS: 'nexovira_payment_records',
  WEBHOOK_LOGS: 'nexovira_paystack_webhook_logs',
  AUDIT_LOGS: 'nexovira_audit_logs',
  EMAIL_LOGS: 'nexovira_email_logs',
  WITHDRAWALS: 'nexovira_withdrawal_requests',
  REFERRALS: 'nexovira_referrals_records',
  SETTINGS: 'nexovira_store_settings',
  SHIPPING_ZONES: 'nexovira_shipping_zones',
  RECENTLY_VIEWED: 'nexovira_recently_viewed_ids',
  PAYSTACK_CONNECTIONS: 'nexovira_paystack_merchant_connections',
  ANNOUNCEMENTS: 'nexovira_store_announcements',
  COUPONS: 'nexovira_store_coupons',
};

// Default Demo Accounts
export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@nexovira.com',
  fullName: 'Nexovira Store Manager',
  phone: '08129595134',
  role: 'admin',
  referralCode: 'NEXO-ADMIN',
  walletBalance: 2500000,
  referralEarnings: 450000,
  createdAt: new Date().toISOString(),
};

export const DEMO_CUSTOMER: UserProfile = {
  id: 'usr-cust-01',
  email: 'customer@nexovira.com',
  fullName: 'Tunde Bakare',
  phone: '08031234567',
  role: 'customer',
  referralCode: 'NEXO-TUNDE88',
  walletBalance: 0,
  referralEarnings: 0,
  isPaystackConnected: false,
  address: {
    street: '15 Admiralty Way',
    city: 'Lekki Phase 1',
    state: 'Lagos',
    country: 'Nigeria',
  },
  createdAt: new Date().toISOString(),
};

// Helper to safely load JSON from localStorage
function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading localStorage key "${key}":`, err);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexovira-data-sync'));
      realtimeSync.notifyChange('products', { key, timestamp: Date.now() });
    }
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
  }
}

// Storage API Interface
export const storageApi = {
  // Store Settings
  getSettings(): StoreSettings {
    return getStoredItem<StoreSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: StoreSettings): void {
    setStoredItem(KEYS.SETTINGS, settings);
  },

  // Auth User Session
  getCurrentUser(): UserProfile | null {
    return getStoredItem<UserProfile | null>(KEYS.USER, null);
  },
  setCurrentUser(user: UserProfile | null): void {
    setStoredItem(KEYS.USER, user);
  },

  // Registered Accounts Registry
  getRegisteredUsers(): UserProfile[] {
    return getStoredItem<UserProfile[]>(KEYS.REGISTERED_USERS, [DEMO_CUSTOMER]);
  },
  registerUser(user: UserProfile): UserProfile[] {
    const currentUsers = this.getRegisteredUsers();
    const exists = currentUsers.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      const updated = currentUsers.map((u) => (u.email.toLowerCase() === user.email.toLowerCase() ? user : u));
      setStoredItem(KEYS.REGISTERED_USERS, updated);
      return updated;
    }
    const updated = [user, ...currentUsers];
    setStoredItem(KEYS.REGISTERED_USERS, updated);
    return updated;
  },

  // Products
  getProducts(): Product[] {
    if (memoryProductsCache && memoryProductsCache.length > 0) {
      return memoryProductsCache;
    }
    const local = getStoredItem<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    memoryProductsCache = local;
    return local;
  },

  setProductsCache(products: Product[]): void {
    memoryProductsCache = products;
    setStoredItem(KEYS.PRODUCTS, products);
  },

  async fetchProductsAsync(): Promise<Product[]> {
    // 1. Query Supabase directly if configured client-side
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const formatted: Product[] = data.map((item: any) => ({
            id: item.id,
            sku: item.sku || 'NEXO-' + item.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            brand: item.brand || 'Nexovira',
            categoryId: item.category_id || item.categoryId || 'cat-refrigerators',
            categoryName: item.category_name || item.categoryName || 'Appliance',
            price: Number(item.price || 0),
            originalPrice: item.original_price ? Number(item.original_price) : undefined,
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined,
            description: item.description || '',
            features: Array.isArray(item.features) ? item.features : typeof item.features === 'string' ? JSON.parse(item.features) : [],
            specs: typeof item.specs === 'object' && item.specs ? item.specs : {},
            images: Array.isArray(item.images) ? item.images : typeof item.images === 'string' ? JSON.parse(item.images) : [item.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80'],
            stock: Number(item.stock || 0),
            isFeatured: Boolean(item.is_featured ?? item.isFeatured),
            isNewArrival: Boolean(item.is_new_arrival ?? item.isNewArrival),
            isBestSeller: Boolean(item.is_best_seller ?? item.isBestSeller),
            rating: Number(item.rating || 5.0),
            reviewCount: Number(item.review_count || item.reviewCount || 1),
            variations: Array.isArray(item.variations) ? item.variations : [],
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          }));
          this.setProductsCache(formatted);
          return formatted;
        }
      } catch (supabaseErr) {
        // Silently continue to server API
      }
    }

    // 2. Query backend API endpoint
    try {
      const res = await fetch('/api/products?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.products) && json.products.length > 0) {
          this.setProductsCache(json.products);
          return json.products;
        }
      }
    } catch (apiErr) {
      // Silently fall back to local cached products
    }

    return this.getProducts();
  },

  saveProducts(products: Product[]): void {
    this.setProductsCache(products);
  },

  addProduct(product: Product): Product[] {
    const products = this.getProducts().filter(p => p.id !== product.id);
    const updated = [product, ...products];
    this.setProductsCache(updated);
    this.addProductAsync(product).catch(() => {});
    return updated;
  },

  async addProductAsync(product: Product): Promise<Product[]> {
    let savedProduct = product;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) savedProduct = json.data;
      }
    } catch (err) {
      console.warn('[Add Product API Warning]:', err);
    }

    if (supabase) {
      try {
        await supabase.from('products').upsert({
          id: savedProduct.id,
          sku: savedProduct.sku,
          name: savedProduct.name,
          slug: savedProduct.slug,
          brand: savedProduct.brand,
          category_id: savedProduct.categoryId,
          category_name: savedProduct.categoryName,
          price: savedProduct.price,
          original_price: savedProduct.originalPrice,
          discount_percent: savedProduct.discountPercent,
          description: savedProduct.description,
          features: savedProduct.features,
          specs: savedProduct.specs,
          images: savedProduct.images,
          stock: savedProduct.stock,
          is_featured: savedProduct.isFeatured,
          is_new_arrival: savedProduct.isNewArrival,
          is_best_seller: savedProduct.isBestSeller,
          rating: savedProduct.rating,
          review_count: savedProduct.reviewCount,
          variations: savedProduct.variations,
          created_at: savedProduct.createdAt,
        });
      } catch (err) {
        console.warn('[Supabase Product Insert Warning]:', err);
      }
    }

    const products = this.getProducts().filter(p => p.id !== savedProduct.id);
    const updated = [savedProduct, ...products];
    this.setProductsCache(updated);
    realtimeSync.notifyChange('products', { action: 'create', product: savedProduct });
    return updated;
  },

  updateProduct(updatedProduct: Product): Product[] {
    const products = this.getProducts();
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    this.setProductsCache(updated);
    this.updateProductAsync(updatedProduct).catch(() => {});
    return updated;
  },

  async updateProductAsync(updatedProduct: Product): Promise<Product[]> {
    try {
      await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch (err) {
      console.warn('[Update Product API Warning]:', err);
    }

    if (supabase) {
      try {
        await supabase.from('products').update({
          sku: updatedProduct.sku,
          name: updatedProduct.name,
          slug: updatedProduct.slug,
          brand: updatedProduct.brand,
          category_id: updatedProduct.categoryId,
          category_name: updatedProduct.categoryName,
          price: updatedProduct.price,
          original_price: updatedProduct.originalPrice,
          discount_percent: updatedProduct.discountPercent,
          description: updatedProduct.description,
          features: updatedProduct.features,
          specs: updatedProduct.specs,
          images: updatedProduct.images,
          stock: updatedProduct.stock,
          is_featured: updatedProduct.isFeatured,
          is_new_arrival: updatedProduct.isNewArrival,
          is_best_seller: updatedProduct.isBestSeller,
          rating: updatedProduct.rating,
          review_count: updatedProduct.reviewCount,
          variations: updatedProduct.variations,
          updated_at: new Date().toISOString(),
        }).eq('id', updatedProduct.id);
      } catch (err) {
        console.warn('[Supabase Product Update Warning]:', err);
      }
    }

    const products = this.getProducts();
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    this.setProductsCache(updated);
    realtimeSync.notifyChange('products', { action: 'update', product: updatedProduct });
    return updated;
  },

  deleteProduct(productId: string): Product[] {
    const products = this.getProducts();
    const updated = products.filter((p) => p.id !== productId);
    this.setProductsCache(updated);
    this.cleanProductFromCartsAndWishlists(productId);
    this.deleteProductAsync(productId).catch(() => {});
    return updated;
  },

  async deleteProductAsync(productId: string): Promise<Product[]> {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('[Delete Product API Warning]:', err);
    }

    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('[Supabase Product Delete Warning]:', err);
      }
    }

    const products = this.getProducts();
    const updated = products.filter((p) => p.id !== productId);
    this.setProductsCache(updated);
    this.cleanProductFromCartsAndWishlists(productId);
    realtimeSync.notifyChange('products', { action: 'delete', productId });
    return updated;
  },
  cleanProductFromCartsAndWishlists(productId: string): void {
    try {
      const cart = this.getCart();
      const updatedCart = cart.filter((item) => item.product?.id !== productId);
      this.saveCart(updatedCart);

      const wishlist = this.getWishlistIds();
      const updatedWishlist = wishlist.filter((id) => id !== productId);
      this.saveWishlistIds(updatedWishlist);

      const recentlyViewed = getStoredItem<string[]>(KEYS.RECENTLY_VIEWED, []);
      const updatedRecentlyViewed = recentlyViewed.filter((id) => id !== productId);
      setStoredItem(KEYS.RECENTLY_VIEWED, updatedRecentlyViewed);
    } catch (err) {
      console.error('Error cleaning deleted product from cart/wishlist:', err);
    }
  },

  // Categories
  getCategories(): ProductCategory[] {
    return getStoredItem<ProductCategory[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  saveCategories(categories: ProductCategory[]): void {
    setStoredItem(KEYS.CATEGORIES, categories);
  },
  addCategory(category: ProductCategory): ProductCategory[] {
    const categories = this.getCategories();
    const updated = [...categories, category];
    this.saveCategories(updated);
    return updated;
  },
  updateCategory(category: ProductCategory): ProductCategory[] {
    const categories = this.getCategories();
    const updated = categories.map((c) => (c.id === category.id ? category : c));
    this.saveCategories(updated);
    return updated;
  },
  deleteCategory(categoryId: string): ProductCategory[] {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.id !== categoryId);
    this.saveCategories(updated);
    return updated;
  },

  // Shipping Zones & Prices
  getShippingZones(): ShippingZone[] {
    return getStoredItem<ShippingZone[]>(KEYS.SHIPPING_ZONES, INITIAL_SHIPPING_ZONES);
  },
  saveShippingZones(zones: ShippingZone[]): void {
    setStoredItem(KEYS.SHIPPING_ZONES, zones);
  },
  addShippingZone(zone: ShippingZone): ShippingZone[] {
    const current = this.getShippingZones();
    const updated = [...current, zone];
    this.saveShippingZones(updated);
    return updated;
  },
  updateShippingZone(zone: ShippingZone): ShippingZone[] {
    const current = this.getShippingZones();
    const updated = current.map((z) => (z.id === zone.id ? zone : z));
    this.saveShippingZones(updated);
    return updated;
  },
  deleteShippingZone(zoneId: string): ShippingZone[] {
    const current = this.getShippingZones();
    const updated = current.filter((z) => z.id !== zoneId);
    this.saveShippingZones(updated);
    return updated;
  },

  // Cart
  getCart(): CartItem[] {
    return getStoredItem<CartItem[]>(KEYS.CART, []);
  },
  saveCart(cart: CartItem[]): void {
    setStoredItem(KEYS.CART, cart);
  },

  // Wishlist
  getWishlistIds(): string[] {
    return getStoredItem<string[]>(KEYS.WISHLIST, []);
  },
  saveWishlistIds(ids: string[]): void {
    setStoredItem(KEYS.WISHLIST, ids);
  },
  toggleWishlist(productId: string): string[] {
    const current = this.getWishlistIds();
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
    this.saveWishlistIds(updated);
    return updated;
  },

  // Orders
  getOrders(): Order[] {
    return getStoredItem<Order[]>(KEYS.ORDERS, []);
  },
  saveOrders(orders: Order[]): void {
    setStoredItem(KEYS.ORDERS, orders);
  },
  createOrder(order: Order): void {
    const orders = this.getOrders();
    const updated = [order, ...orders];
    this.saveOrders(updated);

    // Reduce stock for ordered items & mark out of stock automatically
    const products = this.getProducts();
    const updatedProducts = products.map((p) => {
      const match = order.items.find((item) => item.productId === p.id);
      if (match) {
        const newStock = Math.max(0, p.stock - match.quantity);
        return {
          ...p,
          stock: newStock,
        };
      }
      return p;
    });
    this.saveProducts(updatedProducts);

    // Record Payment Entry if paid
    if (order.paymentStatus === 'paid') {
      const payRecord: PaymentRecord = {
        id: 'pay-' + Date.now(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        reference: order.paymentReference || 'REF-' + Date.now(),
        transactionId: order.transactionId,
        authorizationCode: order.authorizationCode,
        paymentMethod: order.paymentMethod,
        channel: order.channel || 'paystack_inline',
        gatewayResponse: order.gatewayResponse || 'Successful Paystack Payment',
        currency: order.currency || 'NGN',
        amountPaid: order.amountPaid || order.totalAmount,
        status: 'paid',
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        paymentDate: order.paymentDate || new Date().toISOString(),
      };
      this.addPaymentRecord(payRecord);

      // Audit Log
      this.addAuditLog({
        id: 'audit-' + Date.now(),
        action: 'PAYMENT_VERIFIED_AND_ORDER_CREATED',
        actor: order.customerEmail,
        details: `Order #${order.orderNumber} placed and paid ₦${order.totalAmount.toLocaleString()} via Paystack/Wallet. Ref: ${payRecord.reference}`,
        timestamp: new Date().toISOString(),
        metadata: { orderId: order.id, reference: payRecord.reference },
      });

      // Email Confirmation Logs
      this.addEmailLog({
        id: 'email-' + Date.now() + '-cust-order',
        recipient: order.customerEmail,
        subject: `Order Confirmation #${order.orderNumber} - Nexovira Store`,
        body: `Dear ${order.customerName},\n\nThank you for shopping at Nexovira Appliance Store! Your order #${order.orderNumber} for ₦${order.totalAmount.toLocaleString()} has been placed successfully and is currently being processed.\n\nShipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}.\n\nTracking Number: ${order.trackingNumber || 'Pending'}`,
        type: 'order_confirmation',
        sentAt: new Date().toISOString(),
      });

      this.addEmailLog({
        id: 'email-' + Date.now() + '-cust-pay',
        recipient: order.customerEmail,
        subject: `Payment Receipt #${order.orderNumber} - Nexovira Store`,
        body: `Payment Receipt\nReference: ${payRecord.reference}\nAmount Paid: ₦${order.totalAmount.toLocaleString()}\nMethod: Paystack (${order.paymentMethod})\nDate: ${new Date().toLocaleString()}`,
        type: 'payment_confirmation',
        sentAt: new Date().toISOString(),
      });

      this.addEmailLog({
        id: 'email-' + Date.now() + '-admin',
        recipient: 'admin@nexovira.com',
        subject: `[NEW ORDER PAID] Order #${order.orderNumber}`,
        body: `New paid order received from ${order.customerName} (${order.customerEmail}). Total Amount: ₦${order.totalAmount.toLocaleString()}. Payment Ref: ${payRecord.reference}`,
        type: 'admin_alert',
        sentAt: new Date().toISOString(),
      });
    }

    // Add Wallet Transaction record if paid via wallet
    if (order.paymentMethod === 'wallet' || order.paymentMethod === 'paystack_and_wallet') {
      const tx: WalletTransaction = {
        id: 'tx-' + Date.now(),
        userId: order.userId,
        type: 'purchase',
        amount: order.totalAmount,
        status: 'completed',
        reference: order.orderNumber,
        description: `Order Payment #${order.orderNumber}`,
        createdAt: new Date().toISOString(),
      };
      this.addWalletTransaction(tx);
    }
  },
  updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Order[] {
    const orders = this.getOrders();
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          paymentStatus: paymentStatus || o.paymentStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    this.saveOrders(updated);
    return updated;
  },
  updateOrderPaymentDetails(orderId: string, payData: Partial<Order>): Order[] {
    const orders = this.getOrders();
    const updated = orders.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        return {
          ...o,
          ...payData,
          paymentStatus: 'paid' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    this.saveOrders(updated);
    return updated;
  },
  deleteOrder(orderId: string): Order[] {
    const orders = this.getOrders();
    const updated = orders.filter((o) => o.id !== orderId && o.orderNumber !== orderId);
    this.saveOrders(updated);
    return updated;
  },

  // Payment Records
  getPaymentRecords(): PaymentRecord[] {
    return getStoredItem<PaymentRecord[]>(KEYS.PAYMENTS, []);
  },
  addPaymentRecord(record: PaymentRecord): void {
    const records = this.getPaymentRecords();
    const exists = records.some((r) => r.reference === record.reference);
    if (!exists) {
      setStoredItem(KEYS.PAYMENTS, [record, ...records]);
    }
  },

  // Webhook Logs
  getWebhookLogs(): WebhookLog[] {
    return getStoredItem<WebhookLog[]>(KEYS.WEBHOOK_LOGS, []);
  },
  addWebhookLog(log: WebhookLog): void {
    const logs = this.getWebhookLogs();
    setStoredItem(KEYS.WEBHOOK_LOGS, [log, ...logs]);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(KEYS.AUDIT_LOGS, []);
  },
  addAuditLog(log: AuditLog): void {
    const logs = this.getAuditLogs();
    setStoredItem(KEYS.AUDIT_LOGS, [log, ...logs]);
  },

  // Email Notification Logs
  getEmailLogs(): EmailNotificationLog[] {
    return getStoredItem<EmailNotificationLog[]>(KEYS.EMAIL_LOGS, []);
  },
  addEmailLog(log: EmailNotificationLog): void {
    const logs = this.getEmailLogs();
    setStoredItem(KEYS.EMAIL_LOGS, [log, ...logs]);
  },

  // Wallet & Transactions
  getWalletTransactions(userId?: string): WalletTransaction[] {
    const all = getStoredItem<WalletTransaction[]>(KEYS.TRANSACTIONS, []);
    if (!userId) return all;
    return all.filter((t) => t.userId === userId);
  },
  addWalletTransaction(tx: WalletTransaction): void {
    const all = getStoredItem<WalletTransaction[]>(KEYS.TRANSACTIONS, []);
    setStoredItem(KEYS.TRANSACTIONS, [tx, ...all]);
  },

  // Withdrawals
  getWithdrawals(): WithdrawalRequest[] {
    return getStoredItem<WithdrawalRequest[]>(KEYS.WITHDRAWALS, []);
  },
  addWithdrawalRequest(req: WithdrawalRequest): void {
    const all = this.getWithdrawals();
    setStoredItem(KEYS.WITHDRAWALS, [req, ...all]);
  },
  updateWithdrawalStatus(reqId: string, status: 'approved' | 'rejected', notes?: string): WithdrawalRequest[] {
    const all = this.getWithdrawals();
    const updated = all.map((r) => {
      if (r.id === reqId) {
        return {
          ...r,
          status,
          processedAt: new Date().toISOString(),
          notes,
        };
      }
      return r;
    });
    setStoredItem(KEYS.WITHDRAWALS, updated);
    return updated;
  },

  // Referrals
  getReferrals(referrerId?: string): ReferralRecord[] {
    const all = getStoredItem<ReferralRecord[]>(KEYS.REFERRALS, []);
    if (!referrerId) return all;
    return all.filter((r) => r.referrerId === referrerId);
  },
  addReferral(record: ReferralRecord): void {
    const all = getStoredItem<ReferralRecord[]>(KEYS.REFERRALS, []);
    setStoredItem(KEYS.REFERRALS, [record, ...all]);
  },

  // Recently Viewed
  getRecentlyViewedIds(): string[] {
    return getStoredItem<string[]>(KEYS.RECENTLY_VIEWED, []);
  },
  addRecentlyViewed(productId: string): string[] {
    const current = this.getRecentlyViewedIds().filter((id) => id !== productId);
    const updated = [productId, ...current].slice(0, 10);
    setStoredItem(KEYS.RECENTLY_VIEWED, updated);
    return updated;
  },

  // Paystack Merchant Connections
  getPaystackConnections(): Record<string, any> {
    return getStoredItem<Record<string, any>>(KEYS.PAYSTACK_CONNECTIONS, {});
  },
  getPaystackConnection(userId: string) {
    const connections = this.getPaystackConnections();
    return connections[userId] || null;
  },
  savePaystackConnection(userId: string, data: any) {
    const connections = this.getPaystackConnections();
    const updated = {
      ...connections,
      [userId]: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    };
    setStoredItem(KEYS.PAYSTACK_CONNECTIONS, updated);
    return updated[userId];
  },
  disconnectPaystack(userId: string) {
    const connections = this.getPaystackConnections();
    if (connections[userId]) {
      connections[userId].status = 'disconnected';
      connections[userId].updatedAt = new Date().toISOString();
      setStoredItem(KEYS.PAYSTACK_CONNECTIONS, connections);
    }
  },

  // Announcements
  getAnnouncements(): any[] {
    return getStoredItem<any[]>(KEYS.ANNOUNCEMENTS, [
      {
        id: 'ann-1',
        title: '🚚 Free Nationwide Express Delivery!',
        content: 'Enjoy free delivery on all smart inverter refrigerators & ACs above ₦250,000 this week.',
        type: 'promo',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  },
  saveAnnouncements(list: any[]) {
    setStoredItem(KEYS.ANNOUNCEMENTS, list);
  },

  // Coupons
  getCoupons(): any[] {
    return getStoredItem<any[]>(KEYS.COUPONS, [
      {
        id: 'cpn-1',
        code: 'NEXO5',
        discountPercent: 5,
        minSpend: 100000,
        isActive: true,
        expiryDate: '2026-12-31',
      },
      {
        id: 'cpn-2',
        code: 'WELCOME10',
        discountPercent: 10,
        minSpend: 250000,
        isActive: true,
        expiryDate: '2026-12-31',
      },
    ]);
  },
  saveCoupons(list: any[]) {
    setStoredItem(KEYS.COUPONS, list);
  },
};
