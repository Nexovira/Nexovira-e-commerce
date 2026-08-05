import React from 'react';
import { MessageCircle, Instagram, ShieldCheck, MapPin, Phone, Lock } from 'lucide-react';
import { NexoviraLogo } from './NexoviraLogo';

interface FooterProps {
  onSelectCategory: (catId: string) => void;
  onOpenAdminAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdminAuth }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <NexoviraLogo size="md" lightMode={false} textClassName="text-white" />

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Official store for Nexovira inverter refrigerators, AI washing machines, low-wattage split air conditioners, and kitchen appliances.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/nexov_ira/"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-rose-400 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Instagram className="w-4 h-4" />
                <span>@nexov_ira</span>
              </a>

              <a
                href="https://x.com/Nexovira"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-blue-400 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="font-bold">𝕏</span>
                <span>@Nexovira</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Top Categories
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('cat-refrigerators')} className="hover:text-blue-400">
                  Refrigerators & Freezers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cat-washing-machines')} className="hover:text-blue-400">
                  Washing Machines
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cat-air-conditioners')} className="hover:text-blue-400">
                  Air Conditioners
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cat-cooking')} className="hover:text-blue-400">
                  Cookers & Ovens
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cat-small-kitchen')} className="hover:text-blue-400">
                  Small Kitchen Set
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Customer Care
            </h4>
            <div className="space-y-2 text-slate-400">
              <a href="https://wa.me/2348129595134" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp 1: 08129595134</span>
              </a>

              <a href="https://wa.me/2347025900156" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp 2: 07025900156</span>
              </a>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>08129595134 / 07025900156</span>
              </div>
            </div>
          </div>

          {/* Showroom & Admin */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Location & Portal
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Lekki Expressway Phase 1, Lagos State, Nigeria.</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenAdminAuth}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Nexovira Appliance Store. All Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 font-semibold text-slate-300">
              Paystack Verified
            </span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 font-semibold text-slate-300">
              256-bit SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
