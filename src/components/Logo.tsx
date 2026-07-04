import Link from "next/link";

// Marca de Selapp: brote de dos hojas (mismo trazo que public/logo-mark.svg,
// sin el fondo, para usar sobre superficies claras).
export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path
        d="M256 414 C256 330 256 280 262 218"
        stroke="#6B4E3D"
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M258 292 C178 288 126 228 124 136 C214 146 258 208 258 292 Z"
        fill="#6B4E3D"
      />
      <path
        d="M260 224 C260 148 312 100 388 98 C390 178 336 226 260 224 Z"
        fill="#D4A574"
      />
    </svg>
  );
}

interface LogoProps {
  /** Tamaño de la marca en px */
  size?: number;
  /** Mostrar el wordmark "selapp" junto a la marca */
  withWordmark?: boolean;
  /** Link de destino; null para no envolver en link */
  href?: string | null;
  className?: string;
}

export default function Logo({ size = 34, withWordmark = true, href = "/", className = "" }: LogoProps) {
  const inner = (
    <>
      <span style={{ width: size, height: size }} className="inline-block shrink-0">
        <LogoMark className="w-full h-full" />
      </span>
      {withWordmark && (
        <span
          className="font-serif font-semibold text-selapp-brown tracking-tight leading-none"
          style={{ fontSize: size * 0.72 }}
        >
          selapp
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center gap-2 ${className}`} aria-label="Selapp — inicio">
        {inner}
      </Link>
    );
  }
  return <span className={`inline-flex items-center gap-2 ${className}`}>{inner}</span>;
}
