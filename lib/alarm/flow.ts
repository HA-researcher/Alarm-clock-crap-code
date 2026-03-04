export type AppState =
  | "idle"
  | "waiting"
  | "alarming"
  | "coding"
  | "monitoring"
  | "cleared";

export type AppRoute = "/" | "/waiting" | "/challenge" | "/monitoring";

export const STATE_TO_ROUTE: Record<AppState, AppRoute> = {
  idle: "/",
  waiting: "/waiting",
  alarming: "/challenge",
  coding: "/challenge",
  monitoring: "/monitoring",
  cleared: "/",
};

export const ROUTE_ALLOWED_STATES: Record<AppRoute, AppState[]> = {
  "/": ["idle", "cleared"],
  "/waiting": ["waiting"],
  "/challenge": ["alarming", "coding"],
  "/monitoring": ["monitoring"],
};

const ALLOWED_TRANSITIONS: Record<AppState, AppState[]> = {
  idle: ["waiting"],
  waiting: ["alarming"],
  alarming: ["coding"],
  coding: ["monitoring"],
  monitoring: ["cleared"],
  cleared: ["waiting"],
};

export function canTransition(from: AppState, to: AppState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getRouteForState(state: AppState): AppRoute {
  return STATE_TO_ROUTE[state];
}

export function isStateAllowedOnRoute(state: AppState, route: AppRoute): boolean {
  return ROUTE_ALLOWED_STATES[route].includes(state);
}

export function normalizeRoute(pathname: string): AppRoute | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (
    normalized === "/" ||
    normalized === "/waiting" ||
    normalized === "/challenge" ||
    normalized === "/monitoring"
  ) {
    return normalized;
  }

  return null;
}
