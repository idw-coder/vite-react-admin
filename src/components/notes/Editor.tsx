import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { ja } from '@blocknote/core/locales';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import api from '@/lib/api';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string | null;
}

/**
 * 画像アップロード処理
 * POST /api/upload/{category} にファイルを送信し、URLを返す
 */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url;
}

function Editor({ onChange, initialContent }: EditorProps) {
  const editor: BlockNoteEditor = useCreateBlockNote({
    dictionary: ja,
    uploadFile,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
  });

  return (
    <div>
      <BlockNoteView
        editor={editor}
        onChange={() => onChange(JSON.stringify(editor.document, null, 2))}
      />
    </div>
  );
}

export default Editor;
