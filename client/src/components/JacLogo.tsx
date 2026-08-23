import React from "react";

const OFFICIAL_LOGO_URL = "/manus-storage/logo_jac_bellavista_colores_oficiales_112ab20c.webp";
const OFFICIAL_LOGO_ALT = "Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad";

export interface JacLogoProps {
  variant?: "full" | "icon" | "watermark" | "monochrome";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

/**
 * Logo institucional oficial proporcionado por la JAC Bellavista.
 * El activo se sirve desde almacenamiento administrado para conservar el emblema
 * con el apretón de manos dorado, cinta 1991 y la leyenda “Todos Somos Comunidad”.
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

  const animationClasses = animated ? "transition-transform duration-300 hover:scale-105" : "";
  const imageClass = `shrink-0 object-contain ${animationClasses}`;

  const emblem = (isDecorative = false, multiplier = 1) => (
    <img
      src={OFFICIAL_LOGO_URL}
      alt={isDecorative ? "" : OFFICIAL_LOGO_ALT}
      aria-hidden={isDecorative || undefined}
      width={dimension * multiplier}
      height={dimension * multiplier * 1.25}
      className={imageClass}
      style={{ width: dimension * multiplier, height: dimension * multiplier * 1.25 }}
      loading="eager"
    />
  );

  if (variant === "watermark") {
    return <span className={`pointer-events-none select-none opacity-15 ${className}`}>{emblem(true, 3)}</span>;
  }

  if (variant === "icon" || !showText || variant === "monochrome") {
    return <span className={className}>{emblem()}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {emblem()}
      <div className="flex min-w-0 flex-col">
        <span className="font-serif text-base font-extrabold leading-tight tracking-tight text-[#0F4C81] dark:text-blue-200 sm:text-lg">
          JAC Bellavista
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1B8A5A] dark:text-emerald-400">
          Todos Somos Comunidad
        </span>
      </div>
    </div>
  );
}
