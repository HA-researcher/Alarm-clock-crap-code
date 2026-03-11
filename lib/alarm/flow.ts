export type AppState =
  | "idle"
  | "waiting"
  | "alarming"
  | "coding"
  | "reviewing"
  | "monitoring"
  | "penalty"
  | "force_stopped"
  | "cleared";

export type AppRoute = "/" | "/waiting" | "/challenge" | "/monitoring";

export const STATE_TO_ROUTE: Record<AppState, AppRoute> = {
  idle: "/",
  waiting: "/waiting",
  alarming: "/challenge",
  coding: "/challenge",
  reviewing: "/challenge",
  monitoring: "/monitoring",
  penalty: "/monitoring",
  force_stopped: "/",
  cleared: "/",
};

export const ROUTE_ALLOWED_STATES: Record<AppRoute, AppState[]> = {
  "/": ["idle", "cleared", "force_stopped"],
  "/waiting": ["waiting"],
  "/challenge": ["alarming", "coding", "reviewing"],
  "/monitoring": ["monitoring", "penalty"],
};

const ALLOWED_TRANSITIONS: Record<AppState, AppState[]> = {
  idle: ["waiting"],
  waiting: ["alarming", "force_stopped"],
  alarming: ["coding", "force_stopped"],
  coding: ["monitoring", "reviewing", "alarming", "force_stopped"],
  reviewing: ["cleared", "alarming", "monitoring", "force_stopped"],
  monitoring: ["cleared", "penalty", "force_stopped"],
  penalty: ["monitoring", "cleared", "force_stopped"],
  cleared: ["waiting", "idle"],
  force_stopped: ["idle"],
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
