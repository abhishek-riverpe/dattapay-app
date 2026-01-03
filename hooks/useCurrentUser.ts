import apiClient from "@/lib/api-client";
import { APIResponse, User } from "@/schemas";
import { useQuery } from "@tanstack/react-query";

const useCurrentUser = () =>
  useQuery<APIResponse<User>>({
    queryKey: ["current"],
    queryFn: () => apiClient.get("/users/me").then((res) => res.data),
    // Refetch every 60 seconds instead of 10 to reduce unnecessary requests
    refetchInterval: 60_000,
  });

export default useCurrentUser;
