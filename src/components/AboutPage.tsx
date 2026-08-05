import React from 'react';
import { ShieldCheck, Zap, Truck, Award, Sparkles, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Hero Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-xl relative overflow-hidden text-white">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
            N
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
            About Nexovira Appliance Store
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white font-display">
            Smart Appliances.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-amber-300">
              Smarter Living.
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Nexovira Appliance Store is Nigeria's premier destination for next-generation home and kitchen electronics. We engineer and supply appliances tailored to withstand local power fluctuations, tropical humidity, and intensive daily usage.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm">
            <Zap className="w-8 h-8 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Generator Mode & Low Wattage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our Inverter Split ACs and Smart Refrigerators feature multi-step generator power control so you can keep cool even on small capacity home generators.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">100% Genuine Warranty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every Nexovira appliance comes with comprehensive manufacturer warranty coverage (up to 10 years on inverter compressors and wash motors).
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm">
            <Truck className="w-8 h-8 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Nationwide Express Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              With fulfillment hubs across Lagos, Abuja, and Port Harcourt, we deliver and install your heavy appliances safely at your doorstep.
            </p>
          </div>
        </div>

        {/* Quality Guarantees */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 font-display text-center">
            The Nexovira Commitment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              '100% Copper Condenser coils with Gold Fin anti-corrosion coating',
              'AI load sensing and fabric protection for washing machines',
              'Fast freezing retention up to 100 hours during power blackouts',
              'Paystack-verified 256-bit encrypted secure checkout',
              'Dedicated WhatsApp support lines at 08129595134 & 07025900156',
              'Automated referral partner earnings with instant wallet payouts',
            ].map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
