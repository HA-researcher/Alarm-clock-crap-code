import type { AppState } from "@/lib/alarm/flow";
import type { SessionRepository } from "@/lib/session/repository";
import type { SessionStatus } from "@/lib/session/types";

export interface AlarmGateway {
  syncState(state: AppState): Promise<void>;
}

const STATE_TO_STATUS: Partial<Record<AppState, SessionStatus>> = {
  alarming: "alarming",
  coding: "coding",
  monitoring: "monitoring",
  penalty: "penalty",
  cleared: "cleared",
};

class SupabaseAlarmGateway implements AlarmGateway {
  constructor(
    private roomId: string | null,
    private repo: SessionRepository,
  ) {}

  async syncState(state: AppState): Promise<void> {
    if (!this.roomId || !this.repo.setStatus) return;
    const status = STATE_TO_STATUS[state];
    if (status) {
      await this.repo.setStatus(this.roomId, status);
    }
  }
}

const noopGateway: AlarmGateway = {
  async syncState() {
    // no-op until gateway is initialized
  },
};

let currentGateway: AlarmGateway = noopGateway;

export function getAlarmGateway(): AlarmGateway {
  return currentGateway;
}

export function setAlarmGateway(gateway: AlarmGateway): void {
  currentGateway = gateway;
}

export function initAlarmGateway(roomId: string | null, repo: SessionRepository): void {
  currentGateway = new SupabaseAlarmGateway(roomId, repo);
}
