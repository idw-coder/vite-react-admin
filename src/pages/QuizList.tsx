import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { quizRepository } from '@/modules/quiz/quiz.repository'
import type { Quiz, QuizCategory } from '@/modules/quiz/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, ListChecks } from 'lucide-react'

const QuizList = () => {
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const cats = await quizRepository.getCategories()
        setCategories(cats)
        if (cats.length > 0 && selectedCategoryId === null) {
          setSelectedCategoryId(cats[0].id)
        }
      } catch (e) {
        setError('カテゴリの取得に失敗しました')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedCategoryId == null) {
      setQuizzes([])
      return
    }
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await quizRepository.getQuizzesByCategory(selectedCategoryId)
        setQuizzes(list)
      } catch (e) {
        setError('クイズ一覧の取得に失敗しました')
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCategoryId])

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          API（/api/quiz/categories）が利用可能か確認してください。
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ListChecks className="w-6 h-6" />
          クイズ管理
        </h1>
        <Link
          to="/quizzes/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          新規クイズ
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            カテゴリ
          </label>
          <select
            value={selectedCategoryId ?? ''}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="w-full max-w-xs h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm mb-4">{error}</p>
      )}

      {loading && quizzes.length === 0 ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            このカテゴリにクイズはまだありません。「新規クイズ」から追加してください。
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((q) => (
            <li key={q.id}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {q.question}
                  </CardTitle>
                  <Link
                    to={`/quizzes/${q.id}/edit`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Pencil className="w-4 h-4" />
                    編集
                  </Link>
                </CardHeader>
                <CardContent className="py-0 px-6 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    slug: {q.slug}
                  </p>
                  {q.tags && q.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {q.tags.map((tag) => (
                        <span
                          key={`${tag.id}-${tag.slug}`}
                          className="inline-flex items-center rounded-md border border-input bg-background px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag.name ?? tag.slug}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default QuizList
