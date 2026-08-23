import React from "react";

export interface JacLogoProps {
  variant?: "full" | "icon" | "watermark" | "monochrome";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

/**
 * Official JAC Bellavista 1991 emblem - vectorized from the original institutional logo.
 * Deep blue outer ring with "TODOS SOMOS COMUNIDAD" (top) and "BELLAVISTA" (bottom),
 * inner green border, golden handshake, and blue ribbon with "1991".
 */
export function JacLogo({
  variant = "full",
  size = "md",
  className = "",
  showText = true,
  animated = false,
}: JacLogoProps) {
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
    ? "transition-transform duration-300 hover:scale-105"
    : "";

  // Shared emblem SVG definition
  const EmblemSVG = ({ w, h }: { w: number; h: number }) => (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${animationClasses}`}
      aria-label="Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad"
      role="img"
    >
      <defs>
        {/* Blue Ring Gradient */}
        <linearGradient id="jacBlueRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D4A7A" />
          <stop offset="50%" stopColor="#0F4C81" />
          <stop offset="100%" stopColor="#1A5A94" />
        </linearGradient>
        {/* Golden Handshake Gradient */}
        <linearGradient id="jacGold" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#E8B830" />
          <stop offset="40%" stopColor="#D99B00" />
          <stop offset="100%" stopColor="#C88A00" />
        </linearGradient>
        {/* Ribbon Gradient */}
        <linearGradient id="jacRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0D4070" />
          <stop offset="50%" stopColor="#0F4C81" />
          <stop offset="100%" stopColor="#0D4070" />
        </linearGradient>
        {/* Text Paths for curved text */}
        <path id="topTextPath" d="M 28,100 A 72,72 0 0,1 172,100" />
        <path id="bottomTextPath" d="M 38,105 A 65,65 0 0,0 162,105" />
      </defs>

      {/* === OUTER BLUE RING === */}
      <circle cx="100" cy="100" r="92" fill="url(#jacBlueRing)" />

      {/* Top text: TODOS SOMOS COMUNIDAD */}
      <text fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="3">
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          TODOS SOMOS COMUNIDAD
        </textPath>
      </text>

      {/* Bottom text: BELLAVISTA */}
      <text fill="#FFFFFF" fontSize="18" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="5">
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          BELLAVISTA
        </textPath>
      </text>

      {/* === INNER WHITE CIRCLE === */}
      <circle cx="100" cy="100" r="64" fill="#FFFFFF" />

      {/* Inner green border ring */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="#1B8A5A" strokeWidth="2" />

      {/* === GOLDEN HANDSHAKE === */}
      <g transform="translate(100, 98) scale(1.15)">
        {/* Left arm/sleeve */}
        <path
          d="M-42 8 C-42 8, -38 -4, -28 -8 L-14 -14 C-10 -16, -6 -14, -4 -10
             L-2 -4 C0 -1, -4 4, -8 6 L-18 12 C-24 14, -32 14, -42 8 Z"
          fill="url(#jacGold)"
          stroke="#A67C00"
          strokeWidth="0.8"
        />
        {/* Right arm/sleeve */}
        <path
          d="M42 8 C42 8, 38 -4, 28 -8 L14 -14 C10 -16, 6 -14, 4 -10
             L2 -4 C0 -1, 4 4, 8 6 L18 12 C24 14, 32 14, 42 8 Z"
          fill="url(#jacGold)"
          stroke="#A67C00"
          strokeWidth="0.8"
        />
        {/* Central clasped hand area */}
        <path
          d="M-14 -14 C-8 -18, 8 -18, 14 -14 L8 -6 C4 -2, -4 -2, -8 -6 Z"
          fill="url(#jacGold)"
          stroke="#A67C00"
          strokeWidth="0.6"
        />
        {/* Finger lines - clasped fingers */}
        <path d="M-10 2 Q-6 6, 0 6 Q6 6, 10 2" stroke="#A67C00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M-8 8 Q-4 12, 0 12 Q4 12, 8 8" stroke="#A67C00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M-5 14 Q-2 17, 0 17 Q2 17, 5 14" stroke="#A67C00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Thumb left */}
        <path d="M-18 -2 C-16 -6, -12 -8, -8 -6" stroke="#A67C00" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Thumb right */}
        <path d="M18 -2 C16 -6, 12 -8, 8 -6" stroke="#A67C00" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Wrist line left */}
        <path d="M-42 8 L-28 8" stroke="#A67C00" strokeWidth="1.2" fill="none" />
        {/* Wrist line right */}
        <path d="M42 8 L28 8" stroke="#A67C00" strokeWidth="1.2" fill="none" />
      </g>

      {/* === BOTTOM RIBBON BANNER WITH "1991" === */}
      {/* Ribbon left tail */}
      <path d="M38 178 L32 195 L50 188 Z" fill="url(#jacRibbon)" />
      {/* Ribbon right tail */}
      <path d="M162 178 L168 195 L150 188 Z" fill="url(#jacRibbon)" />
      {/* Ribbon main body */}
      <path
        d="M40 168 Q100 180, 160 168 L162 182 Q100 194, 38 182 Z"
        fill="url(#jacRibbon)"
        stroke="#0A3A66"
        strokeWidth="1"
      />
      {/* 1991 text */}
      <text x="100" y="180" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="800" fontFamily="Georgia, serif" fontStyle="italic" letterSpacing="3">
        1991
      </text>
    </svg>
  );

  if (variant === "icon" || !showText) {
    return (
      <span className={className}>
        <EmblemSVG w={dimension} h={dimension * 1.1} />
      </span>
    );
  }

  if (variant === "watermark") {
    return (
      <svg
        width={dimension * 3}
        height={dimension * 3}
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none opacity-8 select-none ${className}`}
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" stroke="#0F4C81" strokeWidth="3" fill="none" />
        <circle cx="100" cy="100" r="64" stroke="#1B8A5A" strokeWidth="1.5" fill="none" />
        <text x="100" y="55" textAnchor="middle" fill="#0F4C81" fontSize="10" fontWeight="bold">TODOS SOMOS COMUNIDAD</text>
        <text x="100" y="155" textAnchor="middle" fill="#0F4C81" fontSize="12" fontWeight="bold">BELLAVISTA</text>
        <text x="100" y="195" textAnchor="middle" fill="#0F4C81" fontSize="14" fontWeight="bold" fontStyle="italic">1991</text>
      </svg>
    );
  }

  // Full variant with emblem + typography
  return (
    <div className={`inline-flex items-center gap-3 ${animationClasses} ${className}`}>
      <EmblemSVG w={dimension} h={dimension * 1.1} />
      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-extrabold tracking-tight text-[#0F4C81] dark:text-blue-200 leading-tight text-base sm:text-lg">
            JAC Bellavista
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1B8A5A] dark:text-emerald-400">
            Todos Somos Comunidad
          </span>
        </div>
      )}
    </div>
  );
}
