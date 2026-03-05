"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiHome, FiBookOpen, FiHeart, FiSearch, FiBook, FiBell, FiMenu, FiX, FiLogOut } from "react-icons/fi";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=1");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications for sidebar:", error);
    }
  };

  const menuItems = [
    { href: "/", icon: <FiHome className="w-5 h-5" />, label: "Inicio" },
    { href: "/sermons", icon: <FiBookOpen className="w-5 h-5" />, label: "Sermones" },
    { href: "/devotionals", icon: <FiHeart className="w-5 h-5" />, label: "Devocionales" },
    { href: "/verse-search", icon: <FiSearch className="w-5 h-5" />, label: "Buscar Versículos" },
    { href: "/notes", icon: <FiBook className="w-5 h-5" />, label: "Diario" },
    { href: "/notifications", icon: <FiBell className="w-5 h-5" />, label: "Notificaciones", badge: unreadCount },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Botón de toggle - solo visible cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-50 bg-white/50 backdrop-blur-md border border-selapp-brown/10 text-selapp-brown p-2.5 rounded-xl transition-all hover:bg-white/90 shadow-sm hover:shadow"
          aria-label="Abrir menú"
        >
          <FiMenu className="w-6 h-6" />
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
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
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
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isActive(item.href)
                      ? "bg-selapp-accent text-white shadow-md"
                      : "text-selapp-brown hover:bg-selapp-beige/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive(item.href) ? "bg-white text-selapp-accent" : "bg-red-500 text-white"
                        }`}>
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    ) : null}
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
