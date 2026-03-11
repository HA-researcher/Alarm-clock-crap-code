"use client";

import { useRouter } from "next/navigation";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import { useSleepDetection } from "@/components/useSleepDetection";
import { useAlarmAudio } from "@/lib/alarm/useAlarmAudio";

export default function MonitoringPage() {
  const router = useRouter();
  const state = useAlarmStore((store: AlarmStore) => store.state);
  const volume = useAlarmStore((store: AlarmStore) => store.volume);
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);
  const transition = useAlarmStore((store: AlarmStore) => store.transition);
  const reset = useAlarmStore((store: AlarmStore) => store.reset);

  // penalty時にアラーム音を鳴らす
  useAlarmAudio(state, volume);

  const clearChallenge = () => {
    const moved = transition("cleared");
    if (moved) {
      router.push("/");
    }
  };

  const backToHome = () => {
    reset();
    router.push("/");
  };

  const handleSleepDetected = () => {
    if (state !== "penalty") {
      transition("penalty");
    }
  };

  const handleAwakeDetected = () => {
    if (state === "penalty") {
      transition("monitoring");
    }
  };

  const { videoRef, isInitializing } = useSleepDetection(
    handleSleepDetected,
    handleAwakeDetected
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold">
        {state === "penalty" ? "⚠️ 二度寝検知！" : "👀 起床確認中..."}
      </h1>

      {isSleepDetectionOn && (
        <div className="relative w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-md">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm">
              カメラ起動中...
            </div>
          )}
        </div>
      )}

      {state === "penalty" && (
        <div className="animate-pulse bg-red-500/20 border-2 border-red-500 text-red-600 font-bold px-6 py-4 rounded-xl shadow-lg w-full max-w-sm">
          ⚠️ 起きてください！二度寝を検知しました！ ⚠️
        </div>
      )}

      {state === "monitoring" && (
        <p className="text-green-400 font-semibold">起きていることを確認中... 目を開けていてください！</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={clearChallenge}
          className="rounded-lg bg-green-600 hover:bg-green-700 px-6 py-3 text-white font-semibold transition-colors"
        >
          ✅ 完全に起床した
        </button>
        <button
          type="button"
          onClick={backToHome}
          className="rounded-lg border border-gray-600 hover:bg-gray-800 px-4 py-3 text-gray-300 transition-colors"
        >
          リセット
        </button>
      </div>
    </main>
  );
}
