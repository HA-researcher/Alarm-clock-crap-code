"use client";

import type { OnMount } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { challengePrompt } from "@/lib/alarm/challengeMock";
import { useAlarmStore } from "@/stores/alarmStore";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function ChallengePage() {
  const router = useRouter();
  const state = useAlarmStore((store) => store.state);
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
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Challenge</h1>
        <p className="text-sm opacity-70">/challenge</p>
        <p data-testid="challenge-status" className="text-lg">
          Current state: <span className="font-semibold">{state}</span>
        </p>
      </header>

      <section className="grid flex-1 gap-4 md:grid-cols-2">
        <article
          data-testid="challenge-problem"
          className="rounded border border-black/20 p-4 whitespace-pre-wrap"
        >
          {challengePrompt}
        </article>

        <div className="rounded border border-black/20 p-2" data-testid="challenge-editor">
          <MonacoEditor
            height="60vh"
            defaultLanguage="typescript"
            value={challengeCode}
            onChange={(value) => setChallengeCode(value ?? "")}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submitCode}
          data-testid="challenge-submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          提出
        </button>
        <button
          type="button"
          onClick={resetAndBackToHome}
          data-testid="challenge-reset"
          className="rounded border border-black px-4 py-2"
        >
          Reset
        </button>
      </div>
    </main>
  );
}
