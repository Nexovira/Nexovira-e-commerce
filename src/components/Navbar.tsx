import React, { useState, useEffect } from 'react';
import { NexoviraLogo } from './NexoviraLogo';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  PhoneCall,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Package,
  Info,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  cart: CartItem[];
  wishlistCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onLogout: () => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cart,
  wishlistCount,
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenSearch,
  onOpenAiAssistant,
  onOpenAuth,
  onLogout,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Prevent body scroll when mobile drawer is open & handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 shadow-sm border-b border-slate-200">
      {/* Top Value Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-6 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 text-blue-400 font-medium truncate">
              <Truck className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Free Delivery over ₦350,000</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Genuine Warranty & Service
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs">
            <a
              href="https://wa.me/2348129595134"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">WhatsApp: 08129595134</span>
            </a>
            <span className="text-slate-700 hidden xs:inline">|</span>
            <div className="hidden xs:flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-semibold truncate max-w-[100px]">{currentUser.fullName.split(' ')[0]}</span>
                  {currentUser.role === 'admin' && (
                    <span className="bg-amber-600/90 text-white font-bold px-1.5 py-0.5 rounded text-[9px]">
                      ADMIN
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[10px] sm:text-[11px] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-[10px] sm:text-[11px] transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
          <NexoviraLogo size="sm" lightMode={true} />
        </div>

        {/* Live Search Trigger Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200/70 text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Search products, categories, SKU (e.g. Inverter AC, NEXO-FR-520L)...</span>
            </div>
            <kbd className="hidden xl:inline-block bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-300">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* AI Shopping Assistant Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 sm:px-3.5 py-2 min-h-[44px] rounded-xl transition-all shadow-xs border border-blue-500/20 shrink-0"
            aria-label="AI Advisor"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="hidden xs:inline sm:inline">AI Advisor</span>
          </button>

          {/* Search Icon (Mobile) */}
          <button
            onClick={onOpenSearch}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Search Products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => setActiveTab('wishlist')}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-blue-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-2 min-h-[44px] text-xs font-medium transition-colors"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-black text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                My Cart
              </div>
              <div className="text-slate-900 font-bold text-xs">
                ₦{cartSubtotal.toLocaleString()}
              </div>
            </div>
          </button>

          {/* User Account Dropdown (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                {currentUser ? currentUser.fullName.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <span className="font-medium">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-800">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveTab(currentUser.role === 'admin' ? 'admin' : 'dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      {currentUser.role === 'admin' ? 'Admin Dashboard' : 'My Account & Wallet'}
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveTab('orders');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      Order History & Tracking
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth('signin');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-cyan-600" /> Sign In
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth('signup');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-blue-600" /> Create Account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-white border-t border-slate-200 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-1 py-1">
            <button
              onClick={() => {
                setActiveTab('home');
                onSelectCategory('all');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'home' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('all');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'shop' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              All Appliances
            </button>
            <button
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('cat-refrigerators');
              }}
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Refrigerators
            </button>
            <button
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('cat-washing-machines');
              }}
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Washing Machines
            </button>
            <button
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('cat-air-conditioners');
              }}
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Air Conditioners
            </button>
            <button
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('cat-cooking');
              }}
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Cookers & Ovens
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'about' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'contact' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:08129595134"
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>08129595134</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Semi-transparent Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content Panel (80% width up to max-w-xs) */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <NexoviraLogo size="xs" lightMode={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search Action */}
            <div className="p-3 bg-slate-100 border-b border-slate-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between bg-white border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-semibold shadow-xs hover:border-blue-400 transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>Search products...</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">Search</span>
              </button>
            </div>

            {/* Account Quick Status / Auth */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-extrabold text-slate-900 truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase shrink-0">
                    {currentUser.role}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="flex-1 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center text-xs shadow-xs"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="flex-1 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-center text-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Drawer Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Main Navigation */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">
                  Main Navigation
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      onSelectCategory('all');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeTab === 'home'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Home Storefront</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('shop');
                      onSelectCategory('all');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeTab === 'shop'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Shop All Appliances</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCart();
                    }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span>Shopping Cart</span>
                    </div>
                    {cartItemsCount > 0 && (
                      <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        {cartItemsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('wishlist');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeTab === 'wishlist'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => {
                        setActiveTab(currentUser.role === 'admin' ? 'admin' : 'dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        activeTab === 'dashboard' || activeTab === 'admin'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>My Orders & Account</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAiAssistant();
                    }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>AI Shopping Advisor</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">
                  Appliance Categories
                </p>
                <div className="space-y-1 text-xs text-slate-700">
                  <button
                    onClick={() => {
                      setActiveTab('shop');
                      onSelectCategory('cat-refrigerators');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-slate-100 font-semibold flex items-center justify-between"
                  >
                    <span>Refrigerators & Freezers</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('shop');
                      onSelectCategory('cat-washing-machines');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-slate-100 font-semibold flex items-center justify-between"
                  >
                    <span>Washing Machines & Dryers</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('shop');
                      onSelectCategory('cat-air-conditioners');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-slate-100 font-semibold flex items-center justify-between"
                  >
                    <span>Air Conditioners & Inverters</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('shop');
                      onSelectCategory('cat-cooking');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl hover:bg-slate-100 font-semibold flex items-center justify-between"
                  >
                    <span>Cookers, Ranges & Ovens</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Information */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">
                  Information
                </p>
                <div className="space-y-1 text-xs text-slate-700">
                  <button
                    onClick={() => {
                      setActiveTab('about');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl font-semibold transition flex items-center gap-2 ${
                      activeTab === 'about'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <Info className="w-4 h-4 text-slate-400" />
                    <span>About Nexovira</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('contact');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl font-semibold transition flex items-center gap-2 ${
                      activeTab === 'contact'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>

              {/* Account Quick Dashboard Link */}
              {currentUser && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab(currentUser.role === 'admin' ? 'admin' : 'dashboard');
                    }}
                    className="w-full text-left px-3 py-3 min-h-[44px] bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-between"
                  >
                    <span>{currentUser.role === 'admin' ? 'Admin Dashboard' : 'My Wallet & Profile'}</span>
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-2">
              <a
                href="https://wa.me/2348129595134"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-600 font-bold min-h-[36px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: 08129595134</span>
              </a>
              {currentUser && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-rose-600 font-bold hover:underline flex items-center gap-1 mt-1 min-h-[36px]"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
