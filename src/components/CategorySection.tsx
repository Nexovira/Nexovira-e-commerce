import React from 'react';
import { ProductCategory } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface CategorySectionProps {
  categories: ProductCategory[];
  onSelectCategory: (catId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Curated Collections
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-display mt-1">
              Explore Appliance Categories
            </h2>
          </div>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mt-2 md:mt-0">
            Engineered for African homes with low power start-up, surge protection, and long lifespan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-blue-400 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col h-72"
            >
              {/* Image Background with Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold bg-white/90 backdrop-blur text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                    {cat.productCount || 6}+ Models
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 flex items-center justify-center transition-all shadow-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-slate-200 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
