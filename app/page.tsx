'use client';

import { useState } from 'react';

export default function Home() {
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [volume, setVolume] = useState(50);
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('normal');
  const [customPrompt, setCustomPrompt] = useState('');
  const [sleepDetection, setSleepDetection] = useState(true);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy (入門)' },
    { value: 'normal', label: 'Normal (初級)' },
    { value: 'hard', label: 'Hard (上級)' },
    { value: 'custom', label: 'Custom (カスタム)' },
  ];

  // ダミーのQRコードと合言葉
  const qrCodeUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSJibGFjayI+UVIgQ29kZTwvdGV4dD4KPC9zdmc+';
  const passCode = 'A1B2C3';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a1a] via-[#1a3a3a] to-[#0a1a1a] p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* メインカード */}
        <div className="bg-[#1a2a2a] rounded-2xl shadow-2xl border border-[#2a4a4a] p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#66bb6a] mb-2">目覚ましクソコード</h1>
            <p className="text-[#a0a0a0]">起床時刻とプログラミング課題を設定してください</p>
          </div>

          {/* 設定フォーム */}
          <div className="space-y-6">
            {/* 起床時刻 */}
            <div className="bg-[#0f1f1f] rounded-lg p-4">
              <label className="block text-[#66bb6a] font-semibold mb-2">
                起床時刻
              </label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a2a2a] border border-[#2a4a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#66bb6a] focus:border-transparent"
              />
            </div>

            {/* 音量スライダー */}
            <div className="bg-[#0f1f1f] rounded-lg p-4">
              <label className="block text-[#66bb6a] font-semibold mb-2">
                音量: {volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-[#1a2a2a] rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* 言語選択 */}
            <div className="bg-[#0f1f1f] rounded-lg p-4">
              <label className="block text-[#66bb6a] font-semibold mb-2">
                プログラミング言語
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a2a2a] border border-[#2a4a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#66bb6a] focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 難易度選択 */}
            <div className="bg-[#0f1f1f] rounded-lg p-4">
              <label className="block text-[#66bb6a] font-semibold mb-2">
                難易度
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a2a2a] border border-[#2a4a4a] rounded-lg text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#66bb6a] focus:border-transparent"
              >
                {difficulties.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>

              {/* カスタム選択時のテキストエリア */}
              {difficulty === 'custom' && (
                <div className="mt-4">
                  <label className="block text-[#66bb6a] font-semibold mb-2">
                    カスタム問題の要望
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="例: Reactの不要な再レンダリングを修正する問題"
                    className="w-full px-4 py-3 bg-[#1a2a2a] border border-[#2a4a4a] rounded-lg text-[#e0e0e0] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#66bb6a] focus:border-transparent h-24 resize-none"
                  />
                </div>
              )}
            </div>

            {/* 二度寝検知トグル */}
            <div className="bg-[#0f1f1f] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#66bb6a] font-semibold">二度寝検知機能</h3>
                  <p className="text-[#a0a0a0] text-sm mt-1">
                    Webカメラで顔の状態を監視します
                  </p>
                </div>
                <button
                  onClick={() => setSleepDetection(!sleepDetection)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    sleepDetection ? 'bg-[#66bb6a]' : 'bg-[#2a4a4a]'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      sleepDetection ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* カメラプレビュー */}
            {sleepDetection && (
              <div className="bg-[#0f1f1f] rounded-lg p-4">
                <label className="block text-[#66bb6a] font-semibold mb-2">
                  カメラプレビュー
                </label>
                <div className="bg-[#0a1a1a] rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-[#2a4a4a]">
                  <div className="text-center">
                    <div className="text-[#666666] mb-2">📷</div>
                    <p className="text-[#666666] text-sm">カメラ権限が必要です</p>
                  </div>
                </div>
              </div>
            )}

            {/* QRコードと合言葉 */}
            <div className="bg-[#0f1f1f] rounded-lg p-4">
              <label className="block text-[#66bb6a] font-semibold mb-4">
                スマホ連携
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={qrCodeUrl}
                      alt="QRコード"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-[#a0a0a0] text-sm mt-2">QRコード</p>
                </div>
                <div className="text-center">
                  <div className="bg-[#0a1a1a] px-6 py-3 rounded-lg border border-[#2a4a4a]">
                    <p className="text-[#66bb6a] font-mono text-xl font-bold">
                      {passCode}
                    </p>
                  </div>
                  <p className="text-[#a0a0a0] text-sm mt-2">合言葉</p>
                </div>
              </div>
            </div>

            {/* 待機ボタン */}
            <button
              className="w-full bg-gradient-to-r from-[#66bb6a] to-[#4caf50] hover:from-[#4caf50] hover:to-[#388e3c] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              この設定で待機する
            </button>
          </div>
        </div>

        {/* 注意書き */}
        <div className="mt-6 text-center text-[#a0a0a0] text-sm">
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
