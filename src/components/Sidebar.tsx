"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Home,
  BookOpen,
  Bookmark,
  BookText,
  Sun,
  BarChart2,
  Bell,
  Key,
  X,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Polling de notificaciones no leídas
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
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications for sidebar:", error);
    }
  };

  // Escuchar evento global para abrir el sidebar
  useEffect(() => {
    const handleOpenSidebar = () => setIsOpen(true);
    window.addEventListener("selapp_open_sidebar", handleOpenSidebar);
    return () => window.removeEventListener("selapp_open_sidebar", handleOpenSidebar);
  }, []);

  // Control accesible: cerrar con tecla Escape y bloquear scroll del body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/devotionals", icon: Sun, label: "Devocionales" },
    { href: "/sermons", icon: BookOpen, label: "Sermones" },
    { href: "/versiculos", icon: Bookmark, label: "Versículos" },
    { href: "/notes", icon: BookText, label: "Diario Espiritual" },
    { href: "/sermons/insights", icon: BarChart2, label: "Estadísticas" },
    { href: "/notifications", icon: Bell, label: "Notificaciones", badge: unreadCount },
    { href: "/mcp", icon: Key, label: "Conexión MCP" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Backdrop Overlay accesible */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-card text-card-foreground border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-out w-80 max-w-[85vw] flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menú principal de navegación"
      >
        {/* Header con Perfil de Usuario */}
        <div className="p-5 border-b border-border/80">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm shrink-0 uppercase">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name || session?.user?.email?.split("@")[0] || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || ""}
                </p>
              </div>
            </div>

            {/* Botón de cierre accesible */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Tema en móvil/drawer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 mb-3">
            <span className="text-xs font-medium text-foreground">Tema de la app</span>
            <ThemeToggle />
          </div>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 font-medium px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Lista de Navegación con Smooth Transitions */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>

                    {item.badge && item.badge > 0 ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-primary-foreground text-primary"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-border/80 flex flex-col items-center gap-1">
          <Logo size={22} href={null} />
          <p className="text-[11px] text-muted-foreground">Tu compañero espiritual</p>
        </div>
      </aside>
    </>
  );
}
