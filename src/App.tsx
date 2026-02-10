import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import { Dashboard } from './pages/Dashboard';
import { NoteCreate } from './pages/NoteCreate';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import NoteDetail from './pages/NoteDetail';
import QuizList from './pages/QuizList';
import QuizEdit from './pages/QuizEdit';
import { useAuthStore } from './stores/useAuthStore';
import { authRepository } from './modules/auth/auth.repository';

function App() {
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  /**
   * アプリ起動時にトークンが残っていれば
   * getMe APIでユーザー情報を取得してストアにセットする
   * トークンが無効（期限切れ等）なら認証状態をクリアする
   */
  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const data = await authRepository.getMe();
        setAuth(data.user);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 認証状態の確認中はローディング表示
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/admin">
      <div className="h-full">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/notes/new" element={<NoteCreate />} />
            <Route path="/notes/:noteId" element={<NoteDetail />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quizzes/new" element={<QuizEdit />} />
            <Route path="/quizzes/:id/edit" element={<QuizEdit />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;