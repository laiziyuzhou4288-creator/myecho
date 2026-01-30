import React from 'react';
import { MoonPhase } from '../types';

interface RealisticMoonProps {
  phase: MoonPhase;
  size?: number;
  className?: string;
  simple?: boolean; // New prop for smoother, simpler rendering (for grid)
  brightness?: number; // 0 to 1, default 1
}

const RealisticMoon: React.FC<RealisticMoonProps> = ({ phase, size = 200, className = '', simple = false, brightness = 1 }) => {
  // Glow opacity based on brightness
  const glowOpacity = Math.max(0, brightness * 0.8); 
  
  // Body brightness: we use a dark overlay opacity. 
  // Adjusted floor from 0.1 to 0.25 so it's never completely pitch black
  const darknessOverlay = 1 - Math.max(0.25, brightness); 

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      
      {/* Outer Glow (Dynamic based on brightness) */}
      {!simple && brightness > 0.2 && (
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-200/30 rounded-full blur-xl pointer-events-none transition-opacity duration-500"
            style={{ 
                width: size * 1.2, 
                height: size * 1.2,
                opacity: glowOpacity
            }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className={`transition-all duration-500 ${simple ? "" : "drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"}`}
        style={{ filter: `brightness(${0.6 + brightness * 0.4})` }} // Adjusted filter for better base visibility
      >
        <defs>
          {/* Clip Path to keep the blurred shadow inside the moon circle */}
          <clipPath id="moonCircleClip">
             <circle cx="50" cy="50" r="48" />
          </clipPath>

          {/* Texture Filter (Only for complex mode) */}
          {!simple && (
            <filter id="moonTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
              <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1">
                <feDistantLight azimuth="45" elevation="60" />
              </feDiffuseLighting>
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>
          )}
          
          {/* Blur Filter for Shadow Softness (Terminator Line) */}
          <filter id="shadowBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation={simple ? 1.5 : 3} />
          </filter>

          {/* Base Moon Gradient - Pearl/Stone look */}
          <radialGradient id={`moonGradient-${simple ? 's' : 'c'}`} cx="35%" cy="35%" r="65%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#fdfbf7" /> {/* Creamy white */}
            <stop offset="80%" stopColor="#cbd5e1" /> {/* Light grey */}
            <stop offset="100%" stopColor="#94a3b8" /> {/* Darker grey edge */}
          </radialGradient>
        </defs>

        {/* 1. The Base Moon Sphere */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill={`url(#moonGradient-${simple ? 's' : 'c'})`} 
          filter={simple ? undefined : "url(#moonTexture)"}
        />

        {/* 2. Darkness Overlay for "Energy/Brightness" Control */}
        <circle 
            cx="50" 
            cy="50" 
            r="49" 
            fill="black" 
            fillOpacity={darknessOverlay}
            className="transition-all duration-300"
        />

        {/* 3. The Shadow Overlay Group (Phases) */}
        {/* We apply clip-path so the blurred shadow doesn't leak out */}
        <g clipPath="url(#moonCircleClip)">
            <g filter="url(#shadowBlur)" opacity="0.95">
                {/* Waxing Phases (Light on Right -> Shadow on Left) */}
                {phase === MoonPhase.NEW && <rect x="0" y="0" width="100" height="100" fill="#0f172a" />}
                
                {phase === MoonPhase.WAXING_CRESCENT && (
                     // Shadow covers most, leaves right crescent
                     <path d="M 50 2 A 48 48 0 0 1 50 98 A 48 48 0 0 0 50 2 Z" fill="#0f172a" transform="rotate(180 50 50)"/>
                )}
                {phase === MoonPhase.FIRST_QUARTER && (
                     // Shadow on left half
                     <rect x="0" y="0" width="50" height="100" fill="#0f172a" />
                )}
                {phase === MoonPhase.WAXING_GIBBOUS && (
                     // Shadow is small on left edge (visual approximation)
                     <path d="M 50 2 A 48 48 0 0 0 50 98 A 25 48 0 0 1 50 2 Z" fill="#0f172a" />
                )}
                
                {/* Waning Phases (Light on Left -> Shadow on Right) */}
                {phase === MoonPhase.WANING_GIBBOUS && (
                     // Shadow on right edge
                     <path d="M 50 2 A 48 48 0 0 1 50 98 A 25 48 0 0 0 50 2 Z" fill="#0f172a" />
                )}
                {phase === MoonPhase.LAST_QUARTER && (
                     // Shadow on right half
                     <rect x="50" y="0" width="50" height="100" fill="#0f172a" />
                )}
                {phase === MoonPhase.WANING_CRESCENT && (
                     // Shadow covers most, leaves left crescent
                     <path d="M 50 2 A 48 48 0 0 0 50 98 A 48 48 0 0 1 50 2 Z" fill="#0f172a" transform="rotate(180 50 50)"/>
                )}
            </g>
        </g>
        
        {/* 4. Inner Glow/Rim Light for 3D feel */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth={simple ? 1 : 0.5} strokeOpacity={0.1 + brightness * 0.2} />
      </svg>
    </div>
  );
};

export default RealisticMoon;