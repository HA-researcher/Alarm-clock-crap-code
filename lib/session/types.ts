export type SessionStatus =
  | "waiting"
  | "alarming"
  | "coding"
  | "monitoring"
  | "cleared"
  | "penalty"
  | "force_stopped";

export type SessionConnection =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type SessionSource = "mock" | "supabase";

export interface SessionSnapshot {
  roomId: string;
  status: SessionStatus;
  updatedAt: string | null;
  source: SessionSource;
  connection: SessionConnection;
  error?: string;
}

export const DEFAULT_SESSION_STATUS: SessionStatus = "waiting";
