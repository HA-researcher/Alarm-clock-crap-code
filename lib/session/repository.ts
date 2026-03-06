import type { SessionSnapshot, SessionStatus } from "@/lib/session/types";

export interface SessionRepository {
  getSnapshot(roomId: string): Promise<SessionSnapshot | null>;
  subscribe(
    roomId: string,
    onChange: (snapshot: SessionSnapshot) => void,
  ): () => void;
  setStatus?(roomId: string, status: SessionStatus): Promise<void>;
}
