import { FC } from 'react';
import { Item } from './Item';
import { NoteList } from '../notes/NoteList';
import UserItem from './UserItem';
import { Plus, Search, ListChecks } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useNavigate } from 'react-router-dom';
import { authRepository } from '@/modules/auth/auth.repository';

type Props = {
  onSearchButtonClicked: () => void;
};

const SideBar: FC<Props> = ({ onSearchButtonClicked }) => {
  const { user, clearAuth } = useAuthStore();
  const { createNote } = useNoteStore();
  const navigate = useNavigate();

  const handleSignout = () => {
    authRepository.logout();
    clearAuth();
    navigate('/signin');
  };

  const handleCreateNote = async () => {
    try {
      const note = await createNote('無題');
      navigate(`/notes/${note.id}`);
    } catch {
      console.error('ノートの作成に失敗しました');
    }
  };

  if (!user) {
    return null;
  }
  return (
    <>
      <aside className="group/sidebar h-full bg-neutral-100 overflow-y-auto relative flex flex-col w-60">
        <div>
          <div>
            <UserItem
              user={user}
              signout={handleSignout}
            />
            <Item label="検索" icon={Search} onClick={onSearchButtonClicked} />
            <Item label="クイズ管理" icon={ListChecks} onClick={() => navigate('/quizzes')} />
          </div>
          <div className="mt-4">
            <NoteList />
            <Item label="ノートを作成" icon={Plus} onClick={handleCreateNote} />
          </div>
        </div>
      </aside>
      <div className="absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]"></div>
    </>
  );
};

export default SideBar;
