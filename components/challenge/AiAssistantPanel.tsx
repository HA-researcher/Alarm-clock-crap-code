import { Send } from "lucide-react";

interface AiAssistantPanelProps {
    challengePrompt: string;
    timerNotifications?: Array<{
        id: number;
        message: string;
        timestamp: Date;
    }>;
}

export function AiAssistantPanel({ challengePrompt, timerNotifications = [] }: AiAssistantPanelProps) {
    return (
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-red-500/20 bg-[#161212]/90 font-mono text-xs shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 border-b border-red-500/10 bg-black/40 px-5 py-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3ae05b] shadow-[0_0_8px_rgba(58,224,91,0.6)]"></span>
                <h2 className="text-sm font-bold tracking-widest text-[#e5e5e5]">後輩AIアシスタント</h2>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">

                {/* Chat message from Kohai AI (PANIC) */}
                <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] font-bold border border-red-500/40 text-red-500 animate-pulse">AI</div>
                        <p className="text-[10px] tracking-wider text-red-500 font-bold">後輩AIちゃん <span className="text-red-500/50 ml-1">🚨 たった今</span></p>
                    </div>
                    <div className="rounded-r-lg rounded-bl-lg border border-red-500/30 bg-[#2f0f0f] p-4 leading-relaxed text-red-100 whitespace-pre-wrap shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                        <div className="font-bold text-[#ff4d4d] mb-3 text-sm">
                            「先輩……！サーバー負荷が大変なんです……！助けてください！」
                        </div>
                        {challengePrompt || "デプロイされたコードのせいでメモリが限界です！\n至急、リファクタリングして再提出してください！！"}
                    </div>
                </div>

                {/* タイマー通知 */}
                {timerNotifications.map((notification) => (
                    <div key={notification.id} className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px] font-bold border border-yellow-500/40 text-yellow-500">⏰</div>
                            <p className="text-[10px] tracking-wider text-yellow-500 font-bold">後輩AIちゃん <span className="text-yellow-500/50 ml-1">
                                {new Date(notification.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </span></p>
                        </div>
                        <div className="rounded-r-lg rounded-bl-lg border border-yellow-500/30 bg-[#2f2f0f] p-4 leading-relaxed text-yellow-100 whitespace-pre-wrap shadow-[0_0_15px_rgba(239,239,68,0.15)]">
                            {notification.message}
                        </div>
                    </div>
                ))}

                            </div>

            <div className="border-t border-red-500/10 p-5 bg-black/20">
                <div className="flex items-center rounded border border-gray-800 bg-[#0d0d0d] p-1 transition-colors focus-within:border-gray-600">
                    <input
                        type="text"
                        className="w-full bg-transparent px-3 py-2 text-[#a3a3a3] outline-none placeholder:text-gray-700"
                        placeholder="返信を入力..."
                        disabled
                    />
                    <button disabled className="p-2 text-[#ff4d4d] opacity-50 hover:bg-white/5 rounded transition-colors">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
