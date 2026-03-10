"use client";

import { useState, useEffect } from "react";
import { FiWifiOff } from "react-icons/fi";

export default function NetworkStatus() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Verificar estado inicial
        setIsOffline(!navigator.onLine);

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-red-500/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-red-400/30">
                <FiWifiOff className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wide">Estás navegando sin conexión</span>
            </div>
        </div>
    );
}
