## 概要

Day3のタスク「Gemini API連携基盤（クソコード生成エンドポイントの作成）」を実装しました。
また、動作確認のため、エディタ画面に固定パラメータでAPIを連携する暫定処理を入れています。

### 実装内容

1. **Gemini APIクライアントの導入**
   - `@google/genai` パッケージを追加し、`lib/gemini.ts` に初期化処理を実装しました。
2. **クソコード生成用APIエンドポイントの作成 (`app/api/generate-code/route.ts`)**
   - 太田さんが作成したプロンプト仕様(`ai-prompts.md`)に基づき、システムプロンプトおよびユーザープロンプトを構築してGeminiに投げてJSONレスポンスを返すエンドポイントを実装しました。
3. **フロントエンド用サービスクラスの作成 (`lib/alarm/CodeGeneratorService.ts`)**
   - フロントエンドから上記APIを叩くためのラッパー関数 `fetchCrapCode` と、レスポンスの型定義（`GeneratedChallenge` 等）を実装しました。
4. **エディタ画面への動作確認用組み込み (`app/challenge/page.tsx`)**
   - APIが正常に動くか確認するため、モックデータを外し、暫定的に `language: javascript`, `level: beginner` で `fetchCrapCode` を呼び出してエディタに初期値を表示させるように改修しました。

### 確認・テスト手順

1. ローカルの `.env.local` に `GEMINI_API_KEY=あなたのキー` を設定してください。（※検証で必要です）
2. `npm install` または `npm ci` で依存関係を更新し、`npm run dev` で起動します。
3. `/challenge` 画面にアクセスし、「後輩ちゃんがクソコードを準備中...」というローディングの後に、Geminiから生成された問題・コードがエディタに表示されることを確認してください。

### 残課題 / 次のステップ
- **CodeReviewService機能の実装**: 「提出」ボタン押下後に、修正されたコードを同様にGeminiへ投げて合否判定（Day6タスク）する処理がまだ未実装のため、次に進める予定です。
- 現在API呼び出しパラメータ (`language`, `level`) が `javascript` と `beginner` に一時的に固定されているため、Storeなどからユーザーの設定値を動的に渡す形に繋ぐ必要があります。
