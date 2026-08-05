import React from 'react';
import { Heart, ShoppingBag, Eye, Star, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onViewDetail,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-cyan-400 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewDetail(product)}>
        <img
          src={product.images[0] || 'https://picsum.photos/seed/appliance/600/450'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              -{product.discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full border backdrop-blur transition-all shadow-sm ${
            isWishlisted
              ? 'bg-rose-500 text-white border-rose-400'
              : 'bg-white/80 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button (On Hover) */}
        <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-white/95 hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 backdrop-blur transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Brand Header */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold text-cyan-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="truncate max-w-[120px]">{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewDetail(product)}
            className="text-sm font-bold text-slate-900 hover:text-cyan-600 cursor-pointer line-clamp-2 leading-snug transition-colors"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="text-xs font-bold ml-1 text-slate-800">{product.rating}</span>
            </div>
            <span className="text-[11px] text-slate-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Key Inverter / Spec highlight */}
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">SKU: {product.sku}</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-black text-slate-900">
              ₦{product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                ₦{product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/10'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>

        {/* Stock Status Indicator */}
        <div className="text-[10px]">
          {isOutOfStock ? (
            <span className="text-rose-500 font-semibold">Out of Stock</span>
          ) : isLowStock ? (
            <span className="text-amber-600 font-semibold animate-pulse">
              Only {product.stock} units left in stock!
            </span>
          ) : (
            <span className="text-emerald-600 font-medium">In Stock (Available for Delivery)</span>
          )}
        </div>
      </div>
    </div>
  );
};
