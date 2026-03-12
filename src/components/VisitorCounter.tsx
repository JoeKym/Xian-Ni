import { useState, useEffect, useRef } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

function getSessionId() {
  let id = sessionStorage.getItem("visitor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("visitor_session_id", id);
  }
  return id;
}

export function VisitorCounter() {
  const [count, setCount] = useState(0);
  const location = useLocation();
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    const upsertVisitor = async () => {
      // Cleanup stale visitors first
      await supabase.rpc("cleanup_stale_visitors");

      // Upsert current visitor
      await supabase.from("active_visitors").upsert(
        { session_id: sessionId.current, current_page: location.pathname, last_seen: new Date().toISOString() },
        { onConflict: "session_id" }
      );
    };

    const fetchCount = async () => {
      const { count: c } = await supabase
        .from("active_visitors")
        .select("*", { count: "exact", head: true });
      if (c !== null) setCount(c);
    };

    upsertVisitor().then(fetchCount);

    // Heartbeat every 60s
    const interval = setInterval(() => {
      upsertVisitor().then(fetchCount);
    }, 60000);

    // Listen for changes
    const channel = supabase
      .channel("visitors")
      .on("postgres_changes", { event: "*", schema: "public", table: "active_visitors" }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [location.pathname]);

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Eye size={14} className="text-jade" />
      <span className="text-xs font-heading tracking-wider">{count}</span>
    </div>
  );
}
