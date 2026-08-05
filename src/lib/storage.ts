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
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_SHIPPING_ZONES } from '../data/initialData';

const KEYS = {
  USER: 'nexovira_user_session',
  PRODUCTS: 'nexovira_products_catalog',
  CATEGORIES: 'nexovira_categories_list',
  CART: 'nexovira_shopping_cart',
  WISHLIST: 'nexovira_wishlist_ids',
  ORDERS: 'nexovira_orders_history',
  TRANSACTIONS: 'nexovira_wallet_transactions',
  WITHDRAWALS: 'nexovira_withdrawal_requests',
  REFERRALS: 'nexovira_referrals_records',
  SETTINGS: 'nexovira_store_settings',
  SHIPPING_ZONES: 'nexovira_shipping_zones',
  RECENTLY_VIEWED: 'nexovira_recently_viewed_ids',
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
  walletBalance: 150000,
  referralEarnings: 25000,
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

  // Products
  getProducts(): Product[] {
    return getStoredItem<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    setStoredItem(KEYS.PRODUCTS, products);
  },
  addProduct(product: Product): Product[] {
    const products = this.getProducts();
    const updated = [product, ...products];
    this.saveProducts(updated);
    return updated;
  },
  updateProduct(updatedProduct: Product): Product[] {
    const products = this.getProducts();
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    this.saveProducts(updated);
    return updated;
  },
  deleteProduct(productId: string): Product[] {
    const products = this.getProducts();
    const updated = products.filter((p) => p.id !== productId);
    this.saveProducts(updated);
    return updated;
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
  toggleWishlist(productId: string): string[] {
    const current = this.getWishlistIds();
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
    setStoredItem(KEYS.WISHLIST, updated);
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

    // Reduce stock for ordered items
    const products = this.getProducts();
    const updatedProducts = products.map((p) => {
      const match = order.items.find((item) => item.productId === p.id);
      if (match) {
        const newStock = Math.max(0, p.stock - match.quantity);
        return { ...p, stock: newStock };
      }
      return p;
    });
    this.saveProducts(updatedProducts);

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
  deleteOrder(orderId: string): Order[] {
    const orders = this.getOrders();
    const updated = orders.filter((o) => o.id !== orderId);
    this.saveOrders(updated);
    return updated;
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
};
