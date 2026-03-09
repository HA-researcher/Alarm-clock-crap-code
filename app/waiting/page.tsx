"use client";

import { useRouter } from "next/navigation";
import { useAlarmStore } from "@/stores/alarmStore";

import { HeaderBar } from "@/components/waiting/HeaderBar";
import { StatusBadge } from "@/components/waiting/StatusBadge";
import { TimerDisplay } from "@/components/waiting/TimerDisplay";
import { DashboardCards } from "@/components/waiting/DashboardCards";
import { CriticalDirectives } from "@/components/waiting/CriticalDirectives";

export default function WaitingPage() {
  const router = useRouter();
  const transition = useAlarmStore((store) => store.transition);

  // デバッグ用: 背景をダブルクリックでアラーム画面に遷移
  const handleDoubleClick = () => {
    const moved = transition("alarming");
    if (moved) {
      router.push("/challenge");
    }
  };

  return (
    <div
      className="min-h-screen bg-[#050805] font-mono text-green-500 selection:bg-green-500/30"
      onDoubleClick={handleDoubleClick}
      title="Double click to test alarm"
    >
      <HeaderBar />
      <main className="flex flex-col items-center pb-12">
        <StatusBadge />
        <TimerDisplay />
        <DashboardCards />
        <CriticalDirectives />
      </main>
    </div>
  );
}
