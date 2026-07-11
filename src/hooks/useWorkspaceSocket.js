import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// Realtime task updates for one workspace board. Opens a single WebSocket on
// mount, authenticates with a first frame, and turns each task event into a
// React Query cache patch on ["tasks", workspaceId] — the same key useTasks
// reads. Reconnects with exponential backoff and re-auths on every connect.
//
// Patches are idempotent by task id: the actor receives their own event too
// (their mutation already updated the cache), so a duplicate must be a no-op.

const BASE_BACKOFF = 1000; // 1s
const MAX_BACKOFF = 15000; // cap so we never hammer the server

// Derive the ws:// URL from the axios base so host/scheme stay in one place.
// http://localhost:8000/api/  ->  ws://localhost:8000/ws/workspaces/{id}
function socketUrl(workspaceId) {
  const base = new URL(api.defaults.baseURL, window.location.origin);
  const proto = base.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${base.host}/ws/workspaces/${workspaceId}`;
}

// created/updated both upsert: replace in place if present, else prepend.
function upsertById(list = [], task) {
  const idx = list.findIndex((t) => t.id === task.id);
  if (idx === -1) return [task, ...list];
  const next = list.slice();
  next[idx] = { ...next[idx], ...task };
  return next;
}

export function useWorkspaceSocket(workspaceId) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("connecting"); // connecting | connected | reconnecting

  // Refs hold mutable connection state without re-running the effect.
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const attemptsRef = useRef(0);
  const closedRef = useRef(false); // set on unmount so a close doesn't reconnect

  useEffect(() => {
    if (workspaceId == null) return undefined;

    closedRef.current = false;
    const key = ["tasks", workspaceId];

    function applyEvent(msg) {
      if (msg.workspace_id != null && msg.workspace_id !== workspaceId) return;
      if (msg.type === "task.created" || msg.type === "task.updated") {
        if (!msg.task) return;
        queryClient.setQueryData(key, (old) => upsertById(old, msg.task));
      } else if (msg.type === "task.deleted") {
        const id = msg.task?.id;
        if (id == null) return;
        queryClient.setQueryData(key, (old = []) =>
          old.filter((t) => t.id !== id)
        );
      } else if (msg.type === "activity.created") {
        if (!msg.activity) return;
        queryClient.setQueryData(["workspace-activity", workspaceId], (old = []) =>
          old.some((a) => a.id === msg.activity.id) ? old : [msg.activity, ...old]
        );
      } else if (msg.type === "comment.created") {
        if (!msg.comment || msg.task_id == null) return;
        // Only patch a thread that's actually loaded (detail modal open).
        queryClient.setQueryData(["comments", workspaceId, msg.task_id], (old) =>
          old == null
            ? old
            : old.some((c) => c.id === msg.comment.id)
              ? old
              : [...old, msg.comment]
        );
      } else if (msg.type === "comment.deleted") {
        const id = msg.comment?.id;
        if (id == null || msg.task_id == null) return;
        queryClient.setQueryData(["comments", workspaceId, msg.task_id], (old) =>
          old == null ? old : old.filter((c) => c.id !== id)
        );
      }
    }

    function scheduleReconnect() {
      if (closedRef.current) return;
      setStatus("reconnecting");
      const attempt = attemptsRef.current++;
      const delay = Math.min(MAX_BACKOFF, BASE_BACKOFF * 2 ** attempt);
      const jitter = Math.random() * 300; // de-sync many clients reconnecting at once
      reconnectRef.current = setTimeout(connect, delay + jitter);
    }

    function connect() {
      if (closedRef.current) return;

      const token = localStorage.getItem("token");
      if (!token) {
        // Not authenticated yet — back off and try again rather than open a
        // socket we can't authenticate.
        scheduleReconnect();
        return;
      }

      let ws;
      try {
        ws = new WebSocket(socketUrl(workspaceId));
      } catch {
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        // Socket is open but unauthenticated; the first frame must be auth.
        ws.send(JSON.stringify({ type: "auth", token }));
      };

      ws.onmessage = (e) => {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.type === "success") {
          attemptsRef.current = 0; // healthy connection — reset backoff
          setStatus("connected");
          return;
        }
        if (msg.type === "error") {
          // Server closes after an error frame; onclose drives the reconnect.
          // Backoff caps the retry rate if the token is simply invalid.
          return;
        }
        applyEvent(msg);
      };

      ws.onerror = () => {
        // Always followed by onclose — let that schedule the reconnect.
        try {
          ws.close();
        } catch {
          /* noop */
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        scheduleReconnect();
      };
    }

    connect();

    return () => {
      closedRef.current = true;
      clearTimeout(reconnectRef.current);
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        // Detach handlers first so the intentional close doesn't reconnect.
        ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
      }
    };
  }, [workspaceId, queryClient]);

  return { status };
}
