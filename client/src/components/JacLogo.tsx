import React from "react";

export interface JacLogoProps {
  variant?: "full" | "icon" | "watermark" | "monochrome";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export function JacLogo({
  variant = "full",
  size = "md",
  className = "",
  showText = true,
  animated = false,
}: JacLogoProps) {
  // Dimension calculations
  const dimension =
    typeof size === "number"
      ? size
      : size === "xs"
      ? 28
      : size === "sm"
      ? 36
      : size === "md"
      ? 48
      : size === "lg"
      ? 64
      : 80;

  const animationClasses = animated
    ? "transition-transform duration-300 hover:scale-105 hover:rotate-1"
    : "";

  if (variant === "icon" || !showText) {
    return (
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${animationClasses} ${className}`}
        aria-label="Logo Junta de Acción Comunal Bellavista 1991"
        role="img"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4C81" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B8A5A" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Outer Circular Ring */}
        <circle cx="60" cy="60" r="56" fill="url(#blueGradient)" stroke="#FACC15" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="48" fill="url(#greenGradient)" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Usme Hills / Páramo Silhouette */}
        <path d="M12 72 Q 35 48, 60 62 Q 85 45, 108 72 Z" fill="#15803D" opacity="0.85" />
        <path d="M12 78 Q 40 58, 60 70 Q 80 54, 108 78 Z" fill="#166534" />

        {/* Sun in background */}
        <circle cx="60" cy="42" r="16" fill="url(#sunGlow)" />
        <circle cx="60" cy="42" r="10" fill="url(#goldGradient)" />

        {/* Handshake - Solidarity & Community */}
        <g transform="translate(60, 68) scale(0.95)">
          {/* Left Arm & Cuff (Blue / Governance) */}
          <path
            d="M-36 6 L-20 6 L-12 -2 L-20 -10 L-36 -10 Z"
            fill="#0F4C81"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          {/* Right Arm & Cuff (Green / Rural Community) */}
          <path
            d="M36 6 L20 6 L12 -2 L20 -10 L36 -10 Z"
            fill="#1B8A5A"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          {/* Left Hand */}
          <path
            d="M-18 -2 C-14 -12, -4 -14, 0 -8 C2 -6, -2 4, -12 6 C-16 6, -18 4, -18 -2 Z"
            fill="url(#goldGradient)"
            stroke="#78350F"
            strokeWidth="1.2"
          />
          {/* Right Hand clasping */}
          <path
            d="M18 -2 C14 -12, 4 -14, 0 -8 C-2 -6, 2 4, 12 6 C16 6, 18 4, 18 -2 Z"
            fill="#FBBF24"
            stroke="#78350F"
            strokeWidth="1.2"
          />
          {/* Fingers locked in handshake */}
          <path d="M-8 -4 Q0 -2 8 -4" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-6 0 Q0 2 6 0" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-4 4 Q0 6 4 4" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Ribbon Base */}
        <path d="M22 96 Q60 106 98 96 L92 110 Q60 118 28 110 Z" fill="#0F4C81" stroke="#FACC15" strokeWidth="1" />
        <text x="60" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
          1991
        </text>
      </svg>
    );
  }

  if (variant === "watermark") {
    return (
      <svg
        width={dimension * 3}
        height={dimension * 3}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none opacity-10 select-none ${className}`}
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" stroke="#0F4C81" strokeWidth="4" />
        <circle cx="100" cy="100" r="75" stroke="#1B8A5A" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M40 120 Q 100 80, 160 120" stroke="#0F4C81" strokeWidth="3" fill="none" />
        <g transform="translate(100, 110) scale(1.2)">
          <path d="M-30 0 L-10 -10 L10 0 L-10 10 Z" stroke="#0F4C81" strokeWidth="2" fill="none" />
          <path d="M30 0 L10 -10 L-10 0 L10 10 Z" stroke="#1B8A5A" strokeWidth="2" fill="none" />
        </g>
        <text x="100" y="55" textAnchor="middle" fill="#0F4C81" fontSize="11" fontWeight="bold">
          JAC BELLAVISTA 1991
        </text>
        <text x="100" y="165" textAnchor="middle" fill="#1B8A5A" fontSize="9" fontWeight="bold">
          TODOS SOMOS COMUNIDAD
        </text>
      </svg>
    );
  }

  // Full Variant with Emblem & Typography
  return (
    <div className={`inline-flex shrink-0 items-center gap-3 ${animationClasses} ${className}`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
        aria-label="Emblema JAC Bellavista 1991"
        role="img"
      >
        <defs>
          <linearGradient id="blueGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4C81" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="greenGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B8A5A" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="goldGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <path id="textPathRing" d="M 18, 60 A 42,42 0 1,1 102,60" />
        </defs>

        {/* Outer Ring */}
        <circle cx="60" cy="60" r="56" fill="url(#blueGradFull)" stroke="#FACC15" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="46" fill="url(#greenGradFull)" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* Usme Hills */}
        <path d="M14 74 Q 38 52, 60 64 Q 82 48, 106 74 Z" fill="#15803D" opacity="0.9" />
        <path d="M14 80 Q 40 62, 60 72 Q 80 58, 106 80 Z" fill="#166534" />

        {/* Sun */}
        <circle cx="60" cy="40" r="11" fill="url(#goldGradFull)" />

        {/* Curved Text Path */}
        <text fill="#FFFFFF" fontSize="6.2" fontWeight="bold" letterSpacing="0.6">
          <textPath href="#textPathRing" startOffset="50%" textAnchor="middle">
            JAC BELLAVISTA 1991
          </textPath>
        </text>

        {/* Handshake */}
        <g transform="translate(60, 68) scale(0.95)">
          {/* Left Sleeve (Blue) */}
          <path d="M-34 4 L-18 4 L-10 -4 L-18 -12 L-34 -12 Z" fill="#0F4C81" stroke="#FFFFFF" strokeWidth="0.8" />
          {/* Right Sleeve (Green) */}
          <path d="M34 4 L18 4 L10 -4 L18 -12 L34 -12 Z" fill="#1B8A5A" stroke="#FFFFFF" strokeWidth="0.8" />
          {/* Left Hand */}
          <path d="M-16 -4 C-12 -14, -2 -14, 0 -8 C2 -6, -2 4, -10 6 Z" fill="url(#goldGradFull)" stroke="#78350F" strokeWidth="1" />
          {/* Right Hand */}
          <path d="M16 -4 C12 -14, 2 -14, 0 -8 C-2 -6, 2 4, 10 6 Z" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
          {/* Clasped fingers */}
          <path d="M-7 -4 Q0 -2 7 -4" stroke="#78350F" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M-5 0 Q0 2 5 0" stroke="#78350F" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M-3 4 Q0 6 3 4" stroke="#78350F" strokeWidth="1.3" strokeLinecap="round" />
        </g>

        {/* Bottom Banner Ribbon */}
        <path d="M16 94 Q60 106 104 94 L98 112 Q60 120 22 112 Z" fill="#0F4C81" stroke="#FACC15" strokeWidth="1.2" />
        <text x="60" y="106" textAnchor="middle" fill="#FACC15" fontSize="5.8" fontWeight="800" letterSpacing="0.4">
          TODOS SOMOS COMUNIDAD
        </text>
      </svg>

      {showText && (
        <div className="flex min-w-[150px] flex-col whitespace-nowrap">
          <span className="font-serif font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 leading-tight text-base sm:text-lg">
            JAC Bellavista <span className="text-amber-500 font-sans text-xs sm:text-sm font-semibold">(1991)</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
            Todos Somos Comunidad
          </span>
        </div>
      )}
    </div>
  );
}
