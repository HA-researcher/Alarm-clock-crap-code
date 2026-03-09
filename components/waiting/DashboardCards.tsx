"use client";
import { Activity, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardCards() {
    const [uptime, setUptime] = useState("04:12:05");

    return (
        <div className="mt-16 flex w-full max-w-2xl justify-center gap-6 px-4">
            <div className="flex flex-1 flex-col rounded-xl border border-green-900/30 bg-green-950/10 p-6 shadow-[0_0_20px_rgba(34,197,94,0.03)] transition-all hover:bg-green-950/20 hover:border-green-800/40">
                <div className="mb-4 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-700">ステータス</span>
                </div>
                <div className="text-2xl font-bold tracking-widest text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">稼働中</div>
            </div>

            <div className="flex flex-1 flex-col rounded-xl border border-green-900/30 bg-green-950/10 p-6 shadow-[0_0_20px_rgba(34,197,94,0.03)] transition-all hover:bg-green-950/20 hover:border-green-800/40">
                <div className="mb-4 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-700">連続稼働時間</span>
                </div>
                <div className="text-2xl font-bold tracking-widest text-green-500">{uptime}</div>
            </div>
        </div>
    );
}
