import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  page_link: string | null;
  target_user_id: string | null;
  created_at: string;
}

interface Invite {
  id: string;
  community_id: string;
  invited_by: string;
  status: string;
  created_at: string;
  community_name?: string;
  inviter_name?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => localStorage.getItem("notif_last_seen") || "");

  const myNotifications = notifications.filter(
    (n) => !n.target_user_id || (user && n.target_user_id === user.id)
  );
  const unread = myNotifications.filter((n) => !lastSeen || n.created_at > lastSeen).length + invites.length;

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) setNotifications(data as Notification[]);
    };
    fetchNotifs();

    if (user) {
      const fetchInvites = async () => {
        const { data } = await supabase
          .from("community_invites")
          .select("*")
          .eq("invited_user_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          // Enrich with community names and inviter names
          const comIds = [...new Set(data.map(i => i.community_id))];
          const inviterIds = [...new Set(data.map(i => i.invited_by))];
          const [{ data: coms }, { data: profiles }] = await Promise.all([
            supabase.from("communities").select("id, name").in("id", comIds),
            supabase.from("profiles").select("user_id, display_name").in("user_id", inviterIds),
          ]);
          const comMap: Record<string, string> = {};
          coms?.forEach((c: any) => { comMap[c.id] = c.name; });
          const profMap: Record<string, string> = {};
          profiles?.forEach((p: any) => { profMap[p.user_id] = p.display_name; });
          setInvites(data.map(i => ({
            ...i,
            community_name: comMap[i.community_id] || "a community",
            inviter_name: profMap[i.invited_by] || "Someone",
          })));
        }
      };
      fetchInvites();
    }

    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 30));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const now = new Date().toISOString();
      setLastSeen(now);
      localStorage.setItem("notif_last_seen", now);
    }
  };

  const handleAcceptInvite = async (invite: Invite) => {
    if (!user) return;
    // Update invite status
    await supabase.from("community_invites").update({ status: "accepted" }).eq("id", invite.id);
    // Join community
    const { error } = await supabase.from("community_members").insert({
      community_id: invite.community_id,
      user_id: user.id,
      role: "member",
    });
    if (error) { toast.error("Failed to join community"); return; }
    setInvites(prev => prev.filter(i => i.id !== invite.id));
    toast.success(`Joined ${invite.community_name}!`);
  };

  const handleDeclineInvite = async (invite: Invite) => {
    await supabase.from("community_invites").update({ status: "declined" }).eq("id", invite.id);
    setInvites(prev => prev.filter(i => i.id !== invite.id));
    toast.success("Invite declined");
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-1.5 text-muted-foreground hover:text-primary transition-colors">
        <Bell size={18} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary text-secondary-foreground text-[9px] flex items-center justify-center font-heading"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 bottom-full mb-2 w-80 z-50 gradient-card border border-border rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border">
                <h3 className="font-heading text-xs text-primary tracking-wider uppercase">Notifications</h3>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {/* Pending invites */}
                {invites.map((inv) => (
                  <div key={`inv-${inv.id}`} className="px-3 py-2.5 border-b border-border/50 bg-primary/5">
                    <div className="flex justify-between items-start">
                      <span className="font-heading text-xs text-foreground">Community Invite</span>
                      <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{timeAgo(inv.created_at)}</span>
                    </div>
                    <p className="text-xs font-body text-muted-foreground mt-0.5">
                      {inv.inviter_name} invited you to <span className="text-foreground">{inv.community_name}</span>
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptInvite(inv)}
                        className="flex items-center gap-1 text-[10px] font-heading px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Check size={10} /> Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(inv)}
                        className="flex items-center gap-1 text-[10px] font-heading px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={10} /> Decline
                      </button>
                    </div>
                  </div>
                ))}

                {myNotifications.length === 0 && invites.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-muted-foreground font-body text-center">No notifications yet</p>
                ) : (
                  myNotifications.map((n) => {
                    const isNew = !lastSeen || n.created_at > lastSeen;
                    return (
                      <div key={n.id} className={`px-3 py-2 border-b border-border/50 ${isNew ? "bg-primary/5" : ""}`}>
                        <div className="flex justify-between items-start">
                          <span className="font-heading text-xs text-foreground">{n.title}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="text-xs font-body text-muted-foreground mt-0.5">{n.message}</p>
                        {n.page_link && (
                          <Link
                            to={n.page_link}
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] text-primary hover:underline font-heading mt-1 inline-block"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
