import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";
import { toast } from "sonner";

interface ForwardMessageModalProps {
  open: boolean;
  onClose: () => void;
  messageContent: string;
  imageUrl?: string | null;
  userId: string;
}

interface ConversationTarget {
  id: string;
  type: "dm" | "group";
  name: string;
  avatar_url: string | null;
  targetUserId?: string;
}

export function ForwardMessageModal({ open, onClose, messageContent, imageUrl, userId }: ForwardMessageModalProps) {
  const [targets, setTargets] = useState<ConversationTarget[]>([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      // Fetch DM conversations
      const { data: convos } = await supabase
        .from("conversations" as any).select("*")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      const dmTargets: ConversationTarget[] = [];
      if (convos) {
        const otherIds = (convos as any[]).map(c => c.user1_id === userId ? c.user2_id : c.user1_id);
        if (otherIds.length > 0) {
          const { data: profs } = await supabase.from("profiles")
            .select("user_id, display_name, avatar_url")
            .in("user_id", otherIds);
          if (profs) {
            (convos as any[]).forEach((c: any) => {
              const otherId = c.user1_id === userId ? c.user2_id : c.user1_id;
              const prof = (profs as any[]).find(p => p.user_id === otherId);
              dmTargets.push({
                id: c.id,
                type: "dm",
                name: prof?.display_name || "Cultivator",
                avatar_url: prof?.avatar_url,
                targetUserId: otherId,
              });
            });
          }
        }
      }

      // Fetch group chats
      const { data: groups } = await supabase.from("group_chats" as any).select("id, name, avatar_url");
      const groupTargets: ConversationTarget[] = (groups || []).map((g: any) => ({
        id: g.id, type: "group" as const, name: g.name, avatar_url: g.avatar_url,
      }));

      setTargets([...dmTargets, ...groupTargets]);
    };
    load();
  }, [open, userId]);

  const handleForward = async (target: ConversationTarget) => {
    setSending(target.id);
    try {
      const forwardedContent = `↪ Forwarded: ${messageContent}`;
      if (target.type === "dm") {
        const { error } = await supabase.from("direct_messages" as any).insert({
          conversation_id: target.id,
          sender_id: userId,
          content: forwardedContent,
          image_url: imageUrl || null,
        } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("group_messages" as any).insert({
          group_id: target.id,
          sender_id: userId,
          content: forwardedContent,
          image_url: imageUrl || null,
        } as any);
        if (error) throw error;
      }
      toast.success(`Forwarded to ${target.name}`);
      onClose();
    } catch {
      toast.error("Failed to forward message");
    }
    setSending(null);
  };

  const filtered = search.trim()
    ? targets.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : targets;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Forward Message</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="pl-9 h-8 text-xs" />
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filtered.length === 0 && <p className="text-center text-muted-foreground text-xs py-4">No conversations found</p>}
          {filtered.map(t => (
            <button
              key={`${t.type}-${t.id}`}
              onClick={() => handleForward(t)}
              disabled={sending === t.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
            >
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={t.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{t.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm text-foreground truncate">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.type === "group" ? "Group" : "Direct Message"}</p>
              </div>
              <Send size={14} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
        {/* Preview */}
        <div className="mt-2 p-2 rounded bg-muted/30 border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1">Forwarding:</p>
          <p className="text-xs text-foreground truncate">{messageContent}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
