import { getAll } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

export function useFetch(endpoint, params) {
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: () => getAll(endpoint, params),
    staleTime: 60 * 1000 * 10, // 10 minutes
  });
}
