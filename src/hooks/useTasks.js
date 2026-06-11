import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { taskService, workspaceTaskService } from "../services/api";

// One set of hooks for both trees: pass a workspaceId for workspace tasks,
// omit it for personal tasks. Each scope gets its own cache entry.
const keyFor = (workspaceId) => ["tasks", workspaceId ?? "personal"];

function serviceFor(workspaceId) {
  if (workspaceId == null) return taskService;
  return {
    list: (params) => workspaceTaskService.list(workspaceId, params),
    create: (data) => workspaceTaskService.create(workspaceId, data),
    update: (id, data) => workspaceTaskService.update(workspaceId, id, data),
    remove: (id) => workspaceTaskService.remove(workspaceId, id),
  };
}

// Server guards return meaningful details (403 delete policy, 400 invalid
// assignee) — show those instead of a generic message when present.
function errMsg(err, fallback) {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export function useTasks(workspaceId) {
  return useQuery({
    queryKey: keyFor(workspaceId),
    queryFn: async () => (await serviceFor(workspaceId).list()).data,
  });
}

export function useCreateTask(workspaceId) {
  const qc = useQueryClient();
  const key = keyFor(workspaceId);
  return useMutation({
    mutationFn: async (data) => (await serviceFor(workspaceId).create(data)).data,
    onSuccess: (task) => {
      qc.setQueryData(key, (old = []) => [task, ...old]);
      notifications.show({ message: "Task created", color: "teal" });
    },
    onError: (err) =>
      notifications.show({
        message: errMsg(err, "Could not create task"),
        color: "red",
      }),
  });
}

export function useUpdateTask(workspaceId) {
  const qc = useQueryClient();
  const key = keyFor(workspaceId);
  return useMutation({
    mutationFn: async ({ id, data }) =>
      (await serviceFor(workspaceId).update(id, data)).data,
    // optimistic update so status toggles feel instant
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      notifications.show({
        message: errMsg(err, "Could not update task"),
        color: "red",
      });
    },
    onSuccess: (task) => {
      qc.setQueryData(key, (old = []) =>
        old.map((t) => (t.id === task.id ? task : t))
      );
    },
  });
}

export function useDeleteTask(workspaceId) {
  const qc = useQueryClient();
  const key = keyFor(workspaceId);
  return useMutation({
    mutationFn: async (id) => {
      await serviceFor(workspaceId).remove(id);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(key, (old = []) => old.filter((t) => t.id !== id));
      notifications.show({ message: "Task deleted", color: "gray" });
    },
    onError: (err) =>
      notifications.show({
        message: errMsg(err, "Could not delete task"),
        color: "red",
      }),
  });
}
