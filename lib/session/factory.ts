import { mockSessionRepository } from "@/lib/session/adapters/mockSessionRepository";
import { supabaseSessionRepository } from "@/lib/session/adapters/supabaseSessionRepository";
import type { SessionRepository } from "@/lib/session/repository";
import type { SessionSource } from "@/lib/session/types";

const sessionBackend: SessionSource =
  process.env.NEXT_PUBLIC_SESSION_BACKEND === "supabase" ? "supabase" : "mock";

export function getSessionRepository(): SessionRepository {
  if (sessionBackend === "supabase") {
    return supabaseSessionRepository;
  }
  return mockSessionRepository;
}

export function getSessionBackend(): SessionSource {
  return sessionBackend;
}
