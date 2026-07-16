"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiHome, FiBookOpen, FiBookmark, FiBook, FiPlus, FiX, FiMenu } from "react-icons/fi";

export const MOBILE_TABS = [
  { label: "Inicio", path: "/", icon: <FiHome className="w-5 h-5" /> },
  { label: "Sermones", path: "/sermons", icon: <FiBookOpen className="w-5 h-5" /> },
  { label: "Versículos", path: "/versiculos", icon: <FiBookmark className="w-5 h-5" /> },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ocultar la barra en la vista de detalle de sermón para liberar espacio y no tapar el editor/chat
  const isSermonChat = pathname.startsWith("/sermons/") && pathname !== "/sermons/insights" && pathname !== "/sermons";

  if (!session || isSermonChat) return null;

  const handleAction = (type: "sermon" | "diary") => {
    setIsMenuOpen(false);
    if (type === "sermon") {
      if (pathname === "/sermons") {
        window.dispatchEvent(new Event("selapp_open_add_sermon"));
      } else {
        router.push("/sermons?add=true");
      }
    } else if (type === "diary") {
      router.push("/notes");
    }
  };

  return (
    <>
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-selapp-brown/10 shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 relative px-2">
          {/* Primeros dos tabs */}
          {MOBILE_TABS.slice(0, 2).map((tab) => {
            const active = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-colors py-1 cursor-pointer ${
                  active ? "text-selapp-brown font-bold" : "text-selapp-brown-light/60"
                }`}
              >
                <span className={`transition-transform mb-1 ${active ? "scale-110 text-selapp-brown" : ""}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] truncate">{tab.label}</span>
              </Link>
            );
          })}

          {/* Botón Central (Crear) - Plano y alineado */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 min-w-0 transition-colors py-1 cursor-pointer text-selapp-brown-light/60 hover:text-selapp-brown"
            title="Nueva acción"
          >
            <span className="transition-transform mb-1">
              <FiPlus className="w-5 h-5" />
            </span>
            <span className="text-[10px] truncate">Crear</span>
          </button>

          {/* Tercer tab: Versículos */}
          {(() => {
            const tab = MOBILE_TABS[2];
            const active = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-colors py-1 cursor-pointer ${
                  active ? "text-selapp-brown font-bold" : "text-selapp-brown-light/60"
                }`}
              >
                <span className={`transition-transform mb-1 ${active ? "scale-110 text-selapp-brown" : ""}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] truncate">{tab.label}</span>
              </Link>
            );
          })()}

          {/* Cuarto tab: Menú (abre Sidebar) */}
          <button
            onClick={() => window.dispatchEvent(new Event("selapp_open_sidebar"))}
            className="flex flex-col items-center justify-center flex-1 min-w-0 transition-colors py-1 cursor-pointer text-selapp-brown-light/60 hover:text-selapp-brown"
          >
            <span className="transition-transform mb-1">
              <FiMenu className="w-5 h-5" />
            </span>
            <span className="text-[10px] truncate">Menú</span>
          </button>
        </div>
      </nav>

      {/* Modal / Menú emergente de acciones rápidas */}
      {isMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex justify-between items-center border-b border-selapp-brown/5 pb-2">
              <span className="text-sm font-bold text-selapp-brown-dark uppercase tracking-wider">Crear Nuevo Registro</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-selapp-beige rounded-full text-selapp-brown-light"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAction("sermon")}
                className="bg-selapp-beige hover:bg-selapp-beige-dark/70 border border-selapp-brown/10 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <span className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-selapp-brown mb-3 group-hover:scale-110 transition-transform shadow-xs">
                  <FiBookOpen className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-selapp-brown block">Nuevo Sermón</span>
                <span className="text-[9px] text-selapp-brown-light block mt-1">Notas de prédica</span>
              </button>

              <button
                onClick={() => handleAction("diary")}
                className="bg-selapp-beige hover:bg-selapp-beige-dark/70 border border-selapp-brown/10 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
              >
                <span className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-selapp-brown mb-3 group-hover:scale-110 transition-transform shadow-xs">
                  <FiBook className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-selapp-brown block">Escribir Diario</span>
                <span className="text-[9px] text-selapp-brown-light block mt-1">Agradecimiento o notas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
