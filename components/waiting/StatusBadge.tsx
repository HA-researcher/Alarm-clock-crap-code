export function StatusBadge() {
    return (
        <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-green-900/50 bg-green-950/30 px-6 py-2 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                <span className="text-[11px] font-bold tracking-[0.2em] text-green-500">PC連携 ＆ 準備完了</span>
            </div>
        </div>
    );
}
