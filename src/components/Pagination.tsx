"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    // Generar array de páginas para mostrar
    // Mostraremos máximo 5 páginas a la vez
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar siempre la actual, y páginas alrededor
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            // Ajustes para los extremos
            if (currentPage <= 3) {
                endPage = Math.min(totalPages, maxVisiblePages);
            } else if (currentPage >= totalPages - 2) {
                startPage = Math.max(1, totalPages - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            {/* Botón Anterior */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || disabled}
                className="p-2 rounded-xl border border-selapp-brown/20 bg-white text-selapp-brown hover:bg-selapp-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                aria-label="Página anterior"
            >
                <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* Números de página */}
            <div className="flex bg-white rounded-xl shadow-sm border border-selapp-brown/10 overflow-hidden">
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        disabled={disabled}
                        className={`px-4 py-2 font-medium transition-colors border-r last:border-r-0 border-selapp-brown/10
              ${currentPage === page
                                ? "bg-selapp-brown text-white"
                                : "bg-white text-selapp-brown hover:bg-selapp-beige"
                            }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Botón Siguiente */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || disabled}
                className="p-2 rounded-xl border border-selapp-brown/20 bg-white text-selapp-brown hover:bg-selapp-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                aria-label="Página siguiente"
            >
                <FiChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
