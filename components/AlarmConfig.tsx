"use client";

interface AlarmConfigProps {
  alarmTime: string;
  volume: number;
  enableMonitoring: boolean;
  onAlarmTimeChange: (value: string) => void;
  onVolumeChange: (value: number) => void;
  onMonitoringToggle: () => void;
}

export default function AlarmConfig({
  alarmTime,
  volume,
  enableMonitoring,
  onAlarmTimeChange,
  onVolumeChange,
  onMonitoringToggle,
}: AlarmConfigProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-green-400 mb-4">アラーム設定</h2>
      
      {/* 起床時刻 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          起床時刻
        </label>
        <input
          type="time"
          value={alarmTime}
          onChange={(e) => onAlarmTimeChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* 音量 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          アラーム音量: {volume}%
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* 二度寝検知 */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            二度寝検知 (PCのみ)
          </label>
          <button
            type="button"
            onClick={onMonitoringToggle}
            aria-label={enableMonitoring ? "二度寝検知を無効にする" : "二度寝検知を有効にする"}
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
          カメラで顔を検知し、二度寝を防ぎます
        </p>
      </div>

      {/* { カメラプレビュー }
      {enableMonitoring && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            カメラプレビュー
          </label>
          <div className="w-full aspect-video border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center bg-gray-700/50">
            <p className="text-gray-400 text-sm">カメラプレビュー表示領域</p>
          </div>
        </div>
      )} */}
    </div>
  );
}
