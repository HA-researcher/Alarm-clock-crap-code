# PR: 監視画面からのカメラプレビュー削除 / Remove Camera Preview from Monitoring Page

## 概要 / Overview
監視画面において、ユーザーのプライバシー保護およびUIの簡素化のため、カメラ映像の直接的な表示（プレビュー）を削除しました。
睡眠検知機能は引き続きバックグラウンドで動作し、システムのステータスをテキストベースで分かりやすく表示するように変更しました。

Removed the direct camera feed (preview) from the monitoring screen to protect user privacy and simplify the UI.
Sleep detection functionality continues to operate in the background, and the system status is now displayed clearly via text-based indicators.

## 変更内容 / Changes
- `app/monitoring/page.tsx`
  - 可視状態の `<video>` 要素および映像オーバーレイ（録画時間、ISO、FPS等）を削除。
  - 睡眠検知ロジックの継続のため、非表示（`hidden`）の状態でビデオ要素を維持。
  - カメラ映像に代わり、「SYSTEM ACTIVE」や「! PENALTY !」といったステータスを中央に表示するようデザインを修正。

- `app/monitoring/page.tsx`
  - Removed the visible `<video>` element and image overlays (recording time, ISO, FPS, etc.).
  - Maintained the video element in a hidden state to preserve sleep detection logic.
  - Re-designed the layout to display statuses like "SYSTEM ACTIVE" or "! PENALTY !" in the center, replacing the camera feed.

## 影響範囲 / Impact
- 監視画面のUI。
- ユーザーにカメラ映像が表示されなくなりますが、睡眠検知によるアラーム発動等の機能は影響を受けません。

- UI of the monitoring page.
- Users will no longer see their own camera feed, but features like alarm triggering based on sleep detection remain unaffected.

## 動作確認方法 / Verification
- [ ] 監視画面を開き、カメラ映像が表示されないことを確認。
- [ ] システムステータス（SYSTEM ACTIVE等）が正しく表示されることを確認。
- [ ] （可能であれば）目を閉じるなどしてペナルティ状態に遷移することを確認。

- [ ] Open the monitoring page and confirm the camera feed is not displayed.
- [ ] Confirm the system status (e.g., SYSTEM ACTIVE) is displayed correctly.
- [ ] (If possible) Confirm transition to the penalty state by closing eyes.
