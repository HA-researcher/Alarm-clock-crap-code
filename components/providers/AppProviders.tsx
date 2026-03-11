"use client";

import { useEffect, type ReactNode } from "react";

import { SessionProvider } from "@/components/providers/SessionProvider";
import { useAlarmStore } from "@/stores/alarmStore";
import { initAlarmGateway } from "@/lib/alarm/gateway";
import { getSessionRepository } from "@/lib/session/factory";

function GatewayInitializer() {
  const roomId = useAlarmStore((s) => s.roomId);

  useEffect(() => {
    initAlarmGateway(roomId, getSessionRepository());
  }, [roomId]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <GatewayInitializer />
      {children}
    </SessionProvider>
  );
}
