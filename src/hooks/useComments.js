import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentService } from "../services/api";

const commentsKey = (workspaceId, taskId) => ["comments", workspaceId, taskId];

function errMsg(err, fallback) {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export function useComments(workspaceId, taskId) {
  return useQuery({
    queryKey: commentsKey(workspaceId, taskId),
    queryFn: async () => (await commentService.list(workspaceId, taskId)).data,
    enabled: workspaceId != null && taskId != null,
  });
}

export function useCreateComment(workspaceId, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) =>
      (await commentService.create(workspaceId, taskId, body)).data,
    onSuccess: (comment) => {
      // The socket may have already appended it (server broadcasts before the
      // POST returns) — dedupe by id.
      qc.setQueryData(commentsKey(workspaceId, taskId), (old = []) =>
        old.some((c) => c.id === comment.id) ? old : [...old, comment]
      );
    },
    onError: (err) => toast.error(errMsg(err, "Could not post comment")),
  });
}

export function useDeleteComment(workspaceId, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId) => {
      await commentService.remove(workspaceId, taskId, commentId);
      return commentId;
    },
    onSuccess: (id) => {
      qc.setQueryData(commentsKey(workspaceId, taskId), (old = []) =>
        old.filter((c) => c.id !== id)
      );
    },
    onError: (err) => toast.error(errMsg(err, "Could not delete comment")),
  });
}
