import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "./AuthProvider";
import { Layout } from "./Layout";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdminCheck();
  const { user } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin && user) {
      // Fire-and-forget ban for unauthorized access — no await needed
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ban-unauthorized-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      }).catch(() => {});
    }
  }, [loading, isAdmin, user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground font-body animate-pulse">Verifying access...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
