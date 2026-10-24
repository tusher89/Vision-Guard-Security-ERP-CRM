import React from 'react';

interface VisionGuardLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  monochrome?: boolean;
}

export const VisionGuardLogo: React.FC<VisionGuardLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'full',
  monochrome = false,
}) => {
  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtextSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* High-Tech Shield + Cybernetic Security Eye + PCB Traces Logo */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 160 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform hover:scale-105 duration-300"
        >
          <defs>
            {/* Outer Shield Gradient */}
            <linearGradient id="shieldGrad" x1="80" y1="6" x2="80" y2="164" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="50%" stopColor="#070C1E" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>

            {/* Glowing Border Gradient */}
            <linearGradient id="borderGrad" x1="16" y1="12" x2="144" y2="164" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Cyan Accent Gradient */}
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Iris Radial Glow */}
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="40%" stopColor="#0284C7" />
              <stop offset="75%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Red Camera Recording Dot Glow */}
            <radialGradient id="redLensDot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4B4B" />
              <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shield Outer Path */}
          <path
            d="M80 6L144 24C144 76 130 126 80 164C30 126 16 76 16 24L80 6Z"
            fill={monochrome ? '#1E293B' : 'url(#shieldGrad)'}
            stroke={monochrome ? '#475569' : 'url(#borderGrad)'}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Shield Bevel Accent */}
          <path
            d="M80 15L135 30.5C135 74 123 118 80 152C37 118 25 74 25 30.5L80 15Z"
            fill="none"
            stroke={monochrome ? '#334155' : '#0EA5E9'}
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Circuit Board Traces (Top Left) */}
          <g opacity="0.85" stroke={monochrome ? '#64748B' : '#00E5FF'} strokeWidth="1.6" strokeLinecap="round">
            <path d="M42 42 L60 42 L72 54" />
            <circle cx="42" cy="42" r="2.5" fill={monochrome ? '#64748B' : '#00E5FF'} />
            <circle cx="72" cy="54" r="2" fill={monochrome ? '#64748B' : '#38BDF8'} />

            {/* Circuit Trace (Top Right) */}
            <path d="M118 42 L100 42 L88 54" />
            <circle cx="118" cy="42" r="2.5" fill={monochrome ? '#64748B' : '#00E5FF'} />
            <circle cx="88" cy="54" r="2" fill={monochrome ? '#64748B' : '#38BDF8'} />

            {/* Circuit Traces (Bottom Flanks) */}
            <path d="M36 85 L48 85 L56 95 L56 108" />
            <circle cx="36" cy="85" r="2" fill={monochrome ? '#64748B' : '#00E5FF'} />
            <circle cx="56" cy="108" r="2.5" fill={monochrome ? '#64748B' : '#38BDF8'} />

            <path d="M124 85 L112 85 L104 95 L104 108" />
            <circle cx="124" cy="85" r="2" fill={monochrome ? '#64748B' : '#00E5FF'} />
            <circle cx="104" cy="108" r="2.5" fill={monochrome ? '#64748B' : '#38BDF8'} />

            {/* Center Vertical Security Bus */}
            <path d="M80 18 L80 38" strokeDasharray="3 3" strokeWidth="1.5" strokeOpacity="0.6" />
            <circle cx="80" cy="38" r="2" fill={monochrome ? '#64748B' : '#38BDF8'} />
          </g>

          {/* Cybernetic Security Eye Outline (Almond Eye Shape) */}
          <path
            d="M34 85 C46 60, 114 60, 126 85 C114 110, 46 110, 34 85 Z"
            fill="#FFFFFF"
            stroke={monochrome ? '#94A3B8' : '#00E5FF'}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Eye Corner Wing Lines */}
          <path
            d="M26 85 L34 85"
            stroke={monochrome ? '#94A3B8' : '#00E5FF'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M126 85 L134 85"
            stroke={monochrome ? '#94A3B8' : '#00E5FF'}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Outer Lens Rim */}
          <circle
            cx="80"
            cy="85"
            r="23"
            fill={monochrome ? '#0F172A' : 'url(#irisGrad)'}
            stroke={monochrome ? '#475569' : '#00E5FF'}
            strokeWidth="2.2"
          />

          {/* Lens Aperture Rings */}
          <circle
            cx="80"
            cy="85"
            r="16"
            fill="none"
            stroke={monochrome ? '#94A3B8' : '#38BDF8'}
            strokeWidth="1.2"
            strokeDasharray="4 2.5"
          />

          {/* Inner Optical Sensor / Camera Pupil */}
          <circle
            cx="80"
            cy="85"
            r="10"
            fill="#030712"
            stroke={monochrome ? '#CBD5E1' : '#00E5FF'}
            strokeWidth="1.5"
          />

          {/* CCTV Optical Lens Core / IR Sensor Light */}
          <circle
            cx="80"
            cy="85"
            r="4.5"
            fill={monochrome ? '#E2E8F0' : 'url(#cyanGrad)'}
          />

          {/* Security System Active Status Light (Precision Red Glint) */}
          <circle
            cx="85"
            cy="80"
            r="1.8"
            fill="#FFFFFF"
          />
          <circle
            cx="75"
            cy="90"
            r="1.2"
            fill="#38BDF8"
            opacity="0.8"
          />

          {/* Lower Shield Emblem Accent */}
          <path
            d="M74 134 L80 142 L86 134"
            fill="none"
            stroke={monochrome ? '#475569' : '#00E5FF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography: VISION GUARD - CCTV & SECURITY SOLUTIONS */}
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <div className={`font-black tracking-wider uppercase flex items-center gap-1.5 ${textSizes[size]}`}>
            <span className="text-white drop-shadow-sm font-extrabold tracking-tight">VISION</span>
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent font-extrabold tracking-tight">
              GUARD
            </span>
          </div>
          <div className={`font-semibold tracking-[0.22em] text-cyan-400/90 uppercase mt-0.5 ${subtextSizes[size]}`}>
            CCTV &amp; Security Solutions
          </div>
        </div>
      )}
    </div>
  );
};
