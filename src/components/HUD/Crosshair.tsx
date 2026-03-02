"use client";

export default function Crosshair() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#00ff41"
          strokeWidth="1"
          strokeDasharray="8 4"
          opacity="0.6"
        />
        {/* Inner circle */}
        <circle
          cx="60"
          cy="60"
          r="20"
          stroke="#00ff41"
          strokeWidth="1"
          opacity="0.8"
        />
        {/* Cross lines */}
        <line x1="60" y1="0" x2="60" y2="35" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
        <line x1="60" y1="85" x2="60" y2="120" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
        <line x1="0" y1="60" x2="35" y2="60" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
        <line x1="85" y1="60" x2="120" y2="60" stroke="#00ff41" strokeWidth="1" opacity="0.5" />
        {/* Corner brackets */}
        <path d="M20 20 L20 30 M20 20 L30 20" stroke="#00ff41" strokeWidth="1.5" opacity="0.7" />
        <path d="M100 20 L100 30 M100 20 L90 20" stroke="#00ff41" strokeWidth="1.5" opacity="0.7" />
        <path d="M20 100 L20 90 M20 100 L30 100" stroke="#00ff41" strokeWidth="1.5" opacity="0.7" />
        <path d="M100 100 L100 90 M100 100 L90 100" stroke="#00ff41" strokeWidth="1.5" opacity="0.7" />
        {/* Center dot */}
        <circle cx="60" cy="60" r="2" fill="#00ff41" opacity="0.9" />
      </svg>
    </div>
  );
}
