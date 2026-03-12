"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import { AlarmSettings } from "@/types/alarm";
import ChallengeConfig from "@/components/ChallengeConfig";
import AlarmConfig from "@/components/AlarmConfig";
import MobileConnection from "@/components/MobileConnection";
import { useSessionContext } from "@/components/providers/SessionProvider";
import type { SessionStatus } from "@/lib/session/types";
import { getSessionRepository } from "@/lib/session/factory";
import { buildNextAlarmDate } from "@/lib/alarm/time";
import { unlockAlarmAudio } from "@/lib/alarm/audioManager";

const MOCK_STATUS_OPTIONS: SessionStatus[] = [
  "waiting",
  "alarming",
  "coding",
  "monitoring",
  "cleared",
  "penalty",
  "force_stopped",
];

export default function HomePage() {
  const router = useRouter();

  const { roomId, snapshot, refresh, setMockStatus } = useSessionContext();

  const state = useAlarmStore((store: AlarmStore) => store.state);
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);
  const setSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.setSleepDetectionOn);
  const transition = useAlarmStore((store: AlarmStore) => store.transition);
  const reset = useAlarmStore((store: AlarmStore) => store.reset);
  const setAlarmTime = useAlarmStore((store: AlarmStore) => store.setAlarmTime);
  const setAlarmSettings = useAlarmStore((store: AlarmStore) => store.setAlarmSettings);

  const isDev = process.env.NODE_ENV !== "production";

  const [settings, setSettings] = useState<AlarmSettings>({
    alarmTime: "07:00",
    selectedLanguage: "javascript",
    difficulty: "medium",
    enableMonitoring: true,
    customProblem: "",
    volume: 70,
  });

  const updateSetting = <K extends keyof AlarmSettings>(
    key: K,
    value: AlarmSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const startWaiting = async () => {
    if (!settings.alarmTime) {
      alert("アラーム時刻を設定してください。");
      return;
    }

    // 初回ユーザー操作に紐づけて AudioContext を resume しておく。
    // これを先にやっておくことで、waiting → alarming に入ったときに
    // ブラウザの自動再生制約で音が鳴らない事故を減らす。
    try {
      await unlockAlarmAudio();
    } catch (error) {
      console.error("[startWaiting] unlockAlarmAudio failed:", error);
      // unlock に失敗しても設定保存と画面遷移は継続する
    }

    const newRoomId = crypto.randomUUID();
    const targetDate = buildNextAlarmDate(settings.alarmTime);

    // Zustand に設定を保存
    setAlarmTime(settings.alarmTime);
    setAlarmSettings({
      language: settings.selectedLanguage,
      level: settings.difficulty,
      customProblem: settings.customProblem,
      volume: settings.volume,
      roomId: newRoomId,
    });

    // Supabase に room を作成
    try {
      await getSessionRepository().createRoom?.(newRoomId, {
        targetTime: targetDate?.toISOString() ?? new Date().toISOString(),
        language: settings.selectedLanguage,
        level: settings.difficulty,
        customLevelPrompt: settings.customProblem || undefined,
        isSleepDetectionOn,
      });
    } catch (err) {
      console.error("[startWaiting] createRoom failed:", err);
      // room作成失敗でも待機画面には進む（standalone modeで動く）
    }

    const moved = transition("waiting");
    if (moved) {
      router.push("/waiting");
    }
  };

  const debugJumpToChallenge = () => {
    reset();
    setAlarmTime(settings.alarmTime);
    setAlarmSettings({
      language: settings.selectedLanguage,
      level: settings.difficulty,
      customProblem: settings.customProblem,
      volume: settings.volume,
    });

    const movedToWaiting = transition("waiting");
    if (!movedToWaiting) {
      return;
    }

    const movedToAlarming = transition("alarming");
    if (movedToAlarming) {
      router.push("/challenge");
    }
  };

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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              enableMonitoring={isSleepDetectionOn}
              onAlarmTimeChange={(value) => updateSetting("alarmTime", value)}
              onVolumeChange={(value) => updateSetting("volume", value)}
              onMonitoringToggle={handleToggleSleepDetection}
            />
          </div>

          <div>
            <MobileConnection state={state} />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => void startWaiting()}
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

        {isDev && (
          <div
            data-testid="home-dev-panel"
            className="mt-8 w-full max-w-2xl mx-auto rounded border border-amber-500/60 bg-amber-100/50 px-4 py-3 text-left text-sm text-black"
          >
            <p className="mb-2 font-semibold">DEV ONLY</p>
            <div className="mb-3">
              <button
                type="button"
                onClick={debugJumpToChallenge}
                data-testid="home-debug-challenge"
                className="rounded border border-black px-3 py-1 hover:bg-black/10"
              >
                Jump to /challenge (alarming)
              </button>
            </div>

            <div
              data-testid="home-session-status"
              className="mb-3 rounded border border-black/20 bg-white/60 p-3"
            >
              <p>
                roomId: <span className="font-semibold">{roomId}</span>
              </p>
              <p>
                source: <span className="font-semibold">{snapshot?.source ?? "unknown"}</span>
              </p>
              <p>
                connection:{" "}
                <span className="font-semibold">{snapshot?.connection ?? "connecting"}</span>
              </p>
              <p>
                db status: <span className="font-semibold">{snapshot?.status ?? "waiting"}</span>
              </p>
              {snapshot?.error && (
                <p data-testid="home-session-error" className="text-red-700">
                  error: {snapshot.error}
                </p>
              )}
              <button
                type="button"
                onClick={() => { void refresh(); }}
                data-testid="home-session-refresh"
                className="mt-2 rounded border border-black px-3 py-1 hover:bg-black/10"
              >
                Refresh Session Snapshot
              </button>
            </div>

            {snapshot?.source === "mock" && setMockStatus && (
              <div data-testid="home-mock-controls" className="rounded border border-black/20 bg-white/60 p-3">
                <p className="mb-2 font-semibold">Mock session status controls</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_STATUS_OPTIONS.map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      data-testid={`home-mock-status-${statusOption}`}
                      className="rounded border border-black px-2 py-1 hover:bg-black/10"
                      onClick={() => { void setMockStatus(statusOption); }}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}