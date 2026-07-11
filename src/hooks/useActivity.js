import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "../services/api";

// Recent workspace activity (newest first). The workspace socket prepends live
// events to this same cache key, so the feed stays current.
export function useActivity(workspaceId) {
  return useQuery({
    queryKey: ["workspace-activity", workspaceId],
    queryFn: async () => (await workspaceService.activity(workspaceId)).data,
    enabled: workspaceId != null,
  });
}
