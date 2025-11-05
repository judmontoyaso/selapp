import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "selapp — Devocionales y Notas",
  description:
    "Selapp: devocionales diarios y notas de predicación con un diseño elegante, cálido y moderno.",
  manifest: "/manifest.json",
  themeColor: "#6B4E3D",
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
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#6B4E3D" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Sidebar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
