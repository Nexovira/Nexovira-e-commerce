import React, { useState } from 'react';

interface NexoviraLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7 md:w-8 md:h-8',
    md: 'w-8 h-8 md:w-10 md:h-10',
    lg: 'w-10 h-10 md:w-14 md:h-14',
    xl: 'w-16 h-16 md:w-20 md:h-20',
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2 md:gap-3 ${className}`}>
      <div className={`relative ${dimensions} shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-xs border border-slate-800 flex items-center justify-center`}>
        {!imgError ? (
          <img
            src="/logo.jpeg"
            alt="Nexovira Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-black text-cyan-400 text-xs md:text-sm tracking-tighter">NEX</span>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-base md:text-xl font-black tracking-tight font-display ${
                lightMode ? 'text-slate-900' : 'text-white'
              } ${textClassName}`}
            >
              NEXOVIRA
            </span>
            <span
              className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-md uppercase font-extrabold tracking-wider ${
                lightMode
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
              }`}
            >
              Appliance
            </span>
          </div>
          <p className="text-[10px] md:text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
            Smart Appliances. Smarter Living.
          </p>
        </div>
      )}
    </div>
  );
};

