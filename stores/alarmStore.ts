import { create } from "zustand";
import { persist } from "zustand/middleware";

import { starterCode } from "@/lib/alarm/challengeMock";
import { getAlarmGateway } from "@/lib/alarm/gateway";
import { canTransition, type AppState } from "@/lib/alarm/flow";

export interface AlarmStore {
  state: AppState;
  challengeCode: string;
  isSleepDetectionOn: boolean;
  alarmTime: string | null;
  language: string;
  level: string;
  customProblem: string;
  volume: number;
  roomId: string | null;

  transition(next: AppState): boolean;
  setChallengeCode(code: string): void;
  setSleepDetectionOn(on: boolean): void;
  setAlarmTime(alarmTime: string | null): void;
  setAlarmSettings(
    settings: Partial<Pick<AlarmStore, "language" | "level" | "customProblem" | "volume" | "roomId">>
  ): void;
  reset(): void;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      state: "idle",
      challengeCode: starterCode,
      isSleepDetectionOn: true,
      alarmTime: null,
      language: "javascript",
      level: "medium",
      customProblem: "",
      volume: 70,
      roomId: null,

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

      setAlarmTime: (alarmTime: string | null) => {
        set({ alarmTime });
      },

      setAlarmSettings: (settings) => {
        set(settings);
      },

      reset: () => {
        set({
          state: "idle",
          challengeCode: starterCode,
          isSleepDetectionOn: true,
          alarmTime: null,
          language: "javascript",
          level: "medium",
          customProblem: "",
          volume: 70,
          roomId: null,
        });
        void getAlarmGateway().syncState("idle").catch(() => undefined);
      },
    }),
    {
      name: "alarm-store",
      partialize: (state) => ({
        state: state.state,
        challengeCode: state.challengeCode,
        isSleepDetectionOn: state.isSleepDetectionOn,
        alarmTime: state.alarmTime,
        language: state.language,
        level: state.level,
        customProblem: state.customProblem,
        volume: state.volume,
        roomId: state.roomId,
      }),
    }
  )
);
