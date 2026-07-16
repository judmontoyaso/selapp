"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { FiHome, FiBookOpen, FiBookmark, FiBook } from "react-icons/fi";

export default function DesktopHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Si no está autenticado o estamos en una página de autenticación, no mostrar header global
  if (!session || pathname.startsWith("/auth")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Inicio", icon: <FiHome className="w-4 h-4" /> },
    { href: "/sermons", label: "Sermones", icon: <FiBookOpen className="w-4 h-4" /> },
    { href: "/versiculos", label: "Versículos", icon: <FiBookmark className="w-4 h-4" /> },
    { href: "/notes", label: "Diario", icon: <FiBook className="w-4 h-4" /> },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="hidden sm:flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-selapp-brown/10 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-8">
        <Logo size={32} />
        
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-selapp-accent/15 text-selapp-brown-dark shadow-sm border border-selapp-accent/20"
                    : "text-selapp-brown-light hover:text-selapp-brown hover:bg-selapp-beige/40"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Campana de Notificaciones integrada en el flujo */}
        <NotificationBell />

        {/* Botón de Perfil que abre la Sidebar */}
        <button
          onClick={() => window.dispatchEvent(new Event("selapp_open_sidebar"))}
          className="w-9 h-9 bg-gradient-to-br from-selapp-accent to-selapp-brown text-white font-bold rounded-full flex items-center justify-center shadow hover:shadow-md active:scale-95 transition-all border border-white cursor-pointer uppercase text-xs"
          aria-label="Abrir menú de configuración"
        >
          {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
        </button>
      </div>
    </header>
  );
}
