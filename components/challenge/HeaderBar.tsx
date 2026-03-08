import { AlertCircle, Bell } from "lucide-react";

interface HeaderBarProps {
  onEmergencyStop: () => void;
}

export function HeaderBar({ onEmergencyStop }: HeaderBarProps) {
  return (
    <header className="flex w-full items-center justify-between border-b-2 border-red-900/40 bg-[#130b0b] px-6 py-4 font-mono shadow-md">
      <div className="flex items-center gap-4 text-red-500">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-widest text-[#e5e5e5]">クソコードターミナル V1.0 <span className="text-red-500">- 緊急モード</span></h1>
          <p className="mt-1 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-red-500/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            致命的なシステム障害が切迫しています
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="mb-1 text-[10px] font-bold tracking-[0.3em] text-gray-500">稼働時間</p>
          <p className="text-sm tracking-wider text-green-500 shadow-green-500/50 drop-shadow-md">00:04:21:09</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20">
          <Bell className="h-5 w-5 fill-current" />
        </button>
        <button
          onClick={onEmergencyStop}
          className="flex h-10 items-center justify-center rounded bg-[#e82515] px-6 text-sm font-bold tracking-wider text-white shadow-[0_0_20px_rgba(232,37,21,0.25)] transition-all hover:scale-105 hover:bg-red-500"
        >
          緊急停止 (GIVE UP)
        </button>
      </div>
    </header>
  );
}
