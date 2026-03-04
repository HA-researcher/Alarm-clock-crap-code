"use client";

import { useRouter } from "next/navigation";

import { useAlarmStore } from "@/stores/alarmStore";

export default function HomePage() {
  const router = useRouter();
  const state = useAlarmStore((store) => store.state);
  const transition = useAlarmStore((store) => store.transition);
  const reset = useAlarmStore((store) => store.reset);
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
