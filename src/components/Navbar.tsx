import React, { useState } from 'react';
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
  onSwitchUserRole: (role: 'guest' | 'customer' | 'admin') => void;
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
  onSwitchUserRole,
  onLogout,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 shadow-sm border-b border-slate-200">
      {/* Top Value Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <Truck className="w-3.5 h-3.5" /> Free Express Delivery on orders above ₦350,000
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Genuine Warranty & Local Service
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://wa.me/2348129595134"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Support: 08129595134
            </a>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Mode:</span>
              <button
                onClick={() => onSwitchUserRole('guest')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  !currentUser ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Guest
              </button>
              <button
                onClick={() => onSwitchUserRole('customer')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  currentUser?.role === 'customer'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => onSwitchUserRole('admin')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
          <NexoviraLogo size="md" lightMode={true} />
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
        <div className="flex items-center gap-2 md:gap-4">
          {/* AI Shopping Assistant Button */}
          <button
            onClick={onOpenAiAssistant}
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm border border-blue-500/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Advisor</span>
          </button>

          {/* Search Icon (Mobile) */}
          <button
            onClick={onOpenSearch}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => setActiveTab('wishlist')}
            className="relative p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
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

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 md:px-3 md:py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                {currentUser ? currentUser.fullName.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <span className="hidden md:inline font-medium">
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
                        onSwitchUserRole('customer');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-blue-600" /> Customer Sign In
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSwitchUserRole('admin');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Portal
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-slate-100 text-slate-600 rounded-xl px-4 py-2.5 text-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Search products...</span>
            </div>
          </button>

          <div className="flex flex-col space-y-1 pt-2">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('shop');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm"
            >
              All Products
            </button>
            <button
              onClick={() => {
                setActiveTab('about');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm"
            >
              About Nexovira
            </button>
            <button
              onClick={() => {
                setActiveTab('contact');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm"
            >
              Contact Us
            </button>
            <button
              onClick={() => {
                onOpenAiAssistant();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-between"
            >
              <span>AI Shopping Assistant</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
