import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/api";

export const NOTIFS_KEY = ["notifications"];
export const UNREAD_KEY = ["notifications-unread"];

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFS_KEY,
    queryFn: async () => (await notificationService.list()).data,
    enabled,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: async () => (await notificationService.unreadCount()).data.count,
    enabled,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: (_res, id) => {
      qc.setQueryData(NOTIFS_KEY, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      qc.setQueryData(UNREAD_KEY, (c = 0) => Math.max(0, c - 1));
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.setQueryData(NOTIFS_KEY, (old = []) =>
        old.map((n) => ({ ...n, is_read: true }))
      );
      qc.setQueryData(UNREAD_KEY, 0);
    },
  });
}
