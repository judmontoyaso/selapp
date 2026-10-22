import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import DesktopHeader from "@/components/DesktopHeader";
import PushNotificationSetup from "@/components/PushNotificationSetup";
import MobileTabBar from "@/components/MobileTabBar";
import { Toaster } from "sonner";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF5EB" },
    { media: "(prefers-color-scheme: dark)", color: "#171413" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent/20 selection:text-foreground transition-colors duration-200`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Sidebar />
            <DesktopHeader />
            <PushNotificationSetup />
            <div className="flex-1 pb-20 sm:pb-0">
              {children}
            </div>
            <MobileTabBar />
            <Toaster
              richColors
              position="top-right"
              closeButton
              toastOptions={{
                classNames: {
                  toast: "font-sans border-border shadow-lg rounded-xl",
                  description: "text-muted-foreground",
                  actionButton: "bg-primary text-primary-foreground font-medium",
                  cancelButton: "bg-muted text-muted-foreground",
                  closeButton: "border-border text-foreground hover:bg-muted",
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
