import { create } from "zustand";
import { persist } from "zustand/middleware";

import { starterCode } from "@/lib/alarm/challengeMock";
import { getAlarmGateway } from "@/lib/alarm/gateway";
import { canTransition, type AppState } from "@/lib/alarm/flow";

export interface AlarmStore {
  state: AppState;
  challengeCode: string;
  isSleepDetectionOn: boolean;

  // 追加
  // Home で設定したアラーム時刻（例: "07:00"）を保持する
  // waiting 画面でこの値を読み、目標時刻までの残り時間を計算する
  alarmTime: string | null;

  transition(next: AppState): boolean;
  setChallengeCode(code: string): void;
  setSleepDetectionOn(on: boolean): void;

  // 追加
  // アラーム時刻を保存する setter
  setAlarmTime(alarmTime: string | null): void;

  reset(): void;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      state: "idle",
      challengeCode: starterCode,
      isSleepDetectionOn: true,

      // 追加
      // 初期状態ではアラーム時刻は未設定
      alarmTime: null,

      transition: (next) => {
        const current = get().state;
        if (!canTransition(current, next)) {
          return false;
        }

        set({ state: next });
        void getAlarmGateway().syncState(next).catch(() => undefined);
        return true;
      },

      setChallengeCode: (code) => {
        set({ challengeCode: code });
      },

      setSleepDetectionOn: (on: boolean) => {
        set({ isSleepDetectionOn: on });
      },

      // 追加
      // Home で指定されたアラーム時刻を保存する
      setAlarmTime: (alarmTime: string | null) => {
        set({ alarmTime });
      },

      reset: () => {
        set({
          state: "idle",
          challengeCode: starterCode,
          isSleepDetectionOn: true,

          // 追加
          // リセット時はアラーム時刻も消す
          alarmTime: null,
        });
        void getAlarmGateway().syncState("idle").catch(() => undefined);
      },
    }),
    {
      name: "alarm-store",

      // ★追加
      // リロード後も waiting の情報を維持できるように保存対象を指定する
      partialize: (state) => ({
        state: state.state,
        challengeCode: state.challengeCode,
        isSleepDetectionOn: state.isSleepDetectionOn,
        alarmTime: state.alarmTime,
      }),
    }
  )
);