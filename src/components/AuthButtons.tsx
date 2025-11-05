"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session) {
    // Para usuarios autenticados, no mostramos nada aquí
    // El botón de cerrar sesión está en el sidebar
    return null;
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/auth/signin"
        className="border border-selapp-brown text-selapp-brown px-4 py-2 rounded-full text-sm hover:bg-selapp-beige transition-all"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/auth/signup"
        className="bg-selapp-brown text-white px-4 py-2 rounded-full text-sm hover:bg-selapp-brown-dark transition-all"
      >
        Registrarse
      </Link>
    </div>
  );
}
