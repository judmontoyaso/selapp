"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor";
import { FiMessageSquare, FiFileText, FiEdit2, FiTrash2, FiCheck, FiArrowLeft, FiEdit3, FiX, FiPlus } from "react-icons/fi";

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
    <div className="min-h-screen bg-gradient-to-br from-selapp-beige via-selapp-cream to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-selapp-brown via-selapp-brown to-selapp-brown-dark text-white rounded-b-3xl shadow-lg mb-6">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-4 pb-3 flex flex-col gap-3">

          {/* Fila Principal: Volver + Título + Botón Nueva Nota */}
          <div className="flex items-center gap-3 w-full">

            {/* Botón volver */}
            <Link
              href="/sermons"
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 border border-white/10"
              title="Volver a mis Sermones"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>

            {/* Título e Info del Sermón */}
            <div className="flex-1 min-w-0">
              {editingSermon ? (
                <div className="flex flex-col sm:flex-row w-full gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-selapp-brown font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                    placeholder="Título del sermón"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editPastor}
                    onChange={(e) => setEditPastor(e.target.value)}
                    className="w-full sm:w-36 px-3 py-2 rounded-xl text-selapp-brown text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                    placeholder="Pastor"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveSermon} disabled={uploading} className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm font-semibold disabled:opacity-50 shadow">
                      <FiCheck className="w-4 h-4" />
                      <span>Guardar</span>
                    </button>
                    <button onClick={() => setEditingSermon(false)} disabled={uploading} className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm font-semibold disabled:opacity-50 border border-white/20">
                      <FiX className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold truncate leading-tight" title={sermon.title}>
                      {sermon.title}
                    </h1>
                    <button
                      onClick={handleEditSermon}
                      className="text-white/50 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0 hover:bg-white/10"
                      title="Editar título y pastor"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/60 truncate mt-0.5">
                    {sermon.pastor} · {formatDate(sermon.date)}
                  </p>
                </div>
              )}
            </div>

            {/* Botón Nueva Nota */}
            {!editingSermon && (
              <button
                onClick={() => { setViewMode('chat'); setTimeout(scrollToBottom, 100); }}
                className="flex-shrink-0 bg-white text-selapp-brown hover:bg-selapp-beige px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 border border-white/80"
              >
                <FiPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Nota</span>
              </button>
            )}
          </div>

          {/* Tabs de Vista */}
          <div className="flex w-full border-t border-white/10 pt-2.5">
            <div className="flex w-full bg-black/20 p-1 rounded-xl gap-1 shadow-inner">
              <button
                onClick={() => setViewMode("chat")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  viewMode === "chat" ? "bg-white text-selapp-brown shadow-md" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>Notas</span>
              </button>
              <button
                onClick={() => setViewMode("document")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  viewMode === "document" ? "bg-white text-selapp-brown shadow-md" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <FiFileText className="w-4 h-4" />
                <span>Documento</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area (Flujo Natural Documento sin límite de altura) */}
      <div className="px-4">
        <div className="container mx-auto max-w-4xl">
          {viewMode === 'document' && sermon.messages.length === 0 ? (
            <div className="text-center text-selapp-brown-light py-12 selapp-card flex flex-col items-center">
              <FiEdit3 className="w-16 h-16 mb-4 text-selapp-brown/30" />
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
            <div className="space-y-3 pb-40">
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
                          className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all flex items-center justify-center w-12"
                          disabled={uploading}
                          title="Eliminar mensaje"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-4 py-2 rounded-lg bg-selapp-brown hover:bg-selapp-brown-dark text-white transition-all shadow-lg flex items-center justify-center gap-2"
                          disabled={uploading || !editingContent.trim()}
                        >
                          {uploading ? "..." : <><FiCheck className="w-5 h-5" /> <span>Guardar</span></>}
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
                          className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-selapp-brown hover:bg-selapp-brown-dark text-white p-2 rounded-lg text-xs shadow-md"
                        >
                          <FiEdit2 className="w-3 h-3" />
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

      {/* Input de nueva nota - SOLO en vista chat, Fijo en el fondo de la pestaña del navegador */}
      {viewMode === 'chat' && !editingId && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-selapp-brown/10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20">
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
