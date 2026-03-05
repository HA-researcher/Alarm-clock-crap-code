"use client";

import { useRouter } from "next/navigation";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";

export default function HomePage() {
  const router = useRouter();
  const state = useAlarmStore((store: AlarmStore) => store.state);
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);
  const setSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.setSleepDetectionOn);
  const transition = useAlarmStore((store: AlarmStore) => store.transition);
  const reset = useAlarmStore((store: AlarmStore) => store.reset);
  const isDev = process.env.NODE_ENV !== "production";

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

  const handleToggleSleepDetection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setSleepDetectionOn(true);
      } catch (err) {
        console.error("Camera permission denied:", err);
        setSleepDetectionOn(false);
        alert("カメラの許可が得られなかったため、二度寝検知機能をOFFにします。");
      }
    } else {
      setSleepDetectionOn(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold">目覚ましクソコード</h1>
      <p className="text-sm opacity-70">Home (/)</p>
      <p className="text-lg" data-testid="home-status">
        Current state: <span className="font-semibold">{state}</span>
      </p>

      {state === "cleared" && (
        <p className="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm">
          Challenge cleared. 次の目覚ましを開始できます。
        </p>
      )}

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="sleep-detection-toggle"
          checked={isSleepDetectionOn}
          onChange={handleToggleSleepDetection}
          className="h-5 w-5 rounded border-gray-300"
        />
        <label htmlFor="sleep-detection-toggle" className="text-sm cursor-pointer select-none">
          二度寝検知機能 (カメラ使用)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={startWaiting}
          data-testid="home-start-alarm"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Start Alarm
        </button>
        <button
          type="button"
          onClick={reset}
          data-testid="home-reset"
          className="rounded border border-black px-4 py-2"
        >
          Reset to idle
        </button>
      </div>

      {isDev && (
        <div className="rounded border border-amber-500/60 bg-amber-100/50 px-4 py-3 text-sm">
          <p className="mb-2 font-semibold">DEV ONLY</p>
          <button
            type="button"
            onClick={debugJumpToChallenge}
            data-testid="home-debug-challenge"
            className="rounded border border-black px-3 py-1"
          >
            Jump to /challenge (alarming)
          </button>
        </div>
      )}
    </main>
  );
}
