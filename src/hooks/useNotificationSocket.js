import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { NOTIFS_KEY, UNREAD_KEY } from "./useNotifications";

// One per-user WebSocket for live notifications. First-frame auth (token in the
// message, not the URL), exponential backoff, idempotent cache patches. Mounted
// once at app level while logged in.
const BASE_BACKOFF = 1000;
const MAX_BACKOFF = 15000;

function socketUrl() {
  const base = new URL(api.defaults.baseURL, window.location.origin);
  const proto = base.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${base.host}/ws/notifications`;
}

export function useNotificationSocket(enabled = true) {
  const queryClient = useQueryClient();
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const attemptsRef = useRef(0);
  const closedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    closedRef.current = false;

    function applyEvent(msg) {
      if (msg.type !== "notification.created" || !msg.notification) return;
      queryClient.setQueryData(NOTIFS_KEY, (old) =>
        old == null
          ? old
          : old.some((n) => n.id === msg.notification.id)
            ? old
            : [msg.notification, ...old]
      );
      queryClient.setQueryData(UNREAD_KEY, (c = 0) => c + 1);
    }

    function scheduleReconnect() {
      if (closedRef.current) return;
      const attempt = attemptsRef.current++;
      const delay = Math.min(MAX_BACKOFF, BASE_BACKOFF * 2 ** attempt);
      reconnectRef.current = setTimeout(connect, delay + Math.random() * 300);
    }

    function connect() {
      if (closedRef.current) return;
      const token = localStorage.getItem("token");
      if (!token) {
        scheduleReconnect();
        return;
      }
      let ws;
      try {
        ws = new WebSocket(socketUrl());
      } catch {
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));
      ws.onmessage = (e) => {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.type === "success") {
          attemptsRef.current = 0;
          return;
        }
        if (msg.type === "error") return;
        applyEvent(msg);
      };
      ws.onerror = () => {
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
        ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
      }
    };
  }, [enabled, queryClient]);
}
