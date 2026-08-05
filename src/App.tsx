import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategorySection } from './components/CategorySection';
import { ProductGrid } from './components/ProductGrid';
import { ProductCard } from './components/ProductCard';
import { LiveSearchBar } from './components/LiveSearchBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactPage } from './components/ContactPage';
import { AboutPage } from './components/AboutPage';
import { GeminiAiAssistant } from './components/GeminiAiAssistant';
import { Footer } from './components/Footer';

import { Product, ProductCategory, Order, UserProfile, CartItem } from './types';
import { storageApi, DEMO_CUSTOMER, DEMO_ADMIN } from './lib/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storageApi.getCurrentUser() || DEMO_CUSTOMER);
  const [products, setProducts] = useState<Product[]>(storageApi.getProducts());
  const [categories, setCategories] = useState<ProductCategory[]>(storageApi.getCategories());
  const [cart, setCart] = useState<CartItem[]>(storageApi.getCart());
  const [wishlistIds, setWishlistIds] = useState<string[]>(storageApi.getWishlistIds());
  const [orders, setOrders] = useState<Order[]>(storageApi.getOrders());

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals & Drawers
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync state helpers
  const handleRefreshData = () => {
    setProducts(storageApi.getProducts());
    setCategories(storageApi.getCategories());
    setOrders(storageApi.getOrders());
    setCart(storageApi.getCart());
    setWishlistIds(storageApi.getWishlistIds());
    setCurrentUser(storageApi.getCurrentUser());
  };

  const handleSwitchUserRole = (role: 'guest' | 'customer' | 'admin') => {
    if (role === 'guest') {
      setCurrentUser(null);
      storageApi.setCurrentUser(null);
    } else if (role === 'customer') {
      setCurrentUser(DEMO_CUSTOMER);
      storageApi.setCurrentUser(DEMO_CUSTOMER);
    } else {
      setCurrentUser(DEMO_ADMIN);
      storageApi.setCurrentUser(DEMO_ADMIN);
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storageApi.setCurrentUser(null);
    setActiveTab('home');
  };

  // Cart Management
  const handleAddToCart = (product: Product, selectedVariations?: Record<string, string>) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updatedCart = [...cart];

    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({
        product,
        quantity: 1,
        selectedColor: selectedVariations ? selectedVariations['Finish'] || selectedVariations['Color'] : undefined,
      });
    }

    setCart(updatedCart);
    storageApi.saveCart(updatedCart);
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    let updatedCart = [...cart];
    updatedCart[index].quantity += delta;
    if (updatedCart[index].quantity <= 0) {
      updatedCart.splice(index, 1);
    }
    setCart(updatedCart);
    storageApi.saveCart(updatedCart);
  };

  const handleRemoveCartItem = (index: number) => {
    let updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    storageApi.saveCart(updatedCart);
  };

  const handleToggleWishlist = (productId: string) => {
    const updated = storageApi.toggleWishlist(productId);
    setWishlistIds(updated);
  };

  const handleOrderSuccess = (order: Order) => {
    storageApi.createOrder(order);
    setCart([]);
    storageApi.saveCart([]);
    setCheckoutOpen(false);
    setConfirmedOrder(order);
    handleRefreshData();
  };

  // Featured / New Arrival / Best Seller subsets for Home
  const featuredProducts = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      {/* Header Navigation */}
      <Navbar
        currentUser={currentUser}
        cart={cart}
        wishlistCount={wishlistIds.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAiAssistant={() => setAiOpen(true)}
        onSwitchUserRole={handleSwitchUserRole}
        onLogout={handleLogout}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setActiveTab('shop');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <HeroBanner
              onExploreShop={() => setActiveTab('shop')}
              onOpenAiAssistant={() => setAiOpen(true)}
              onSelectCategory={(catSlug) => {
                const match = categories.find((c) => c.slug === catSlug || c.id === catSlug);
                setSelectedCategory(match ? match.id : 'all');
                setActiveTab('shop');
              }}
            />

            <CategorySection
              categories={categories}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setActiveTab('shop');
              }}
            />

            {/* Featured Showcase Grid */}
            <section className="py-12 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                      Top Rated Selection
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display mt-1">
                      Featured Appliances & Flash Sales
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setActiveTab('shop');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-2 md:mt-0"
                  >
                    View All Appliances →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onQuickView={(p) => setSelectedProductDetail(p)}
                      onViewDetail={(p) => setSelectedProductDetail(p)}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'shop' && (
          <ProductGrid
            products={products}
            categories={categories}
            wishlistIds={wishlistIds}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setSelectedProductDetail(p)}
            onViewDetail={(p) => setSelectedProductDetail(p)}
          />
        )}

        {activeTab === 'wishlist' && (
          <div className="py-12 max-w-7xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-slate-900 font-display mb-6">
              Saved Wishlist Appliances ({wishlistIds.length})
            </h1>
            {wishlistIds.length === 0 ? (
              <p className="text-slate-500 text-xs">No items saved to your wishlist yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => wishlistIds.includes(p.id))
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isWishlisted={true}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onQuickView={(p) => setSelectedProductDetail(p)}
                      onViewDetail={(p) => setSelectedProductDetail(p)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && currentUser && (
          <CustomerDashboard
            currentUser={currentUser}
            orders={orders}
            onRefreshUserData={handleRefreshData}
          />
        )}

        {activeTab === 'orders' && currentUser && (
          <CustomerDashboard
            currentUser={currentUser}
            orders={orders}
            onRefreshUserData={handleRefreshData}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            products={products}
            categories={categories}
            orders={orders}
            onRefreshData={handleRefreshData}
          />
        )}

        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Global Modals & Drawers */}
      <LiveSearchBar
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProductDetail(p)}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(discount) => {
          setAppliedDiscount(discount);
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={(p, v) => {
          handleAddToCart(p, v);
          setSelectedProductDetail(null);
        }}
        allProducts={products}
        onSelectRelated={(p) => setSelectedProductDetail(p)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => {
          setConfirmedOrder(null);
          setActiveTab('orders');
        }}
      />

      <GeminiAiAssistant
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        catalog={products}
        onSelectProduct={(p) => {
          setSelectedProductDetail(p);
          setAiOpen(false);
        }}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setActiveTab('shop');
        }}
        onOpenAdmin={() => {
          handleSwitchUserRole('admin');
        }}
      />
    </div>
  );
}
