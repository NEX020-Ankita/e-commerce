'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = "Enter description..." }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-3',
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="border-b border-gray-300 p-2 bg-gray-50">
        <div className="flex flex-wrap gap-1 mb-2">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-sm rounded ${editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-sm rounded ${editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 text-sm rounded ${editor?.isActive('strike') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Strike"
          >
            <s>S</s>
          </button>

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-sm rounded ${editor?.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-sm rounded ${editor?.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Number List"
          >
            1.
          </button>

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            className="px-2 py-1 text-sm rounded bg-white hover:bg-gray-100"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            className="px-2 py-1 text-sm rounded bg-white hover:bg-gray-100"
            title="Redo"
          >
            ↷
          </button>
        </div>

      </div>
      <EditorContent editor={editor} />
    </div>
  );
}