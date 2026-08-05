import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Tag, Zap } from 'lucide-react';
import { Product } from '../types';

interface LiveSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const LiveSearchBar: React.FC<LiveSearchBarProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matched = products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(term);
      const matchSku = p.sku.toLowerCase().includes(term);
      const matchCategory = p.categoryName.toLowerCase().includes(term);
      const matchBrand = p.brand.toLowerCase().includes(term);
      const matchDesc = p.description.toLowerCase().includes(term);
      const matchFeature = p.features.some((f) => f.toLowerCase().includes(term));
      return matchName || matchSku || matchCategory || matchBrand || matchDesc || matchFeature;
    });

    setResults(matched);
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by appliance name, category, SKU (e.g., Inverter AC, NEXO-FR-520L)..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!searchTerm ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-xs">
                Start typing to search across all Nexovira appliances, categories, and technical SKUs.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-[11px] text-slate-400">Popular Searches:</span>
                {['Inverter AC', 'French Door Refrigerator', 'Air Fryer', '5-Burner Cooker', '65 QLED'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1 font-medium"
                    >
                      <Tag className="w-3 h-3 text-blue-600" />
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No appliances found matching "{searchTerm}". Try checking your spelling or search by broader categories like "Refrigerators" or "Cooker".
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider px-2">
                Found {results.length} Matches
              </div>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="text-blue-600 font-semibold">{product.brand}</span>
                        <span>•</span>
                        <span>SKU: {product.sku}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        ₦{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-1 rounded hidden sm:inline font-medium">
                      {product.categoryName}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-200 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
