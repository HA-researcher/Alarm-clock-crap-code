"use client";

import { useEffect, useRef } from "react";
import type { AppState } from "@/lib/alarm/flow";

const ALARM_STATES: AppState[] = ["alarming", "penalty"];
const PAUSE_STATES: AppState[] = ["coding", "monitoring"];

interface AlarmNodes {
  ctx: AudioContext;
  oscillator: OscillatorNode;
  gainNode: GainNode;
  intervalId: ReturnType<typeof setInterval>;
}

export function useAlarmAudio(state: AppState, volume: number) {
  const nodesRef = useRef<AlarmNodes | null>(null);

  const stopAlarm = () => {
    if (!nodesRef.current) return;
    const { ctx, oscillator, intervalId } = nodesRef.current;
    clearInterval(intervalId);
    try {
      oscillator.stop();
    } catch {
      // may already be stopped
    }
    void ctx.close();
    nodesRef.current = null;
  };

  const startAlarm = (vol: number) => {
    if (nodesRef.current) return; // already running

    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = (vol / 100) * 0.3;
    gainNode.connect(ctx.destination);

    let isOn = false;

    const oscillator = ctx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 880;
    oscillator.connect(gainNode);
    oscillator.start();

    // 0.5秒ON / 0.2秒OFFでビープ音をパルス
    const intervalId = setInterval(() => {
      isOn = !isOn;
      gainNode.gain.setTargetAtTime(
        isOn ? (vol / 100) * 0.3 : 0,
        ctx.currentTime,
        0.01,
      );
    }, isOn ? 500 : 200);

    nodesRef.current = { ctx, oscillator, gainNode, intervalId };
  };

  useEffect(() => {
    if (ALARM_STATES.includes(state)) {
      startAlarm(volume);
    } else {
      stopAlarm();
    }

    return () => {
      if (PAUSE_STATES.includes(state)) {
        // coding/monitoring時は音を止めるが後でalarmingに戻れる
        stopAlarm();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, volume]);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
