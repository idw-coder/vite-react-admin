import { useEffect, useState } from "react";
import { quizRepository } from "@/modules/quiz/quiz.repository";
import type { QuizTag } from "@/modules/quiz/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

const TagManage = () => {
  const [tags, setTags] = useState<QuizTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新規作成フォーム
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // インライン編集
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await quizRepository.getTags();
      setTags(list);
    } catch {
      setError("タグの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newSlug.trim();
    const name = newName.trim();
    if (!slug || !name) return;
    setCreating(true);
    setError(null);
    try {
      const created = await quizRepository.createTag({ slug, name });
      setTags((prev) => [...prev, created]);
      setNewSlug("");
      setNewName("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "作成に失敗しました";
      setError(msg ?? "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (tag: QuizTag) => {
    setEditingId(tag.id);
    setEditSlug(tag.slug);
    setEditName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSlug("");
    setEditName("");
  };

  const handleUpdate = async (id: number) => {
    const slug = editSlug.trim();
    const name = editName.trim();
    if (!slug || !name) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await quizRepository.updateTag(id, { slug, name });
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEdit();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "更新に失敗しました";
      setError(msg ?? "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このタグを削除しますか？")) return;
    setError(null);
    try {
      await quizRepository.removeTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("削除に失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>タグ管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          {/* 新規作成フォーム */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="slug（例: typescript）"
              className="w-40"
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名前（例: TypeScript）"
              className="flex-1"
            />
            <button
              type="submit"
              disabled={creating || !newSlug.trim() || !newName.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </form>

          {/* タグ一覧 */}
          {loading ? (
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">タグがまだありません</p>
          ) : (
            <ul className="divide-y divide-border">
              {tags.map((tag) =>
                editingId === tag.id ? (
                  <li key={tag.id} className="flex items-center gap-2 py-3">
                    <Input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-40"
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(tag.id)}
                      disabled={saving}
                      className="p-2 text-primary hover:text-primary/80 disabled:opacity-50"
                      title="保存"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      title="キャンセル"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ) : (
                  <li key={tag.id} className="flex items-center gap-3 py-3">
                    <span className="w-40 text-sm text-muted-foreground truncate">
                      {tag.slug}
                    </span>
                    <span className="flex-1 text-sm">{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      title="編集"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="p-2 text-muted-foreground hover:text-destructive"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TagManage;