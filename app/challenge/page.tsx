"use client";

import type { OnMount } from "@monaco-editor/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAlarmStore } from "@/stores/alarmStore";
import { CodeGeneratorService, type GeneratedChallenge } from "@/lib/alarm/CodeGeneratorService";
import { CodeReviewService, type ReviewResult } from "@/lib/alarm/CodeReviewService";

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

  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editor.onDidFocusEditorText(() => {
      transition("coding");
    });
  };

  const submitCode = async () => {
    if (!challenge || isReviewing) return;

    try {
      setIsReviewing(true);
      setReviewResult(null); // Clear previous result
      transition("reviewing");

      const result = await CodeReviewService.reviewCode({
        language: challenge.code.language,
        original_code: challenge.code.content,
        submitted_code: challengeCode,
        input_output_spec_json: JSON.stringify(challenge.input_output_spec),
        expected_behavior_json: JSON.stringify(challenge.expected_behavior)
      });

      setReviewResult(result);

      if (result.is_passed) {
        transition("cleared");
      } else {
        transition("alarming"); // 失敗時は再度アラーム状態に戻す
      }
    } catch (err) {
      console.error(err);
      transition("alarming");
    } finally {
      setIsReviewing(false);
    }
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

  // AIアシスタントパネルに表示するメッセージを状態に応じて切り替え
  let aiPromptText = "課題データがありません。";
  if (isReviewing) {
    aiPromptText = "先輩のコードをレビュー中……！通ってくれーっ！";
  } else if (reviewResult) {
    const statusMsg = reviewResult.is_passed ? "合格 🎉" : "不合格 ❌";
    const diffs = reviewResult.diff_summary?.length ? "\n- " + reviewResult.diff_summary.join("\n- ") : "";
    const violations = reviewResult.violations?.length ? `\n\n【⚠️ 警告】\n- ${reviewResult.violations.join("\n- ")}` : "";
    aiPromptText = `【レビュー結果: ${statusMsg}】\n\n${reviewResult.message}\n${diffs}${violations}`;
  } else if (isLoading) {
    aiPromptText = "後輩ちゃんがクソコードを準備中...";
  } else if (error) {
    aiPromptText = error;
  } else if (challenge) {
    aiPromptText = `【${challenge.title}】\n${challenge.story}\n\n【課題】\n${challenge.task}`;
  }

  return (
    <main
      data-testid="challenge-page"
      className="flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0a] text-[#e5e5e5] font-mono selection:bg-[#ff4d4d]/30"
    >
      <HeaderBar onEmergencyStop={resetAndBackToHome} />

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
          <SubmissionArea onSubmit={submitCode} isSubmitting={isReviewing} />
        </section>

        {/* Right Column: Diagnostics */}
        <section className="flex w-[300px] shrink-0 flex-col gap-6">
          <DiagnosticsPanel />
        </section>
      </div>
    </main>
  );
}