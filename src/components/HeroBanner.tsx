import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, Truck, Sparkles, Award } from 'lucide-react';

interface HeroBannerProps {
  onExploreShop: () => void;
  onOpenAiAssistant: () => void;
  onSelectCategory: (catSlug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreShop,
  onOpenAiAssistant,
  onSelectCategory,
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback handled by poster image
      });
    }
  }, []);

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800/80 min-h-[540px]">
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* High-quality Poster Image while video loads or on unsupported autoplay */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
          alt="Nexovira 3D Smart Appliance Showroom"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Looping Photorealistic Background Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/Appliance_store_hero_background_…_202608052216.mp4" type="video/mp4" />
        </video>

        {/* Floating 3D Showroom UI Overlays (Matching uploaded video atmosphere) */}
        <div className="absolute inset-0 pointer-events-none z-1 hidden md:block">
          {/* Paystack Floating Badge from video */}
          <div className="absolute top-10 right-[35%] bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>✔ Paystack Checkout Verified</span>
          </div>

          {/* AC Blue Breeze Particles Glow */}
          <div className="absolute top-6 right-20 w-48 h-20 bg-cyan-400/10 blur-xl rounded-full" />

          {/* Smart TV Tag from video */}
          <div className="absolute bottom-28 left-[45%] bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-lg">
            📺 Smart OLED TV • Inverter
          </div>
        </div>

        {/* Ambient Radial Gradient Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/15 via-sky-500/5 to-transparent pointer-events-none" />

        {/* Dark Gradient Overlay (45–55% average opacity for optimal hero text readability) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/45 pointer-events-none z-2" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/20 pointer-events-none z-2" />
      </div>

      {/* Hero Content Layer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-cyan-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-300 shadow-md shadow-cyan-500/10">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>Next-Gen Inverter Tech & Generator Compatible</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white font-display">
              Smart Appliances.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 drop-shadow-sm">
                Smarter Living.
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed font-normal">
              Upgrade your home with official Nexovira premium smart refrigerators, AI washing machines, quiet inverter air conditioners, and kitchen master sets. Engineered for energy efficiency, durability, and extreme climate reliability.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreShop}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 text-sm group"
              >
                <span>Shop Premium Catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAiAssistant}
                className="bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-semibold px-5 py-3.5 rounded-xl transition-colors flex items-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Ask AI Advisor</span>
              </button>
            </div>

            {/* Value Props Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Official Warranty</p>
                  <p className="text-slate-400 text-[11px]">Up to 10-Yr Motor</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Express Shipping</p>
                  <p className="text-slate-400 text-[11px]">Doorstep Delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Gen-Mode Ready</p>
                  <p className="text-slate-400 text-[11px]">Low Wattage Tech</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Paystack Verified</p>
                  <p className="text-slate-400 text-[11px]">100% Safe Payments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Feature Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 p-2 border border-slate-700/80 shadow-2xl overflow-hidden group">
              <div className="relative rounded-xl overflow-hidden aspect-4/3">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80"
                  alt="Nexovira Smart Refrigerator"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Flagship Arrival
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs text-cyan-300 font-semibold mb-1">Nexovira Pro Series</div>
                  <h3 className="text-lg font-bold">Smart Inverter French Door 520L</h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/60">
                    <div>
                      <span className="text-xl font-black text-amber-300">₦850,000</span>
                      <span className="text-xs text-slate-400 line-through ml-2">₦980,000</span>
                    </div>
                    <button
                      onClick={() => onSelectCategory('cat-refrigerators')}
                      className="text-xs bg-slate-900/90 hover:bg-cyan-600 hover:text-white text-slate-200 border border-slate-700 font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      View Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
