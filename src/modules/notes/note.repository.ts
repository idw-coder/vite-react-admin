import api from '@/lib/api'
import { Note } from './note'

/**
 * ノート関連のAPI通信
 */
export const noteRepository = {
  /** ノート一覧取得（自分のノートのみ） */
  async getAll(): Promise<Note[]> {
    const response = await api.get('/notes')
    return response.data
  },

  /** ノート取得（1件） */
  async getById(id: number): Promise<Note> {
    const response = await api.get(`/notes/${id}`)
    return response.data
  },

  /** ノート作成 */
  async create(params: { title: string; content?: string }): Promise<Note> {
    const response = await api.post('/notes', params)
    return response.data
  },

  /** ノート更新 */
  async update(id: number, params: { title?: string; content?: string }): Promise<Note> {
    const response = await api.put(`/notes/${id}`, params)
    return response.data
  },

  /** ノート削除（ソフトデリート） */
  async remove(id: number): Promise<void> {
    await api.delete(`/notes/${id}`)
  },
}
