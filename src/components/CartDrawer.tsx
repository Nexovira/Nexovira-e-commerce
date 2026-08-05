import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 350000;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15000;
  const total = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (couponCode.trim().toUpperCase() === 'NEXO10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponSuccess('10% Promo Discount Applied!');
    } else if (couponCode.trim().toUpperCase() === 'WELCOME20') {
      const discount = Math.round(subtotal * 0.05);
      setAppliedDiscount(discount);
      setCouponSuccess('5% Welcome Discount Applied!');
    } else {
      setCouponError('Invalid coupon code. Try NEXO10');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 font-display">
              Shopping Cart ({cart.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs">
          {subtotal >= freeShippingThreshold ? (
            <div className="text-emerald-600 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>You qualify for FREE Express Shipping!</span>
            </div>
          ) : (
            <div>
              <p className="text-slate-600 mb-1">
                Add <span className="font-bold text-blue-600">₦{(freeShippingThreshold - subtotal).toLocaleString()}</span> more to unlock FREE Nationwide Delivery.
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-500 text-sm">Your cart is currently empty.</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
              >
                Explore Appliances
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-center"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                  <div className="text-xs font-bold text-slate-900">
                    ₦{item.product.price.toLocaleString()}
                  </div>

                  {item.selectedColor && (
                    <div className="text-[10px] text-slate-500">
                      Finish: <span className="text-slate-700 font-medium">{item.selectedColor}</span>
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() => onUpdateQuantity(idx, -1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-2.5 text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, 1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-1 text-rose-500 hover:text-rose-600"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code (Try NEXO10)"
                className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 text-xs uppercase focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg"
              >
                Apply
              </button>
            </form>

            {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>}

            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₦{subtotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₦{appliedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₦${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-blue-600 font-black">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => onProceedToCheckout(appliedDiscount, couponCode)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
