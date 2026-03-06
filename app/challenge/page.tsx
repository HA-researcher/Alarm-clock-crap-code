"use client";

import type { OnMount } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAlarmStore } from "@/stores/alarmStore";
import { CodeGeneratorService, type GeneratedChallenge } from "@/lib/alarm/CodeGeneratorService";

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

  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        // FIXME: 実際のRoom設定情報(Store等から)を渡すように変更が必要ですが
        // とりあえずデフォルト設定でAPIを呼び出します
        const result = await CodeGeneratorService.fetchCrapCode({
          language: "javascript",
          level: "beginner",
        });

        if (mounted) {
          setChallenge(result);
          setChallengeCode(result.code.content);
        }
      } catch (err) {
        if (mounted) {
          console.error(err);
          setError("課題の取得に失敗しました。後輩ちゃんが遠隔で解決してくれたみたいです...");
          // Fallback用に一部状態を強制遷移させる処理などをここに書く場合もあります
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchChallenge();

    return () => {
      mounted = false;
    };
  }, [setChallengeCode]);

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
          className="rounded border border-black/20 p-4 whitespace-pre-wrap overflow-y-auto max-h-[60vh]"
        >
          {isLoading ? (
            <p>後輩ちゃんがクソコードを準備中...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : challenge ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{challenge.title}</h2>
              <p className="italic text-gray-700">{challenge.story}</p>

              <div className="bg-gray-100 p-3 rounded">
                <h3 className="font-semibold mb-1">【課題】</h3>
                <p>{challenge.task}</p>
              </div>

              <div>
                <h3 className="font-semibold">【目標】</h3>
                <ul className="list-disc pl-5">
                  <li>言語: {challenge.code.language}</li>
                  <li>難易度: {challenge.difficulty.level}</li>
                  <li>目安行数: {challenge.difficulty.target_lines_mid}行</li>
                </ul>
              </div>
            </div>
          ) : null}
        </article>

        <div className="rounded border border-black/20 p-2" data-testid="challenge-editor">
          <MonacoEditor
            height="60vh"
            defaultLanguage={challenge?.code.language || "typescript"}
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
