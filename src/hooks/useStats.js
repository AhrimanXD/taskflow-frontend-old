import { useQuery } from "@tanstack/react-query";
import { statsService } from "../services/api";

export function useOverview() {
  return useQuery({
    queryKey: ["stats-overview"],
    queryFn: async () => (await statsService.overview()).data,
  });
}
