"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Ocurrió un error inesperado
          </h2>
          <p className="text-sm text-muted-foreground">
            No pudimos cargar la página solicitada. Puedes intentar recargar el contenido o volver al inicio.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Button
            variant="default"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}
