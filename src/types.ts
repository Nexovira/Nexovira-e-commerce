export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  walletBalance: number;
  referralEarnings: number;
  isPaystackConnected?: boolean;
  paystackEmail?: string;
  paystackCustomerCode?: string;
  paystackPublicKey?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Color", "Capacity", "Warranty"
  options: string[]; // e.g. ["Stainless Steel", "Black Stainless", "Inverter White"]
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  price: number; // In NGN
  originalPrice?: number;
  discountPercent?: number;
  description: string;
  features: string[];
  specs: Record<string, string>;
  images: string[];
  stock: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  variations?: ProductVariation[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedCapacity?: string;
  selectedWarranty?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'wallet' | 'paystack_and_wallet';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  selectedVariations?: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  transactionId?: string;
  authorizationCode?: string;
  gatewayResponse?: string;
  currency?: string;
  amountPaid?: number;
  paymentDate?: string;
  channel?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  reference: string;
  transactionId?: string;
  authorizationCode?: string;
  paymentMethod: string;
  channel?: string;
  gatewayResponse?: string;
  currency: string;
  amountPaid: number;
  status: PaymentStatus;
  customerEmail: string;
  customerName?: string;
  paymentDate: string;
  ipAddress?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  reference: string;
  status: string;
  signatureVerified: boolean;
  payload: any;
  receivedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EmailNotificationLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  type: 'order_confirmation' | 'payment_confirmation' | 'admin_alert' | 'refund_alert';
  sentAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'referral_bonus' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  description: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  bonusAmount: number;
  status: 'credited' | 'pending';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  instagramUrl: string;
  xUrl: string;
  whatsappNumbers: string[];
  supportEmail: string;
  address: string;
  referralBonusPercent: number;
  lowStockThreshold: number;
  freeShippingMinAmount: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  statesCovered: string[];
}

export interface SearchFilterState {
  query: string;
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'popularity' | 'price_low' | 'price_high' | 'newest' | 'rating';
}
