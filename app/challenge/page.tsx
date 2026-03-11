"use client";

import type { OnMount } from "@monaco-editor/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAlarmStore } from "@/stores/alarmStore";
import { CodeGeneratorService, type GeneratedChallenge } from "@/lib/alarm/CodeGeneratorService";
import { getSessionRepository } from "@/lib/session/factory";
import { useAlarmAudio } from "@/lib/alarm/useAlarmAudio";

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
  const language = useAlarmStore((store) => store.language);
  const level = useAlarmStore((store) => store.level);
  const customProblem = useAlarmStore((store) => store.customProblem);
  const roomId = useAlarmStore((store) => store.roomId);
  const volume = useAlarmStore((store) => store.volume);
  const appState = useAlarmStore((store) => store.state);

  useAlarmAudio(appState, volume);

  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  const [originalCode, setOriginalCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [isForceStopped, setIsForceStopped] = useState(false);

  const handleEditorMount: OnMount = (editor) => {
    editor.onDidFocusEditorText(() => {
      transition("coding");
    });
  };

  const submitCode = async () => {
    if (!challenge || isReviewing) return;
    setIsReviewing(true);
    setReviewResult(null);

    try {
      const res = await fetch("/api/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalCode,
          userCode: challengeCode,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Review API error: ${res.status}`);
      }

      const data = (await res.json()) as { is_passed: boolean; message: string };

      if (data.is_passed) {
        const moved = transition("monitoring");
        if (moved) {
          router.push("/monitoring");
        }
      } else {
        setReviewResult({ passed: false, message: data.message });
      }
    } catch (err) {
      console.error("[challenge:submit]", err);
      setReviewResult({ passed: false, message: "レビューAPIでエラーが発生しました。もう一度試してください。" });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleEmergencyStop = () => {
    setIsForceStopped(true);
    if (roomId) {
      void getSessionRepository().setStatus?.(roomId, "force_stopped");
    }
    setTimeout(() => {
      reset();
      router.push("/");
    }, 4000);
  };

  useEffect(() => {
    let mounted = true;
    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        const result = await CodeGeneratorService.fetchCrapCode({
          language,
          level,
          custom_level_prompt: customProblem || undefined,
        });

        if (mounted) {
          setChallenge(result);
          setOriginalCode(result.code.content);
          setChallengeCode(result.code.content);

          if (roomId) {
            void getSessionRepository().setCurrentCode?.(roomId, result.code.content);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error(err);
          setError("後輩ちゃんのクソコードは他の人が遠隔で解決してくれたみたいです...");
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
  }, [language, level, customProblem, roomId, setChallengeCode]);

  const aiPromptText = isLoading
    ? "後輩ちゃんがクソコードを準備中..."
    : error
      ? error
      : challenge
        ? `【${challenge.title}】\n${challenge.story}\n\n【課題】\n${challenge.task}`
        : "課題データがありません。";

  return (
    <main
      data-testid="challenge-page"
      className="flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0a] text-[#e5e5e5] font-mono selection:bg-[#ff4d4d]/30"
    >
      {/* フェールセーフオーバーレイ */}
      {isForceStopped && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="max-w-lg text-center p-8 rounded-xl border border-gray-700 bg-gray-900">
            <p className="text-4xl mb-4">😅</p>
            <p className="text-lg font-bold text-white mb-2">後輩ちゃんのクソコードは</p>
            <p className="text-lg font-bold text-green-400 mb-4">他の人が遠隔で解決してくれたみたいです！</p>
            <p className="text-gray-400">先輩、起こしてごめんなさい～！</p>
            <p className="mt-4 text-sm text-gray-600">まもなくホームに戻ります...</p>
          </div>
        </div>
      )}

      <HeaderBar onEmergencyStop={handleEmergencyStop} />

      <div className="mx-auto flex w-full max-w-[1920px] flex-1 gap-6 overflow-hidden p-6 text-sm">
        {/* Left Column: AI Assistant */}
        <section className="flex w-[350px] shrink-0 flex-col gap-6">
          <AiAssistantPanel challengePrompt={aiPromptText} />
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
          <SubmissionArea
            onSubmit={() => void submitCode()}
            isReviewing={isReviewing}
            reviewResult={reviewResult}
          />
        </section>

        {/* Right Column: Diagnostics */}
        <section className="flex w-[300px] shrink-0 flex-col gap-6">
          <DiagnosticsPanel />
        </section>
      </div>
    </main>
  );
}
