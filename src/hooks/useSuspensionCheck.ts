import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface SuspensionInfo {
  is_suspended: boolean;
  type?: string;
  reason?: string;
  expires_at?: string;
}

export function useSuspensionCheck() {
  const { user, loading: authLoading } = useAuth();
  const [suspension, setSuspension] = useState<SuspensionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSuspension(null);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data, error } = await supabase.rpc("is_user_suspended", { _user_id: user.id });
      if (!error && data) {
        setSuspension(data as unknown as SuspensionInfo);
      }
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  return {
    isSuspended: suspension?.is_suspended ?? false,
    suspensionType: suspension?.type,
    loading: loading || authLoading,
  };
}
