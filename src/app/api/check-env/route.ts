import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✅ Configurada" : "❌ Falta",
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ? "✅ Configurada" : "❌ Falta",
    VAPID_SUBJECT: process.env.VAPID_SUBJECT ? "✅ Configurada" : "❌ Falta",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Configurada" : "❌ Falta",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Configurada" : "❌ Falta",
  };

  const allConfigured = Object.values(envVars).every(v => v.includes("✅"));

  return NextResponse.json({
    status: allConfigured ? "✅ Todo configurado" : "❌ Faltan variables",
    variables: envVars,
    vapidKeys: {
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 20) + "...",
      privateKey: process.env.VAPID_PRIVATE_KEY?.substring(0, 20) + "...",
      subject: process.env.VAPID_SUBJECT,
    }
  });
}
