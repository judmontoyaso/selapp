"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { href: "/", icon: "🏠", label: "Inicio" },
    { href: "/sermons", icon: "📖", label: "Sermones" },
    { href: "/devotionals", icon: "🙏", label: "Devocionales" },
    { href: "/verse-search", icon: "🔎", label: "Buscar Versículos" },
    { href: "/notes", icon: "📓", label: "Diario" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Botón de toggle - solo visible cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-selapp-beige text-selapp-brown p-3 rounded-lg shadow-md transition-all hover:scale-105"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      )}

      {/* Overlay oscuro cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar con info del usuario */}
          <div className="p-6 border-b border-selapp-brown/10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-selapp-accent to-selapp-brown rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-selapp-brown truncate">
                    {session?.user?.name || session?.user?.email?.split('@')[0] || "Usuario"}
                  </p>
                  <p className="text-xs text-selapp-brown-light truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </div>
              {/* Botón X para cerrar */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-selapp-brown hover:bg-selapp-beige/50 w-8 h-8 rounded-lg transition-colors flex-shrink-0 flex items-center justify-center text-xl font-bold"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>
            
            {/* Botón de cerrar sesión */}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.href)
                        ? "bg-selapp-accent text-white shadow-md"
                        : "text-selapp-brown hover:bg-selapp-beige/50"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-selapp-brown/10">
            <div className="text-xs text-selapp-brown-light text-center">
              <p className="mb-1 font-semibold">Selapp v1.0</p>
              <p>Tu compañero espiritual</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
