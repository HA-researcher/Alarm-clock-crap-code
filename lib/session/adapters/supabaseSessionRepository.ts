import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import type { RoomCreationData, SessionRepository } from "@/lib/session/repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  DEFAULT_SESSION_STATUS,
  type SessionSnapshot,
  type SessionStatus,
} from "@/lib/session/types";

const SESSION_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SESSION_SCHEMA ?? "public";
const SESSION_TABLE = process.env.NEXT_PUBLIC_SUPABASE_SESSION_TABLE ?? "rooms";
const ROOM_ID_COLUMN = process.env.NEXT_PUBLIC_SUPABASE_ROOM_ID_COLUMN ?? "id";
const STATUS_COLUMN = process.env.NEXT_PUBLIC_SUPABASE_STATUS_COLUMN ?? "status";

function toSessionStatus(value: unknown): SessionStatus {
  const status = typeof value === "string" ? value : DEFAULT_SESSION_STATUS;

  if (
    status === "waiting" ||
    status === "alarming" ||
    status === "coding" ||
    status === "monitoring" ||
    status === "cleared" ||
    status === "penalty" ||
    status === "force_stopped"
  ) {
    return status;
  }

  return DEFAULT_SESSION_STATUS;
}

function buildSnapshot(
  roomId: string,
  params?: {
    status?: SessionStatus;
    connection?: SessionSnapshot["connection"];
    error?: string;
  },
): SessionSnapshot {
  return {
    roomId,
    status: params?.status ?? DEFAULT_SESSION_STATUS,
    updatedAt: null,
    source: "supabase",
    connection: params?.connection ?? "connected",
    error: params?.error,
  };
}

function buildMissingConfigSnapshot(roomId: string): SessionSnapshot {
  return buildSnapshot(roomId, {
    connection: "error",
    error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  });
}

function rowToSnapshot(roomId: string, row: Record<string, unknown>): SessionSnapshot {
  return buildSnapshot(roomId, {
    status: toSessionStatus(row[STATUS_COLUMN]),
    connection: "connected",
  });
}

class SupabaseSessionRepository implements SessionRepository {
  async getSnapshot(roomId: string): Promise<SessionSnapshot | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return buildMissingConfigSnapshot(roomId);
    }

    const query = await supabase
      .from(SESSION_TABLE)
      .select(STATUS_COLUMN)
      .eq(ROOM_ID_COLUMN, roomId)
      .maybeSingle();

    if (query.error) {
      return buildSnapshot(roomId, {
        connection: "error",
        error: query.error.message,
      });
    }

    if (!query.data) {
      return buildSnapshot(roomId, {
        connection: "disconnected",
      });
    }

    const row = query.data as unknown;
    if (typeof row !== "object" || Array.isArray(row) || row === null) {
      return buildSnapshot(roomId, {
        connection: "error",
        error: "Unexpected row shape from Supabase",
      });
    }

    return rowToSnapshot(roomId, row as Record<string, unknown>);
  }

  subscribe(
    roomId: string,
    onChange: (snapshot: SessionSnapshot) => void,
  ): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) {
      onChange(buildMissingConfigSnapshot(roomId));
      return () => undefined;
    }

    const channel = supabase
      .channel(`session-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: SESSION_SCHEMA,
          table: SESSION_TABLE,
          filter: `${ROOM_ID_COLUMN}=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
          onChange(rowToSnapshot(roomId, row));
        },
      );

    void channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void this.getSnapshot(roomId).then((snapshot) => {
          if (snapshot) {
            onChange(snapshot);
          }
        });
        return;
      }

      if (status === "CHANNEL_ERROR") {
        onChange(
          buildSnapshot(roomId, {
            connection: "error",
            error: "Realtime channel error",
          }),
        );
        return;
      }

      if (status === "TIMED_OUT" || status === "CLOSED") {
        onChange(
          buildSnapshot(roomId, {
            connection: "disconnected",
          }),
        );
      }
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }

  async createRoom(roomId: string, data: RoomCreationData): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from(SESSION_TABLE).insert({
      [ROOM_ID_COLUMN]: roomId,
      target_time: data.targetTime,
      language: data.language,
      level: data.level,
      custom_level_prompt: data.customLevelPrompt ?? null,
      is_sleep_detection_on: data.isSleepDetectionOn,
      status: "waiting",
      current_code: null,
    });

    if (error) {
      console.error("[supabaseSessionRepository] createRoom error:", error.message);
    }
  }

  async setStatus(roomId: string, status: SessionStatus): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from(SESSION_TABLE)
      .update({ [STATUS_COLUMN]: status })
      .eq(ROOM_ID_COLUMN, roomId);

    if (error) {
      console.error("[supabaseSessionRepository] setStatus error:", error.message);
    }
  }

  async setCurrentCode(roomId: string, code: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from(SESSION_TABLE)
      .update({ current_code: code })
      .eq(ROOM_ID_COLUMN, roomId);

    if (error) {
      console.error("[supabaseSessionRepository] setCurrentCode error:", error.message);
    }
  }
}

export const supabaseSessionRepository = new SupabaseSessionRepository();
