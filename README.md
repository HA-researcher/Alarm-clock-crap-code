This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Challenge Editor Setup

Install Monaco dependencies:

```bash
npm install @monaco-editor/react monaco-editor
```

Challenge editor demo flow:

1. Run `npm run dev`
2. Open `/` and click `Start Alarm`
3. On `/waiting`, click `Trigger Alarm`
4. On `/challenge`, focus the editor to switch status to `coding`
5. Edit code and click `提出` to print the current code to browser console

Development-only shortcut:

- In non-production mode, Home shows a `DEV ONLY` button:
  `Jump to /challenge (alarming)`
- This fast-forwards state and route for manual debugging without changing production behavior.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Routing

このアプリは「状態（Zustand）を正」とし、ルートガードでURL整合性を維持します。  
不整合なURLへアクセスした場合は、現在状態に対応する正規ルートへリダイレクトされます。

### 1) Route -> 許可状態

| Route | 許可される state | 役割 |
| --- | --- | --- |
| `/` | `idle`, `cleared` | Home（開始/リセット/完了表示） |
| `/waiting` | `waiting` | 待機画面（アラーム発火） |
| `/challenge` | `alarming`, `coding` | 問題 + Monaco Editor |
| `/monitoring` | `monitoring` | 監視画面（cleared化） |

### 2) State -> 正規Route

| state | route |
| --- | --- |
| `idle` | `/` |
| `waiting` | `/waiting` |
| `alarming` | `/challenge` |
| `coding` | `/challenge` |
| `monitoring` | `/monitoring` |
| `cleared` | `/` |

### 3) 許可遷移（状態遷移ルール）

- `idle -> waiting`
- `waiting -> alarming`
- `alarming -> coding`
- `coding -> monitoring`
- `monitoring -> cleared`
- `cleared -> waiting`
- `reset()` は任意状態から `idle` に戻す

### 4) 現在の主な画面導線（UI）

- `/` : `Start Alarm` で `waiting` にして `/waiting` へ
- `/waiting` : `Trigger Alarm` で `alarming` にして `/challenge` へ
- `/challenge` :
  - Editorフォーカスで `coding` に遷移
  - `提出` は現在コードを `console.log`（外部送信なし）
- `/monitoring` : `Mark Cleared` で `cleared` にして `/` へ

### 5) DEV専用ショートカット

- Homeに `DEV ONLY` ボタン（`Jump to /challenge (alarming)`）を表示
- 開発時のみ、`reset -> waiting -> alarming` を一気に進めて `/challenge` へ遷移
- 本番（production）では表示しない


## API Routes（設計メモ / 将来差し替え前提）

現時点（Web単体骨子）では **Supabase/Gemini/MediaPipe など外部接続は未実装**。  
ただし後で差し替えしやすいように、Next.js 側に API Routes の形を先に定義しておく。

> 方針: クライアント（UI）は `src/api/client.ts` だけを呼ぶ。  
> `client.ts` は「今はモック」「後で /api/* に差し替え」「さらに後で Supabase直 or Edge/Server Actions へ変更」でもUI影響を最小化する。

---

### 1) API一覧（最小）

| Method | Path | 用途 | 呼び出し元 |
|---|---|---|---|
| `POST` | `/api/challenge` | クソコード（課題）生成 | `/waiting` → `/challenge` 遷移時 |
| `POST` | `/api/review` | AIレビュー（合否判定） | `/challenge` の「提出」 |
| `POST` | `/api/failsafe` | フェールセーフ用（force_stopped 記録等）※任意 | APIエラー発生時 |

> Web単体モードでは `/api/failsafe` は不要でもOK（UIだけで force_stopped にしても良い）

---

### 2) データモデル（TypeScript想定）

#### Challenge（課題）
```ts
type Challenge = {
  id: string;
  title: string;
  description: string;
  language: string;     // "python" | "javascript" | ...
  level: string;        // "beginner" | "intermediate" | "advanced" | "custom"
  starterCode: string;  // Monacoに入れる初期コード
  createdAt: string;    // ISO
};
