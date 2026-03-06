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

  // 現在の状態を取得（右側の MobileConnection に渡すために使う）
  const state = useAlarmStore((store: AlarmStore) => store.state);

  // 二度寝検知のON/OFF状態を取得
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);

  // 二度寝検知をON/OFFする関数
  const setSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.setSleepDetectionOn);

  // state を waiting / alarming などへ遷移させる関数
  const transition = useAlarmStore((store: AlarmStore) => store.transition);

  // ストアを初期状態へ戻す関数
  const reset = useAlarmStore((store: AlarmStore) => store.reset);

  // ★追加
  // Home で設定したアラーム時刻を Zustand に保存するための関数
  // waiting 画面ではこの値を読んで、カウントダウンを表示する
  const setAlarmTime = useAlarmStore((store: AlarmStore) => store.setAlarmTime);

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
    // 追加
    // アラーム時刻が空なら waiting に進ませない
    // waiting 画面では alarmTime が必須なので、ここで最低限チェックする
    if (!settings.alarmTime) {
      alert("アラーム時刻を設定してください。");
      return;
    }

    // 追加
    // Home で入力された時刻を Zustand に保存する
    // これを保存しておくことで、/waiting に遷移したあとも
    // 設定した時刻を元にカウントダウンを開始できる
    setAlarmTime(settings.alarmTime);

    // 既存どおり、state を waiting に遷移させる
    const moved = transition("waiting");
    if (moved) {
      router.push("/waiting");
    }
  };

  const debugJumpToChallenge = () => {
    reset();

    // 追加
    // DEV で直接 challenge に飛ぶ場合でも、
    // いま設定中の alarmTime を保存しておく
    // （このPRでは waiting の動作確認にも使えるようにしておくと便利）
    setAlarmTime(settings.alarmTime);

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
        // カメラ権限を事前に確認
        await navigator.mediaDevices.getUserMedia({ video: true });

        // 権限が取れたら Zustand と settings の両方を ON にする
        setSleepDetectionOn(true);
        updateSetting("enableMonitoring", true);
      } catch (err) {
        console.error("Camera permission denied:", err);

        // 権限拒否時は OFF に戻す
        setSleepDetectionOn(false);
        updateSetting("enableMonitoring", false);
        alert("カメラの許可が得られなかったため、二度寝検知機能をOFFにします。");
      }
    } else {
      // OFF にする場合は Zustand と settings の両方を更新する
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