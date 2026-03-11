import type { SessionSnapshot, SessionStatus } from "@/lib/session/types";

export interface RoomCreationData {
  targetTime: string;
  language: string;
  level: string;
  customLevelPrompt?: string;
  isSleepDetectionOn: boolean;
}

export interface SessionRepository {
  getSnapshot(roomId: string): Promise<SessionSnapshot | null>;
  subscribe(
    roomId: string,
    onChange: (snapshot: SessionSnapshot) => void,
  ): () => void;
  createRoom?(roomId: string, data: RoomCreationData): Promise<void>;
  setStatus?(roomId: string, status: SessionStatus): Promise<void>;
  setCurrentCode?(roomId: string, code: string): Promise<void>;
}
