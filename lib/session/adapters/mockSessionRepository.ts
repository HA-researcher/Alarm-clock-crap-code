import type { RoomCreationData, SessionRepository } from "@/lib/session/repository";
import {
  DEFAULT_SESSION_STATUS,
  type SessionSnapshot,
  type SessionStatus,
} from "@/lib/session/types";

type RoomState = {
  status: SessionStatus;
  updatedAt: string;
};

const roomStateMap = new Map<string, RoomState>();
const roomListeners = new Map<string, Set<(snapshot: SessionSnapshot) => void>>();

function ensureRoomState(roomId: string): RoomState {
  const existing = roomStateMap.get(roomId);
  if (existing) {
    return existing;
  }

  const initial: RoomState = {
    status: DEFAULT_SESSION_STATUS,
    updatedAt: new Date().toISOString(),
  };
  roomStateMap.set(roomId, initial);
  return initial;
}

function buildSnapshot(roomId: string): SessionSnapshot {
  const state = ensureRoomState(roomId);
  return {
    roomId,
    status: state.status,
    updatedAt: state.updatedAt,
    source: "mock",
    connection: "connected",
  };
}

function emitRoomUpdate(roomId: string): void {
  const listeners = roomListeners.get(roomId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  const snapshot = buildSnapshot(roomId);
  for (const listener of listeners) {
    listener(snapshot);
  }
}

class MockSessionRepository implements SessionRepository {
  async getSnapshot(roomId: string): Promise<SessionSnapshot | null> {
    return buildSnapshot(roomId);
  }

  subscribe(
    roomId: string,
    onChange: (snapshot: SessionSnapshot) => void,
  ): () => void {
    const listeners = roomListeners.get(roomId) ?? new Set();
    listeners.add(onChange);
    roomListeners.set(roomId, listeners);

    onChange(buildSnapshot(roomId));

    return () => {
      const current = roomListeners.get(roomId);
      if (!current) {
        return;
      }
      current.delete(onChange);
      if (current.size === 0) {
        roomListeners.delete(roomId);
      }
    };
  }

  async createRoom(roomId: string, _data: RoomCreationData): Promise<void> {
    if (!roomStateMap.has(roomId)) {
      roomStateMap.set(roomId, {
        status: DEFAULT_SESSION_STATUS,
        updatedAt: new Date().toISOString(),
      });
    }
    emitRoomUpdate(roomId);
  }

  async setStatus(roomId: string, status: SessionStatus): Promise<void> {
    roomStateMap.set(roomId, {
      status,
      updatedAt: new Date().toISOString(),
    });
    emitRoomUpdate(roomId);
  }

  async setCurrentCode(_roomId: string, _code: string): Promise<void> {
    // mock: no-op
  }
}

export const mockSessionRepository = new MockSessionRepository();
