import { useEffect, useState, useCallback } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import { SearchModal } from './components/notes/SearchModal';
import { useAuthStore } from './stores/useAuthStore';
import { useNoteStore } from './stores/useNoteStore';

const Layout = () => {
  const { user } = useAuthStore();
  const { notes, fetchNotes } = useNoteStore();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState(notes);

  // 認証済みならノート一覧を取得
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // notesが更新されたら検索結果も更新
  useEffect(() => {
    setFilteredNotes(notes);
  }, [notes]);

  const handleSearch = useCallback(
    (keyword: string) => {
      if (!keyword.trim()) {
        setFilteredNotes(notes);
        return;
      }
      const lower = keyword.toLowerCase();
      setFilteredNotes(
        notes.filter(
          (note) =>
            note.title.toLowerCase().includes(lower) ||
            note.content?.toLowerCase().includes(lower)
        )
      );
    },
    [notes]
  );

  const handleNoteSelect = useCallback(
    (noteId: number) => {
      navigate(`/notes/${noteId}`);
      setIsSearchOpen(false);
    },
    [navigate]
  );

  if (!user) {
    return <Navigate to="/signin" />;
  }
  return (
    <div className="h-full flex">
      <SideBar onSearchButtonClicked={() => setIsSearchOpen(true)} />
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
        <SearchModal
          isOpen={isSearchOpen}
          notes={filteredNotes}
          onItemSelect={handleNoteSelect}
          onKeywordChanged={handleSearch}
          onClose={() => setIsSearchOpen(false)}
        />
      </main>
    </div>
  );
};

export default Layout;
