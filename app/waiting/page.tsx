"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { type AlarmStore, useAlarmStore } from "@/stores/alarmStore";
import {
  buildNextAlarmDate,
  formatRemainingTime,
  formatTargetTime,
} from "@/lib/alarm/time";

export default function WaitingPage() {
  const router = useRouter();

  // 現在の store 状態を表示確認用に取得
  const state = useAlarmStore((store: AlarmStore) => store.state);

  // Home で保存したアラーム時刻を取得
  const alarmTime = useAlarmStore((store: AlarmStore) => store.alarmTime);

  // state を alarming に進めるための関数
  const transition = useAlarmStore((store: AlarmStore) => store.transition);

  // Reset ボタン用
  const reset = useAlarmStore((store: AlarmStore) => store.reset);

  // 画面に表示する残り時間（ミリ秒）
  const [remainingMs, setRemainingMs] = useState(0);

  // 二重遷移防止用フラグ
  // setInterval が複数回走ったり、diff <= 0 が続いたときに
  // transition("alarming") を何度も呼ばないために使う
  const triggeredRef = useRef(false);

  // alarmTime ("HH:mm") から次に来る目標日時 Date を作る
  const targetDate = useMemo(() => {
    if (!alarmTime) return null;
    return buildNextAlarmDate(alarmTime);
  }, [alarmTime]);

  useEffect(() => {
    // alarmTime が無いまま waiting に来た場合は Home に戻す
    if (!alarmTime || !targetDate) {
      router.replace("/");
      return;
    }

    const updateRemaining = () => {
      const diff = targetDate.getTime() - Date.now();

      // 毎秒、残り時間を更新する
      setRemainingMs(diff);

      // 指定時刻に到達したら alarming に遷移して challenge へ移動する
      // triggeredRef で二重実行を防ぐ
      if (diff <= 0 && !triggeredRef.current) {
        triggeredRef.current = true;

        const moved = transition("alarming");
        if (moved) {
          router.replace("/challenge");
        }
      }
    };

    // 初回表示時にもすぐ1回実行する
    // これがないと、画面表示から1秒待つまで表示が更新されない
    updateRemaining();

    // 1秒ごとに残り時間を更新する
    const intervalId = window.setInterval(updateRemaining, 1000);

    // ページ離脱時に interval を解除してメモリリークを防ぐ
    return () => {
      window.clearInterval(intervalId);
    };
  }, [alarmTime, router, targetDate, transition]);

  const handleReset = () => {
    // waiting 状態を解除して Home に戻す
    reset();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-xl">
          <div className="space-y-6 text-center">
            <div>
              <p className="text-sm text-gray-400">現在の状態</p>
              <h1 className="mt-2 text-3xl font-bold">待機中</h1>
            </div>

            <div>
              <p className="text-sm text-gray-400">設定時刻</p>
              <p className="mt-2 text-xl font-semibold">
                {targetDate ? formatTargetTime(targetDate) : "未設定"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">アラームまで残り</p>
              <p className="mt-2 text-5xl font-bold tracking-widest">
                {formatRemainingTime(remainingMs)}
              </p>
            </div>

            <p className="text-sm text-gray-400">
              指定時刻になると challenge 画面へ移動します
            </p>

            <div className="rounded-lg bg-gray-900/50 p-4 text-left text-sm text-gray-400">
              <p>store state: {state}</p>
              <p>alarmTime: {alarmTime ?? "null"}</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}