"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import { useSleepDetection } from "@/components/useSleepDetection";
import { useAlarmAudio } from "@/lib/alarm/useAlarmAudio";

interface SystemLog {
  timestamp: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
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
  const [eyeClosedPenalty, setEyeClosedPenalty] = useState(10);
  const [faceMissingPenalty, setFaceMissingPenalty] = useState(3);

  // システムログ
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 録画時間
  const [recordingTime, setRecordingTime] = useState("00:00:00");
  const [sessionUser] = useState("ユーザー001");
  const [uptime] = useState("00:45:23");

  // ログ追加関数
  const addLog = (message: string, type: SystemLog["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString("ja-JP", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
    setLogs(prev => [...prev.slice(-19), { timestamp, message, type }]);
  };

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

    addLog("システム初期化完了", "success");
    addLog("カメラキャリブレーション完了", "success");
    addLog("顔検知有効化", "info");

    return () => clearInterval(interval);
  }, []);

  // ペナルティカウンターの更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === "penalty") {
      interval = setInterval(() => {
        setEyeClosedPenalty(prev => Math.max(0, prev - 1));
        setFaceMissingPenalty(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      setEyeClosedPenalty(10);
      setFaceMissingPenalty(3);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
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

  const handleSleepDetected = () => {
    if (state !== "penalty") {
      addLog("睡眠検知 - ペナルティ発動", "error");
      transition("penalty");
    }
  };

  const handleAwakeDetected = () => {
    if (state === "penalty") {
      addLog("ユーザー覚醒確認 - ペナルティ解除", "success");
      transition("monitoring");
    }
  };

  const { videoRef, isInitializing } = useSleepDetection(
    handleSleepDetected,
    handleAwakeDetected
  );

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono text-sm p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左側：カメラ映像 */}
          <div className="lg:col-span-2 space-y-4">
            {/* カメラコンテナ */}
            <div className="relative bg-black rounded-lg overflow-hidden border border-green-500/30">
              {/* オーバーレイ情報 */}
              <div className="absolute top-4 left-4 z-10 text-xs space-y-1 text-green-400">
                <div>録画 {recordingTime}</div>
                <div>ISO 800</div>
                <div>30 FPS</div>
                <div>1920x1080</div>
              </div>

              {/* カメラ映像 */}
              <div className="aspect-video relative">
                {isSleepDetectionOn && (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    autoPlay
                    muted
                  />
                )}
                {isInitializing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-green-400 text-sm">
                    <div className="text-center">
                      <div className="animate-pulse mb-2">■</div>
                      <div>カメラ初期化中...</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ステータス表示 */}
              <div className="absolute bottom-4 left-4 text-xs text-green-400">
                {state === "penalty" ? (
                  <div className="text-red-400 animate-pulse">
                    眼閉じ - ペナルティ発動中
                  </div>
                ) : (
                  <div>
                    開眼確認 - 監視中
                  </div>
                )}
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
            <div className="flex justify-center">
              <button
                type="button"
                onClick={clearChallenge}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 border border-green-500"
              >
                完全に起きた
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
