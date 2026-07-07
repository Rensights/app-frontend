import { apiClient } from "./api";

type QueuedEvent = { eventType: string; pagePath?: string; metadata?: string };

const MAX_QUEUE_SIZE = 20;
const FLUSH_INTERVAL_MS = 15_000;

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let listenersAttached = false;

function flush() {
  if (queue.length === 0) return;
  const toSend = queue;
  queue = [];
  void apiClient.trackEvents(toSend);
}

function enqueue(event: QueuedEvent) {
  queue.push(event);
  if (queue.length >= MAX_QUEUE_SIZE) {
    flush();
  }
}

/** Manually instrument a business event, e.g. trackEvent("DEAL_VIEWED", { dealId }). */
export function trackEvent(eventType: string, metadata?: Record<string, unknown>) {
  enqueue({
    eventType,
    pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  });
}

/** Records a page view for the given path - called automatically on every route change. */
export function trackPageView(path: string) {
  enqueue({ eventType: "PAGE_VIEW", pagePath: path });
}

/** Starts the periodic flush loop and unload-safety listeners. Idempotent. */
export function startAnalyticsFlushLoop() {
  if (typeof window === "undefined") return;
  if (!flushTimer) {
    flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
  }
  if (!listenersAttached) {
    listenersAttached = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("pagehide", flush);
  }
}

export function stopAnalyticsFlushLoop() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flush();
}
