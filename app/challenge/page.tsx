"use client";

import type { OnMount } from "@monaco-editor/react";
import { useRouter } from "next/navigation";

import { challengePrompt } from "@/lib/alarm/challengeMock";
import { useAlarmStore } from "@/stores/alarmStore";

import { HeaderBar } from "@/components/challenge/HeaderBar";
import { DiagnosticsPanel } from "@/components/challenge/DiagnosticsPanel";
import { AiAssistantPanel } from "@/components/challenge/AiAssistantPanel";
import { TerminalEditor } from "@/components/challenge/TerminalEditor";
import { SubmissionArea } from "@/components/challenge/SubmissionArea";

export default function ChallengePage() {
  const router = useRouter();
  const transition = useAlarmStore((store) => store.transition);
  const challengeCode = useAlarmStore((store) => store.challengeCode);
  const setChallengeCode = useAlarmStore((store) => store.setChallengeCode);
  const reset = useAlarmStore((store) => store.reset);

  const handleEditorMount: OnMount = (editor) => {
    editor.onDidFocusEditorText(() => {
      transition("coding");
    });
  };

  const submitCode = () => {
    console.log("[challenge:submit]", challengeCode);
  };

  const resetAndBackToHome = () => {
    reset();
    router.push("/");
  };

  return (
    <main
      data-testid="challenge-page"
      className="flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0a] text-[#e5e5e5] font-mono selection:bg-[#ff4d4d]/30"
    >
      <HeaderBar onEmergencyStop={resetAndBackToHome} />

      <div className="mx-auto flex w-full max-w-[1920px] flex-1 gap-6 overflow-hidden p-6 text-sm">
        {/* Left Column: AI Assistant */}
        <section className="flex w-[350px] shrink-0 flex-col gap-6">
          <AiAssistantPanel challengePrompt={challengePrompt} />
        </section>

        {/* Center Column: Code Editor + Submission */}
        <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-hidden pb-1">
            <TerminalEditor
              code={challengeCode}
              setCode={setChallengeCode}
              onEditorMount={handleEditorMount}
            />
          </div>
          <SubmissionArea onSubmit={submitCode} />
        </section>

        {/* Right Column: Diagnostics */}
        <section className="flex w-[300px] shrink-0 flex-col gap-6">
          <DiagnosticsPanel />
        </section>
      </div>
    </main>
  );
}
