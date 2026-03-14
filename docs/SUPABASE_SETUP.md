# SUPABASE_SETUP.md

# Supabase Setup

Student's All の Step 2 で必要な Supabase 初期設定手順．

---

# 1 プロジェクト作成

1. Supabase で新しいプロジェクトを作成する
2. Project URL を控える
3. anon public key を控える

---

# 2 環境変数

ルートの `.env.local` に以下を設定する．

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

# 3 Authentication 設定

Auth > Providers で Email を有効化する．

推奨設定

* Confirm email は開発初期は任意
* 本番では Confirm email を有効化
* Site URL はアプリの URL に合わせる

開発時の Site URL 例

```text
http://localhost:3000
```

---

# 4 Database 初期化

SQL Editor で [supabase/schema.sql](../supabase/schema.sql) の内容を実行する．

この SQL で以下を作成する．

* classes
* assignments
* shifts
* tasks
* index
* Row Level Security
* user_id ベースのポリシー

---

# 5 アプリ側の接続構成

現在の実装では以下の責務で分割している．

* `src/lib/supabase.ts`: 共有エントリとブラウザ向けクライアント
* `src/lib/supabase-browser.ts`: Client Component 用
* `src/lib/supabase-server.ts`: Server Component と Server Actions 用
* `src/lib/supabase-middleware.ts`: セッション更新用
* `proxy.ts`: リクエストごとのセッション同期
* `src/types/supabase.ts`: データベース型

---

# 6 動作確認

1. `npm run dev` を実行する
2. トップページにアクセスする
3. 環境変数未設定時に Supabase 初期化エラーが出ることを確認する
4. 環境変数設定後に正常起動することを確認する

---

# 7 認証実装済み項目

Step 3 で以下を実装済み．

* サインアップ
* ログイン
* ログアウト
* `/assignments` のセッションベース保護
* `/login` への認証済みユーザーのリダイレクト

---

# 8 次の Step

Step 4 で実装する内容

* カレンダー
* バイト管理
* ダッシュボード
