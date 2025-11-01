"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex gap-2">
        <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-selapp-brown hidden sm:inline">
          {session.user?.name || session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm transition-all"
        >
          Cerrar Sesión
        </button>
      </div>
    );
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
