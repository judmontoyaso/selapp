"use client";

import { FiBookOpen } from "react-icons/fi";

export default function SermonSkeleton() {
    return (
        <div className="selapp-card p-6 h-full border-l-4 border-transparent bg-white shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-selapp-beige/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

            <div className="flex items-start justify-between mb-4 animate-pulse">
                {/* Skeleton Icono Circular */}
                <div className="flex-shrink-0 w-12 h-12 bg-selapp-beige/50 rounded-full flex items-center justify-center">
                    <FiBookOpen className="w-6 h-6 text-selapp-brown/20" />
                </div>

                {/* Skeleton Badge Mensajes */}
                <div className="w-20 h-6 bg-selapp-beige rounded-full" />
            </div>

            {/* Skeleton Título */}
            <div className="w-3/4 h-6 bg-selapp-beige/70 rounded-md mb-3 animate-pulse" />
            <div className="w-1/2 h-6 bg-selapp-beige/70 rounded-md mb-4 animate-pulse" />

            {/* Skeleton Textos (Pastor y Fecha) */}
            <div className="w-2/3 h-4 bg-selapp-beige/40 rounded-md mb-2 animate-pulse" />
            <div className="w-1/3 h-3 bg-selapp-beige/40 rounded-md animate-pulse" />
        </div>
    );
}
