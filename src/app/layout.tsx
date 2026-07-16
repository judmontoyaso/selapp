import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import PushNotificationSetup from "@/components/PushNotificationSetup";
import MobileTabBar from "@/components/MobileTabBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Selapp — Devocionales y Notas",
  description:
    "Selapp: devocionales diarios y notas de predicación con un diseño elegante, cálido y moderno.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B4E3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#6B4E3D" />
      </head>
      <body className={`${inter.variable} ${lora.variable} font-sans min-h-screen flex flex-col`}>
        <SessionProvider>
          <Sidebar />
          <div className="hidden sm:block fixed top-4 right-4 z-50">
            <NotificationBell />
          </div>
          <PushNotificationSetup />
          <div className="flex-1 pb-20 sm:pb-0">
            {children}
          </div>
          <MobileTabBar />
        </SessionProvider>
      </body>
    </html>
  );
}
