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
    <div className="min-h-screen bg-gray-900">
      {/* メインコンテンツ */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: アラーム設定 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Configuration */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">Challenge Configuration</h2>
              
              {/* プログラミング言語 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Programming Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-gray-700">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 難易度 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value} className="bg-gray-700">
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* カスタム問題 */}
              {difficulty === "custom" && (
                <div className="mb-4 animate-in">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Challenge
                  </label>
                  <textarea
                    value={customProblem}
                    onChange={(e) => setCustomProblem(e.target.value)}
                    placeholder="Describe your custom challenge..."
                    className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            {/* Alarm Schedule */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">Alarm Schedule</h2>
              
              {/* 起床時刻 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wake-up Time
                </label>
                <input
                  type="time"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* 音量 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alarm Volume: {volume}%
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* 二度寝検知 */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Sleep Detection (PC Only)
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
                <p className="text-xs text-gray-400 mt-1">
                  Use camera to detect sleep and prevent snoozing
                </p>
              </div>

              {/* カメラプレビュー */}
              {enableMonitoring && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Camera Preview
                  </label>
                  <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center bg-gray-700/50">
                    <p className="text-gray-400 text-sm">Camera preview area</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右側: モバイル連携 */}
          <div className="space-y-6">
            {/* Mobile Connection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">Mobile Connection</h2>
              
              {/* QRコード領域 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  QR Code
                </label>
                <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center bg-gray-700/50">
                  <div className="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-12 h-12 mx-auto mb-2 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">QR Code will appear here</p>
                  </div>
                </div>
              </div>

              {/* 合言葉 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pairing Code
                </label>
                <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-center">
                  <span className="text-green-400 font-mono text-lg">ABC123</span>
                </div>
              </div>
            </div>

            {/* 状態表示 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Current State:</span>
                  <span className="text-sm font-medium text-green-400">{state}</span>
                </div>
                
                {state === "cleared" && (
                  <div className="mt-3 p-3 bg-green-900/50 border border-green-700 rounded-md">
                    <p className="text-sm text-green-300">
                      ✅ Challenge cleared. Ready for next alarm.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={startWaiting}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Save Alarm Configuration
            </button>
            
            <button
              type="button"
              onClick={reset}
              className="border border-gray-600 hover:bg-gray-800 py-3 px-6 rounded-lg transition-colors text-gray-300"
            >
              Reset
            </button>
          </div>
        </div>

        {/* デバッグ用 */}
        {isDev && (
          <div className="mt-8 rounded border border-gray-700 bg-gray-800 px-4 py-3 text-sm max-w-md mx-auto">
            <p className="mb-2 font-semibold text-gray-300">🔧 DEV ONLY</p>
            <button
              type="button"
              onClick={debugJumpToChallenge}
              className="w-full rounded border border-gray-600 px-3 py-1 hover:bg-gray-700 text-gray-300"
            >
              Jump to /challenge (alarming)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
