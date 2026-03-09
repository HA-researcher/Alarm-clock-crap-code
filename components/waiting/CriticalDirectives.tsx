import { Plug, MinusCircle, Volume2 } from "lucide-react";

export function CriticalDirectives() {
    return (
        <div className="mt-16 flex w-full max-w-xl flex-col items-center px-4">
            <div className="mb-8 flex w-full items-center justify-center gap-4">
                <div className="h-[1px] flex-1 bg-green-900/30"></div>
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-green-600">重要指示事項</span>
                <div className="h-[1px] flex-1 bg-green-900/30"></div>
            </div>

            <div className="flex w-full flex-col gap-3">
                <div className="flex items-center gap-4 rounded border border-green-900/30 bg-green-950/10 px-5 py-4 transition-colors hover:bg-green-950/30">
                    <Plug className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm font-semibold tracking-wide text-green-500/90">PCを常に電源に接続しておいてください</span>
                </div>

                <div className="flex items-center gap-4 rounded border border-green-900/30 bg-green-950/10 px-5 py-4 transition-colors hover:bg-green-950/30">
                    <MinusCircle className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm font-semibold tracking-wide text-green-500/90">自動スリープモードを無効にしてください</span>
                </div>

                <div className="flex items-center gap-4 rounded border border-green-900/30 bg-green-950/10 px-5 py-4 transition-colors hover:bg-green-950/30">
                    <Volume2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm font-semibold tracking-wide text-green-500/90">マスター音量が100%になっていることを確認してください</span>
                </div>
            </div>

            <div className="mt-20 flex flex-col items-center pb-8 text-[9px] font-medium tracking-[0.2em] text-green-900/60">
                <span>システムターミナル V2.4.0</span>
                <span className="mt-1 text-green-500/40 animate-pulse">●</span>
            </div>
        </div>
    );
}
