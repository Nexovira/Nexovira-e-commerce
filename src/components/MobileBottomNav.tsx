import React from 'react';
import {
  Home,
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  ShieldCheck,
  Package,
  FileText,
  BarChart3,
} from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  cart: CartItem[];
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onOpenAiAssistant: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  cart,
  wishlistCount,
  onOpenCart,
  onOpenAuth,
}) => {
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] left-4 right-4 z-40 max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_12px_35px_rgba(15,23,42,0.18)] rounded-[26px] p-1.5 transition-all duration-300">
        <nav className="flex items-center justify-around h-14">
          {!isAdmin ? (
            /* Customer / Guest Items */
            <>
              {/* Home Tab */}
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 ${
                  activeTab === 'home'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label="Home"
              >
                <Home
                  className={`w-4 h-4 transition-transform ${
                    activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'
                  }`}
                />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Home</span>
              </button>

              {/* Shop Tab */}
              <button
                onClick={() => setActiveTab('shop')}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 ${
                  activeTab === 'shop'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label="Shop Catalog"
              >
                <ShoppingBag
                  className={`w-4 h-4 transition-transform ${
                    activeTab === 'shop' ? 'stroke-[2.5]' : 'stroke-[2]'
                  }`}
                />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Shop</span>
              </button>

              {/* Wishlist Tab */}
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 relative ${
                  activeTab === 'wishlist'
                    ? 'bg-rose-600 text-white font-extrabold shadow-md shadow-rose-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label="Saved Wishlist"
              >
                <div className="relative">
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      activeTab === 'wishlist' ? 'fill-white stroke-white' : 'stroke-[2]'
                    }`}
                  />
                  {wishlistCount > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 font-black text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center border border-white ${
                        activeTab === 'wishlist'
                          ? 'bg-white text-rose-600'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Wishlist</span>
              </button>

              {/* Cart Tab */}
              <button
                onClick={onOpenCart}
                className="flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60 relative"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 stroke-[2]" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white font-black text-[9px] min-w-[15px] h-3.5 px-1 rounded-full flex items-center justify-center border border-white shadow-xs animate-pulse">
                      {cartItemsCount > 99 ? '99+' : cartItemsCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Cart</span>
              </button>

              {/* Profile / Account Tab */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth('signin');
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label={currentUser ? 'My Account' : 'Sign In'}
              >
                <User
                  className={`w-4 h-4 transition-transform ${
                    activeTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[2]'
                  }`}
                />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[55px]">
                  {currentUser ? 'Account' : 'Sign In'}
                </span>
              </button>
            </>
          ) : (
            /* Admin Specific Navigation Items */
            <>
              {/* Admin Home */}
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 ${
                  activeTab === 'home'
                    ? 'bg-amber-600 text-white font-extrabold shadow-md shadow-amber-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label="Home"
              >
                <Home className="w-4 h-4 stroke-[2]" />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Home</span>
              </button>

              {/* Products Catalog */}
              <button
                onClick={() => setActiveTab('shop')}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 ${
                  activeTab === 'shop'
                    ? 'bg-amber-600 text-white font-extrabold shadow-md shadow-amber-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label="Products Catalog"
              >
                <Package className="w-4 h-4 stroke-[2]" />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Products</span>
              </button>

              {/* Admin Dashboard */}
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white font-extrabold shadow-md shadow-amber-600/30 scale-105'
                    : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60'
                }`}
                aria-label="Dashboard"
              >
                <BarChart3 className="w-4 h-4 stroke-[2]" />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Dashboard</span>
              </button>

              {/* Admin Orders */}
              <button
                onClick={() => setActiveTab('admin')}
                className="flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60"
                aria-label="Orders"
              >
                <FileText className="w-4 h-4 stroke-[2]" />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Orders</span>
              </button>

              {/* Admin Profile */}
              <button
                onClick={() => setActiveTab('admin')}
                className="flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-[20px] transition-all duration-200 text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100/60"
                aria-label="Admin Profile"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2] text-amber-600" />
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">Admin</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

