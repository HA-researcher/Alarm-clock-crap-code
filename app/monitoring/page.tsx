"use client";

import { useRouter } from "next/navigation";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import { useSleepDetection } from "@/components/useSleepDetection";

export default function MonitoringPage() {
  const router = useRouter();
  const state = useAlarmStore((store: AlarmStore) => store.state);
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);
  const transition = useAlarmStore((store: AlarmStore) => store.transition);
  const reset = useAlarmStore((store: AlarmStore) => store.reset);

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
      <h1 className="text-3xl font-bold">Monitoring</h1>
      <p className="text-sm opacity-70">/monitoring</p>

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
              Initializing AI...
            </div>
          )}
        </div>
      )}

      {state === "penalty" && (
        <div className="animate-pulse bg-red-500/20 border-2 border-red-500 text-red-600 font-bold px-6 py-4 rounded-xl shadow-lg mt-4 w-full max-w-sm">
          ⚠️ 起きてください！二度寝を検知しました！ ⚠️
        </div>
      )}

      <p className="text-lg">
        Current state: <span className="font-semibold">{state}</span>
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={clearChallenge}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Mark Cleared
        </button>
        <button
          type="button"
          onClick={backToHome}
          className="rounded border border-black px-4 py-2"
        >
          Reset
        </button>
      </div>
    </main>
  );
}
