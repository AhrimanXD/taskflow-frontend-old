import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { workspaceService } from "../services/api";

const WORKSPACES_KEY = ["workspaces"];

function memberErr(err, fallback) {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

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

// Members of one workspace — drives the assignee picker. Keyed per workspace.
export function useWorkspaceMembers(workspaceId) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => (await workspaceService.members(workspaceId)).data,
    enabled: workspaceId != null,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await workspaceService.create(data)).data,
    onSuccess: (ws) => {
      qc.setQueryData(WORKSPACES_KEY, (old = []) => [ws, ...old]);
      toast.success("Workspace created");
    },
    onError: () => toast.error("Could not create workspace"),
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
      toast("Workspace deleted");
    },
    onError: () => toast.error("Could not delete workspace"),
  });
}

const membersKey = (workspaceId) => ["workspace-members", workspaceId];

export function useRemoveMember(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      await workspaceService.removeMember(workspaceId, userId);
      return userId;
    },
    onSuccess: (userId) => {
      qc.setQueryData(membersKey(workspaceId), (old = []) =>
        old.filter((m) => m.user_id !== userId)
      );
      toast("Member removed");
    },
    onError: (err) => toast.error(memberErr(err, "Could not remove member")),
  });
}

export function useUpdateMemberRole(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }) =>
      (await workspaceService.updateMemberRole(workspaceId, userId, role)).data,
    onSuccess: (member) => {
      qc.setQueryData(membersKey(workspaceId), (old = []) =>
        old.map((m) => (m.user_id === member.user_id ? { ...m, role: member.role } : m))
      );
      toast.success(`Role updated to ${member.role}`);
    },
    onError: (err) => toast.error(memberErr(err, "Could not update role")),
  });
}

export function useLeaveWorkspace(workspaceId) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      await workspaceService.leave(workspaceId);
    },
    onSuccess: () => {
      qc.setQueryData(WORKSPACES_KEY, (old = []) =>
        old.filter((w) => w.id !== workspaceId)
      );
      qc.removeQueries({ queryKey: membersKey(workspaceId) });
      toast("You left the workspace");
      navigate("/workspaces");
    },
    onError: (err) => toast.error(memberErr(err, "Could not leave workspace")),
  });
}
