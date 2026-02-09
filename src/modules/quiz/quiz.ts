/**
 * クイズ関連の型定義
 * API（Laravel/Express）の quiz, quiz_choice, quiz_category に合わせる
 */

export interface QuizCategory {
  id: number
  slug: string
  category_name: string
  description: string
  author_id?: number
}

export interface QuizChoice {
  id?: number
  quiz_id?: number
  choice_text: string
  is_correct: boolean
}

export interface Quiz {
  id: number
  slug: string
  question: string
  explanation: string
  category_id: number
  author_id?: number
  choices?: QuizChoice[]
  created_at?: string
  updated_at?: string
}

/** クイズ作成・更新時のリクエスト用（選択肢は choice_text, is_correct） */
export interface QuizCreateParams {
  slug: string
  question: string
  explanation: string
  category_id: number
  author_id?: number
  choices: { choice_text: string; is_correct: boolean }[]
}

export type QuizUpdateParams = Partial<QuizCreateParams>
