import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { workspaceService } from "../services/api";

const WORKSPACES_KEY = ["workspaces"];

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: async () => (await workspaceService.list()).data,
  });
}

export function useWorkspace(id) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: async () => (await workspaceService.get(id)).data,
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await workspaceService.create(data)).data,
    onSuccess: (ws) => {
      qc.setQueryData(WORKSPACES_KEY, (old = []) => [ws, ...old]);
      notifications.show({ message: "Workspace created", color: "teal" });
    },
    onError: () =>
      notifications.show({ message: "Could not create workspace", color: "red" }),
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await workspaceService.remove(id);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(WORKSPACES_KEY, (old = []) => old.filter((w) => w.id !== id));
      notifications.show({ message: "Workspace deleted", color: "gray" });
    },
    onError: () =>
      notifications.show({ message: "Could not delete workspace", color: "red" }),
  });
}
