"use client";

// Monaco Editor の型。
// エディタが画面に表示されたあとに動く処理の型として使う。
import type { OnMount } from "@monaco-editor/react";

// Next.js の画面遷移用。
// 例: router.push("/monitoring")
import { useRouter } from "next/navigation";

// React の状態管理フック
import { useEffect, useState } from "react";

import { getSessionRepository } from "@/lib/session/factory";

// 画面の部品
import { HeaderBar } from "@/components/challenge/HeaderBar";
import { AiAssistantPanel } from "@/components/challenge/AiAssistantPanel";
import { DiagnosticsPanel } from "@/components/challenge/DiagnosticsPanel";
import { SubmissionArea } from "@/components/challenge/SubmissionArea";
import { TerminalEditor } from "@/components/challenge/TerminalEditor";

// 課題生成サービス
import {
  CodeGeneratorService,
  type GeneratedChallenge,
} from "@/lib/alarm/CodeGeneratorService";

// レビューAPIを呼ぶサービス
import {
  CodeReviewService,
  type ReviewCodeResponse,
} from "@/lib/alarm/CodeReviewService";

// アプリ全体で共有している状態（Zustand）
import { useAlarmStore } from "@/stores/alarmStore";

export default function ChallengePage() {
  // 画面遷移用
  const router = useRouter();

  // 現在のアプリ状態
  // 例: "waiting", "alarming", "coding", "monitoring"
  const state = useAlarmStore((store) => store.state);

  // 状態を次へ進める関数
  const transition = useAlarmStore((store) => store.transition);

  // エディタに表示しているコード本文
  const challengeCode = useAlarmStore((store) => store.challengeCode);

  // エディタのコードを書き換える関数
  const setChallengeCode = useAlarmStore((store) => store.setChallengeCode);

  // 状態をリセットする関数
  const reset = useAlarmStore((store) => store.reset);
  const language = useAlarmStore((store) => store.language);
  const level = useAlarmStore((store) => store.level);
  const customProblem = useAlarmStore((store) => store.customProblem);
  const roomId = useAlarmStore((store) => store.roomId);

  // AIやモックAPIから取得した「課題全体」
  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  // フェールセーフ用
  const [isForceStopped, setIsForceStopped] = useState(false);

  // 課題取得時点の「元コード」。
  // レビュー時に「提出前」と「提出後」を比較したいので保持しておく。
  const [originalCode, setOriginalCode] = useState("");

  // 課題読み込み中かどうか
  const [isLoading, setIsLoading] = useState(true);

  // ここが今回の重要ポイント 1:
  // 課題取得に失敗したとき専用のエラー
  // → 左の課題説明エリアで使う
  const [challengeError, setChallengeError] = useState<string | null>(null);

  // ここが今回の重要ポイント 2:
  // レビュー送信に失敗したとき専用のエラー
  // → AI Review エリアで使う
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 提出中かどうか
  // true のときは「レビュー中...」を表示する
  const [isSubmitting, setIsSubmitting] = useState(false);

  // レビュー結果を保存する state
  // 提出前は null
  const [reviewResult, setReviewResult] = useState<ReviewCodeResponse | null>(
    null,
  );

  // エディタにフォーカスしたら coding 状態へ移行する
  const handleEditorMount: OnMount = (editor) => {
    editor.onDidFocusEditorText(() => {
      transition("coding");
    });
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

  // 提出処理
  const submitCode = async () => {
    // 課題データやコードが足りなければレビューできない
    if (!challenge || !originalCode.trim() || !challengeCode.trim()) {
      setReviewResult({
        passed: false,
        score: 0,
        summary: "提出に必要な課題データが不足しています。",
        strengths: [],
        issues: [
          {
            title: "課題データ不足",
            detail: "課題の再取得後にもう一度お試しください。",
          },
        ],
        feedback: "ページを再読み込みして再提出してください。",
      });
      return;
    }

    // 提出開始
    setIsSubmitting(true);

    // 以前のレビュー結果を消す
    setReviewResult(null);

    // 以前のレビューエラーも消す
    // ここで challengeError は消さない。
    // なぜなら「課題取得エラー」と「レビューエラー」は別物だから。
    setReviewError(null);

    try {
      // もしまだ alarming 状態なら coding にしておく
      // 「鳴動中 → コード修正中」に移るイメージ
      if (state === "alarming") {
        transition("coding");
      }

      // レビューAPIへ送る
      const result = await CodeReviewService.reviewCode({
        challengeTitle: challenge.title,
        challengeTask: challenge.task,
        originalCode,
        patchedCode: challengeCode,
        language: "javascript",
      });

      // レビュー結果を画面に表示
      setReviewResult(result);

      // 合格なら monitoring に進める
      if (result.passed) {
        transition("monitoring");
        router.push("/monitoring");
      }
    } catch (err) {
      console.error(err);

      // レビュー失敗時は reviewError にだけ入れる
      setReviewError("AIレビューに失敗しました。もう一度提出してください。");

      // ===== Day9: フェールセーフ =====
      // エラー発生時は自動で緊急停止処理を走らせる
      handleEmergencyStop();
    } finally {
      // 成功でも失敗でも提出中フラグは下げる
      setIsSubmitting(false);
    }
  };

  // 初回表示時に課題を取得する
  useEffect(() => {
    let mounted = true;

    const fetchChallenge = async () => {
      try {
        // 読み込み開始
        setIsLoading(true);
        // 課題取得前に、古い課題エラーを消す
        setChallengeError(null);

        // ついでにレビューエラーも初期化しておく
        // 新しい課題に入ったとき、前回のレビューエラーが残るのを防ぐため
        setReviewError(null);

        // 古いレビュー結果も消す
        setReviewResult(null);

        // 課題取得APIを呼ぶ
        const result = await CodeGeneratorService.fetchCrapCode({
          language,
          level,
          custom_level_prompt: customProblem || undefined,
        });

        // 画面がもう閉じていたら反映しない
        if (!mounted) {
          return;
        }

        // 課題全体を保存
        setChallenge(result);

        // 元コードを保存
        setOriginalCode(result.code.content);

        // エディタにも同じコードをセット
        setChallengeCode(result.code.content);
      } catch (err) {
        console.error(err);

        if (!mounted) {
          return;
        }

        // 課題取得失敗時は challengeError にだけ入れる
        // これで AI Review エリアに課題取得エラーが出なくなる
        setChallengeError(
          "課題の取得に失敗しました。後輩ちゃんが遠隔で解決してくれたみたいです...",
        );

        // ===== Day9: フェールセーフ =====
        // エラー発生時は自動で緊急停止処理を走らせる
        handleEmergencyStop();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchChallenge();

    return () => {
      mounted = false;
    };
  }, [language, level, customProblem, roomId, setChallengeCode]);

  // 左の AI アシスタント欄に表示する文章
  // ここでは challengeError だけを見る
  const aiPromptText = isLoading
    ? "後輩ちゃんがクソコードを準備中..."
    : challengeError
      ? challengeError
      : challenge
        ? `〖${challenge.title}〗\n${challenge.story}\n\n〖課題〗\n${challenge.task}`
        : "課題データがありません。";

  return (
    <main
      data-testid="challenge-page"
      className="flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0a] font-mono text-[#e5e5e5] selection:bg-[#ff4d4d]/30"
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

      {/* 上部ヘッダー */}
      <HeaderBar onEmergencyStop={handleEmergencyStop} />

      <div className="mx-auto flex w-full max-w-[1920px] flex-1 gap-6 overflow-hidden p-6 text-sm">
        {/* 左: 課題説明エリア
            課題取得失敗時は、ここに challengeError が表示される */}
        <section className="flex w-[350px] shrink-0 flex-col gap-6">
          <AiAssistantPanel challengePrompt={aiPromptText} />
        </section>

        {/* 中央: コード編集 + 提出 + AIレビュー結果 */}
        <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-hidden pb-1">
            <TerminalEditor
              code={challengeCode}
              setCode={setChallengeCode}
              onEditorMount={handleEditorMount}
            />
          </div>
          {/* 提出UI。
              ボタンを押すと submitCode() が呼ばれる */}
          <SubmissionArea onSubmit={submitCode} />

          {/* AIレビュー結果パネル */}
          <section className="rounded-2xl border border-[#2c2c2c] bg-[#121212] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wide text-[#f5f5f5]">
                AI Review
              </h2>

              {/* レビュー中だけ表示 */}
              {isSubmitting ? (
                <span className="text-xs text-yellow-300">レビュー中...</span>
              ) : null}
            </div>

            {/* reviewResult があるときだけレビュー内容を表示 */}
            {reviewResult ? (
              <div className="space-y-3">
                {/* PASS / RETRY ラベル */}
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${reviewResult.passed
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                      }`}
                  >
                    {reviewResult.passed ? "PASS" : "RETRY"}
                  </span>

                  {/* 点数表示 */}
                  <span className="text-xs text-[#b5b5b5]">
                    score: {reviewResult.score}
                  </span>
                </div>

                {/* 一言要約 */}
                <p className="text-sm text-[#e5e5e5]">
                  {reviewResult.summary}
                </p>

                {/* 良かった点 */}
                {reviewResult.strengths.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-bold text-green-300">
                      良かった点
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-[#cfcfcf]">
                      {reviewResult.strengths.map((strength) => (
                        <li key={strength}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* 指摘事項 */}
                {reviewResult.issues.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-bold text-red-300">
                      指摘事項
                    </p>
                    <ul className="space-y-2">
                      {reviewResult.issues.map((issue, index) => (
                        <li
                          key={`${issue.title}-${index}`}
                          className="rounded-lg border border-[#2b2b2b] bg-[#171717] p-3"
                        >
                          <p className="text-xs font-bold text-[#f0f0f0]">
                            {issue.title}
                          </p>
                          <p className="mt-1 text-xs text-[#bdbdbd]">
                            {issue.detail}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* 総合フィードバック */}
                <div className="rounded-lg border border-[#2b2b2b] bg-[#171717] p-3">
                  <p className="mb-1 text-xs font-bold text-[#f0f0f0]">
                    フィードバック
                  </p>
                  <p className="text-xs text-[#cfcfcf]">
                    {reviewResult.feedback}
                  </p>
                </div>
              </div>
            ) : (
              // まだ提出していないとき
              <p className="text-xs text-[#8f8f8f]">
                まだレビュー結果はありません。提出するとここに表示されます。
              </p>
            )}

            {/* ここでは reviewError だけ表示する
                これが今回の修正の本丸。
                以前は challengeError もここに出てしまっていた。 */}
            {reviewError ? (
              <p className="mt-3 text-xs text-red-300">{reviewError}</p>
            ) : null}
          </section>
        </section>

        {/* 右: 既存の診断パネル */}
        <section className="flex w-[300px] shrink-0 flex-col gap-6">
          <DiagnosticsPanel />
        </section>
      </div>
    </main>
  );
}