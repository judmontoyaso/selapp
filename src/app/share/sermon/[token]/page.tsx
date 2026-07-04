import { prisma } from "@/lib/prisma";
import { verifyShareToken } from "@/lib/share-token";
import Link from "next/link";
import type { Metadata } from "next";

// Página pública de solo lectura de un sermón compartido.
// El token va firmado con HMAC: sin el link exacto no se puede acceder.

export const dynamic = "force-dynamic";

async function getSharedSermon(token: string) {
  const sermonId = verifyShareToken(decodeURIComponent(token));
  if (!sermonId) return null;

  return prisma.sermons.findUnique({
    where: { id: sermonId },
    include: {
      messages: {
        orderBy: { order: "asc" },
        include: { images: true },
      },
      user: { select: { name: true } },
    },
  });
}

export async function generateMetadata(context: any): Promise<Metadata> {
  // Next 15: params puede ser una Promise
  const params = await context.params;
  const sermon = await getSharedSermon(params.token);
  return {
    title: sermon ? `${sermon.title} · Selapp` : "Sermón no encontrado · Selapp",
    robots: { index: false, follow: false },
  };
}

export default async function SharedSermonPage(context: any) {
  const params = await context.params;
  const sermon = await getSharedSermon(params.token);

  if (!sermon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-selapp-brown mb-2">Link no válido</h1>
          <p className="text-selapp-brown-light text-sm mb-6">
            Este link de sermón compartido no existe o fue modificado.
          </p>
          <Link
            href="/"
            className="inline-block bg-selapp-brown text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-selapp-brown/90 transition-colors"
          >
            Ir a Selapp
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "long", day: "numeric" }).format(date);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-16">
      {/* Banner de contenido compartido */}
      <div className="bg-selapp-brown text-white text-center text-xs sm:text-sm py-2 px-4">
        Notas de sermón compartidas con{" "}
        <Link href="/" className="font-bold underline underline-offset-2">
          Selapp
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="selapp-card p-6 sm:p-8">
          {/* Encabezado del documento */}
          <div className="mb-8 pb-6 border-b border-selapp-brown/10">
            <h1 className="text-2xl sm:text-3xl font-bold text-selapp-brown mb-2">{sermon.title}</h1>
            <p className="text-selapp-brown-light text-sm sm:text-base">
              Pastor: {sermon.pastor} • {formatDate(sermon.date)}
              {sermon.user?.name ? ` • Notas de ${sermon.user.name}` : ""}
            </p>
          </div>

          {sermon.messages.length === 0 ? (
            <p className="text-center text-selapp-brown-light py-10">
              Este sermón aún no tiene notas.
            </p>
          ) : (
            <div className="space-y-8">
              {sermon.messages.map((message, index) => (
                <div key={message.id}>
                  <div className="flex items-center gap-2 text-xs text-selapp-brown-light mb-3">
                    <span>{formatTime(message.createdAt)}</span>
                  </div>

                  {message.images.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {message.images.map((img) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={img.id}
                          src={img.url}
                          alt={img.fileName}
                          className="w-full h-auto rounded-xl shadow"
                        />
                      ))}
                    </div>
                  )}

                  <div
                    className="prose-selapp text-selapp-brown leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />

                  {index < sermon.messages.length - 1 && (
                    <div className="border-b border-selapp-brown/10 mt-8"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-selapp-brown-light/70 mt-6">
          Hecho con <Link href="/" className="font-semibold hover:underline">Selapp</Link> — devocionales
          diarios y notas de predicación
        </p>
      </div>
    </div>
  );
}
