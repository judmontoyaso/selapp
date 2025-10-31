"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onAttachClick?: () => void;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Escribe tu nota...",
  disabled = false,
  onAttachClick
}: RichTextEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-selapp max-w-none focus:outline-none min-h-[80px] p-3 text-selapp-brown',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  // Actualizar contenido cuando cambie desde afuera
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Deshabilitar cuando uploading
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-selapp-brown/20 rounded-xl bg-white focus-within:ring-2 focus-within:ring-selapp-brown/30 overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-selapp-brown/10 bg-selapp-beige/20">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive('bold')
              ? 'bg-selapp-brown text-white'
              : 'bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown'
          } font-bold disabled:opacity-50`}
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive('italic')
              ? 'bg-selapp-brown text-white'
              : 'bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown'
          } italic disabled:opacity-50`}
          title="Cursiva"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive('underline')
              ? 'bg-selapp-brown text-white'
              : 'bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown'
          } underline disabled:opacity-50`}
          title="Subrayado"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive('heading')
              ? 'bg-selapp-brown text-white'
              : 'bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown'
          } font-bold disabled:opacity-50`}
          title="Título"
        >
          H
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive('blockquote')
              ? 'bg-selapp-brown text-white'
              : 'bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown'
          } disabled:opacity-50`}
          title="Cita"
        >
          &quot;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive('bulletList')
              ? 'bg-selapp-brown text-white'
              : 'bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown'
          } disabled:opacity-50`}
          title="Lista"
        >
          •
        </button>
        {onAttachClick && (
          <>
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={onAttachClick}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg bg-selapp-beige hover:bg-selapp-beige-dark text-selapp-brown transition-all disabled:opacity-50"
              title="Adjuntar imagen"
            >
              📎
            </button>
          </>
        )}
      </div>
      
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
