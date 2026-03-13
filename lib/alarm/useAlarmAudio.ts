// lib/alarm/useAlarmAudio.ts

"use client";

import { useEffect } from "react";
import type { AppState } from "@/lib/alarm/flow";
import {
  startAlarmAudio,
  stopAlarmAudio,
  updateAlarmVolume,
} from "@/lib/alarm/audioManager";

/**
 * どの state で鳴らすか。
 *
 * Issue #21 の必須要件は alarming だが、
 * penalty でも再鳴動したい設計ならここに含めておくと自然。
 */
const PLAY_STATES: AppState[] = ["alarming", "penalty"];

/**
 * 明示的に止める state 群。
 *
 * - coding: 編集開始で一時停止
 * - cleared: 合格後は完全停止
 * - force_stopped: 緊急停止でも完全停止
 * - その他の待機系 state でも音は鳴らさない
 */
const STOP_STATES: AppState[] = [
  "idle",
  "waiting",
  "coding",
  "monitoring",
  "cleared",
  "force_stopped",
];

/**
 * アプリ state に応じて PCブラウザのアラーム音を制御する hook。
 *
 * 責務は薄くし、
 * 実際の Web Audio API 操作は audioManager に寄せる。
 */
export function useAlarmAudio(state: AppState, volume: number) {
  useEffect(() => {
    if (PLAY_STATES.includes(state)) {
      startAlarmAudio(volume);
      return;
    }

    if (STOP_STATES.includes(state)) {
      stopAlarmAudio();
    }
  }, [state, volume]);

  useEffect(() => {
    updateAlarmVolume(volume);
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAlarmAudio();
    };
  }, []);
}