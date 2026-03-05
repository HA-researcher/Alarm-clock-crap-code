"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAlarmStore } from "@/stores/alarmStore";
import { PROGRAMMING_LANGUAGES, DIFFICULTY_LEVELS } from "@/app/util/config";

export default function HomePage() {
  const router = useRouter();
  const state = useAlarmStore((store) => store.state);
  const transition = useAlarmStore((store) => store.transition);
  const reset = useAlarmStore((store) => store.reset);
  const isDev = process.env.NODE_ENV !== "production";

  // 設定状態
  const [alarmTime, setAlarmTime] = useState("07:00");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");
  const [enableMonitoring, setEnableMonitoring] = useState(true);
  const [customProblem, setCustomProblem] = useState("");
  const [volume, setVolume] = useState(70);

  const startWaiting = () => {
    const moved = transition("waiting");
    if (moved) {
      router.push("/waiting");
    }
  };

  const debugJumpToChallenge = () => {
    reset();
    const movedToWaiting = transition("waiting");
    if (!movedToWaiting) {
      return;
    }

    const movedToAlarming = transition("alarming");
    if (movedToAlarming) {
      router.push("/challenge");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-12 px-6 py-16 bg-green-900">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-9 h-9 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          目覚まし設定
        </h1>
        <p className="text-sm text-green-200">
          起床時刻とプログラミング課題を設定してください
        </p>
      </div>

      {/* 設定カード */}
      <div className="w-full max-w-md bg-green-800 rounded-lg shadow-lg p-8 space-y-8">
        {/* 時刻設定 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-green-200 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            起床時刻
          </label>
          <input
            type="time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="w-full px-3 py-2 bg-green-700 text-green-100 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* アラーム音量 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-green-200 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0"
              />
            </svg>
            アラーム音量: {volume}%
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-green-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* 言語選択 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-green-200 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            プログラミング言語
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-green-700 text-green-100 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-green-700">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* 難易度選択 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-green-200">
            難易度
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 bg-green-700 text-green-100 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="easy" className="bg-green-700">初級</option>
            <option value="medium" className="bg-green-700">中級</option>
            <option value="hard" className="bg-green-700">上級</option>
            <option value="custom" className="bg-green-700">カスタム</option>
          </select>
        </div>

        {/* カスタム問題（難易度がcustomの時のみ表示） */}
        {difficulty === "custom" && (
          <div className="space-y-3 animate-in">
            <label className="block text-sm font-medium text-green-200">
              📝 カスタム問題
            </label>
            <textarea
              value={customProblem}
              onChange={(e) => setCustomProblem(e.target.value)}
              placeholder="ここに問題を入力してください..."
              className="w-full px-3 py-2 bg-green-700 text-green-100 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none placeholder-green-300"
            />
          </div>
        )}

        {/* 二度寝検知設定 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-green-200 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              二度寝検知 (PCのみ)
            </label>
            <button
              type="button"
              onClick={() => setEnableMonitoring(!enableMonitoring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableMonitoring ? "bg-green-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableMonitoring ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-green-300">
            カメラで顔を検知し、二度寝を防ぎます
          </p>
        </div>

        {/* カメラプレビュー */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-green-200 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            カメラプレビュー
          </label>
          <div className="w-full h-32 border-2 border-dashed border-green-600 rounded-md flex items-center justify-center bg-green-700/50">
            <p className="text-green-300 text-sm">カメラプレビュー表示領域</p>
          </div>
        </div>
      </div>

      {/* 状態表示 */}
      <div className="text-center">
        <p className="text-sm text-green-200 mb-4">
          現在の状態: <span className="font-semibold">{state}</span>
        </p>
        
        {state === "cleared" && (
          <p className="rounded border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm mb-4 text-green-300">
            ✅ Challenge cleared. 次の目覚ましを開始できます。
          </p>
        )}
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={startWaiting}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
        >
          🚀 アラーム開始
        </button>
        
        <button
          type="button"
          onClick={reset}
          className="w-full border border-green-600 py-2 px-4 rounded-lg hover:bg-green-800 transition-colors text-green-200"
        >
          リセット
        </button>
      </div>

      {/* デバッグ用 */}
      {isDev && (
        <div className="rounded border border-green-500/60 bg-green-700/50 px-4 py-3 text-sm w-full max-w-md">
          <p className="mb-2 font-semibold text-green-200">🔧 DEV ONLY</p>
          <button
            type="button"
            onClick={debugJumpToChallenge}
            className="w-full rounded border border-green-400 px-3 py-1 hover:bg-green-600 text-green-100"
          >
            Jump to /challenge (alarming)
          </button>
        </div>
      )}
    </main>
  );
}
