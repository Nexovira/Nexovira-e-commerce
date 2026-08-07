import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: ProductCategory[];
  wishlistIds: string[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  wishlistIds,
  selectedCategory,
  onSelectCategory,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onViewDetail,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'price_low' | 'price_high' | 'newest'>('popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Extract unique brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
        if (p.price > maxPriceFilter) return false;
        if (inStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.rating - a.rating; // default popularity/rating
      });
  }, [products, selectedCategory, selectedBrand, maxPriceFilter, inStockOnly, sortBy]);

  const resetFilters = () => {
    onSelectCategory('all');
    setSelectedBrand('all');
    setMaxPriceFilter(1000000);
    setInStockOnly(false);
    setSortBy('popularity');
  };

  return (
    <section className="py-10 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Title & Sorting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-display">
              Nexovira Appliance Store Catalogue
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="popularity">Popularity & Rating</option>
                <option value="newest">New Arrivals</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Sidebar Filters (Desktop & Mobile Drawer) */}
          <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Filter Catalogue</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Categories Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => onSelectCategory('all')}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {products.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Brand Line
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                        selectedBrand === b
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Max Price
                  </h4>
                  <span className="text-xs font-bold text-blue-600">
                    ₦{maxPriceFilter.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={1000000}
                  step={25000}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* In Stock Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600 bg-white border-slate-300"
                  />
                  <span>Show In-Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Listing */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <p className="text-slate-500 text-sm">
                  No appliances found matching your specific filter criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isWishlisted={wishlistIds.includes(p.id)}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCart={onAddToCart}
                    onQuickView={onQuickView}
                    onViewDetail={onViewDetail}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};
