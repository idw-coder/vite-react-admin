import { create } from 'zustand'
import { Note } from '@/modules/notes/note'
import { noteRepository } from '@/modules/notes/note.repository'

type NoteState = {
  notes: Note[]
  currentNote: Note | null
  loading: boolean
  error: string | null

  /** ノート一覧を取得 */
  fetchNotes: () => Promise<void>
  /** ノートを1件取得してcurrentNoteにセット */
  fetchNote: (id: number) => Promise<void>
  /** ノートを作成 */
  createNote: (title: string, content?: string) => Promise<Note>
  /** ノートを更新 */
  updateNote: (id: number, params: { title?: string; content?: string }) => Promise<void>
  /** ノートを削除 */
  deleteNote: (id: number) => Promise<void>
  /** currentNoteをクリア */
  clearCurrentNote: () => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null })
    try {
      const notes = await noteRepository.getAll()
      set({ notes, loading: false })
    } catch {
      set({ error: 'ノートの取得に失敗しました', loading: false })
    }
  },

  fetchNote: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const note = await noteRepository.getById(id)
      set({ currentNote: note, loading: false })
    } catch {
      set({ error: 'ノートの取得に失敗しました', loading: false })
    }
  },

  createNote: async (title: string, content?: string) => {
    const note = await noteRepository.create({ title, content })
    set({ notes: [note, ...get().notes] })
    return note
  },

  updateNote: async (id: number, params: { title?: string; content?: string }) => {
    const updated = await noteRepository.update(id, params)
    set({
      notes: get().notes.map((n) => (n.id === id ? updated : n)),
      currentNote: get().currentNote?.id === id ? updated : get().currentNote,
    })
  },

  deleteNote: async (id: number) => {
    await noteRepository.remove(id)
    set({
      notes: get().notes.filter((n) => n.id !== id),
      currentNote: get().currentNote?.id === id ? null : get().currentNote,
    })
  },

  clearCurrentNote: () => set({ currentNote: null }),
}))
