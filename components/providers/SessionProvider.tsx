"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

import { getSessionBackend, getSessionRepository } from "@/lib/session/factory";
import type { SessionRepository } from "@/lib/session/repository";
import {
  DEFAULT_SESSION_STATUS,
  type SessionSnapshot,
  type SessionStatus,
} from "@/lib/session/types";

export interface SessionContextValue {
  roomId: string;
  snapshot: SessionSnapshot | null;
  refresh(): Promise<void>;
  setMockStatus?(status: SessionStatus): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function getRoomIdFromQuery(value: string | null): string {
  if (!value) {
    return "demo-room";
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "demo-room";
}

function createLoadingSnapshot(roomId: string): SessionSnapshot {
  return {
    roomId,
    status: DEFAULT_SESSION_STATUS,
    updatedAt: null,
    source: getSessionBackend(),
    connection: "connecting",
  };
}

function createDisconnectedSnapshot(roomId: string): SessionSnapshot {
  return {
    roomId,
    status: DEFAULT_SESSION_STATUS,
    updatedAt: null,
    source: getSessionBackend(),
    connection: "disconnected",
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const repository: SessionRepository = useMemo(() => getSessionRepository(), []);
  const roomId = getRoomIdFromQuery(searchParams.get("roomId"));
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(() =>
    createLoadingSnapshot(roomId),
  );

  const refresh = useCallback(async () => {
    const next = await repository.getSnapshot(roomId);
    setSnapshot(next ?? createDisconnectedSnapshot(roomId));
  }, [repository, roomId]);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = repository.subscribe(roomId, (next) => {
      if (!cancelled) {
        setSnapshot(next);
      }
    });

    void repository.getSnapshot(roomId).then((next) => {
      if (cancelled) {
        return;
      }

      setSnapshot(next ?? createDisconnectedSnapshot(roomId));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [repository, roomId]);

  const setMockStatus = useCallback(
    async (status: SessionStatus) => {
      if (!repository.setStatus) {
        return;
      }
      await repository.setStatus(roomId, status);
    },
    [repository, roomId],
  );

  const currentSnapshot =
    snapshot && snapshot.roomId === roomId ? snapshot : createLoadingSnapshot(roomId);

  const value = useMemo<SessionContextValue>(
    () => ({
      roomId,
      snapshot: currentSnapshot,
      refresh,
      setMockStatus,
    }),
    [currentSnapshot, refresh, roomId, setMockStatus],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
}
