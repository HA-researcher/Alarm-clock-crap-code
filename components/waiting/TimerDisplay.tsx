"use client";
import { useEffect, useState } from "react";

export function TimerDisplay() {
    return (
        <div className="mt-16 flex flex-col items-center">
            <h2 className="mb-6 text-[11px] font-bold tracking-[0.4em] text-green-700">
                起床シーケンス開始まで
            </h2>
            <div className="flex items-center gap-6 text-green-500">
                {/* HOURS */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-[140px] w-[130px] items-center justify-center rounded-2xl border border-green-900/40 bg-green-950/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                        <span className="text-[5.5rem] font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">07</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-800">時間</span>
                </div>

                <div className="flex h-[140px] items-center pb-8">
                    <span className="text-3xl font-light text-green-900/80">:</span>
                </div>

                {/* MINUTES */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-[140px] w-[130px] items-center justify-center rounded-2xl border border-green-900/40 bg-green-950/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                        <span className="text-[5.5rem] font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">30</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-800">分</span>
                </div>

                <div className="flex h-[140px] items-center pb-8">
                    <span className="text-3xl font-light text-green-900/80">:</span>
                </div>

                {/* SECONDS */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-[140px] w-[130px] items-center justify-center rounded-2xl border border-green-900/40 bg-green-950/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                        <span className="text-[5.5rem] font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">00</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-800">秒</span>
                </div>
            </div>
        </div>
    );
}
