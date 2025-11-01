import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // El middleware solo se ejecutará en las rutas especificadas en matcher
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Si hay token, el usuario está autenticado
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Configurar qué rutas proteger
export const config = {
  matcher: [
    '/sermons/:path*',
    '/devotionals/:path*',
    '/notes/:path*',
    '/api/sermons/:path*',
    '/api/devotionals/:path*',
    '/api/notes/:path*',
    '/api/upload/:path*',
  ],
};
