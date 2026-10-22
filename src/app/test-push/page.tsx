"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function TestPushPage() {
    const { data: session } = useSession();
    const [permission, setPermission] = useState<string>("default");
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [confirmResetOpen, setConfirmResetOpen] = useState(false);
    const [resetting, setResetting] = useState(false);

    const addLog = useCallback((msg: string) => {
        setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    }, []);

    const checkSubscription = useCallback(async () => {
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
            if (sub) {
                addLog("✅ Suscripción encontrada");
            } else {
                addLog("⚠️ No hay suscripción activa");
            }
        }
    }, [addLog]);

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, [checkSubscription]);

    const requestPermission = async () => {
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            addLog(`Permiso solicitado: ${perm}`);
        } catch (error) {
            addLog(`❌ Error solicitando permiso: ${error}`);
        }
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                addLog("❌ Error: Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY en .env");
                setLoading(false);
                return;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            setSubscription(sub);

            // Guardar en backend
            const res = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub),
            });

            if (res.ok) {
                addLog("✅ Suscrito exitosamente y guardado en servidor");
            } else {
                addLog("❌ Error guardando en servidor");
            }
        } catch (error: any) {
            addLog(`❌ Error suscribiendo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            if (subscription) {
                await subscription.unsubscribe();

                // Eliminar del backend
                await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
                    method: "DELETE",
                });

                setSubscription(null);
                addLog("✅ Desuscrito exitosamente");
            }
        } catch (error: any) {
            addLog(`❌ Error desuscribiendo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async () => {
        setLoading(true);
        try {
            addLog("Enviando notificación de prueba...");
            const res = await fetch("/api/test-push");
            const data = await res.json();

            if (res.ok) {
                addLog("✅ Notificación enviada desde el servidor");
            } else {
                addLog(`❌ Error del servidor: ${data.error}`);
            }
        } catch (error: any) {
            addLog(`❌ Error llamando API: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleResetSubscriptions = async () => {
        setResetting(true);
        try {
            const res = await fetch("/api/push/reset", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                addLog(`✅ ${data.message}`);
                toast.success(data.message || "Suscripciones reseteadas");
                if (subscription) await subscription.unsubscribe();
                setSubscription(null);
            } else {
                addLog(`❌ Error: ${data.error}`);
                toast.error(data.error || "Error al resetear suscripciones");
            }
        } catch (e: any) {
            addLog(`❌ Error: ${e}`);
            toast.error(e?.message || "Error al resetear suscripciones");
        } finally {
            setResetting(false);
            setConfirmResetOpen(false);
        }
    };

    if (!session) {
        return <div className="p-8">Debes iniciar sesión para probar notificaciones.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-selapp-brown">🔔 Tester de Notificaciones</h1>

                <div className="space-y-6">
                    {/* Estado */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h2 className="font-semibold mb-2">Estado Actual</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">Permiso:</span>
                                <span className={`ml-2 font-bold ${permission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                                    {permission}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Suscripción:</span>
                                <span className={`ml-2 font-bold ${subscription ? 'text-green-600' : 'text-red-600'}`}>
                                    {subscription ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {permission !== 'granted' && (
                            <button
                                onClick={requestPermission}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Solicitar Permiso
                            </button>
                        )}

                        {permission === 'granted' && !subscription && (
                            <button
                                onClick={subscribe}
                                disabled={loading}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {loading ? 'Suscribiendo...' : 'Suscribirse a Push'}
                            </button>
                        )}

                        {subscription && (
                            <button
                                onClick={unsubscribe}
                                disabled={loading}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : 'Desuscribirse'}
                            </button>
                        )}

                        <button
                            onClick={sendTestNotification}
                            disabled={!subscription || loading}
                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Notificación de Prueba'}
                        </button>

                        <button
                            onClick={() => setConfirmResetOpen(true)}
                            disabled={loading || resetting}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            Resetear Todo
                        </button>
                    </div>

                    {/* Logs */}
                    <div className="border rounded-lg p-4 bg-black text-green-400 font-mono text-sm h-64 overflow-y-auto">
                        {log.length === 0 && <span className="opacity-50">Esperando acciones...</span>}
                        {log.map((l, i) => (
                            <div key={i}>{l}</div>
                        ))}
                    </div>
                    <ConfirmDialog
                        open={confirmResetOpen}
                        onOpenChange={setConfirmResetOpen}
                        title="Resetear suscripciones"
                        description="¿Estás seguro? Esto borrará todas tus suscripciones."
                        confirmLabel="Resetear"
                        variant="destructive"
                        loading={resetting}
                        onConfirm={handleResetSubscriptions}
                    />
                </div>
            </div>
        </div>
    );
}
