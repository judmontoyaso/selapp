"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  };

  if (!session) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-selapp-brown hover:bg-selapp-beige/30 rounded-full transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Notifications Panel */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-selapp-brown/20 z-40 max-h-[32rem] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-selapp-brown/20 flex justify-between items-center">
              <h3 className="font-bold text-selapp-brown">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-selapp-accent hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-selapp-brown/60">
                  <span className="text-4xl block mb-2">🔔</span>
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-selapp-brown/10 hover:bg-selapp-beige/20 transition-colors ${
                      !notification.read ? "bg-selapp-beige/10" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getIcon(notification)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4
                            className={`font-semibold text-sm ${
                              !notification.read
                                ? "text-selapp-brown"
                                : "text-selapp-brown/70"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-selapp-accent hover:text-selapp-accent-dark text-xs flex-shrink-0"
                              title="Marcar como leída"
                            >
                              ✓
                            </button>
                          )}
                        </div>

                        <p className="text-sm text-selapp-brown/70 line-clamp-2 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-selapp-brown/50">
                            {getTimeAgo(notification.createdAt)}
                          </span>

                          <div className="flex gap-2">
                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="text-xs text-selapp-accent hover:underline"
                              >
                                Ver más →
                              </Link>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-selapp-brown/20 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-selapp-accent hover:underline"
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
