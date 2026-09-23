"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type {
  EvaluationCompletedEvent,
  LiveActivityItem,
} from "@/features/realtime/domain/evaluation-completed-event";
import { cycleSubmissionsQueryKey } from "@/features/evaluation-submissions/presentation/hooks/use-cycle-submissions";
import { DASHBOARD_STATS_QUERY_KEY } from "@/features/dashboard/presentation/hooks/use-dashboard-stats";

const MAX_ACTIVITY_ITEMS = 20;

type EventListener = (event: EvaluationCompletedEvent) => void;

/**
 * Module-level singleton: there's no shared layout across `/dashboard/*`
 * routes, so every page navigation unmounts and remounts `AppShell` (and
 * with it, whatever mounts here). Tying the actual `HubConnection` to the
 * component's own lifecycle meant every navigation tore down and reopened a
 * full connection (negotiate + WebSocket + the hub's `OnConnectedAsync`) —
 * wasteful, and worse, it created gaps where a broadcast could arrive while
 * this tab had no live connection and simply be lost (SignalR groups are
 * fire-and-forget, nothing gets queued for a client that isn't connected).
 * Keeping one connection for the whole browser tab, independent of which
 * component currently renders, closes both gaps.
 */
let sharedConnection: HubConnection | null = null;
const listeners = new Set<EventListener>();

function getSharedConnection(): HubConnection {
  if (sharedConnection) return sharedConnection;

  const hubUrl = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL;
  if (!hubUrl) {
    throw new Error("NEXT_PUBLIC_SIGNALR_HUB_URL no está configurada.");
  }

  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      // No cookies involved (auth is the bearer token below); this also
      // keeps the hub's CORS policy simple (AllowAnyOrigin, no credentials).
      withCredentials: false,
      accessTokenFactory: async () => {
        const res = await fetch("/api/realtime/token");
        if (!res.ok) return "";
        const { accessToken } = (await res.json()) as { accessToken: string };
        return accessToken;
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("EvaluationCompleted", (event: EvaluationCompletedEvent) => {
    for (const listener of listeners) listener(event);
  });

  sharedConnection = connection;
  connection.start().catch((err) => {
    console.error("[realtime] No se pudo conectar al hub de notificaciones:", err);
  });

  return connection;
}

function invalidateForEvent(queryClient: QueryClient, event: EvaluationCompletedEvent) {
  queryClient.invalidateQueries({ queryKey: cycleSubmissionsQueryKey(event.cycleId) });
  queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
}

const RealtimeActivityContext = createContext<LiveActivityItem[]>([]);

/** The dashboard's "actividad reciente" feed, fed live by `RealtimeProvider`. */
export function useRealtimeActivity(): LiveActivityItem[] {
  return useContext(RealtimeActivityContext);
}

/**
 * Subscribes to the shared SignalR connection (backend `DashboardHub`, event
 * `EvaluationCompleted`) — mounted in `AppShell` so it only ever runs on
 * authenticated pages. The connection itself is a tab-wide singleton (see
 * above); this component only owns the `activity` list it renders. On every
 * event it:
 * - prepends a live activity entry (session-only, no persistence — the feed
 *   starts empty on a fresh page load and fills up as evaluations complete);
 * - invalidates the affected cycle's submissions query, so an open cycle
 *   detail page refreshes "quién completó y quién no" on its own;
 * - invalidates the dashboard stats query, so counts/progress stay current.
 *
 * The browser can't send an `Authorization` header during a WebSocket
 * handshake, so auth goes through `accessTokenFactory`, which asks our own
 * `GET /api/realtime/token` for the caller's session JWT (see that route for
 * why the token has to leave the server at all).
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activity, setActivity] = useState<LiveActivityItem[]>([]);

  useEffect(() => {
    let hubUrlConfigured = true;
    try {
      getSharedConnection();
    } catch {
      hubUrlConfigured = false;
      console.warn(
        "[realtime] NEXT_PUBLIC_SIGNALR_HUB_URL no está configurada; el dashboard no se actualizará en vivo.",
      );
    }
    if (!hubUrlConfigured) return;

    const onEvent: EventListener = (event) => {
      setActivity((prev) => [
        {
          id: `${event.submissionId}-${event.timestamp}`,
          respondentUserName: event.respondentUserName,
          evaluatedUserName: event.evaluatedUserName,
          isSelfEvaluation: event.isSelfEvaluation,
          timestamp: event.timestamp,
        },
        ...prev,
      ].slice(0, MAX_ACTIVITY_ITEMS));

      invalidateForEvent(queryClient, event);
    };

    listeners.add(onEvent);
    // The connection itself is intentionally left open on cleanup — see the
    // singleton comment above. Only this component's own listener (and the
    // `activity` state it feeds) is scoped to its mount.
    return () => {
      listeners.delete(onEvent);
    };
  }, [queryClient]);

  return (
    <RealtimeActivityContext.Provider value={activity}>
      {children}
    </RealtimeActivityContext.Provider>
  );
}
