import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UsersRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export function GroupsNavLink({ iconSize = 14 }: { iconSize?: number }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const isActive = location.pathname === "/groups";

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchUnread = async () => {
      // Get groups I'm a member of
      const { data: memberships } = await supabase
        .from("group_members" as any).select("group_id").eq("user_id", user.id);
      if (!memberships || memberships.length === 0) { setUnreadCount(0); return; }

      const groupIds = (memberships as any[]).map(m => m.group_id);

      // Get my read timestamps
      const { data: reads } = await supabase
        .from("group_reads" as any).select("group_id, last_read_at").eq("user_id", user.id);
      const readMap: Record<string, string> = {};
      (reads || []).forEach((r: any) => { readMap[r.group_id] = r.last_read_at; });

      // For each group, check if there are messages after my last read
      let count = 0;
      for (const gid of groupIds) {
        const lastRead = readMap[gid];
        let query = supabase.from("group_messages" as any).select("id", { count: "exact", head: true })
          .eq("group_id", gid).neq("sender_id", user.id);
        if (lastRead) query = query.gt("created_at", lastRead);
        const { count: msgCount } = await query;
        if (msgCount && msgCount > 0) count++;
      }
      setUnreadCount(count);
    };

    fetchUnread();

    const channel = supabase.channel("nav-group-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages" }, (payload) => {
        if ((payload.new as any).sender_id !== user.id) {
          setUnreadCount(prev => prev + 1);
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (!user || location.pathname === "/groups") return;
    const timer = setTimeout(async () => {
      const { data: memberships } = await supabase
        .from("group_members" as any).select("group_id").eq("user_id", user.id);
      if (!memberships || memberships.length === 0) { setUnreadCount(0); return; }
      const groupIds = (memberships as any[]).map(m => m.group_id);
      const { data: reads } = await supabase
        .from("group_reads" as any).select("group_id, last_read_at").eq("user_id", user.id);
      const readMap: Record<string, string> = {};
      (reads || []).forEach((r: any) => { readMap[r.group_id] = r.last_read_at; });
      let count = 0;
      for (const gid of groupIds) {
        const lastRead = readMap[gid];
        let query = supabase.from("group_messages" as any).select("id", { count: "exact", head: true })
          .eq("group_id", gid).neq("sender_id", user.id);
        if (lastRead) query = query.gt("created_at", lastRead);
        const { count: msgCount } = await query;
        if (msgCount && msgCount > 0) count++;
      }
      setUnreadCount(count);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, user]);

  if (!user) return null;

  return (
    <Link
      to="/groups"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body transition-all duration-300 ${
        isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
      }`}
    >
      <span className="relative">
        <UsersRound size={iconSize} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
      Groups
    </Link>
  );
}
