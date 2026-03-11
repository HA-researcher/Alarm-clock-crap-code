import { Terminal, AlertTriangle, X } from "lucide-react";

interface SubmissionAreaProps {
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export function SubmissionArea({ onSubmit, isSubmitting = false }: SubmissionAreaProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-[#ff4d4d]/20 bg-[#1e1e1e] p-4 text-sm font-mono text-gray-400 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/5">
                <Terminal className="h-4 w-4 text-[#3ae05b]" />
                <p className="tracking-wide">ターミナル準備完了... パッチの提出を待機中。</p>
                <span className="h-4 w-2 animate-pulse bg-gray-500/50"></span>
            </div>

            <div className="flex items-center gap-6">
                {/* Mock alert block */}
                <div className="flex items-center gap-3 rounded border border-[#ff4d4d]/40 bg-[#160a0a] px-4 py-2 shadow-inner">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ff4d4d] text-white shadow-[0_0_10px_rgba(255,77,77,0.5)]">
                        <AlertTriangle className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <div className="text-xs font-bold tracking-widest text-white">システム過熱</div>
                        <div className="text-[10px] text-gray-500">冷却ファン100%で稼働中。120秒以内にパッチを提出してください。</div>
                    </div>
                    <button className="ml-2 text-gray-600 transition-colors hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="group relative overflow-hidden rounded bg-[#10b981] px-8 py-3 font-bold tracking-[0.2em] text-[#022c22] transition-all hover:bg-[#34d399] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? "レビュー中..." : "パッチを提出"} <span className="opacity-70 text-xs">(ENTER)</span>
                    </span>
                    <div className="absolute inset-0 z-0 h-full w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></div>
                </button>
            </div>
        </div>
    );
}
