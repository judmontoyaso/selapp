"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  BookOpen,
  Heart,
  Search,
  Book,
  Bell,
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/sermons", icon: BookOpen, label: "Sermones" },
    { href: "/devotionals", icon: Heart, label: "Devocionales" },
    { href: "/verse-search", icon: Search, label: "Buscar Versículos" },
    { href: "/notes", icon: Book, label: "Diario" },
    { href: "/notifications", icon: Bell, label: "Notificaciones" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Botón de toggle - solo visible cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-md hover:bg-white text-selapp-brown p-3 rounded-xl shadow-sm border border-selapp-beige-dark/50 transition-all hover:scale-105 hover:shadow-md"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay oscuro cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-selapp-brown-dark/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-80 border-r border-selapp-beige-dark/50`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar con info del usuario */}
          <div className="p-8 border-b border-selapp-beige-dark/50 bg-selapp-beige/30">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-selapp-brown text-selapp-accent rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-selapp-brown truncate">
                    {session?.user?.name || session?.user?.email?.split('@')[0] || "Usuario"}
                  </p>
                  <p className="text-xs text-selapp-brown-light truncate font-medium">
                    {session?.user?.email || "Invitado"}
                  </p>
                </div>
              </div>
              {/* Botón X para cerrar */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-selapp-brown-light hover:text-selapp-brown hover:bg-selapp-beige-dark/30 p-2 rounded-lg transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full bg-white border border-selapp-beige-dark hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-selapp-brown-light px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 font-medium group"
            >
              <LogOut size={18} className="group-hover:stroke-red-600" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-3">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${active
                          ? "bg-selapp-brown text-white shadow-lg shadow-selapp-brown/20"
                          : "text-selapp-brown hover:bg-selapp-beige/50"
                        }`}
                    >
                      <item.icon
                        size={22}
                        className={`transition-colors ${active ? "text-selapp-accent" : "text-selapp-brown-light group-hover:text-selapp-brown"}`}
                        strokeWidth={active ? 2.5 : 2}
                      />
                      <span className={`font-medium ${active ? "font-bold" : ""}`}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-6 border-t border-selapp-beige-dark/50 bg-selapp-beige/30">
            <div className="text-xs text-selapp-brown-light text-center space-y-1">
              <p className="font-bold text-selapp-brown tracking-wide uppercase text-[10px]">Selapp v1.0</p>
              <p className="opacity-70">Tu compañero espiritual</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
