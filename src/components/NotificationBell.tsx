"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";

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
        className="relative p-3 bg-white hover:bg-white/80 backdrop-blur-md text-selapp-brown rounded-full transition-all shadow-sm hover:shadow-md border border-selapp-beige-dark/50"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm border-2 border-white">
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
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-selapp-beige-dark/50 z-40 max-h-[32rem] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-selapp-beige-dark/50 flex justify-between items-center bg-selapp-beige/30">
              <h3 className="font-bold text-selapp-brown font-serif text-lg">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs font-medium text-selapp-accent hover:text-selapp-brown transition-colors"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-selapp-brown/40 flex flex-col items-center">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-selapp-beige-dark/30 hover:bg-selapp-beige/30 transition-colors ${!notification.read ? "bg-selapp-accent/5" : ""
                      }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-selapp-beige-dark/30">
                        {getIcon(notification)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4
                            className={`font-semibold text-sm ${!notification.read
                                ? "text-selapp-brown"
                                : "text-selapp-brown/70"
                              }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-selapp-accent hover:text-selapp-brown transition-colors p-1"
                              title="Marcar como leída"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>

                        <p className="text-sm text-selapp-brown/70 line-clamp-2 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-selapp-beige-dark/30">
                          <span className="text-[10px] uppercase tracking-wider text-selapp-brown/40 font-bold">
                            {getTimeAgo(notification.createdAt)}
                          </span>

                          <div className="flex gap-3">
                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="text-xs text-selapp-accent hover:text-selapp-brown font-medium flex items-center gap-1 transition-colors"
                              >
                                Ver <ExternalLink size={10} />
                              </Link>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
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
              <div className="p-3 border-t border-selapp-beige-dark/50 text-center bg-selapp-beige/30">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-selapp-brown/60 hover:text-selapp-brown uppercase tracking-widest transition-colors"
                >
                  Ver historial completo
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
