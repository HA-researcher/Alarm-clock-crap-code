import { SquareTerminal, Settings } from "lucide-react";

export function HeaderBar() {
    return (
        <header className="flex w-full items-center justify-between border-b border-green-900/30 bg-[#050805] px-8 py-5 shadow-sm">
            <div className="flex items-center gap-3 text-green-500">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500/10 border border-green-500/20">
                    <span className="font-mono text-sm font-bold tracking-tighter">{">_"}</span>
                </div>
                <h1 className="text-xl font-extrabold tracking-widest text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                    MEZAMASHI <span className="text-green-600/80">KUSOCODE</span>
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="flex h-10 w-10 items-center justify-center rounded border border-green-900/50 bg-green-950/20 text-green-500 transition-colors hover:bg-green-900/40 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <SquareTerminal className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded border border-green-900/50 bg-green-950/20 text-green-500 transition-colors hover:bg-green-900/40 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <Settings className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
