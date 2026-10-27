"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Key,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Terminal,
  ShieldCheck,
  Clock,
  Server,
  ChevronRight,
  Lock,
  PenLine,
  BookOpen,
} from "lucide-react";

type McpPermScope = "read" | "write" | "delete";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
}

const PERMISSION_DEFINITIONS: {
  id: McpPermScope;
  label: string;
  description: string;
  required?: boolean;
}[] = [
  {
    id: "read",
    label: "Lectura",
    description: "Consultar sermones, notas y estadísticas",
    required: true,
  },
  {
    id: "write",
    label: "Escritura",
    description: "Crear sermones, añadir apuntes y editar",
  },
  {
    id: "delete",
    label: "Eliminación",
    description: "Borrar sermones permanentemente",
  },
];

const MCP_TOOLS_SUMMARY: {
  name: string;
  desc: string;
  scope: McpPermScope;
  scopeLabel: string;
}[] = [
  {
    name: "list_sermons",
    desc: "Lista y filtra tus sermones por título, predicador o contenido",
    scope: "read",
    scopeLabel: "Lectura",
  },
  {
    name: "get_sermon",
    desc: "Obtiene el detalle completo y todas las notas de un sermón",
    scope: "read",
    scopeLabel: "Lectura",
  },
  {
    name: "get_sermon_insights",
    desc: "Calcula estadísticas de libros, versículos y palabras frecuentes",
    scope: "read",
    scopeLabel: "Lectura",
  },
  {
    name: "search_sermon_notes",
    desc: "Búsqueda textual en todos tus apuntes de prédicas",
    scope: "read",
    scopeLabel: "Lectura",
  },
  {
    name: "create_sermon",
    desc: "Crea un nuevo sermón con notas iniciales y vinculación bíblica",
    scope: "write",
    scopeLabel: "Escritura",
  },
  {
    name: "add_sermon_note",
    desc: "Añade apuntes a un sermón existente con detección de citas",
    scope: "write",
    scopeLabel: "Escritura",
  },
  {
    name: "update_sermon",
    desc: "Actualiza título, predicador o fecha de un sermón",
    scope: "write",
    scopeLabel: "Escritura",
  },
  {
    name: "delete_sermon",
    desc: "Elimina un sermón y sus notas de tu cuenta",
    scope: "delete",
    scopeLabel: "Eliminación",
  },
];

export default function McpPage() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingPermId, setUpdatingPermId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<McpPermScope[]>(["read", "write"]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"url" | "json" | "headers">("url");
  const [origin, setOrigin] = useState("https://selapp.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mcp/keys");
      if (!res.ok) throw new Error("No se pudieron cargar las claves");
      const data = await res.json();
      const loadedKeys: ApiKeyItem[] = (data.keys || []).map((k: ApiKeyItem) => ({
        ...k,
        permissions:
          Array.isArray(k.permissions) && k.permissions.length > 0
            ? k.permissions
            : ["read", "write"],
      }));
      setKeys(loadedKeys);
      if (loadedKeys.length > 0 && !selectedKeyId) {
        setSelectedKeyId(loadedKeys[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar tus claves MCP");
    } finally {
      setLoading(false);
    }
  }, [selectedKeyId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchKeys();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchKeys]);

  const toggleNewKeyPerm = (perm: McpPermScope) => {
    if (perm === "read") return; // Lectura es siempre obligatoria
    setNewKeyPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setCreating(true);
      const res = await fetch("/api/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim() || `MCP Personal ${keys.length + 1}`,
          permissions: newKeyPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la clave");
      }
      const created: ApiKeyItem = {
        ...data.apiKey,
        permissions: data.apiKey.permissions || newKeyPermissions,
      };
      setKeys((prev) => [created, ...prev]);
      setSelectedKeyId(created.id);
      setVisibleKeys((prev) => ({ ...prev, [created.id]: true }));
      setNewKeyName("");
      toast.success("Clave y enlace MCP generados con los permisos seleccionados");
    } catch (err: any) {
      toast.error(err.message || "No se pudo generar la clave");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleKeyPermission = async (item: ApiKeyItem, perm: McpPermScope) => {
    if (perm === "read") {
      toast.info("El permiso de Lectura es la base mínima requerida para la conexión MCP.");
      return;
    }

    const currentPerms = Array.isArray(item.permissions) ? item.permissions : ["read"];
    const hasPerm = currentPerms.includes(perm);
    const updatedPerms = hasPerm
      ? currentPerms.filter((p) => p !== perm)
      : [...currentPerms, perm];

    try {
      setUpdatingPermId(`${item.id}-${perm}`);
      const res = await fetch("/api/mcp/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          permissions: updatedPerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar permisos");
      }
      const updatedKey: ApiKeyItem = {
        ...data.apiKey,
        permissions: data.apiKey.permissions || updatedPerms,
      };
      setKeys((prev) => prev.map((k) => (k.id === item.id ? updatedKey : k)));
      toast.success(
        `Permiso de ${perm === "write" ? "Escritura" : "Eliminación"} ${
          hasPerm ? "desactivado" : "activado"
        } para ${item.name}`
      );
    } catch (err: any) {
      toast.error(err.message || "No se pudieron actualizar los permisos");
    } finally {
      setUpdatingPermId(null);
    }
  };

  const handleRegenerateKey = async (id: string) => {
    try {
      setRegeneratingId(id);
      const res = await fetch("/api/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al regenerar la clave");
      }
      const updated: ApiKeyItem = data.apiKey;
      setKeys((prev) => prev.map((k) => (k.id === id ? updated : k)));
      setVisibleKeys((prev) => ({ ...prev, [id]: true }));
      toast.success("Clave regenerada. Actualiza el enlace en tu cliente MCP.");
    } catch (err: any) {
      toast.error(err.message || "Error al regenerar la clave");
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/mcp/keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar la clave");
      }
      const remaining = keys.filter((k) => k.id !== id);
      setKeys(remaining);
      if (selectedKeyId === id) {
        setSelectedKeyId(remaining[0]?.id || null);
      }
      toast.success("Clave revocada permanentemente");
    } catch (err: any) {
      toast.error(err.message || "Error al revocar la clave");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (text: string, fieldId: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast.success(`${label} copiado al portapapeles`);
      setTimeout(() => {
        setCopiedField((prev) => (prev === fieldId ? null : prev));
      }, 2000);
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 16) return "••••••••••••••••";
    return `${key.slice(0, 12)}••••••••••••••••••••••••${key.slice(-4)}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="border border-border bg-card p-6 rounded">
          <p className="text-sm text-muted-foreground">Cargando configuración MCP...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="border border-border bg-card p-8 rounded text-center space-y-4">
          <Key className="w-8 h-8 text-primary mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Conexión MCP Personal</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Inicia sesión en tu cuenta de Selapp para generar tu clave API personal y tu enlace dinámico de servidor MCP.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <span>Iniciar Sesión</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeKey = keys.find((k) => k.id === selectedKeyId) || keys[0] || null;
  const activePermissions = activeKey?.permissions || ["read", "write"];
  const allowedToolsCount = MCP_TOOLS_SUMMARY.filter((t) =>
    activePermissions.includes(t.scope)
  ).length;

  const dynamicMcpUrl = activeKey
    ? `${origin}/api/mcp?apiKey=${activeKey.key}`
    : `${origin}/api/mcp?apiKey=TU_CLAVE_API`;

  const claudeConfigJson = JSON.stringify(
    {
      mcpServers: {
        "selapp-sermons": {
          url: dynamicMcpUrl,
        },
      },
    },
    null,
    2
  );

  const headersConfigExample = `Endpoint: ${origin}/api/mcp
Authorization: Bearer ${activeKey ? activeKey.key : "TU_CLAVE_API"}`;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Cabecera Sobria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            <Server className="w-3.5 h-3.5 text-primary" />
            <span>Model Context Protocol (MCP)</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Conexión MCP, Claves y Permisos por Usuario
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecta Claude Desktop, Cursor o cualquier cliente MCP con tus sermones y controla qué acciones tiene permitidas cada clave.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-muted/40 text-xs font-medium text-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Cuenta: {session.user?.email}</span>
          </span>
        </div>
      </div>

      {/* Sección Principal: Generador y Lista de Claves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Gestión de Claves y Permisos */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-border bg-card p-5 rounded space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <span>Tus Claves API</span>
              </h2>
              <span className="text-xs text-muted-foreground">
                {keys.length} {keys.length === 1 ? "clave activa" : "claves activas"}
              </span>
            </div>

            {/* Formulario de Nueva Clave con Permisos */}
            <form onSubmit={handleCreateKey} className="space-y-3 border-b border-border pb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre (ej. Claude Solo Lectura, Cursor)..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{creating ? "Creando..." : "Generar"}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Permisos iniciales para la nueva clave:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PERMISSION_DEFINITIONS.map((perm) => {
                    const checked = newKeyPermissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => toggleNewKeyPerm(perm.id)}
                        title={perm.description}
                        className={`px-2 py-1.5 rounded border text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          checked
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            checked ? "text-primary opacity-100" : "opacity-0"
                          }`}
                        />
                        <span>{perm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            {keys.length === 0 ? (
              <div className="border border-dashed border-border p-6 rounded text-center space-y-3">
                <Key className="w-6 h-6 text-muted-foreground mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Aún no tienes una clave MCP personal
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Genera tu primera clave para obtener tu enlace MCP dinámico exclusivo.
                  </p>
                </div>
                <button
                  onClick={() => handleCreateKey()}
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generar Mi Enlace MCP</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((item) => {
                  const isSelected = activeKey?.id === item.id;
                  const isVisible = !!visibleKeys[item.id];
                  const itemPerms = Array.isArray(item.permissions)
                    ? item.permissions
                    : ["read", "write"];

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedKeyId(item.id)}
                      className={`p-3.5 rounded border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {item.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                              Seleccionada
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => toggleVisibility(item.id)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer"
                            title={isVisible ? "Ocultar clave" : "Mostrar clave"}
                          >
                            {isVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(item.key, `key-${item.id}`, "Clave API")
                            }
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer"
                            title="Copiar clave API"
                          >
                            {copiedField === `key-${item.id}` ? (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRegenerateKey(item.id)}
                            disabled={regeneratingId === item.id}
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer"
                            title="Regenerar clave"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                regeneratingId === item.id ? "animate-spin" : ""
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Revocar clave"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-mono text-[11px] bg-muted/60 border border-border/80 px-2.5 py-1.5 rounded text-foreground break-all select-all">
                        {isVisible ? item.key : maskKey(item.key)}
                      </div>

                      {/* Interruptores de Permisos en Vivo */}
                      <div
                        className="mt-2.5 pt-2.5 border-t border-border/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Permisos de esta clave (clic para cambiar):
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {PERMISSION_DEFINITIONS.map((perm) => {
                            const enabled = itemPerms.includes(perm.id);
                            const isUpdating = updatingPermId === `${item.id}-${perm.id}`;
                            return (
                              <button
                                key={perm.id}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleToggleKeyPermission(item, perm.id)}
                                title={perm.description}
                                className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                  enabled
                                    ? perm.id === "delete"
                                      ? "border-destructive/50 bg-destructive/10 text-destructive font-semibold"
                                      : "border-primary bg-primary/15 text-foreground font-semibold"
                                    : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {enabled ? (
                                  <Check className="w-3 h-3 shrink-0" />
                                ) : (
                                  <Lock className="w-2.5 h-2.5 shrink-0 opacity-60" />
                                )}
                                <span className="truncate">{perm.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2.5">
                        <span>
                          Creada: {new Date(item.createdAt).toLocaleDateString("es-CO")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.lastUsedAt
                            ? `Último uso: ${new Date(item.lastUsedAt).toLocaleDateString("es-CO")}`
                            : "Sin uso registrado"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Enlace Dinámico, Configuración y Herramientas Autorizadas */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Enlace MCP Dinámico */}
          <div className="border border-border bg-card p-5 rounded space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Tu Enlace MCP Dinámico Directo
                </h2>
              </div>
              {activeKey && (
                <span className="text-xs text-muted-foreground">
                  Clave: <strong>{activeKey.name}</strong>
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Puedes modificar los permisos de tu clave en cualquier momento desde el panel izquierdo sin necesidad de cambiar ni volver a copiar este enlace.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 font-mono text-xs bg-muted/60 border border-border px-3 py-2.5 rounded text-foreground break-all select-all">
                {dynamicMcpUrl}
              </div>
              <button
                type="button"
                disabled={!activeKey}
                onClick={() => copyToClipboard(dynamicMcpUrl, "mcp-url", "Enlace MCP")}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
              >
                {copiedField === "mcp-url" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card: Herramientas Expuestas según Permisos Activos */}
          <div className="border border-border bg-card p-5 rounded space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>
                  Herramientas Autorizadas para esta Clave ({allowedToolsCount} de {MCP_TOOLS_SUMMARY.length})
                </span>
              </h2>
              <div className="flex items-center gap-1.5">
                {PERMISSION_DEFINITIONS.map((perm) => {
                  const active = activePermissions.includes(perm.id);
                  return (
                    <span
                      key={perm.id}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        active
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border bg-muted/40 text-muted-foreground line-through"
                      }`}
                    >
                      {perm.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MCP_TOOLS_SUMMARY.map((tool) => {
                const isAllowed = activePermissions.includes(tool.scope);
                return (
                  <div
                    key={tool.name}
                    className={`p-2.5 rounded border flex flex-col gap-1 transition-opacity ${
                      isAllowed
                        ? "border-border/80 bg-background"
                        : "border-border/40 bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isAllowed ? "text-primary" : "text-muted-foreground line-through"
                        }`}
                      >
                        {tool.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                          isAllowed
                            ? "border-border bg-muted/50 text-foreground"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {!isAllowed && <Lock className="w-2.5 h-2.5" />}
                        {tool.scope === "read" && isAllowed && <BookOpen className="w-2.5 h-2.5" />}
                        {tool.scope === "write" && isAllowed && <PenLine className="w-2.5 h-2.5" />}
                        {tool.scope === "delete" && isAllowed && <Trash2 className="w-2.5 h-2.5" />}
                        <span>{tool.scopeLabel}</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{tool.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Guías de Integración */}
          <div className="border border-border bg-card p-5 rounded space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Configuración en Clientes IA
                </h2>
              </div>

              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("url")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "url"
                      ? "bg-background text-foreground shadow-2xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  URL Directa
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "json"
                      ? "bg-background text-foreground shadow-2xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  JSON Config
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("headers")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "headers"
                      ? "bg-background text-foreground shadow-2xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Header HTTP
                </button>
              </div>
            </div>

            {activeTab === "url" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Para clientes que aceptan una URL de servidor MCP remoto (Claude Web Integrations, Cursor SSE, TypingMind, LibreChat):
                </p>
                <ol className="text-xs text-foreground space-y-1.5 list-decimal list-inside">
                  <li>Abre la configuración de servidores MCP en tu cliente de IA.</li>
                  <li>Selecciona transporte <strong>SSE</strong> o <strong>Streamable HTTP</strong>.</li>
                  <li>Pega tu enlace MCP dinámico directo copiado arriba.</li>
                </ol>
              </div>
            )}

            {activeTab === "json" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Pega este bloque en tu archivo <code className="font-mono bg-muted px-1 py-0.5 rounded">claude_desktop_config.json</code> o <code className="font-mono bg-muted px-1 py-0.5 rounded">.cursor/mcp.json</code>:
                  </p>
                  <button
                    type="button"
                    disabled={!activeKey}
                    onClick={() => copyToClipboard(claudeConfigJson, "json-config", "Configuración JSON")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    {copiedField === "json-config" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-xs bg-muted/60 border border-border p-3 rounded overflow-x-auto text-foreground">
                  {claudeConfigJson}
                </pre>
              </div>
            )}

            {activeTab === "headers" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Si prefieres no incluir la clave en la URL, usa el endpoint base enviando el header <code className="font-mono bg-muted px-1 py-0.5 rounded">Authorization</code>:
                  </p>
                  <button
                    type="button"
                    disabled={!activeKey}
                    onClick={() => copyToClipboard(headersConfigExample, "headers-config", "Configuración de Headers")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    {copiedField === "headers-config" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-xs bg-muted/60 border border-border p-3 rounded overflow-x-auto text-foreground">
                  {headersConfigExample}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
