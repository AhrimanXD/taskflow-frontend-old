import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invitationService } from "../services/api";

const MINE_KEY = ["invitations", "mine"];

// Invitations the current user has received (defaults to pending only).
export function useMyInvitations(status = "pending") {
  return useQuery({
    queryKey: [...MINE_KEY, status ?? "all"],
    queryFn: async () =>
      (await invitationService.listMine(status ? { status } : {})).data,
  });
}

export function useRespondInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }) => {
      if (action === "accept") return (await invitationService.accept(id)).data;
      return (await invitationService.decline(id)).data;
    },
    onSuccess: (_data, { action }) => {
      qc.invalidateQueries({ queryKey: MINE_KEY });
      if (action === "accept") {
        // accepting grants membership — refresh the workspace list
        qc.invalidateQueries({ queryKey: ["workspaces"] });
        toast.success("Invitation accepted");
      } else {
        toast("Invitation declined");
      }
    },
    onError: () => toast.error("Could not respond to invitation"),
  });
}

// Invitations sent within a workspace (owner/admin view).
export function useWorkspaceInvitations(workspaceId, status = "pending") {
  return useQuery({
    queryKey: ["workspace", workspaceId, "invitations", status ?? "all"],
    queryFn: async () =>
      (
        await invitationService.listForWorkspace(
          workspaceId,
          status ? { status } : {}
        )
      ).data,
    enabled: !!workspaceId,
  });
}

export function useCreateInvitation(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) =>
      (await invitationService.create(workspaceId, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId, "invitations"] });
      toast.success("Invitation sent");
    },
    // error handled by the caller so it can show field-level feedback
  });
}

export function useRevokeInvitation(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await invitationService.revoke(id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId, "invitations"] });
      toast("Invitation revoked");
    },
    onError: () => toast.error("Could not revoke invitation"),
  });
}
