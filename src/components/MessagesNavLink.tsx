import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export function MessagesNavLink({ className, iconSize = 14 }: { className?: string; iconSize?: number }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const isActive = location.pathname === "/messages";

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchUnread = async () => {
      // Get all conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, last_message_at, user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (!convos || convos.length === 0) { setUnreadCount(0); return; }

      // Get read timestamps
      const { data: reads } = await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      const readMap: Record<string, string> = {};
      (reads || []).forEach((r: any) => { readMap[r.conversation_id] = r.last_read_at; });

      // Count conversations with messages after last read
      let count = 0;
      for (const conv of convos as any[]) {
        const lastRead = readMap[conv.id];
        if (!lastRead || new Date(conv.last_message_at) > new Date(lastRead)) {
          // Check if latest message is from someone else
          const { data: latestMsg } = await supabase
            .from("direct_messages")
            .select("sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);
          if (latestMsg && latestMsg.length > 0 && (latestMsg[0] as any).sender_id !== user.id) {
            count++;
          }
        }
      }
      setUnreadCount(count);
    };

    fetchUnread();

    // Listen for new DMs
    const channel = supabase
      .channel("nav-dm-unread")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
      }, (payload) => {
        if ((payload.new as any).sender_id !== user.id) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Re-check when navigating away from messages (user may have read them)
  useEffect(() => {
    if (!user || location.pathname === "/messages") return;
    // Small delay to let conversation_reads update propagate
    const timer = setTimeout(() => {
      // Trigger a lightweight re-fetch
      const refetch = async () => {
        const { data: convos } = await supabase
          .from("conversations")
          .select("id, last_message_at")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        if (!convos || convos.length === 0) { setUnreadCount(0); return; }
        const { data: reads } = await supabase
          .from("conversation_reads")
          .select("conversation_id, last_read_at")
          .eq("user_id", user.id);
        const readMap: Record<string, string> = {};
        (reads || []).forEach((r: any) => { readMap[r.conversation_id] = r.last_read_at; });
        let count = 0;
        for (const conv of convos as any[]) {
          const lastRead = readMap[conv.id];
          if (!lastRead || new Date(conv.last_message_at) > new Date(lastRead)) {
            const { data: latestMsg } = await supabase
              .from("direct_messages")
              .select("sender_id")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1);
            if (latestMsg && latestMsg.length > 0 && (latestMsg[0] as any).sender_id !== user.id) {
              count++;
            }
          }
        }
        setUnreadCount(count);
      };
      refetch();
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, user]);

  if (!user) return null;

  return (
    <Link
      to="/messages"
      className={className || `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body transition-all duration-300 ${
        isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
      }`}
    >
      <span className="relative">
        <MessageCircle size={iconSize} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
      Messages
    </Link>
  );
}
