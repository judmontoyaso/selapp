import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { stripHtml, extractReferences, BOOK_NAME_WORDS } from "@/lib/verse-extract";
import { wordFrequencies } from "@/lib/word-stats";
import { autoLinkBibleVerses } from "@/lib/youversion";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-mcp-key, x-user-email, Accept",
};

// Definición de herramientas (Tools) del MCP de Sermones
const MCP_TOOLS = [
  {
    name: "list_sermons",
    description: "Lista los sermones registrados con búsqueda por título, pastor o contenido de las notas, y paginación.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Término de búsqueda opcional (busca en título, pastor y notas).",
        },
        pastor: {
          type: "string",
          description: "Filtrar por nombre de pastor específico.",
        },
        page: {
          type: "number",
          description: "Número de página (por defecto 1).",
        },
        limit: {
          type: "number",
          description: "Límite de resultados por página (por defecto 20, máximo 50).",
        },
      },
    },
  },
  {
    name: "get_sermon",
    description: "Obtiene el detalle completo de un sermón específico incluyendo todas sus notas/mensajes en orden cronológico.",
    inputSchema: {
      type: "object",
      properties: {
        sermonId: {
          type: "string",
          description: "ID del sermón a consultar.",
        },
      },
      required: ["sermonId"],
    },
  },
  {
    name: "create_sermon",
    description: "Crea una nueva prédica/sermón en Selapp. Opcionalmente recibe una lista de notas iniciales.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Título del sermón o mensaje.",
        },
        pastor: {
          type: "string",
          description: "Nombre del pastor o predicador.",
        },
        date: {
          type: "string",
          description: "Fecha del sermón en formato YYYY-MM-DD o ISO 8601 (por defecto hoy).",
        },
        initialNotes: {
          type: "array",
          items: { type: "string" },
          description: "Notas iniciales o puntos clave a agregar inmediatamente al sermón.",
        },
      },
      required: ["title", "pastor"],
    },
  },
  {
    name: "add_sermon_note",
    description: "Agrega una nueva nota o apunte a un sermón existente. Si incluye citas bíblicas (ej. Juan 3:16), se vinculan automáticamente.",
    inputSchema: {
      type: "object",
      properties: {
        sermonId: {
          type: "string",
          description: "ID del sermón al que se añadirá la nota.",
        },
        content: {
          type: "string",
          description: "Texto o contenido de la nota de predicación.",
        },
      },
      required: ["sermonId", "content"],
    },
  },
  {
    name: "update_sermon",
    description: "Actualiza el título, pastor o fecha de un sermón existente.",
    inputSchema: {
      type: "object",
      properties: {
        sermonId: {
          type: "string",
          description: "ID del sermón a actualizar.",
        },
        title: {
          type: "string",
          description: "Nuevo título.",
        },
        pastor: {
          type: "string",
          description: "Nuevo nombre del pastor.",
        },
        date: {
          type: "string",
          description: "Nueva fecha en formato YYYY-MM-DD o ISO 8601.",
        },
      },
      required: ["sermonId"],
    },
  },
  {
    name: "delete_sermon",
    description: "Elimina un sermón y todas sus notas asociadas permanentemente.",
    inputSchema: {
      type: "object",
      properties: {
        sermonId: {
          type: "string",
          description: "ID del sermón a eliminar.",
        },
      },
      required: ["sermonId"],
    },
  },
  {
    name: "get_sermon_insights",
    description: "Obtiene estadísticas y análisis de sermones: total de prédicas, notas, libros bíblicos más citados, versículos frecuentes y nube de palabras clave (excluyendo versiones bíblicas y stopwords).",
    inputSchema: {
      type: "object",
      properties: {
        sermonId: {
          type: "string",
          description: "ID opcional del sermón. Si se omite, calcula las estadísticas globales de todos los sermones.",
        },
      },
    },
  },
  {
    name: "search_sermon_notes",
    description: "Busca palabras o temas en todas las notas de sermones y devuelve los fragmentos relevantes con el sermón asociado.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Texto o palabra clave a buscar en las notas.",
        },
        limit: {
          type: "number",
          description: "Cantidad máxima de resultados (por defecto 20).",
        },
      },
      required: ["query"],
    },
  },
];

// Definición de recursos (Resources) del MCP
const MCP_RESOURCES = [
  {
    uri: "sermons://recent",
    name: "Sermones Recientes",
    description: "Lista con resumen de los últimos 10 sermones y sus notas más recientes.",
    mimeType: "application/json",
  },
  {
    uri: "sermons://insights",
    name: "Estadísticas Globales de Sermones",
    description: "Estadísticas acumuladas: libros y versículos más citados, y palabras frecuentes.",
    mimeType: "application/json",
  },
];

// Autenticación por Bearer token, query param o API key header
function authenticateRequest(req: Request): boolean {
  const configuredKey = process.env.MCP_API_KEY || process.env.SELAPP_MCP_KEY;
  // Si no hay clave configurada en las variables de entorno, se permite acceso abierto
  if (!configuredKey || configuredKey.trim() === "") {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    if (authHeader.substring(7).trim() === configuredKey.trim()) return true;
  }

  const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("x-mcp-key");
  if (apiKeyHeader && apiKeyHeader.trim() === configuredKey.trim()) return true;

  const url = new URL(req.url);
  const queryKey = url.searchParams.get("apiKey") || url.searchParams.get("key") || url.searchParams.get("token");
  if (queryKey && queryKey.trim() === configuredKey.trim()) return true;

  return false;
}

// Resuelve el usuario sobre el que operará el MCP
async function resolveUser(req: Request): Promise<{ id: string; email: string } | null> {
  const url = new URL(req.url);

  // 1. Query parameter (?email=... o ?userEmail=...)
  const queryEmail = url.searchParams.get("email") || url.searchParams.get("userEmail");
  if (queryEmail) {
    const user = await prisma.user.findUnique({
      where: { email: queryEmail.trim() },
      select: { id: true, email: true },
    });
    if (user) return user;
  }

  // 2. Header explícito
  const headerEmail = req.headers.get("x-user-email");
  if (headerEmail) {
    const user = await prisma.user.findUnique({
      where: { email: headerEmail.trim() },
      select: { id: true, email: true },
    });
    if (user) return user;
  }

  // 3. Variable de entorno opcional MCP_USER_EMAIL
  const envEmail = process.env.MCP_USER_EMAIL;
  if (envEmail) {
    const user = await prisma.user.findUnique({
      where: { email: envEmail.trim() },
      select: { id: true, email: true },
    });
    if (user) return user;
  }

  // 4. Fallback al primer usuario registrado
  return prisma.user.findFirst({
    select: { id: true, email: true },
    orderBy: { email: "asc" },
  });
}

// Ejecutor de Tools
async function executeTool(name: string, args: Record<string, any>, userId: string) {
  switch (name) {
    case "list_sermons": {
      const page = Math.max(1, Number(args.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(args.limit) || 20));
      const skip = (page - 1) * limit;
      const search = (args.search as string)?.trim() || "";
      const pastor = (args.pastor as string)?.trim() || "";

      const whereClause: Prisma.sermonsWhereInput = {
        userId,
        ...(pastor ? { pastor: { contains: pastor, mode: "insensitive" } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { pastor: { contains: search, mode: "insensitive" } },
                {
                  messages: {
                    some: {
                      content: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
      };

      const [total, sermons] = await Promise.all([
        prisma.sermons.count({ where: whereClause }),
        prisma.sermons.findMany({
          where: whereClause,
          orderBy: { date: "desc" },
          skip,
          take: limit,
          include: {
            _count: { select: { messages: true } },
          },
        }),
      ]);

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        sermons: sermons.map((s) => ({
          id: s.id,
          title: s.title,
          pastor: s.pastor,
          date: s.date.toISOString().split("T")[0],
          notesCount: s._count.messages,
          createdAt: s.createdAt,
        })),
      };
    }

    case "get_sermon": {
      const sermonId = String(args.sermonId || "");
      if (!sermonId) throw new Error("sermonId es requerido");

      const sermon = await prisma.sermons.findUnique({
        where: { id: sermonId },
        include: {
          messages: {
            orderBy: { order: "asc" },
            include: { images: true },
          },
        },
      });

      if (!sermon || sermon.userId !== userId) {
        throw new Error(`Sermón con id ${sermonId} no encontrado o sin permisos`);
      }

      return {
        id: sermon.id,
        title: sermon.title,
        pastor: sermon.pastor,
        date: sermon.date.toISOString().split("T")[0],
        createdAt: sermon.createdAt,
        updatedAt: sermon.updatedAt,
        notes: sermon.messages.map((m) => ({
          id: m.id,
          order: m.order,
          content: m.content,
          plainText: stripHtml(m.content),
          createdAt: m.createdAt,
          images: m.images.map((img) => ({ url: img.url, fileName: img.fileName })),
        })),
      };
    }

    case "create_sermon": {
      const title = String(args.title || "").trim();
      const pastor = String(args.pastor || "").trim();
      if (!title || !pastor) throw new Error("title y pastor son obligatorios");

      const sermonDate = args.date ? new Date(args.date) : new Date();

      const sermon = await prisma.sermons.create({
        data: {
          title,
          pastor,
          date: isNaN(sermonDate.getTime()) ? new Date() : sermonDate,
          userId,
        },
      });

      const initialNotes: string[] = Array.isArray(args.initialNotes) ? args.initialNotes : [];
      const createdNotes = [];

      for (let i = 0; i < initialNotes.length; i++) {
        const text = initialNotes[i];
        if (!text || text.trim() === "") continue;
        const linkedContent = await autoLinkBibleVerses(text);
        const msg = await prisma.messages.create({
          data: {
            sermonId: sermon.id,
            content: linkedContent,
            order: i,
          },
        });
        createdNotes.push({ id: msg.id, order: msg.order, content: msg.content });
      }

      return {
        id: sermon.id,
        title: sermon.title,
        pastor: sermon.pastor,
        date: sermon.date.toISOString().split("T")[0],
        notesAdded: createdNotes.length,
        notes: createdNotes,
      };
    }

    case "add_sermon_note": {
      const sermonId = String(args.sermonId || "");
      const content = String(args.content || "").trim();
      if (!sermonId || !content) throw new Error("sermonId y content son requeridos");

      const sermon = await prisma.sermons.findUnique({
        where: { id: sermonId },
        select: { id: true, userId: true },
      });
      if (!sermon || sermon.userId !== userId) {
        throw new Error(`Sermón ${sermonId} no encontrado o no pertenece al usuario`);
      }

      const linkedContent = await autoLinkBibleVerses(content);
      const messageCount = await prisma.messages.count({ where: { sermonId } });

      const msg = await prisma.messages.create({
        data: {
          sermonId,
          content: linkedContent,
          order: messageCount,
        },
      });

      return {
        id: msg.id,
        sermonId: msg.sermonId,
        order: msg.order,
        content: msg.content,
        plainText: stripHtml(msg.content),
        createdAt: msg.createdAt,
      };
    }

    case "update_sermon": {
      const sermonId = String(args.sermonId || "");
      if (!sermonId) throw new Error("sermonId es requerido");

      const existing = await prisma.sermons.findUnique({
        where: { id: sermonId },
        select: { id: true, userId: true },
      });
      if (!existing || existing.userId !== userId) {
        throw new Error(`Sermón ${sermonId} no encontrado`);
      }

      const updateData: Prisma.sermonsUpdateInput = {};
      if (args.title) updateData.title = String(args.title).trim();
      if (args.pastor) updateData.pastor = String(args.pastor).trim();
      if (args.date) {
        const d = new Date(args.date);
        if (!isNaN(d.getTime())) updateData.date = d;
      }

      const updated = await prisma.sermons.update({
        where: { id: sermonId },
        data: updateData,
      });

      return {
        id: updated.id,
        title: updated.title,
        pastor: updated.pastor,
        date: updated.date.toISOString().split("T")[0],
      };
    }

    case "delete_sermon": {
      const sermonId = String(args.sermonId || "");
      if (!sermonId) throw new Error("sermonId es requerido");

      const existing = await prisma.sermons.findUnique({
        where: { id: sermonId },
        select: { id: true, userId: true },
      });
      if (!existing || existing.userId !== userId) {
        throw new Error(`Sermón ${sermonId} no encontrado`);
      }

      await prisma.sermons.delete({ where: { id: sermonId } });
      return { success: true, deletedSermonId: sermonId };
    }

    case "get_sermon_insights": {
      const sermonId = args.sermonId ? String(args.sermonId) : undefined;

      const sermons = await prisma.sermons.findMany({
        where: {
          userId,
          ...(sermonId ? { id: sermonId } : {}),
        },
        orderBy: { date: "desc" },
        include: {
          messages: { select: { content: true } },
        },
      });

      if (sermonId && sermons.length === 0) {
        throw new Error(`Sermón ${sermonId} no encontrado`);
      }

      let fullText = "";
      let totalNotes = 0;
      const verseCounts = new Map<string, { reference: string; usfm: string; count: number }>();
      const bookCounts = new Map<string, { book: string; code: string; count: number }>();

      for (const sermon of sermons) {
        for (const message of sermon.messages) {
          totalNotes++;
          const text = stripHtml(message.content);
          fullText += text + "\n";

          for (const ref of extractReferences(text)) {
            const existing = verseCounts.get(ref.usfm);
            if (existing) existing.count++;
            else verseCounts.set(ref.usfm, { reference: ref.reference, usfm: ref.usfm, count: 1 });

            const book = bookCounts.get(ref.book);
            if (book) book.count++;
            else bookCounts.set(ref.book, { book: ref.bookName, code: ref.book, count: 1 });
          }
        }
      }

      const topVerses = [...verseCounts.values()]
        .sort((a, b) => b.count - a.count || a.reference.localeCompare(b.reference))
        .slice(0, 15);

      const topBooks = [...bookCounts.values()]
        .sort((a, b) => b.count - a.count || a.book.localeCompare(b.book))
        .slice(0, 10);

      const words = wordFrequencies(fullText, 40, BOOK_NAME_WORDS);

      return {
        scope: sermonId ? "single_sermon" : "all_sermons",
        totalSermons: sermons.length,
        totalNotes,
        topBooks,
        topVerses,
        topKeywords: words,
      };
    }

    case "search_sermon_notes": {
      const query = String(args.query || "").trim();
      if (!query) throw new Error("query es requerido");
      const limit = Math.min(50, Math.max(1, Number(args.limit) || 20));

      const messages = await prisma.messages.findMany({
        where: {
          sermons: { userId },
          content: { contains: query, mode: "insensitive" },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sermons: {
            select: { id: true, title: true, pastor: true, date: true },
          },
        },
      });

      return {
        query,
        count: messages.length,
        results: messages.map((m) => ({
          noteId: m.id,
          sermonId: m.sermons.id,
          sermonTitle: m.sermons.title,
          pastor: m.sermons.pastor,
          date: m.sermons.date.toISOString().split("T")[0],
          order: m.order,
          plainText: stripHtml(m.content),
          content: m.content,
        })),
      };
    }

    default:
      throw new Error(`Herramienta desconocida: ${name}`);
  }
}

// Procesa un mensaje JSON-RPC
async function handleJsonRpc(req: Request, body: any, userId: string) {
  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32600, message: "Invalid Request: jsonrpc version must be 2.0" },
    };
  }

  try {
    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
            },
            serverInfo: {
              name: "selapp-sermons-mcp",
              version: "1.0.0",
            },
            instructions: "Servidor MCP para gestión y consulta de notas de predicación y sermones en Selapp.",
          },
        };

      case "notifications/initialized":
        // ACK sin contenido de respuesta
        return null;

      case "ping":
        return { jsonrpc: "2.0", id, result: {} };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS,
          },
        };

      case "tools/call": {
        const { name, arguments: toolArgs } = params || {};
        if (!name) {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "Parámetro 'name' es requerido para tools/call" },
          };
        }

        const toolResult = await executeTool(name, toolArgs || {}, userId);

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult, null, 2),
              },
            ],
            isError: false,
          },
        };
      }

      case "resources/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            resources: MCP_RESOURCES,
          },
        };

      case "resources/read": {
        const uri = params?.uri;
        if (uri === "sermons://recent") {
          const recent = await executeTool("list_sermons", { limit: 10 }, userId);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(recent, null, 2),
                },
              ],
            },
          };
        }
        if (uri === "sermons://insights") {
          const insights = await executeTool("get_sermon_insights", {}, userId);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(insights, null, 2),
                },
              ],
            },
          };
        }

        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: `Recurso no encontrado: ${uri}` },
        };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Método desconocido: ${method}` },
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: `Error ejecutando herramienta: ${err.message || String(err)}`,
          },
        ],
        isError: true,
      },
    };
  }
}

// OPTIONS: Preflight CORS para Claude.ai y navegadores
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// POST: Maneja peticiones JSON-RPC directas o flujo HTTP del MCP
export async function POST(request: Request) {
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "No autorizado. Provee el header Authorization: Bearer <MCP_API_KEY> o el parámetro ?apiKey=...",
        },
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const user = await resolveUser(request);
  if (!user) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: "Usuario no encontrado en la base de datos para asociar los sermones.",
        },
      },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();

    // Soporte para lotes de mensajes JSON-RPC
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const res = await handleJsonRpc(request, item, user.id);
        if (res !== null) results.push(res);
      }
      return NextResponse.json(results, { headers: CORS_HEADERS });
    }

    const response = await handleJsonRpc(request, body, user.id);
    if (response === null) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error("Error processing MCP JSON-RPC:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: `Parse error: ${error.message || String(error)}` },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

// GET: Soporta SSE (Server-Sent Events) estándar para clientes MCP que usan transporte SSE,
// o devuelve status/documentación si es consultado vía navegador/REST.
export async function GET(request: Request) {
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      {
        error: "No autorizado",
        message: "Configura MCP_API_KEY en variables de entorno y envíala en el header Authorization o query param apiKey.",
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const accept = request.headers.get("accept") || "";

  // Si el cliente solicita SSE
  if (accept.includes("text/event-stream")) {
    const url = new URL(request.url);
    const postEndpoint = `${url.pathname}${url.search}`;

    const stream = new ReadableStream({
      start(controller) {
        // Enviar evento 'endpoint' según especificación MCP SSE transport
        controller.enqueue(new TextEncoder().encode(`event: endpoint\ndata: ${postEndpoint}\n\n`));
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  }

  // Respuesta informativa si se abre en navegador o inspecciona por GET
  return NextResponse.json(
    {
      status: "online",
      server: "selapp-sermons-mcp",
      version: "1.0.0",
      description: "Servidor MCP para Sermones y Notas de Predicación de Selapp (Vercel Serverless Ready)",
      endpoint: "/api/mcp",
      supportedTransports: ["HTTP JSON-RPC 2.0 (POST)", "Server-Sent Events (GET)"],
      toolsCount: MCP_TOOLS.length,
      tools: MCP_TOOLS.map((t) => t.name),
      resources: MCP_RESOURCES.map((r) => r.uri),
    },
    { headers: CORS_HEADERS }
  );
}
