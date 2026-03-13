# PR: USE_MOCK_CHALLENGE の実行時切り替え対応 / Enable runtime toggle for USE_MOCK_CHALLENGE

## 概要 / Overview
`USE_MOCK_CHALLENGE` の値を API リクエスト時に動的に決定できるように変更しました。これにより、環境変数を変更することなく、モック課題と AI 生成課題を切り替えてテストすることが可能になります。
また、コメントアウトされていた Gemini API による課題生成ロジックを有効化しました。

Changed the `USE_MOCK_CHALLENGE` value to be determined dynamically during API requests. This allows toggling between mock challenges and AI-generated challenges for testing without changing environment variables.
Also enabled the previously commented-out Gemini API logic for challenge generation.

## 変更内容 / Changes
- `app/api/generate-code/route.ts`
  - `POST` リクエストのボディから `useMock: boolean` を受け取るように変更。
  - ボディに指定がない場合は `process.env.USE_MOCK_CHALLENGE` をデフォルトとして使用。
  - Gemini 1.5 Flash を使用した課題生成ロジックを有効化。
  - 一部のエラーメッセージを日本語に統一。

- `app/api/generate-code/route.ts`
  - Modified to accept `useMock: boolean` from the `POST` request body.
  - Defaults to `process.env.USE_MOCK_CHALLENGE` if not specified in the body.
  - Enabled challenge generation logic using Gemini 1.5 Flash.
  - Unified some error messages into Japanese.

## 影響範囲 / Impact
- `app/api/generate-code` API を呼び出す全てのクライアントコード。
- `USE_MOCK_CHALLENGE` 環境変数の挙動は維持されますが、リクエストボディによるオーバーライドが可能になります。

- All client code calling the `app/api/generate-code` API.
- The behavior of the `USE_MOCK_CHALLENGE` environment variable is preserved, but can now be overridden by the request body.

## 動作確認方法 / Verification
- [ ] モック使用 (`useMock: true`): 期待通りモック課題が返されることを確認。
- [ ] AI 生成使用 (`useMock: false`): Gemini API を通じて課題が生成されることを確認。
- [ ] パラメータなし: `.env.local` の設定に従って動作することを確認。

- [ ] Use Mock (`useMock: true`): Confirmed that mock challenges are returned as expected.
- [ ] Use AI Generation (`useMock: false`): Confirmed that challenges are generated via the Gemini API.
- [ ] No parameter: Confirmed consistent behavior with `.env.local` settings.
