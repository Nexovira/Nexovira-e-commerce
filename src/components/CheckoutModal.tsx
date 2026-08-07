import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CreditCard, Wallet, Truck, ArrowRight, Loader2, ExternalLink, Sparkles, MapPin, Clock, CheckCircle2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, UserProfile, Order, PaymentMethod } from '../types';
import { verifyPaymentServer, loadPaystackScript, initializeTransactionServer } from '../lib/paystack';
import { storageApi } from '../lib/storage';
import { NexoviraLogo } from './NexoviraLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: UserProfile | null;
  appliedDiscount: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  appliedDiscount,
  onOrderSuccess,
}) => {
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState(currentUser?.address?.street || '');
  const [city, setCity] = useState(currentUser?.address?.city || 'Lekki Phase 1');
  const [state, setState] = useState(currentUser?.address?.state || 'Lagos');

  const shippingZones = storageApi.getShippingZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(shippingZones[0]?.id || 'zone-lagos-island');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [paystackFlow, setPaystackFlow] = useState<'popup' | 'redirect'>('popup');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const selectedZone = shippingZones.find((z) => z.id === selectedZoneId) || shippingZones[0];
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingMin = storageApi.getSettings().freeShippingMinAmount || 350000;
  const shippingFee = subtotal >= freeShippingMin ? 0 : (selectedZone?.price || 3500);
  let totalAmount = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const walletBalance = currentUser?.walletBalance || 0;
  const walletDeduction = useWalletBalance ? Math.min(walletBalance, totalAmount) : 0;
  const paystackAmountDue = totalAmount - walletDeduction;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !phone || !street || !city || !state) {
      setErrorMessage('Please complete all delivery address fields.');
      return;
    }

    if (paymentMethod === 'wallet') {
      if (!currentUser?.isPaystackConnected) {
        setErrorMessage('Wallet access requires connecting your Paystack account first.');
        return;
      }
      if (walletBalance < totalAmount) {
        setErrorMessage(`Insufficient wallet balance (₦${walletBalance.toLocaleString()}). Please select Paystack Gateway.`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderNumber = 'NEXO-' + Math.floor(100000 + Math.random() * 900000);
      const reference = 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

      const createPendingOrder = () => {
        const order: Order = {
          id: 'ord-' + Date.now(),
          orderNumber,
          userId: currentUser?.id || 'guest-usr',
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          items: cart.map((c) => ({
            productId: c.product.id,
            productName: c.product.name,
            productImage: c.product.images[0],
            sku: c.product.sku,
            price: c.product.price,
            quantity: c.quantity,
            selectedVariations: c.selectedColor ? { Finish: c.selectedColor } : undefined,
          })),
          subtotal,
          discount: appliedDiscount,
          shippingFee,
          totalAmount,
          status: 'processing',
          paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
          paymentMethod,
          paymentReference: reference,
          shippingAddress: { street, city, state },
          trackingNumber: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        storageApi.createOrder(order);

        if (paymentMethod === 'wallet' && currentUser) {
          const newBal = Math.max(0, walletBalance - totalAmount);
          storageApi.setCurrentUser({ ...currentUser, walletBalance: newBal });
        }

        return order;
      };

      const finalizePaidOrder = (order: Order, payData?: any) => {
        const updatedOrders = storageApi.updateOrderPaymentDetails(order.id, {
          paymentStatus: 'paid',
          transactionId: payData?.transactionId || 'TX-PAYSTACK-' + Date.now(),
          authorizationCode: payData?.authorizationCode || 'AUTH-LIVE',
          gatewayResponse: payData?.gatewayResponse || 'Approved',
          currency: payData?.currency || 'NGN',
          amountPaid: payData?.amount || paystackAmountDue || totalAmount,
          paymentDate: payData?.paidAt || new Date().toISOString(),
          channel: payData?.channel || 'card',
        });

        const paidOrder = updatedOrders.find((o) => o.id === order.id) || order;

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err) {
          // ignore
        }

        setIsProcessing(false);
        onOrderSuccess(paidOrder);
      };

      // Handle Official Paystack Transaction Initializations
      if (paymentMethod === 'paystack') {
        const initialOrder = createPendingOrder();

        // Server-Side Paystack Initialize API call
        const initRes = await initializeTransactionServer({
          email: email.trim(),
          amount: paystackAmountDue,
          reference,
          callbackUrl: `${window.location.origin}?reference=${reference}&trxref=${reference}`,
          metadata: {
            customer_name: fullName,
            customer_phone: phone,
          },
        });

        if (paystackFlow === 'redirect' && initRes.status && initRes.data?.authorization_url) {
          // Direct Redirect to Official Paystack Hosted Checkout Page (checkout.paystack.com)
          window.location.href = initRes.data.authorization_url;
          return;
        }

        // Official Paystack Popup Overlay (js.paystack.co)
        await loadPaystackScript();
        const pkey = currentUser?.paystackPublicKey || (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_42ed8290f1ddc9550302b48d285a855a8286a0d2';

        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: pkey,
            email: email.trim(),
            amount: Math.round(paystackAmountDue * 100),
            ref: reference,
            currency: 'NGN',
            channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
            metadata: {
              custom_fields: [
                { display_name: 'Customer Name', variable_name: 'customer_name', value: fullName },
                { display_name: 'Phone Number', variable_name: 'phone_number', value: phone },
              ],
            },
            onSuccess: async (response) => {
              try {
                const verifyResult = await verifyPaymentServer(response.reference, paystackAmountDue);
                if (!verifyResult.success) {
                  throw new Error(verifyResult.message || 'Payment verification failed');
                }
                finalizePaidOrder(initialOrder, verifyResult.data);
              } catch (vErr: any) {
                setIsProcessing(false);
                setErrorMessage(vErr?.message || 'Payment verification failed.');
              }
            },
            onCancel: () => {
              setIsProcessing(false);
              setErrorMessage('Paystack checkout was closed before completing payment.');
            },
          });
          handler.openIframe();
          return;
        }
      }

      // Wallet Only Payment Path
      const order = createPendingOrder();
      const verifyResult = await verifyPaymentServer(reference, paystackAmountDue);
      finalizePaidOrder(order, verifyResult.data);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Failed to complete transaction. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl relative text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexoviraLogo size="xs" lightMode={false} />
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold px-2 py-0.5 rounded uppercase">
              Express Checkout
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {/* Shipping Address Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4" /> 1. Shipping Address & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08129595134"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House number & street name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">City / L.G.A.</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

            </div>
          </div>

          {/* Shipping Zone & Delivery Option Section */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> 2. Select Shipping Zone & Delivery Speed
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">
                {shippingZones.length} Zones Available
              </span>
            </div>

            {/* Free Shipping Alert Banner */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
              subtotal >= freeShippingMin
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50/70 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0 text-blue-600" />
                <div>
                  <p className="font-bold">
                    {subtotal >= freeShippingMin
                      ? '🎉 Free Express Shipping Active!'
                      : 'Free Shipping Threshold'}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {subtotal >= freeShippingMin
                      ? `Your cart total (₦${subtotal.toLocaleString()}) meets the ₦${freeShippingMin.toLocaleString()} free shipping requirement!`
                      : `Add ₦${(freeShippingMin - subtotal).toLocaleString()} more to unlock 100% FREE shipping across all zones.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Shipping Zone Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {shippingZones.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                const isFree = subtotal >= freeShippingMin;
                const priceDisplay = isFree ? 'FREE' : `₦${zone.price.toLocaleString()}`;

                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-bold text-slate-900 text-xs leading-snug">{zone.name}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                        isFree
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-900 text-white font-mono'
                      }`}>
                        {priceDisplay}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3 h-3 text-blue-600" /> {zone.estimatedDays}
                      </span>
                      {zone.statesCovered && zone.statesCovered.length > 0 && (
                        <span className="truncate max-w-[160px] text-slate-400">
                          {zone.statesCovered.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Dropdown Backup */}
            <div className="pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                <span>Or select from dropdown list:</span>
              </div>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                {shippingZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} — {subtotal >= freeShippingMin ? 'FREE Shipping' : `₦${zone.price.toLocaleString()}`} ({zone.estimatedDays})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wallet Application Option */}
          {walletBalance > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900">Apply Customer Wallet Balance</p>
                  <p className="text-slate-500 text-[11px]">
                    Available: ₦{walletBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWalletBalance}
                  onChange={(e) => setUseWalletBalance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 3. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setPaymentMethod('paystack')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'paystack'
                    ? 'bg-blue-50 border-blue-600 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  💳
                </div>
                <div>
                  <p className="font-bold text-slate-900">Paystack Secured Gateway</p>
                  <p className="text-[10px] text-slate-500">Bank Transfer, Cards & USSD</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-blue-50 border-blue-600 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Nexovira Customer Wallet</p>
                  <p className="text-[10px] text-slate-500">
                    {currentUser?.isPaystackConnected ? 'Instant One-Click Payment' : '🔒 Paystack Connection Required'}
                  </p>
                </div>
              </label>
            </div>

            {/* Paystack Native Gateway Info Box */}
            {paymentMethod === 'paystack' && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-md text-xs border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 text-sm">Paystack Official Checkout</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-md font-mono">
                      PCI-DSS Level 1 Certified
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Payment will be completed safely on Paystack&apos;s official checkout interface. Paystack supports:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-300 font-medium">
                    <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Debit / Credit Cards
                    </div>
                    <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Bank Transfer
                    </div>
                    <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" /> USSD & QR Codes
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Paystack Gateway Launch Mode:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaystackFlow('popup')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paystackFlow === 'popup'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-bold block text-xs">Official Popup Overlay</span>
                        <span className="text-[10px] text-slate-400">Pay directly without leaving site</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaystackFlow('redirect')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paystackFlow === 'redirect'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-bold block text-xs flex items-center gap-1">
                          Hosted Page Redirect <ExternalLink className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-slate-400">Redirect to checkout.paystack.com</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Total Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-slate-900">₦{subtotal.toLocaleString()}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon Discount</span>
                <span>-₦{appliedDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₦${shippingFee.toLocaleString()}`}</span>
            </div>
            {walletDeduction > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Wallet Balance Applied</span>
                <span>-₦{walletDeduction.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-blue-600 font-black">₦{paystackAmountDue.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Paystack Transaction...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Complete Order (₦{paystackAmountDue.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
