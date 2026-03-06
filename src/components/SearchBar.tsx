"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

export default function SearchBar({
    onSearch,
    placeholder = "Buscar en títulos, pastores o contenido de notas...",
    initialValue = "",
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const isFirstRender = useRef(true);

    // Efecto Debounce para evitar llamadas excesivas a la API
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            onSearch(query);
        }, 400); // 400ms de retraso

        return () => {
            clearTimeout(handler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const handleClear = () => {
        setQuery("");
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-selapp-brown/40 group-focus-within:text-selapp-accent transition-colors" />
            </div>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="block w-full pl-12 pr-10 py-4 bg-white border border-selapp-brown/10 rounded-2xl leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-selapp-accent/20 focus:border-selapp-accent transition-all sm:text-base text-selapp-brown placeholder-selapp-brown-light/50"
            />

            {query && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-selapp-brown/40 hover:text-selapp-brown-dark transition-colors"
                    aria-label="Limpiar búsqueda"
                >
                    <FiX className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
