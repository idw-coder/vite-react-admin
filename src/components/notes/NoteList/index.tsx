import { NoteItem } from './NoteItem';
import { useNoteStore } from '@/stores/useNoteStore';
import { useNavigate, useParams } from 'react-router-dom';

export function NoteList() {
  const { notes, deleteNote } = useNoteStore();
  const navigate = useNavigate();
  const { noteId } = useParams();

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteNote(id);
      if (Number(noteId) === id) {
        navigate('/');
      }
    } catch {
      console.error('ノートの削除に失敗しました');
    }
  };

  if (notes.length === 0) {
    return (
      <p className="text-sm font-medium text-muted-foreground/80 py-1 pl-[25px]">
        ノートがありません
      </p>
    );
  }

  return (
    <>
      {notes.map((note) => (
        <div key={note.id}>
          <NoteItem
            id={note.id}
            label={note.title || '無題'}
            isSelected={Number(noteId) === note.id}
            onClick={() => navigate(`/notes/${note.id}`)}
            onDelete={(e) => handleDelete(e, note.id)}
          />
        </div>
      ))}
    </>
  );
}
