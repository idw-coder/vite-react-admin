import api from "@/lib/api";
import type {
  Quiz,
  QuizCategory,
  QuizCreateParams,
  QuizUpdateParams,
  QuizTag,
} from "./quiz";


/**
 * クイズ関連のAPI通信
 * バックエンドの /api/quiz ルートに合わせる
 * - GET /api/quiz/categories
 * - GET /api/quiz/category/:categoryId/quizzes
 * - GET /api/quiz/:quizId
 */
export const quizRepository = {
  /** カテゴリ一覧取得 */
  async getCategories(): Promise<QuizCategory[]> {
    const response = await api.get("/quiz/categories");
    return response.data;
  },

  /** カテゴリ別クイズ一覧取得（categoryId 必須） */
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    const response = await api.get<Quiz[]>(
      `/quiz/category/${categoryId}/quizzes`,
    );
    return response.data;
  },

  /** クイズ1件取得（選択肢込み） */
  async getById(id: number): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quiz/${id}`);
    return response.data;
  },

  /** タグ一覧取得 */
  async getTags(): Promise<QuizTag[]> {
    const response = await api.get<QuizTag[]>("/quiz/tags");
    return response.data;
  },

  /** タグ作成 */
  async createTag(params: { slug: string; name: string }): Promise<QuizTag> {
    const response = await api.post<QuizTag>("/quiz/tags", params);
    return response.data;
  },
  /** タグ更新 */
  async updateTag(id: number, params: { slug?: string; name?: string }): Promise<QuizTag> {
    const response = await api.put<QuizTag>(`/quiz/tags/${id}`, params);
    return response.data;
  },

  /** タグ削除 */
  async removeTag(id: number): Promise<void> {
    await api.delete(`/quiz/tags/${id}`);
  },

  /** クイズ作成（バックエンドにルートがある場合） */
  async create(params: QuizCreateParams): Promise<Quiz> {
    const response = await api.post<Quiz>("/quiz", params);
    return response.data;
  },

  /** クイズ更新（バックエンドにルートがある場合） */
  async update(id: number, params: QuizUpdateParams): Promise<Quiz> {
    const response = await api.put<Quiz>(`/quiz/${id}`, params);
    return response.data;
  },

  /** クイズ削除（バックエンドにルートがある場合） */
  async remove(id: number): Promise<void> {
    await api.delete(`/quiz/${id}`);
  },
};