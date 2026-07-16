import Link from "next/link";

// Marca de Selapp: brote de dos hojas (mismo trazo que public/logo-mark.svg,
// sin el fondo, para usar sobre superficies claras).
export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img src="/icons/nature.png" alt="" className={`${className} object-contain`} />
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
