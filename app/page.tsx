"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAlarmStore } from "@/stores/alarmStore";

export default function HomePage() {
  const router = useRouter();

  // main ブランチの状態管理
  const state = useAlarmStore((store) => store.state);
  const transition = useAlarmStore((store) => store.transition);
  const reset = useAlarmStore((store) => store.reset);
  const isDev = process.env.NODE_ENV !== "production";

  // feature/home-ui-mock のUIローカル状態
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [volume, setVolume] = useState(50);
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("normal");
  const [customPrompt, setCustomPrompt] = useState("");
  const [sleepDetection, setSleepDetection] = useState(true);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "typescript", label: "TypeScript" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
  ];

  const difficulties = [
    { value: "easy", label: "Easy (入門)" },
    { value: "normal", label: "Normal (初級)" },
    { value: "hard", label: "Hard (上級)" },
    { value: "custom", label: "Custom (カスタム)" },
  ];

  // ダミーのQRコードと合言葉
  const qrCodeUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSJibGFjayI+UVIgQ29kZTwvdGV4dD4KPC9zdmc+";
  const passCode = "A1B2C3";

  const startWaiting = () => {
    // TODO: 将来的にここで設定値を store に保存する（wakeUpTime, volume, language, difficulty ...）
    const moved = transition("waiting");
    if (moved) router.push("/waiting");
  };

  const debugJumpToChallenge = () => {
    reset();
    const movedToWaiting = transition("waiting");
    if (!movedToWaiting) return;

    const movedToAlarming = transition("alarming");
    if (movedToAlarming) router.push("/challenge");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a1a] via-[#1a3a3a] to-[#0a1a1a] p-4">
      <div className="mx-auto max-w-2xl py-8">
        {/* メインカード */}
        <div className="rounded-2xl border border-[#2a4a4a] bg-[#1a2a2a] p-8 shadow-2xl">
          {/* ヘッダー */}
          <div className="mb-4 text-center">
            <h1 className="mb-2 text-3xl font-bold text-[#66bb6a]">
              目覚ましクソコード
            </h1>
            <p className="text-[#a0a0a0]">起床時刻とプログラミング課題を設定してください</p>

            {/* main 側の状態表示（テスト・デバッグ用途） */}
            <p className="mt-3 text-sm text-[#a0a0a0]" data-testid="home-status">
              Current state: <span className="font-semibold text-[#e0e0e0]">{state}</span>
            </p>

            {state === "cleared" && (
              <p className="mt-3 rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm text-[#e0e0e0]">
                Challenge cleared. 次の目覚ましを開始できます。
              </p>
            )}
          </div>

          {/* 設定フォーム */}
          <div className="space-y-6">
            {/* 起床時刻 */}
            <div className="rounded-lg bg-[#0f1f1f] p-4">
              <label className="mb-2 block font-semibold text-[#66bb6a]">起床時刻</label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="w-full rounded-lg border border-[#2a4a4a] bg-[#1a2a2a] px-4 py-3 text-[#e0e0e0] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
              />
            </div>

            {/* 音量スライダー */}
            <div className="rounded-lg bg-[#0f1f1f] p-4">
              <label className="mb-2 block font-semibold text-[#66bb6a]">
                音量: {volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#1a2a2a]"
              />
            </div>

            {/* 言語選択 */}
            <div className="rounded-lg bg-[#0f1f1f] p-4">
              <label className="mb-2 block font-semibold text-[#66bb6a]">
                プログラミング言語
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-[#2a4a4a] bg-[#1a2a2a] px-4 py-3 text-[#e0e0e0] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 難易度選択 */}
            <div className="rounded-lg bg-[#0f1f1f] p-4">
              <label className="mb-2 block font-semibold text-[#66bb6a]">難易度</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-[#2a4a4a] bg-[#1a2a2a] px-4 py-3 text-[#e0e0e0] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
              >
                {difficulties.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>

              {/* カスタム選択時のテキストエリア */}
              {difficulty === "custom" && (
                <div className="mt-4">
                  <label className="mb-2 block font-semibold text-[#66bb6a]">
                    カスタム問題の要望
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="例: Reactの不要な再レンダリングを修正する問題"
                    className="h-24 w-full resize-none rounded-lg border border-[#2a4a4a] bg-[#1a2a2a] px-4 py-3 text-[#e0e0e0] placeholder-[#666666] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#66bb6a]"
                  />
                </div>
              )}
            </div>

            {/* 二度寝検知トグル */}
            <div className="rounded-lg bg-[#0f1f1f] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#66bb6a]">二度寝検知機能</h3>
                  <p className="mt-1 text-sm text-[#a0a0a0]">
                    Webカメラで顔の状態を監視します
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSleepDetection(!sleepDetection)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    sleepDetection ? "bg-[#66bb6a]" : "bg-[#2a4a4a]"
                  }`}
                  aria-pressed={sleepDetection}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      sleepDetection ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* カメラプレビュー */}
            {sleepDetection && (
              <div className="rounded-lg bg-[#0f1f1f] p-4">
                <label className="mb-2 block font-semibold text-[#66bb6a]">
                  カメラプレビュー
                </label>
                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-[#2a4a4a] bg-[#0a1a1a]">
                  <div className="text-center">
                    <div className="mb-2 text-[#666666]">📷</div>
                    <p className="text-sm text-[#666666]">カメラ権限が必要です</p>
                  </div>
                </div>
              </div>
            )}

            {/* QRコードと合言葉 */}
            <div className="rounded-lg bg-[#0f1f1f] p-4">
              <label className="mb-4 block font-semibold text-[#66bb6a]">スマホ連携</label>
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="text-center">
                  <div className="rounded-lg bg-white p-4">
                    <img src={qrCodeUrl} alt="QRコード" className="h-32 w-32" />
                  </div>
                  <p className="mt-2 text-sm text-[#a0a0a0]">QRコード</p>
                </div>
                <div className="text-center">
                  <div className="rounded-lg border border-[#2a4a4a] bg-[#0a1a1a] px-6 py-3">
                    <p className="font-mono text-xl font-bold text-[#66bb6a]">{passCode}</p>
                  </div>
                  <p className="mt-2 text-sm text-[#a0a0a0]">合言葉</p>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <button
              type="button"
              onClick={startWaiting}
              data-testid="home-start-alarm"
              className="w-full transform rounded-lg bg-gradient-to-r from-[#66bb6a] to-[#4caf50] px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-[#4caf50] hover:to-[#388e3c]"
            >
              この設定で待機する
            </button>

            <button
              type="button"
              onClick={reset}
              data-testid="home-reset"
              className="w-full rounded-lg border border-[#2a4a4a] bg-transparent px-6 py-3 font-semibold text-[#e0e0e0] hover:bg-white/5"
            >
              Reset to idle
            </button>

            {isDev && (
              <div className="rounded border border-amber-500/60 bg-amber-100/10 px-4 py-3 text-sm text-[#e0e0e0]">
                <p className="mb-2 font-semibold text-amber-300">DEV ONLY</p>
                <button
                  type="button"
                  onClick={debugJumpToChallenge}
                  data-testid="home-debug-challenge"
                  className="rounded border border-[#2a4a4a] bg-black/30 px-3 py-1 hover:bg-black/40"
                >
                  Jump to /challenge (alarming)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 注意書き */}
        <div className="mt-6 text-center text-sm text-[#a0a0a0]">
          <p>⚠️ PCは電源に繋ぎ、スリープさせずに画面を開いたまま就寝してください</p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #66bb6a;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #66bb6a;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}