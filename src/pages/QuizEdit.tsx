import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizRepository } from "@/modules/quiz/quiz.repository";
import type { QuizCategory, QuizTag } from "@/modules/quiz/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, ArrowLeft } from "lucide-react";
import Editor from "@/components/notes/Editor";

type ChoiceRow = { choice_text: string; is_correct: boolean };

function normalizeExplanationForEditor(value: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return trimmed;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return trimmed;
  } catch {
    /* プレーンテキストとして扱う */
  }
  const block = [
    {
      id: crypto.randomUUID?.() ?? `block-${Date.now()}`,
      type: "paragraph" as const,
      props: {},
      content: [{ type: "text" as const, text: trimmed, styles: {} }],
      children: [],
    },
  ];
  return JSON.stringify(block);
}

const emptyChoice = (): ChoiceRow => ({ choice_text: "", is_correct: false });

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // /quizzes/new ルートには :id がないため id は undefined。新規作成モードと判定する
  const isNew = !id || id === "new";

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<QuizTag[]>([]);
  const [slug, setSlug] = useState("");
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [choices, setChoices] = useState<ChoiceRow[]>([emptyChoice(), emptyChoice()]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [categoryList, tagList] = await Promise.all([
          quizRepository.getCategories(),
          quizRepository.getTags(),
        ]);
        setCategories(categoryList);
        if (categoryList.length > 0) {
          setCategoryId((prev) => (prev === "" ? categoryList[0].id : prev));
        }
        setAvailableTags(tagList);
      } catch {
        setError("マスタデータの取得に失敗しました");
      }
    };
    loadMaster();
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const quiz = await quizRepository.getById(Number(id));
        setSlug(quiz.slug);
        setQuestion(quiz.question);
        setExplanation(normalizeExplanationForEditor(quiz.explanation ?? ""));
        setCategoryId(Number(quiz.category_id));
        if (quiz.choices && quiz.choices.length > 0) {
          setChoices(
            quiz.choices.map((c) => ({
              choice_text: c.choice_text,
              is_correct: c.is_correct,
            })),
          );
        }
        if (quiz.tags && quiz.tags.length > 0) {
          setTags(quiz.tags.map((t) => t.slug));
        }
      } catch {
        setError("クイズの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  const addChoice = () => {
    setChoices((prev) => [...prev, emptyChoice()]);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;
    setChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChoice = (
    index: number,
    field: "choice_text" | "is_correct",
    value: string | boolean,
  ) => {
    setChoices((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCategoryId =
      categoryId === "" ? Number.NaN : Number(categoryId);
    const catId = Number.isFinite(normalizedCategoryId)
      ? normalizedCategoryId
      : categories[0]?.id;
    if (catId == null) {
      setError("カテゴリを選択してください");
      return;
    }
    const validChoices = choices.filter((c) => c.choice_text.trim() !== "");
    if (validChoices.length < 2) {
      setError("正解を含め、選択肢を2つ以上入力してください");
      return;
    }
    if (validChoices.every((c) => !c.is_correct)) {
      setError("正解を1つ以上指定してください");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: slug.trim(),
        question: question.trim(),
        explanation: explanation.trim(),
        category_id: catId,
        choices: validChoices,
        tags,
      };
      if (isNew) {
        const created = await quizRepository.create(payload);
        navigate(`/quizzes/${created.id}/edit`, { replace: true });
      } else {
        await quizRepository.update(Number(id), payload);
        setError(null);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "保存に失敗しました";
      setError(msg ?? "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/quizzes")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          一覧へ戻る
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "新規クイズ" : "クイズを編集"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <div>
              <label className="text-sm font-medium block mb-2">スラッグ</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例: react-usestate-hook"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">問題文</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例: Reactで状態を管理するHookは？"
                required
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                解説（ノートと同じリッチエディタ）
              </label>
              <div className="min-h-[200px] rounded-md border border-input overflow-hidden">
                <Editor
                  key={`explanation-${id ?? "new"}`}
                  initialContent={explanation || undefined}
                  onChange={(value) => setExplanation(value)}
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="text-sm font-medium block mb-2">カテゴリ</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-2">タグ</label>
              {availableTags.length === 0 ? (
                <p className="text-xs text-muted-foreground">タグが登録されていません</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const selected = tags.includes(tag.slug);
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() =>
                          setTags((prev) =>
                            selected
                              ? prev.filter((s) => s !== tag.slug)
                              : [...prev, tag.slug],
                          )
                        }
                        className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-input hover:bg-muted/70"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">選択肢</label>
                <button
                  type="button"
                  onClick={addChoice}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  選択肢を追加
                </button>
              </div>
              <ul className="space-y-3">
                {choices.map((choice, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-md border border-input bg-muted/30"
                  >
                    <input
                      type="radio"
                      name="correct"
                      checked={choice.is_correct}
                      onChange={() => {
                        setChoices((prev) =>
                          prev.map((c, i) => ({
                            ...c,
                            is_correct: i === index,
                          })),
                        );
                      }}
                      className="rounded-full border-input"
                      title="正解"
                    />
                    <Input
                      value={choice.choice_text}
                      onChange={(e) =>
                        updateChoice(index, "choice_text", e.target.value)
                      }
                      placeholder={`選択肢 ${index + 1}`}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeChoice(index)}
                      disabled={choices.length <= 2}
                      className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-40"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                ラジオで正解を1つ選び、選択肢を2つ以上入力してください。
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {saving ? "保存中..." : "保存"}
              </button>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => navigate("/quizzes")}
                  className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizEdit;