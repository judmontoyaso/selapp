"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  Sun,
  BookOpen,
  BookText,
  Bookmark,
  Plus,
  Menu,
  X,
} from "lucide-react";

export const MOBILE_TABS = [
  { label: "Inicio", path: "/", icon: Home },
  { label: "Devocionales", path: "/devotionals", icon: Sun },
  { label: "Sermones", path: "/sermons", icon: BookOpen },
  { label: "Diario", path: "/notes", icon: BookText },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ocultar la barra en la vista de detalle de sermón para liberar espacio al editor/chat
  const isSermonChat =
    pathname.startsWith("/sermons/") &&
    pathname !== "/sermons/insights" &&
    pathname !== "/sermons";

  // Control de tecla escape para modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  if (!session || isSermonChat || pathname.startsWith("/auth")) {
    return null;
  }

  const handleAction = (type: "sermon" | "diary" | "devotional" | "verses") => {
    setIsMenuOpen(false);
    if (type === "sermon") {
      if (pathname === "/sermons") {
        window.dispatchEvent(new Event("selapp_open_add_sermon"));
      } else {
        router.push("/sermons?add=true");
      }
    } else if (type === "diary") {
      router.push("/notes");
    } else if (type === "devotional") {
      router.push("/devotionals");
    } else if (type === "verses") {
      router.push("/versiculos");
    }
  };

  const isTabActive = (tabPath: string) => {
    if (tabPath === "/") return pathname === "/";
    return pathname.startsWith(tabPath);
  };

  return (
    <>
      {/* Barra de navegación inferior móvil */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 dark:bg-card/90 backdrop-blur-xl border-t border-border/70 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-colors duration-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Navegación móvil inferior"
      >
        <div className="flex items-center justify-around h-16 relative px-2">
          {/* Tabs 1 y 2: Inicio y Devocionales */}
          {MOBILE_TABS.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 transition-all duration-150 ${
                  active
                    ? "text-primary dark:text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform duration-150 ${
                    active ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                <span className="text-[10px] tracking-tight truncate">{tab.label}</span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-primary dark:bg-accent mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* Botón Central Elevado: Crear */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 group focus:outline-none cursor-pointer"
            title="Crear nuevo registro"
            aria-label="Crear nuevo registro"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5 group-hover:text-foreground truncate">
              Crear
            </span>
          </button>

          {/* Tab 3: Sermones */}
          {(() => {
            const tab = MOBILE_TABS[2];
            const Icon = tab.icon;
            const active = isTabActive(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 transition-all duration-150 ${
                  active
                    ? "text-primary dark:text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform duration-150 ${
                    active ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                <span className="text-[10px] tracking-tight truncate">{tab.label}</span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-primary dark:bg-accent mt-0.5" />
                )}
              </Link>
            );
          })()}

          {/* Tab 4: Menú (abre Sidebar con todas las rutas y ThemeToggle) */}
          <button
            onClick={() => window.dispatchEvent(new Event("selapp_open_sidebar"))}
            className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 text-muted-foreground hover:text-foreground transition-all duration-150 focus:outline-none cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className="text-[10px] tracking-tight truncate">Menú</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Modal de Acciones Rápidas */}
      {isMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm bg-card text-card-foreground border border-border rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-200">
            {/* Handle indicador de arrastre */}
            <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto" />

            {/* Cabecera del Sheet */}
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Crear Registro
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grilla de Acciones Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction("sermon")}
                className="bg-muted/40 hover:bg-muted/80 border border-border/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-11 h-11 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground block">Nuevo Sermón</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Notas de prédica</span>
              </button>

              <button
                onClick={() => handleAction("diary")}
                className="bg-muted/40 hover:bg-muted/80 border border-border/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-11 h-11 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <BookText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground block">Escribir Diario</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Gratitud y notas</span>
              </button>

              <button
                onClick={() => handleAction("devotional")}
                className="bg-muted/40 hover:bg-muted/80 border border-border/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-11 h-11 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground block">Devocional</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Lectura de hoy</span>
              </button>

              <button
                onClick={() => handleAction("verses")}
                className="bg-muted/40 hover:bg-muted/80 border border-border/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] active:scale-95"
              >
                <div className="w-11 h-11 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground block">Versículos</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Favoritos y Biblia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
