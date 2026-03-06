"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import { AlarmSettings } from "@/types/alarm";
import ChallengeConfig from "@/components/ChallengeConfig";
import AlarmConfig from "@/components/AlarmConfig";
import MobileConnection from "@/components/MobileConnection";

export default function HomePage() {
  const router = useRouter();
  const state = useAlarmStore((store: AlarmStore) => store.state);
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);
  const setSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.setSleepDetectionOn);
  const transition = useAlarmStore((store: AlarmStore) => store.transition);
  const reset = useAlarmStore((store: AlarmStore) => store.reset);
  const isDev = process.env.NODE_ENV !== "production";

  // 設定状態を1つのオブジェクトにまとめる
  const [settings, setSettings] = useState<AlarmSettings>({
    alarmTime: "07:00",
    selectedLanguage: "javascript",
    difficulty: "medium",
    enableMonitoring: true,
    customProblem: "",
    volume: 70,
  });

  // 個別のセッター関数
  const updateSetting = <K extends keyof AlarmSettings>(
    key: K,
    value: AlarmSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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

  // e.target.checked ではなく、現在の store の状態を反転させてトグルするよう変更
  const handleToggleSleepDetection = async () => {
    const nextState = !isSleepDetectionOn;
    
    if (nextState) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setSleepDetectionOn(true);
        updateSetting("enableMonitoring", true);
      } catch (err) {
        console.error("Camera permission denied:", err);
        setSleepDetectionOn(false);
        updateSetting("enableMonitoring", false);
        alert("カメラの許可が得られなかったため、二度寝検知機能をOFFにします。");
      }
    } else {
      setSleepDetectionOn(false);
      updateSetting("enableMonitoring", false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* メインコンテンツ */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: アラーム設定 */}
          <div className="lg:col-span-2 space-y-6">
            <ChallengeConfig
              selectedLanguage={settings.selectedLanguage}
              difficulty={settings.difficulty}
              customProblem={settings.customProblem}
              onLanguageChange={(value) => updateSetting("selectedLanguage", value)}
              onDifficultyChange={(value) => updateSetting("difficulty", value)}
              onCustomProblemChange={(value) => updateSetting("customProblem", value)}
            />
            
            <AlarmConfig
              alarmTime={settings.alarmTime}
              volume={settings.volume}
              enableMonitoring={isSleepDetectionOn} // Zustandのステートを渡す
              onAlarmTimeChange={(value) => updateSetting("alarmTime", value)}
              onVolumeChange={(value) => updateSetting("volume", value)}
              onMonitoringToggle={handleToggleSleepDetection} // カメラ権限取得処理付きのトグル関数を渡す
            />
          </div>

          {/* 右側: モバイル連携 */}
          <div>
            <MobileConnection state={state} />
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={startWaiting}
              data-testid="home-start-alarm"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              アラーム設定を保存
            </button>
            
            <button
              type="button"
              onClick={reset}
              data-testid="home-reset"
              className="border border-gray-600 hover:bg-gray-800 py-3 px-6 rounded-lg transition-colors text-gray-300"
            >
              リセット
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