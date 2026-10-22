"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  BookOpen,
  Bookmark,
  BookText,
  Sun,
  Search,
  BarChart2,
  Bell,
  Menu,
  LogOut,
} from "lucide-react";

export default function DesktopHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Ocultar header en páginas de autenticación o cuando no hay sesión activa
  if (!session || pathname.startsWith("/auth")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/devotionals", label: "Devocionales", icon: Sun },
    { href: "/sermons", label: "Sermones", icon: BookOpen },
    { href: "/versiculos", label: "Versículos", icon: Bookmark },
    { href: "/notes", label: "Diario", icon: BookText },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/sermons?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="hidden sm:flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Brand & Links de navegación */}
      <div className="flex items-center gap-6 lg:gap-8 min-w-0">
        <Logo size={32} />

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-accent/15 text-foreground font-semibold shadow-2xs border border-accent/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cluster derecho: Buscador, ThemeToggle, Notificaciones y Perfil */}
      <div className="flex items-center gap-3">
        {/* Buscador Rápido de Sermones */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar sermones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border/80 focus:border-ring rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </form>

        {/* Selector de Tema */}
        <ThemeToggle />

        {/* Campana de Notificaciones */}
        <NotificationBell />

        {/* Menú de Usuario con Dropdown accesible */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 bg-gradient-to-br from-accent to-primary text-primary-foreground font-bold rounded-full flex items-center justify-center shadow-xs hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background active:scale-95 transition-all uppercase text-xs focus:outline-none cursor-pointer"
              aria-label="Abrir menú de usuario"
            >
              {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session.user?.name || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notes" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer">
                <BookText className="w-4 h-4 text-muted-foreground" />
                <span>Diario Espiritual</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sermons/insights" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <span>Estadísticas</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span>Notificaciones</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => window.dispatchEvent(new Event("selapp_open_sidebar"))}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer"
            >
              <Menu className="w-4 h-4 text-muted-foreground" />
              <span>Menú lateral completo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
