import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TitleInput } from '@/components/notes/Toolbar';
import Editor from '@/components/notes/Editor';
import { useNoteStore } from '@/stores/useNoteStore';

const NoteDetail = () => {
  const { noteId } = useParams();
  const { currentNote, fetchNote, updateNote, clearCurrentNote, loading } =
    useNoteStore();
  const titleRef = useRef('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (noteId) {
      fetchNote(Number(noteId));
    }
    return () => {
      clearCurrentNote();
    };
  }, [noteId]);

  useEffect(() => {
    if (currentNote) {
      titleRef.current = currentNote.title;
      setContent(currentNote.content ?? '');
    }
  }, [currentNote?.id, currentNote?.title, currentNote?.content]);

  /** タイトル変更（保存ボタンで反映） */
  const handleTitleChange = (value: string) => {
    titleRef.current = value;
    // 自動保存は無効化（保存ボタンで更新）
    // if (!currentNote) return;
    // if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // debounceTimer.current = setTimeout(() => {
    //   updateNote(currentNote.id, { title: value });
    // }, 500);
  };

  /** コンテンツ変更（保存ボタンで反映） */
  const handleContentChange = (value: string) => {
    setContent(value);
    // 自動保存は無効化（保存ボタンで更新）
    // if (!currentNote) return;
    // if (debounceTimer.current) clearTimeout(debounceTimer.current);
    // debounceTimer.current = setTimeout(() => {
    //   updateNote(currentNote.id, { content: value });
    // }, 500);
  };

  const handleSave = () => {
    if (!currentNote) return;
    updateNote(currentNote.id, {
      title: titleRef.current,
      content,
    });
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
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleSave}
            className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            保存
          </button>
        </div>
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
