"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getRouteForState,
  isStateAllowedOnRoute,
  normalizeRoute,
} from "@/lib/alarm/flow";
import { useAlarmStore } from "@/stores/alarmStore";

export function RouteStateGuard() {
  const state = useAlarmStore((store) => store.state);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const expectedRoute = getRouteForState(state);
    const currentRoute = normalizeRoute(pathname);

    if (currentRoute === null) {
      router.replace(expectedRoute);
      return;
    }

    if (!isStateAllowedOnRoute(state, currentRoute)) {
      router.replace(expectedRoute);
    }
  }, [pathname, router, state]);

  return null;
}
