import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { taskService } from "../services/api";

const TASKS_KEY = ["tasks"];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async () => (await taskService.list()).data,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await taskService.create(data)).data,
    onSuccess: (task) => {
      qc.setQueryData(TASKS_KEY, (old = []) => [task, ...old]);
      notifications.show({ message: "Task created", color: "teal" });
    },
    onError: () =>
      notifications.show({ message: "Could not create task", color: "red" }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => (await taskService.update(id, data)).data,
    // optimistic update so status toggles feel instant
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData(TASKS_KEY);
      qc.setQueryData(TASKS_KEY, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(TASKS_KEY, ctx.previous);
      notifications.show({ message: "Could not update task", color: "red" });
    },
    onSuccess: (task) => {
      qc.setQueryData(TASKS_KEY, (old = []) =>
        old.map((t) => (t.id === task.id ? task : t))
      );
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await taskService.remove(id);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(TASKS_KEY, (old = []) => old.filter((t) => t.id !== id));
      notifications.show({ message: "Task deleted", color: "gray" });
    },
    onError: () =>
      notifications.show({ message: "Could not delete task", color: "red" }),
  });
}
