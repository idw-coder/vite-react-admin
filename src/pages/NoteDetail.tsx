import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TitleInput } from '@/components/notes/Toolbar';
import Editor from '@/components/notes/Editor';
import { useNoteStore } from '@/stores/useNoteStore';

const NoteDetail = () => {
  const { noteId } = useParams();
  const { currentNote, fetchNote, updateNote, clearCurrentNote, loading } =
    useNoteStore();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (noteId) {
      fetchNote(Number(noteId));
    }
    return () => {
      clearCurrentNote();
    };
  }, [noteId]);

  /** タイトル変更（デバウンス付きで自動保存） */
  const handleTitleChange = (value: string) => {
    if (!currentNote) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateNote(currentNote.id, { title: value });
    }, 500);
  };

  /** コンテンツ変更（デバウンス付きで自動保存） */
  const handleContentChange = (value: string) => {
    if (!currentNote) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateNote(currentNote.id, { content: value });
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">ノートが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        <TitleInput
          initialData={currentNote}
          onTitleChange={handleTitleChange}
        />
        <Editor
          key={currentNote.id}
          initialContent={currentNote.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default NoteDetail;
