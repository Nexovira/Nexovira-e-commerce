import React from 'react';

interface NexoviraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  lightMode?: boolean;
}

export const NexoviraLogo: React.FC<NexoviraLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = '',
  lightMode = false,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* High-Tech Shield "N" Logo SVG with exact pitch-black background as provided in reference image */}
      <div className={`relative ${dimensions} shrink-0 rounded-xl overflow-hidden shadow-md shadow-cyan-500/10`}>
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Pitch Black to Deep Navy Soft Gradient Background */}
            <radialGradient id="n-bg-glow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#020d1c" />
              <stop offset="60%" stopColor="#000000" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Primary Electric Cyan Gradient */}
            <linearGradient id="n-cyan-gradient" x1="120" y1="100" x2="392" y2="440" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="35%" stopColor="#00D2FF" />
              <stop offset="85%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#0044CC" />
            </linearGradient>

            {/* Glossy Bevel Highlight Gradient */}
            <linearGradient id="n-bevel-gradient" x1="150" y1="120" x2="360" y2="360" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#80F5FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0088FF" stopOpacity="0" />
            </linearGradient>

            {/* Bottom Floor Flare Line Gradient */}
            <linearGradient id="n-flare-gradient" x1="100" y1="0" x2="412" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
              <stop offset="20%" stopColor="#00F0FF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#00F0FF" stopOpacity="1" />
              <stop offset="80%" stopColor="#00F0FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>

            {/* Cyan Glow Filters */}
            <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="flare-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Exact Pitch Black Square Background Canvas */}
          <rect width="512" height="512" rx="64" fill="url(#n-bg-glow)" />

          {/* Subtle Ambient Backing Glow */}
          <circle cx="256" cy="240" r="160" fill="#00E5FF" opacity="0.12" filter="url(#neon-glow)" />

          {/* 2. MAIN GEOMETRIC "N" SHIELD EMBLEM */}

          {/* Left Vertical Pillar Stem */}
          <path
            d="M 152,116 L 218,116 L 218,295 L 186,327 L 152,293 Z"
            fill="url(#n-cyan-gradient)"
          />

          {/* Top Inverted Triangle Notch */}
          <path
            d="M 220,138 L 324,138 L 272,192 Z"
            fill="url(#n-cyan-gradient)"
          />

          {/* Main Diagonal "N" Body & Right Shield Wing */}
          <path
            d="M 220,146 L 318,292 L 318,116 L 388,116 L 388,298 L 256,428 L 152,324 L 184,292 L 256,364 L 318,302 L 220,154 Z"
            fill="url(#n-cyan-gradient)"
            filter="url(#neon-glow)"
          />

          {/* Metallic Inner Highlight Overlay for 3D Chrome Effect */}
          <path
            d="M 220,146 L 318,292 L 318,116 L 388,116 L 388,140 L 334,140 L 334,260 L 256,380 L 176,300 L 194,282 L 256,344 L 302,298 L 220,170 Z"
            fill="url(#n-bevel-gradient)"
            opacity="0.65"
          />

          {/* Lower Parallel Accent Slash */}
          <path
            d="M 205,348 L 273,415 L 298,390 L 230,323 Z"
            fill="url(#n-cyan-gradient)"
          />

          {/* 3. Top-Right Lens Flare Sparkle Ray */}
          <line
            x1="355"
            y1="125"
            x2="435"
            y2="45"
            stroke="#E0F7FA"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#flare-glow)"
          />
          <line
            x1="375"
            y1="105"
            x2="415"
            y2="65"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />

          {/* 4. Bottom Horizontal Cyan Floor Laser Line */}
          <line
            x1="100"
            y1="460"
            x2="412"
            y2="460"
            stroke="url(#n-flare-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#flare-glow)"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xl md:text-2xl font-black tracking-tight font-display ${
                lightMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              NEXOVIRA
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                lightMode
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
              }`}
            >
              Appliance
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            Smart Appliances. Smarter Living.
          </p>
        </div>
      )}
    </div>
  );
};
