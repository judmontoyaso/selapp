"use client";

import { useEffect } from "react";
import { getOfflineMutations, removeOfflineMutation } from "@/lib/db-client";

export default function OfflineSync() {
    useEffect(() => {
        const handleSync = async () => {
            if (!navigator.onLine) return;

            try {
                const mutations = await getOfflineMutations();
                if (mutations.length === 0) return;

                console.log(`[OfflineSync] Encontradas ${mutations.length} mutaciones pendientes. Sincronizando...`);

                for (const mut of mutations) {
                    try {
                        await fetch(mut.endpoint, {
                            method: mut.type,
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(mut.payload),
                        });
                        // Si la llamada fue exitosa o arrojó un error manejable por el server, borramos la cola
                        await removeOfflineMutation(mut.id);
                        console.log(`[OfflineSync] ✅ Mutación ${mut.id} enviada exitosamente.`);
                    } catch (e) {
                        console.error(`[OfflineSync] ❌ Error sincronizando mutación ${mut.id}:`, e);
                        // Si falla el fetch por red intermitente, no la borramos de IndexedDB para intentar luego
                    }
                }
            } catch (e) {
                console.error("[OfflineSync] Falla leyendo la idb:", e);
            }
        };

        // Intentar sincronizar al arrancar la app
        handleSync();

        // Intentar sincronizar cada vez que vuelva el internet
        window.addEventListener("online", handleSync);

        return () => {
            window.removeEventListener("online", handleSync);
        };
    }, []);

    return null; // Este componente no renderiza nada visual, es un despachador lógico
}
