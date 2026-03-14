"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import { useSleepDetection } from "@/components/useSleepDetection";
import { useAlarmAudio } from "@/lib/alarm/useAlarmAudio";

interface SystemLog {
  timestamp: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
}

// 新規: モニタリング画面の見た目用ステータス
// active / penalty の2状態だけで管理する
type MonitorBannerState = "active" | "penalty";

// 新規: 初期ログを state 初期値として生成する関数
// useEffect 内で同期的に addLog しないために、初期値として持たせる
function createInitialLogs(): SystemLog[] {
  const timestamp = new Date().toLocaleTimeString("ja-JP", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return [
    { timestamp, message: "システム初期化完了", type: "success" },
    { timestamp, message: "カメラキャリブレーション完了", type: "success" },
    { timestamp, message: "顔検知有効化", type: "info" },
  ];
}

export default function MonitoringPage() {
  const router = useRouter();
  const state = useAlarmStore((store: AlarmStore) => store.state);
  const volume = useAlarmStore((store: AlarmStore) => store.volume);
  const isSleepDetectionOn = useAlarmStore((store: AlarmStore) => store.isSleepDetectionOn);
  const transition = useAlarmStore((store: AlarmStore) => store.transition);
  const reset = useAlarmStore((store: AlarmStore) => store.reset);

  // penalty時にアラーム音を鳴らす
  useAlarmAudio(state, volume);

  // ペナルティカウンター
  // 新規: 既定値は固定値として扱い、effect 内で同期 setState しない
  const EYE_CLOSED_PENALTY_SECONDS = 10;
  const FACE_MISSING_PENALTY_SECONDS = 3;

  // 新規: penalty に入ってからの経過秒数だけ state で持つ
  const [penaltyElapsedSeconds, setPenaltyElapsedSeconds] = useState(0);
  const penaltyStartedAtRef = useRef<number | null>(null);

  // システムログ
  // 新規: 初期ログを state 初期値にして、effect 内の addLog 連打を除去
  const [logs, setLogs] = useState<SystemLog[]>(() => createInitialLogs());
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 録画時間
  const [recordingTime, setRecordingTime] = useState("00:00:00");
  const [sessionUser] = useState("ユーザー001");
  const [uptime] = useState("00:45:23");

  // 新規: 画面中央の表示制御用 state
  const [bannerState, setBannerState] = useState<MonitorBannerState>("active");
  const [statusMessage, setStatusMessage] = useState("正常に監視を行っています");

  // ログ追加関数
  const addLog = useCallback((message: string, type: SystemLog["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString("ja-JP", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
    setLogs(prev => [...prev.slice(-19), { timestamp, message, type }]);
  }, []);

  // 録画時間の更新
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setRecordingTime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ペナルティカウンターの更新
  // 新規: effect 内で同期 setState せず、penalty 中だけ interval callback で更新する
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state === "penalty") {
      penaltyStartedAtRef.current = Date.now();
      setPenaltyElapsedSeconds(0);

      interval = setInterval(() => {
        const startedAt = penaltyStartedAtRef.current;
        if (!startedAt) return;

        const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
        setPenaltyElapsedSeconds(elapsedSeconds);
      }, 1000);
    } else {
      penaltyStartedAtRef.current = null;
      setPenaltyElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  // 新規: store の state と見た目表示を同期する
  // penalty 以外は常に SYSTEM ACTIVE 表示へ戻す
  useEffect(() => {
    if (state === "penalty") {
      setBannerState("penalty");
      setStatusMessage("顔または開眼状態を確認できません");
      return;
    }

    setBannerState("active");
    setStatusMessage("正常に監視を行っています");
  }, [state]);

  // 自動スクロール
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const clearChallenge = () => {
    addLog("ユーザーにより監視セッション終了", "info");
    const moved = transition("cleared");
    if (moved) {
      router.push("/");
    }
  };

  const backToHome = () => {
    addLog("システムリセット開始", "warning");
    reset();
    router.push("/");
  };

  const handleSleepDetected = useCallback(() => {
    if (state !== "penalty") {
      addLog("睡眠検知 - ペナルティ発動", "error");
      setPenaltyElapsedSeconds(0);
      setBannerState("penalty");
      setStatusMessage("顔または開眼状態を確認できません");
      transition("penalty");
    }
  }, [addLog, state, transition]);

  const handleAwakeDetected = useCallback(() => {
    if (state === "penalty") {
      addLog("ユーザー覚醒確認 - ペナルティ解除", "success");
      transition("monitoring");
    }
  }, [addLog, state, transition]);

  // 新規: 顔認識復帰時のログだけ残す
  // 画面表示は SUCCESS にせず、penalty でなければ常に SYSTEM ACTIVE を表示する
  const handleFaceDetected = useCallback(() => {
    if (state === "monitoring") {
      addLog("顔認識確認 - 監視継続", "success");
    }
  }, [addLog, state]);

  const { videoRef, isInitializing } = useSleepDetection(
    handleSleepDetected,
    handleAwakeDetected,
    handleFaceDetected,
    isSleepDetectionOn
  );

  // 新規: penalty 中だけカウントダウン表示にし、それ以外は既定値を表示する
  const eyeClosedPenalty = state === "penalty"
    ? Math.max(0, EYE_CLOSED_PENALTY_SECONDS - penaltyElapsedSeconds)
    : EYE_CLOSED_PENALTY_SECONDS;

  const faceMissingPenalty = state === "penalty"
    ? Math.max(0, FACE_MISSING_PENALTY_SECONDS - penaltyElapsedSeconds)
    : FACE_MISSING_PENALTY_SECONDS;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono text-sm p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左側：モニタリング状態 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 状態コンテナ */}
            <div className="relative bg-black rounded-lg overflow-hidden border border-green-500/30 min-h-[400px] flex flex-col items-center justify-center">
              {/* 非表示のカメラ映像 (睡眠検知のために必要) */}
              <video
                ref={videoRef}
                className="hidden"
                playsInline
                autoPlay
                muted
              />

              {/* ステータス表示 */}
              <div className="text-center space-y-4">
                {isInitializing ? (
                  <div className="text-green-400 text-sm">
                    <div className="animate-pulse mb-2 text-2xl">■</div>
                    <div>システム初期化中...</div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold tracking-tighter">
                      {bannerState === "penalty" ? (
                        <span className="text-red-500 animate-pulse">! PENALTY !</span>
                      ) : (
                        <span className="text-green-500">SYSTEM ACTIVE</span>
                      )}
                    </div>
                    <div className="text-sm text-green-400/70">
                      {statusMessage}
                    </div>
                  </>
                )}
              </div>

              {/* 稼働時間などの簡易情報 */}
              <div className="absolute top-4 left-4 text-[10px] text-green-500/50 uppercase tracking-widest">
                Session Active: {recordingTime}
              </div>
            </div>

            {/* ペナルティカウンター */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`border rounded-lg p-4 text-center ${
                state === "penalty" 
                  ? "border-red-500 bg-red-950/50 text-red-400 animate-pulse" 
                  : "border-green-500/30 bg-black/50 text-green-400"
              }`}>
                <div className="text-xs mb-2">閉眼ペナルティ</div>
                <div className="text-2xl font-bold">
                  {eyeClosedPenalty.toString().padStart(2, "0")}秒
                </div>
              </div>
              <div className={`border rounded-lg p-4 text-center ${
                state === "penalty" 
                  ? "border-red-500 bg-red-950/50 text-red-400 animate-pulse" 
                  : "border-green-500/30 bg-black/50 text-green-400"
              }`}>
                <div className="text-xs mb-2">顔消失ペナルティ</div>
                <div className="text-2xl font-bold">
                  {faceMissingPenalty.toString().padStart(2, "0")}秒
                </div>
              </div>
            </div>

            {/* コントロールボタン */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={clearChallenge}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 border border-green-500"
              >
                完全に起きた
              </button>

              {/* 新規: 既存の backToHome が未使用にならないよう、ホームへ戻る導線を追加 */}
              <button
                type="button"
                onClick={backToHome}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 border border-gray-500"
              >
                ホームに戻る
              </button>
            </div>
          </div>

          {/* 右側：システムログ */}
          <div className="space-y-4">
            <div className="border border-green-500/30 rounded-lg p-4 bg-black/50">
              <div className="text-green-400 text-sm font-bold mb-3">システムログ</div>
              <div 
                ref={logContainerRef}
                className="h-96 overflow-y-auto space-y-2 text-xs font-mono"
              >
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-green-600">[{log.timestamp}]</span>
                    <span className={
                      log.type === "error" ? "text-red-400" :
                      log.type === "warning" ? "text-yellow-400" :
                      log.type === "success" ? "text-green-300" :
                      "text-green-400"
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* システム情報 */}
            <div className="border border-green-500/30 rounded-lg p-4 bg-black/50 space-y-2">
              <div className="text-green-400 text-sm font-bold mb-3">システム状態</div>
              <div className="text-xs space-y-1">
                <div>セッションユーザー: {sessionUser}</div>
                <div>稼働時間: {uptime}</div>
                <div>睡眠検知: {isSleepDetectionOn ? "有効" : "無効"}</div>
                <div>ステータス: 
                  <span className={`ml-2 ${
                    state === "penalty" ? "text-red-400" : "text-green-400"
                  }`}>
                    {state === "idle" ? "待機中" :
                     state === "waiting" ? "待機中" :
                     state === "alarming" ? "警告中" :
                     state === "coding" ? "コーディング中" :
                     state === "monitoring" ? "監視中" :
                     state === "penalty" ? "ペナルティ" :
                     state === "cleared" ? "完了" : state}
                  </span>
                </div>
              </div>
            </div>

            {/* 警告メッセージ */}
            <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-950/20">
              <div className="text-yellow-400 text-xs">
                <div className="font-bold mb-2">⚠ システム警告</div>
                <div>アラームが作動中です。睡眠を検知した場合、緊急シーケンスが開始されます。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}