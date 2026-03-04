import type { AppState } from "@/lib/alarm/flow";

export interface AlarmGateway {
  syncState(state: AppState): Promise<void>;
}

const noopGateway: AlarmGateway = {
  async syncState() {
    // Placeholder for future external sync implementation (e.g. Supabase).
  },
};

let currentGateway: AlarmGateway = noopGateway;

export function getAlarmGateway(): AlarmGateway {
  return currentGateway;
}

export function setAlarmGateway(gateway: AlarmGateway): void {
  currentGateway = gateway;
}
