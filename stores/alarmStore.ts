import { create } from "zustand";

import { starterCode } from "@/lib/alarm/challengeMock";
import { getAlarmGateway } from "@/lib/alarm/gateway";
import { canTransition, type AppState } from "@/lib/alarm/flow";

export interface AlarmStore {
  state: AppState;
  challengeCode: string;
  transition(next: AppState): boolean;
  setChallengeCode(code: string): void;
  reset(): void;
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  state: "idle",
  challengeCode: starterCode,
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
  reset: () => {
    set({ state: "idle" });
    void getAlarmGateway().syncState("idle").catch(() => undefined);
  },
}));
