"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor";

interface Image {
  id: string;
  url: string;
  fileName: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  images: Image[];
  order: number;
}

interface Sermon {
  id: string;
  title: string;
  pastor: string;
  date: string;
  messages: Message[];
}

export default function SermonChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingSermon, setEditingSermon] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPastor, setEditPastor] = useState("");
  const [viewMode, setViewMode] = useState<'document' | 'chat'>(
    searchParams.get('mode') === 'chat' ? 'chat' : 'document'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchSermon();
    }
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [sermon?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [viewMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSermon = async () => {
    try {
      const response = await fetch(`/api/sermons/${params.id}`);
      if (!response.ok) {
        router.push("/sermons");
        return;
      }
      const data = await response.json();
      setSermon(data);
    } catch (error) {
      console.error("Error fetching sermon:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<any[]> => {
    const uploadedImages = [];

    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        uploadedImages.push(data);
      }
    }

    return uploadedImages;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && selectedImages.length === 0) return;

    setUploading(true);

    try {
      let imageUrls: any[] = [];

      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      const response = await fetch(`/api/sermons/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage || "(Imagen adjunta)",
          imageUrls,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        setSelectedImages([]);
        fetchSermon();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar mensaje");
    } finally {
      setUploading(false);
    }
  };

  const applyFormatting = (format: string, isEditing = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = isEditing ? editingContent : newMessage;
    const selectedText = currentText.substring(start, end);

    let formattedText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        cursorOffset = 2;
        break;
      case "heading":
        formattedText = `### ${selectedText}`;
        cursorOffset = 4;
        break;
      case "quote":
        formattedText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      case "list":
        formattedText = `• ${selectedText}`;
        cursorOffset = 2;
        break;
    }

    const newText =
      currentText.substring(0, start) + formattedText + currentText.substring(end);
    
    if (isEditing) {
      setEditingContent(newText);
    } else {
      setNewMessage(newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        start + cursorOffset + selectedText.length
      );
    }, 0);
  };

  const formatMessageContent = (content: string) => {
    let formatted = content
      // Negrita
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-selapp-brown-dark">$1</strong>')
      // Cursiva
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Subrayado
      .replace(/__(.*?)__/g, '<u class="underline decoration-selapp-brown">$1</u>')
      // Títulos (permite espacios antes)
      .replace(/^\s*### (.+)$/gm, '<h3 class="text-xl font-bold mb-2 mt-4 text-selapp-brown-dark">$1</h3>')
      // Citas (permite espacios antes)
      .replace(/^\s*> (.+)$/gm, '<blockquote class="border-l-4 border-selapp-accent pl-4 italic my-3 text-selapp-brown-light bg-selapp-beige/30 py-2 rounded-r">$1</blockquote>')
      // Lista (permite espacios antes)
      .replace(/^\s*• (.+)$/gm, '<li class="ml-6 my-1">$1</li>');
    
    // Envolver listas consecutivas en <ul>
    formatted = formatted.replace(/(<li class="ml-6 my-1">.*?<\/li>\n?)+/g, '<ul class="list-disc my-2">$&</ul>');
    // Convertir saltos de línea que no están dentro de tags
    formatted = formatted.replace(/\n(?![^<]*>)/g, '<br />');
    
    return formatted;
  };

  const handleEdit = (message: Message) => {
    setEditingId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingContent.trim()) return;

    setUploading(true);
    try {
      const response = await fetch(`/api/sermons/${params.id}/messages/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingContent("");
        fetchSermon();
      }
    } catch (error) {
      console.error("Error updating message:", error);
      alert("Error al actualizar el mensaje");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta nota?")) return;

    try {
      const response = await fetch(`/api/sermons/${params.id}/messages/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSermon();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Error al eliminar el mensaje");
    }
  };

  const handleEditSermon = () => {
    setEditTitle(sermon?.title || "");
    setEditPastor(sermon?.pastor || "");
    setEditingSermon(true);
  };

  const handleSaveSermon = async () => {
    if (!editTitle.trim() || !editPastor.trim()) {
      alert("El título y el pastor son obligatorios");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`/api/sermons/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, pastor: editPastor }),
      });

      if (response.ok) {
        setEditingSermon(false);
        fetchSermon();
      } else {
        alert("Error al actualizar el sermón");
      }
    } catch (error) {
      console.error("Error updating sermon:", error);
      alert("Error al actualizar el sermón");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-selapp-brown border-t-transparent mb-4"></div>
          <p className="text-selapp-brown-light">Cargando sermón...</p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-selapp-brown-light">Sermón no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-selapp-beige via-selapp-cream to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-selapp-brown to-selapp-brown-dark text-white shadow-lg">
        <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center gap-4">
          <Link
            href="/sermons"
            className="hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <span className="text-xl">←</span>
          </Link>
          <Image
            src="/icon-192x192.png"
            alt="Selapp"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="flex-1">
            {editingSermon ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1 rounded-lg text-selapp-brown font-bold text-lg"
                  placeholder="Título del sermón"
                />
                <input
                  type="text"
                  value={editPastor}
                  onChange={(e) => setEditPastor(e.target.value)}
                  className="w-full px-3 py-1 rounded-lg text-selapp-brown text-sm"
                  placeholder="Nombre del pastor"
                />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold">{sermon.title}</h1>
                <p className="text-sm text-selapp-beige-dark">
                  Pastor: {sermon.pastor} • {formatDate(sermon.date)}
                </p>
              </>
            )}
          </div>
          
          {editingSermon ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveSermon}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={() => setEditingSermon(false)}
                disabled={uploading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditSermon}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              ✏️ Editar
            </button>
          )}
          
          {/* Botón para cambiar entre vistas */}
          <button
            onClick={() => setViewMode(viewMode === "document" ? "chat" : "document")}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            {viewMode === "document" ? (
              <>
                <span>💬</span>
                <span className="hidden sm:inline">Vista Chat</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span className="hidden sm:inline">Vista Documento</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {viewMode === 'document' && sermon.messages.length === 0 ? (
            <div className="text-center text-selapp-brown-light py-12 selapp-card">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg mb-4">No hay notas aún</p>
              <p className="text-sm mb-6">Cambia a vista chat para empezar a escribir</p>
            </div>
          ) : viewMode === 'document' ? (
            <div className="selapp-card p-8">
              {/* Título del documento */}
              <div className="mb-8 pb-6 border-b border-selapp-brown/10">
                <h1 className="text-3xl font-bold text-selapp-brown mb-2">{sermon.title}</h1>
                <p className="text-selapp-brown-light">
                  Pastor: {sermon.pastor} • {formatDate(sermon.date)}
                </p>
              </div>

              {/* Mensajes como secciones del documento - SOLO LECTURA */}
              <div className="space-y-8">
                {sermon.messages.map((message, index) => (
                  <div key={message.id}>
                    <div className="relative">
                      {/* Hora */}
                      <div className="flex items-center gap-2 text-xs text-selapp-brown-light mb-3">
                        <span>{formatTime(message.createdAt)}</span>
                      </div>

                      {/* Imágenes */}
                      {message.images.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 gap-3">
                          {message.images.map((img) => (
                            <div
                              key={img.id}
                              className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                              onClick={() => window.open(img.url, "_blank")}
                            >
                              <img
                                src={img.url}
                                alt={img.fileName}
                                className="w-full h-auto"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Contenido formateado */}
                      <div
                        className="prose-selapp text-selapp-brown leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: message.content,
                        }}
                      />
                    </div>

                    {/* Separador entre notas */}
                    {index < sermon.messages.length - 1 && (
                      <div className="border-b border-selapp-brown/10 my-8"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VISTA CHAT - Para editar */
            <div className="space-y-3">
              {sermon.messages.map((message) => (
                <div key={message.id}>
                  {editingId === message.id ? (
                    /* Editando mensaje en vista chat */
                    <div className="bg-white rounded-xl p-4 border-2 border-selapp-brown shadow-lg">
                      <div className="mb-3">
                        <span className="text-sm font-medium text-selapp-brown">
                          Editando mensaje
                        </span>
                      </div>
                      
                      {/* Rich Text Editor */}
                      <RichTextEditor
                        content={editingContent}
                        onChange={setEditingContent}
                        placeholder="Edita tu mensaje..."
                        disabled={uploading}
                      />

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2 rounded-lg border border-selapp-brown/20 text-selapp-brown hover:bg-selapp-beige transition-all"
                          disabled={uploading}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all"
                          disabled={uploading}
                        >
                          🗑️
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-4 py-2 rounded-lg bg-selapp-brown hover:bg-selapp-brown-dark text-white transition-all shadow-lg"
                          disabled={uploading || !editingContent.trim()}
                        >
                          {uploading ? "..." : "✓"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Burbuja de chat con botón editar */
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] rounded-2xl p-3 max-w-[80%] shadow-md relative group">
                        {/* Botón editar */}
                        <button
                          onClick={() => handleEdit(message)}
                          className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-selapp-brown hover:bg-selapp-brown-dark text-white px-2 py-1 rounded-lg text-xs"
                        >
                          ✏️
                        </button>

                        {/* Imágenes */}
                        {message.images.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {message.images.map((img) => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt={img.fileName}
                                className="rounded-lg max-w-full cursor-pointer"
                                onClick={() => window.open(img.url, "_blank")}
                              />
                            ))}
                          </div>
                        )}

                        {/* Contenido */}
                        <div
                          className="prose-selapp-white text-sm"
                          dangerouslySetInnerHTML={{
                            __html: message.content,
                          }}
                        />

                        {/* Hora */}
                        <div className="text-[10px] text-gray-500 mt-1 text-right">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de nueva nota - SOLO en vista chat */}
      {viewMode === 'chat' && !editingId && (
        <div className="p-4 bg-white border-t border-selapp-brown/10">
          <div className="container mx-auto max-w-4xl">
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {/* Rich Text Editor */}
              <RichTextEditor
                content={newMessage}
                onChange={setNewMessage}
                placeholder="Escribe tu nota aquí..."
                disabled={uploading}
                onAttachClick={() => fileInputRef.current?.click()}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewMessage("");
                    setSelectedImages([]);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border border-selapp-brown/20 text-selapp-brown hover:bg-selapp-beige transition-all"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-selapp-brown hover:bg-selapp-brown-dark text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
                  disabled={uploading || (!newMessage.trim() && selectedImages.length === 0)}
                >
                  {uploading ? "Guardando..." : "Guardar Nota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
