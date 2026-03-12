import { useAuth } from "@/components/AuthProvider";

export function useAdminCheck() {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
}
