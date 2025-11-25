"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = filter === "unread" 
        ? "/api/notifications?unreadOnly=true&limit=100"
        : "/api/notifications?limit=100";
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllRead = async () => {
    if (!confirm("¿Eliminar todas las notificaciones leídas?")) return;

    try {
      const response = await fetch("/api/notifications?all=true", {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !n.read));
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const getIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    const iconMap: { [key: string]: string } = {
      verse_of_day: "📖",
      reading_reminder: "📚",
      diary_reminder: "✍️",
      achievement: "🏆",
      custom: "🔔",
    };

    return iconMap[notification.type] || "🔔";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Hace un momento";
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    return date.toLocaleDateString("es-ES", { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="text-selapp-brown text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-selapp-brown hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-selapp-brown mb-2">🔔 Notificaciones</h1>
              {unreadCount > 0 && (
                <p className="text-selapp-brown-light">
                  Tienes {unreadCount} notificación{unreadCount !== 1 ? "es" : ""} sin leer
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "all"
                  ? "bg-selapp-accent text-white"
                  : "bg-selapp-beige/30 text-selapp-brown hover:bg-selapp-beige/50"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "unread"
                  ? "bg-selapp-accent text-white"
                  : "bg-selapp-beige/30 text-selapp-brown hover:bg-selapp-beige/50"
              }`}
            >
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
            <button
              onClick={deleteAllRead}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Eliminar leídas
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-2xl animate-spin inline-block">⏳</span>
            <p className="text-selapp-brown-light mt-4">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl block mb-4">🔔</span>
            <h2 className="text-2xl font-bold text-selapp-brown mb-2">
              {filter === "unread" ? "No tienes notificaciones sin leer" : "No tienes notificaciones"}
            </h2>
            <p className="text-selapp-brown/60">
              {filter === "unread" 
                ? "¡Excelente! Estás al día con todo"
                : "Recibirás notificaciones de versículos, recordatorios y logros"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-selapp-accent" : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-4xl">
                    {getIcon(notification)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3
                        className={`text-lg font-bold ${
                          !notification.read
                            ? "text-selapp-brown"
                            : "text-selapp-brown/70"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-sm text-selapp-brown/50 flex-shrink-0">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-selapp-brown/80 mb-4">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => markAsRead(notification.id)}
                          className="px-4 py-2 bg-selapp-accent hover:bg-selapp-accent-dark text-white rounded-lg font-semibold transition-colors"
                        >
                          Ver más →
                        </Link>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          ✓ Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
