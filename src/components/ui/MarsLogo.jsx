import { useId } from 'react';
import './MarsLogo.css';

/**
 * MarsLogo — Authentic "Mars and Moon" Aerospace Insignia
 * 
 * Features:
 * - Mars sphere with authentic albedo shading, northern polar ice cap, and Valles canyon feature
 * - Inclined orbital trajectory loop with fore/aft depth
 * - Companion Martian Moon (Phobos) in synchronous orbit
 * - Precision Mission Control telemetry reticle ticks
 */
function MarsLogo({ size = 24, className = '', title = 'Mars Pathfinder' }) {
  const reactId = useId();
  const uniqueId = `mars-logo-${size}-${reactId.replace(/:/g, '')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={`mars-logo ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        {/* Mars Atmospheric Shading Gradient */}
        <radialGradient id={`${uniqueId}-mars`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="35%" stopColor="#ea580c" />
          <stop offset="70%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </radialGradient>

        {/* Martian Moon (Phobos) Gradient */}
        <radialGradient id={`${uniqueId}-moon`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </radialGradient>

        {/* Orbit Path Gradient */}
        <linearGradient id={`${uniqueId}-orbit`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
        </linearGradient>

        {/* Subtle Mars Glow */}
        <filter id={`${uniqueId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Precision Telemetry Cardinal Ticks (Mission Control Reticle) */}
      <line x1="15.5" y1="1.5" x2="15.5" y2="4" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
      <line x1="15.5" y1="28" x2="15.5" y2="30.5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
      <line x1="1.5" y1="16" x2="4" y2="16" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
      <line x1="28" y1="16" x2="30.5" y2="16" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

      {/* 2. Rear Orbital Arc (passing behind Mars) */}
      <path
        d="M 6.5 19.5 C 5.2 14.8 9.5 10.2 16.8 8.6 C 22.8 7.3 27.5 9.2 28.5 13.2"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.1"
        strokeDasharray="2.2 1.5"
        opacity="0.45"
      />

      {/* 3. Mars Celestial Sphere */}
      <circle
        cx="15.5"
        cy="16"
        r="7.8"
        fill={`url(#${uniqueId}-mars)`}
        stroke="#271007"
        strokeWidth="0.8"
      />

      {/* 4. Mars Geological Features */}
      {/* Northern Polar Ice Cap */}
      <path
        d="M 12.2 9.4 C 13.6 8.8 16.8 8.8 18.2 9.4 C 17.2 10.2 13.2 10.2 12.2 9.4 Z"
        fill="#ffedd5"
        opacity="0.88"
      />

      {/* Valles Marineris Canyon Fault Line */}
      <path
        d="M 11.5 17 Q 15 18.8 19.2 15.8"
        fill="none"
        stroke="#2a0c05"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Syrtis Major Albedo Basin */}
      <path
        d="M 16.2 12.2 C 17.8 13.2 18.2 14.8 16.8 15.8 C 15.6 14.6 15.4 13.2 16.2 12.2 Z"
        fill="#3b1106"
        opacity="0.5"
      />

      {/* Atmospheric Limb Highlight */}
      <path
        d="M 9.2 11.2 C 12.5 8.5 18.5 8.5 21.8 11.2"
        fill="none"
        stroke="#fed7aa"
        strokeWidth="0.75"
        opacity="0.45"
        strokeLinecap="round"
      />

      {/* 5. Front Orbital Arc (sweeping in front of Mars) */}
      <path
        d="M 28.5 13.2 C 29.5 17.8 24.8 23 16.8 24.6 C 10 26 5.5 23.8 4.2 19.5"
        fill="none"
        stroke={`url(#${uniqueId}-orbit)`}
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Pathfinder Flight Trajectory Vector Arrow / Sub-orbital node */}
      <circle cx="6.8" cy="22.2" r="1.1" fill="#f59e0b" />

      {/* 6. The Companion Martian Moon (Phobos) */}
      <g className="mars-logo-moon">
        <circle
          cx="25.5"
          cy="11.2"
          r="2.4"
          fill={`url(#${uniqueId}-moon)`}
          stroke="#0a0b0d"
          strokeWidth="0.6"
        />
        {/* Stickney impact crater on Phobos */}
        <circle cx="24.9" cy="10.8" r="0.65" fill="#374151" opacity="0.85" />
      </g>
    </svg>
  );
}

export default MarsLogo;
