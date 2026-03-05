import { create } from "zustand";

import { starterCode } from "@/lib/alarm/challengeMock";
import { getAlarmGateway } from "@/lib/alarm/gateway";
import { canTransition, type AppState } from "@/lib/alarm/flow";

export interface AlarmStore {
  state: AppState;
  challengeCode: string;
  isSleepDetectionOn: boolean;
  transition(next: AppState): boolean;
  setChallengeCode(code: string): void;
  setSleepDetectionOn(on: boolean): void;
  reset(): void;
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  state: "idle",
  challengeCode: starterCode,
  isSleepDetectionOn: true,
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
  reset: () => {
    set({ state: "idle" });
    void getAlarmGateway().syncState("idle").catch(() => undefined);
  },
}));
