import type { OnMount } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { AlertTriangle, Code2, Paintbrush, FileJson } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
});

interface TerminalEditorProps {
    code: string;
    setCode: (val: string) => void;
    onEditorMount: OnMount;
}

export function TerminalEditor({ code, setCode, onEditorMount }: TerminalEditorProps) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-red-500/20 bg-[#1e1e1e] font-mono shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            {/* Tab bar */}
            <div className="flex border-b border-black/80 bg-[#111111] text-xs font-semibold text-gray-400">
                <div className="group relative flex min-w-[160px] cursor-pointer items-center justify-between border-t-2 border-[#ff4d4d] bg-[#1e1e1e] px-4 py-3 text-white transition-colors">
                    <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-[#ff4d4d]" />
                        <span>buggy_main.js</span>
                    </div>
                    <span className="text-gray-500 hover:text-white">×</span>
                </div>
                <div className="group relative flex min-w-[160px] cursor-pointer items-center justify-between border-r border-[#1e1e1e]/20 px-4 py-3 opacity-60 transition-colors hover:bg-white/5">
                    <div className="flex items-center gap-2">
                        <Paintbrush className="h-4 w-4 text-[#4da6ff]" />
                        <span>styles_legacy.css</span>
                    </div>
                </div>
                <div className="group relative flex min-w-[160px] cursor-pointer items-center justify-between px-4 py-3 opacity-60 transition-colors hover:bg-white/5">
                    <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-[#e3a02a]" />
                        <span>index.html</span>
                    </div>
                </div>
            </div>

            {/* Editor area */}
            <div className="relative flex-1 bg-[#1e1e1e]">
                <MonacoEditor
                    defaultLanguage="typescript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                    onMount={onEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "var(--font-mono), monospace",
                        lineHeight: 1.7,
                        padding: { top: 20 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: "on",
                        renderLineHighlight: "none",
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            vertical: "hidden",
                            horizontal: "hidden"
                        }
                    }}
                />
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-between bg-[#0055ff] px-4 py-1.5 text-xs font-bold tracking-wider text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1">
                        <Code2 className="h-3 w-3" /> main*
                    </span>
                    <span className="flex items-center gap-1 opacity-80 font-normal">
                        ⟳ 0
                    </span>
                    <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> 2つのエラー</span>
                </div>
            </div>
        </div>
    );
}
