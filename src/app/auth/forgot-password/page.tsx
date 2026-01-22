"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.error || "Ocurrió un error. Intenta nuevamente.");
      }
    } catch (error) {
      setError("Error de conexión. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

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
            ¿Olvidaste tu Contraseña?
          </h1>
          <p className="text-selapp-brown-light">
            No te preocupes, te ayudaremos a recuperarla
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-selapp-brown">
                ¡Revisa tu correo!
              </h2>
              <p className="text-selapp-brown-light">
                Si el correo existe en nuestro sistema, recibirás las instrucciones para
                recuperar tu contraseña.
              </p>
              <p className="text-sm text-selapp-brown-light">
                El enlace será válido por 1 hora.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/signin"
                  className="inline-block text-selapp-brown hover:text-selapp-brown-dark font-medium"
                >
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-selapp-brown mb-2"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-selapp-brown/20 focus:border-selapp-brown focus:ring-2 focus:ring-selapp-brown/20 outline-none transition-all"
                    placeholder="tu@email.com"
                  />
                  <p className="mt-2 text-sm text-selapp-brown-light">
                    Ingresa el correo asociado a tu cuenta
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-selapp-brown hover:bg-selapp-brown-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar Instrucciones"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-selapp-brown-light hover:text-selapp-brown text-sm"
                >
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-selapp-brown-light text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/signup"
              className="text-selapp-brown hover:text-selapp-brown-dark font-medium"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
