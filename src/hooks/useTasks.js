import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      // Idempotent insert: the realtime socket may have already added this
      // task (the server broadcasts before returning the HTTP response), so
      // dedupe by id to avoid a duplicate card.
      qc.setQueryData(key, (old = []) =>
        old.some((t) => t.id === task.id) ? old : [task, ...old]
      );
      toast.success("Task created");
    },
    onError: (err) => toast.error(errMsg(err, "Could not create task")),
  });
}

export function useUpdateTask(workspaceId) {
  const qc = useQueryClient();
  const key = keyFor(workspaceId);
  return useMutation({
    mutationFn: async ({ id, data }) => {
      // OCC: workspace edits must carry the version the client last saw. Pull it
      // from cache so callers don't have to thread it through every mutate call.
      let payload = data;
      if (workspaceId != null && data.version === undefined) {
        const cached = qc.getQueryData(key)?.find((t) => t.id === id);
        if (cached?.version != null) payload = { ...data, version: cached.version };
      }
      return (await serviceFor(workspaceId).update(id, payload)).data;
    },
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
      // Roll back the optimistic edit first.
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      // 409 = someone else changed this task. The server sends the current
      // state; show it and ask the user to retry rather than clobbering.
      if (err?.response?.status === 409) {
        const current = err?.response?.data?.detail?.current;
        if (current) {
          qc.setQueryData(key, (old = []) =>
            old.map((t) => (t.id === current.id ? current : t))
          );
        }
        toast.error(
          "This task was just changed by someone else — showing the latest. Please review and retry."
        );
        return;
      }
      toast.error(errMsg(err, "Could not update task"));
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
      toast("Task deleted");
    },
    onError: (err) => toast.error(errMsg(err, "Could not delete task")),
  });
}
