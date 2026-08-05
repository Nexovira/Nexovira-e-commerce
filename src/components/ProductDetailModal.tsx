import React, { useState } from 'react';
import { Product } from '../types';
import {
  X,
  Star,
  ShoppingBag,
  Share2,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Truck,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedVariations?: Record<string, string>) => void;
  allProducts: Product[];
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  allProducts,
  onSelectRelated,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  if (!product) return null;

  const activeImage = product.images[selectedImageIndex] || product.images[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const productUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out ${product.name} on Nexovira Appliance Store!`);

  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl relative text-slate-900 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-blue-600 font-bold uppercase tracking-wider">{product.brand}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">SKU: {product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Gallery Column */}
            <div className="md:col-span-6 space-y-4">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 relative">
                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                        selectedImageIndex === idx ? 'border-blue-600' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-display leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-sm font-bold ml-1 text-slate-800">{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500">({product.reviewCount} customer reviews)</span>
                  <span className="text-xs text-emerald-600 font-semibold">• {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    ₦{product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && (
                    <div className="text-xs text-slate-400 line-through">
                      ₦{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
                {product.discountPercent && (
                  <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Variations Selector */}
              {product.variations && product.variations.length > 0 && (
                <div className="space-y-3">
                  {product.variations.map((v) => (
                    <div key={v.id}>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Select {v.name}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt) => {
                          const isSelected = selectedVariations[v.name] === opt || (!selectedVariations[v.name] && opt === v.options[0]);
                          return (
                            <button
                              key={opt}
                              onClick={() => setSelectedVariations({ ...selectedVariations, [v.name]: opt })}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Add to Cart Button */}
              <button
                disabled={product.stock <= 0}
                onClick={() => onAddToCart(product, selectedVariations)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Shopping Cart'}</span>
              </button>

              {/* Social Share Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block mb-2">
                  Share Appliance:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${shareText}%20${productUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs flex items-center gap-1 border border-emerald-200 font-medium"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://x.com/intent/post?text=${shareText}&url=${productUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Post on X</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                Overview & Description
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                Key Features
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Technical Specifications
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
              {Object.entries(product.specs).map(([key, val], idx) => (
                <div
                  key={key}
                  className={`flex justify-between p-3 ${
                    idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                  }`}
                >
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="text-slate-800 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Related Appliances
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-xl cursor-pointer transition-all flex items-center gap-3 group shadow-sm"
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                        {rel.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-900">
                        ₦{rel.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
