import { BarChart2 } from "lucide-react";

export function DiagnosticsPanel() {
    return (
        <div className="rounded-lg border border-red-500/20 bg-[#161212]/90 p-5 font-mono text-xs shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="mb-6 flex items-center justify-between border-b border-red-500/20 pb-3">
                <h2 className="text-sm font-bold tracking-widest text-[#ff4d4d]">システム診断</h2>
                <BarChart2 className="h-4 w-4 text-[#ff4d4d]" />
            </div>

            <div className="space-y-6">
                <div>
                    <div className="mb-2 flex justify-between font-semibold tracking-wider text-gray-400">
                        <span>CPU負荷</span>
                        <span className="text-[#ff4d4d]">99%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded bg-[#2a1f1f]">
                        <div className="h-full w-[99%] bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.5)]"></div>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex justify-between font-semibold tracking-wider text-gray-400">
                        <span>メモリ使用率</span>
                        <span className="text-[#6b7cff]">94.2GB</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded bg-[#2a1f1f]">
                        <div className="flex h-full w-[94%] bg-[#ff4d4d]">
                            <div className="h-full w-[90%] bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.5)]"></div>
                            <div className="h-full w-[10%] bg-[#6b7cff]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center rounded border border-[#ff4d4d]/10 bg-black/40 py-4 shadow-inner">
                    <span className="text-[10px] tracking-widest text-gray-500">コード効率</span>
                    <span className="mt-2 text-5xl font-bold text-[#ff4d4d]">F</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded border border-[#ff4d4d]/10 bg-black/40 py-4 shadow-inner">
                    <span className="text-[10px] tracking-widest text-gray-500">脅威レベル</span>
                    <span className="mt-2 text-3xl font-bold tracking-widest text-[#ff4d4d]">最大</span>
                </div>
            </div>
        </div>
    );
}
