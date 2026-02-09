# Express API 仕様書

Express + TypeORM + MySQL で構築されたバックエンドAPIの仕様。
Next.js など外部のフロントエンドからこのAPIを利用してノートの表示・管理を行うことを想定している。


## 接続情報

- ベースURL: `http://localhost:8888/api`
- 認証方式: JWT Bearer トークン（`Authorization: Bearer {token}` ヘッダーで送信）
- トークンの有効期限: 7日間
- レスポンス形式: JSON
- CORS: `http://localhost:5173` を許可済み（Next.js で使う場合は追加設定が必要）


## 認証

**POST /api/auth/login** — ログイン

リクエストボディ:
```json
{ "email": "user@example.com", "password": "password123" }
```

レスポンス:
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": 2, "name": "テストユーザー", "email": "user@example.com", "role": "user" }
}
```

**GET /api/auth/me** — ログインユーザー情報取得（要認証）

レスポンス:
```json
{
  "user": { "id": 2, "name": "テストユーザー", "email": "user@example.com", "createdAt": "...", "updatedAt": "..." },
  "role": "user"
}
```

**POST /api/users** — ユーザー登録

リクエストボディ:
```json
{ "name": "新規ユーザー", "email": "new@example.com", "password": "password123", "role": "user" }
```


## ノート

すべてのノートAPIは認証必須。ユーザーは自分のノートのみ操作可能。

**GET /api/notes** — ノート一覧取得

`updatedAt` の降順で返却される。

レスポンス:
```json
[
  {
    "id": 1,
    "userId": 2,
    "title": "ノートのタイトル",
    "content": "[{\"id\":\"abc\",\"type\":\"paragraph\",\"props\":{},\"content\":[{\"type\":\"text\",\"text\":\"本文\"}],\"children\":[]}]",
    "createdAt": "2026-02-08T03:30:00.000Z",
    "updatedAt": "2026-02-08T03:35:00.000Z",
    "deletedAt": null
  }
]
```

`content` は BlockNote エディタの JSON 文字列。人間が読む形式ではなく、エディタの内部構造をそのまま保持している。

**GET /api/notes/:id** — ノート取得（1件、生データ）

BlockNote JSON 形式の `content` をそのまま返す。React アプリの BlockNoteView で編集・表示する場合に使用する。

**GET /api/notes/:id/markdown** — ノート取得（Markdown形式）

サーバーサイドで `@blocknote/server-util` を使い、BlockNote JSON を Markdown に変換して返す。

レスポンス:
```json
{
  "title": "ノートのタイトル",
  "markdown": "# 見出し\n\nこれは本文です。\n\n- リスト1\n- リスト2"
}
```

Next.js の SSR でノートを表示する場合はこのエンドポイントを使う。変換は Lossy（非可逆）のため、BlockNote 固有の一部装飾やレイアウト情報は失われる可能性がある。

**GET /api/notes/:id/html** — ノート取得（HTML形式）

Markdown と同様に、HTML に変換して返す。メール送信やPDF生成などに適している。

レスポンス:
```json
{
  "title": "ノートのタイトル",
  "html": "<h1>見出し</h1><p>これは本文です。</p>"
}
```

**POST /api/notes** — ノート作成

リクエストボディ:
```json
{ "title": "新しいノート", "content": "(BlockNote JSON文字列、省略可)" }
```

`title` は必須。`content` は省略可能。作成されたノートが返却される（201）。

**PUT /api/notes/:id** — ノート更新

リクエストボディ:
```json
{ "title": "変更後のタイトル", "content": "(BlockNote JSON文字列)" }
```

`title` と `content` はそれぞれ省略可能。指定されたフィールドのみ更新される。

**DELETE /api/notes/:id** — ノート削除

ソフトデリート方式。`deletedAt` にタイムスタンプが入るだけで、レコード自体は残る。


## ファイルアップロード

認証必須。アップロードされたファイルはカテゴリと年月でディレクトリ分けされる。

**POST /api/upload/:category** — ファイルアップロード

- パスパラメータ `category`: `notes` または `avatars`
- リクエスト形式: `multipart/form-data`
- フィールド名: `file`
- 許可ファイル形式: JPEG, PNG, GIF, WebP
- サイズ上限: 5MB

レスポンス:
```json
{ "url": "/uploads/notes/2026-02/1707350400-a3b2c1.png" }
```

保存先ディレクトリ構成:
```
uploads/{category}/{YYYY-MM}/{timestamp}-{random}.{ext}
```

アップロード済みファイルは `/uploads/...` パスで静的に配信される。


## クイズ（Quiz）

クイズ・カテゴリ・選択肢のCRUD。バックエンドのルートは `/api/quiz` にマウントする想定。

**GET /api/quiz/categories** — カテゴリ一覧

レスポンス例:
```json
[
  { "id": 1, "slug": "react-basic", "category_name": "React基礎・実践", "description": "...", "author_id": 1 }
]
```

**GET /api/quiz/category/:categoryId/quizzes** — カテゴリ別クイズ一覧

パスパラメータ: `categoryId`。

レスポンス例:
```json
[
  { "id": 1, "slug": "react-usestate-hook", "question": "Reactで状態を管理するHookは？", "explanation": "...", "category_id": 1, "author_id": 1 }
]
```

**GET /api/quiz/:quizId** — クイズ1件取得（選択肢込み）

レスポンス例:
```json
{
  "id": 1,
  "slug": "react-usestate-hook",
  "question": "Reactで状態を管理するHookは？",
  "explanation": "正解はuseStateです。...",
  "category_id": 1,
  "author_id": 1,
  "choices": [
    { "id": 1, "quiz_id": 1, "choice_text": "useState", "is_correct": true },
    { "id": 2, "quiz_id": 1, "choice_text": "useEffect", "is_correct": false }
  ]
}
```

**POST /api/quiz** — クイズ作成

リクエストボディ:
```json
{
  "slug": "react-usestate-hook",
  "question": "問題文",
  "explanation": "解説",
  "category_id": 1,
  "author_id": 1,
  "choices": [
    { "choice_text": "useState", "is_correct": true },
    { "choice_text": "useEffect", "is_correct": false }
  ]
}
```

**PUT /api/quiz/:id** — クイズ更新

上記と同様のボディで部分更新可。選択肢は送信した内容で置き換える実装が一般的。

**DELETE /api/quiz/:id** — クイズ削除


## DB スキーマ

**Note テーブル**

| カラム | 型 | 備考 |
|---|---|---|
| id | bigint unsigned (PK) | 自動採番 |
| user_id | bigint unsigned (FK) | User.id への外部キー、CASCADE 削除 |
| title | varchar(255) | デフォルト空文字 |
| content | text, nullable | BlockNote JSON 文字列 |
| created_at | datetime | 自動設定 |
| updated_at | datetime | 自動更新 |
| deleted_at | datetime, nullable | ソフトデリート用 |

**User テーブル**

| カラム | 型 | 備考 |
|---|---|---|
| id | bigint unsigned (PK) | 自動採番 |
| name | varchar(255) | |
| email | varchar(255), unique | |
| password | varchar(255) | bcrypt ハッシュ |
| createdAt | datetime | |
| updatedAt | datetime | |
| deletedAt | datetime, nullable | |

ユーザーの `role` は UserMeta テーブルに `metaKey: "role"` として保存されている。


## 認証フロー

- `POST /api/auth/login` でメールアドレスとパスワードを送信
- 認証成功時に JWT トークンが返却される
- 以降のリクエストでは `Authorization: Bearer {token}` ヘッダーを付与する
- トークンのペイロード: `{ userId, email, role }`
- サーバー側ミドルウェアがトークンを検証し、`req.user` にデコードされた情報をセットする


## エラーレスポンス

すべてのエラーは以下の形式で返却される:
```json
{ "error": "エラーメッセージ" }
```

主なステータスコード:
- 400: バリデーションエラー（必須項目不足、不正なファイル形式など）
- 401: 認証エラー（トークンなし、トークン無効、トークン期限切れ）
- 404: リソースが見つからない
- 409: 重複エラー（ユーザー登録時のメール重複）
- 500: サーバー内部エラー
