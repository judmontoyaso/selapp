"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(data.error || "Ocurrió un error. Intenta nuevamente.");
      }
    } catch (error) {
      setError("Error de conexión. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/selapp.png"
                alt="Selapp"
                width={120}
                height={48}
                className="object-contain mx-auto"
              />
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-selapp-brown mb-4">
              Token Inválido
            </h2>
            <p className="text-selapp-brown-light mb-6">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block bg-selapp-brown hover:bg-selapp-brown-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/selapp.png"
              alt="Selapp"
              width={120}
              height={48}
              className="object-contain mx-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-selapp-brown mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-selapp-brown-light">
            Crea una nueva contraseña segura
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-selapp-brown">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-selapp-brown-light">
                Tu contraseña ha sido cambiada exitosamente.
              </p>
              <p className="text-sm text-selapp-brown-light">
                Serás redirigido al inicio de sesión...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-selapp-brown mb-2"
                >
                  Nueva Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-selapp-brown/20 focus:border-selapp-brown focus:ring-2 focus:ring-selapp-brown/20 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-selapp-brown mb-2"
                >
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-selapp-brown/20 focus:border-selapp-brown focus:ring-2 focus:ring-selapp-brown/20 outline-none transition-all"
                  placeholder="Repite tu contraseña"
                  minLength={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 <strong>Consejo:</strong> Usa una contraseña segura que incluya letras,
                  números y símbolos.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-selapp-brown hover:bg-selapp-brown-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </form>
          )}
        </div>

        {!success && (
          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-selapp-brown-light hover:text-selapp-brown text-sm"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="text-selapp-brown">Cargando...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
