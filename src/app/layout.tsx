import type { Metadata } from "next";
import { Inter, Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import PushNotificationSetup from "@/components/PushNotificationSetup";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: "Selapp — Tu Espacio Espiritual",
  description:
    "Selapp: devocionales diarios, sermones y notas con un diseño diseñado para la paz y la reflexión.",
  manifest: "/manifest.json",
  themeColor: "#4A403A",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#4A403A" />
      </head>
      <body className="font-sans antialiased bg-selapp-beige text-selapp-brown selection:bg-selapp-accent/30">
        <SessionProvider>
          <Sidebar />
          <div className="fixed top-6 right-6 z-40">
            <NotificationBell />
          </div>
          <PushNotificationSetup />
          <main className="min-h-screen transition-all duration-300">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
