import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceMode() {
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceEta, setMaintenanceEta] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .in("key", ["maintenance_mode", "maintenance_eta"]);
      if (!error && data) {
        (data as any[]).forEach((row: any) => {
          if (row.key === "maintenance_mode") setMaintenance(row.value === "true");
          if (row.key === "maintenance_eta" && row.value) setMaintenanceEta(row.value);
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  return { maintenance, maintenanceEta, loading };
}
