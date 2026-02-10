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

export interface QuizTag {
  id: number
  slug: string
  name: string
}

export interface Quiz {
  id: number
  slug: string
  question: string
  explanation: string
  category_id: number
  author_id?: number
  choices?: QuizChoice[]
  tags?: QuizTag[]
  created_at?: string
  updated_at?: string
}

export interface QuizCreateParams {
  slug: string
  question: string
  explanation: string
  category_id: number
  author_id?: number
  choices: { choice_text: string; is_correct: boolean }[]
  tags?: string[]
}

export type QuizUpdateParams = Partial<QuizCreateParams>