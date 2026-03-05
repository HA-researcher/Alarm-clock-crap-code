"use client";

import { useRouter } from "next/navigation";

import { useAlarmStore } from "@/stores/alarmStore";

export default function WaitingPage() {
  const router = useRouter();
  const state = useAlarmStore((store) => store.state);
  const transition = useAlarmStore((store) => store.transition);
  const reset = useAlarmStore((store) => store.reset);

  const triggerAlarm = () => {
    const moved = transition("alarming");
    if (moved) {
      router.push("/challenge");
    }
  };

  const backToHome = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold">Waiting</h1>
      <p className="text-sm opacity-70">/waiting</p>
      <p className="text-lg">
        Current state: <span className="font-semibold">{state}</span>
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={triggerAlarm}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Trigger Alarm
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
