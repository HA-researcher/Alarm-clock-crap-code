"use client";

import { useRouter } from "next/navigation";

import { useSessionContext } from "@/components/providers/SessionProvider";
import type { SessionStatus } from "@/lib/session/types";
import { useAlarmStore } from "@/stores/alarmStore";

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
  const state = useAlarmStore((store) => store.state);
  const transition = useAlarmStore((store) => store.transition);
  const reset = useAlarmStore((store) => store.reset);
  const { roomId, snapshot, refresh, setMockStatus } = useSessionContext();
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
        <div
          data-testid="home-dev-panel"
          className="w-full rounded border border-amber-500/60 bg-amber-100/50 px-4 py-3 text-left text-sm"
        >
          <p className="mb-2 font-semibold">DEV ONLY</p>
          <div className="mb-3">
            <button
              type="button"
              onClick={debugJumpToChallenge}
              data-testid="home-debug-challenge"
              className="rounded border border-black px-3 py-1"
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
            <p>
              updatedAt: <span className="font-semibold">{snapshot?.updatedAt ?? "-"}</span>
            </p>
            {snapshot?.error && (
              <p data-testid="home-session-error" className="text-red-700">
                error: {snapshot.error}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              data-testid="home-session-refresh"
              className="mt-2 rounded border border-black px-3 py-1"
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
                    className="rounded border border-black px-2 py-1"
                    onClick={() => {
                      void setMockStatus(statusOption);
                    }}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
