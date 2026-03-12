import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Pencil, Trash2, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { RoleBadge } from "@/pages/Members";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

export function CharacterComments({ characterId, characterName }: { characterId: string; characterName: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (profile) setName(profile.display_name);
  }, [profile]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("character_id", characterId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) {
        setComments(data);
        // Fetch usernames for comments with user_id
        const userIds = [...new Set(data.filter(c => c.user_id).map(c => c.user_id as string))];
        if (userIds.length > 0) {
          const [profilesRes, rolesRes] = await Promise.all([
            supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds),
            supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
          ]);
          if (profilesRes.data) {
            const uMap: Record<string, string> = {};
            const aMap: Record<string, string | null> = {};
            profilesRes.data.forEach(p => {
              if (p.username) uMap[p.user_id] = p.username;
              aMap[p.user_id] = p.avatar_url;
            });
            setUsernames(uMap);
            setAvatars(aMap);
          }
          if (rolesRes.data) {
            const rMap: Record<string, string> = {};
            rolesRes.data.forEach(r => {
              if (!rMap[r.user_id] || r.role === "admin") rMap[r.user_id] = r.role;
            });
            setRoles(rMap);
          }
        }
      }
    };
    fetchComments();

    const channel = supabase
      .channel(`comments-${characterId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `character_id=eq.${characterId}` },
        () => { fetchComments(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [characterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 1000) return;
    setSending(true);

    // AI moderation check
    try {
      const { data: modData, error: modError } = await supabase.functions.invoke("moderate-content", {
        body: { content: content.trim(), user_id: user?.id || null },
      });

      if (!modError && modData && !modData.allowed) {
        const severity = modData.severity;
        if (severity === "severe") {
          alert("Your account has been banned for posting severely inappropriate content. Contact mail.jkyme@gmail.com to appeal.");
          window.location.href = "/suspended";
        } else {
          alert("Your comment was flagged as inappropriate and your account has been suspended for 7 days. Contact mail.jkyme@gmail.com to appeal.");
          window.location.href = "/suspended";
        }
        setSending(false);
        return;
      }
    } catch {
      // If moderation fails, allow the comment through
    }

    await supabase.from("comments").insert({
      character_id: characterId,
      author_name: name.trim() || "Anonymous Cultivator",
      content: content.trim(),
      user_id: user?.id || null,
    });
    setContent("");
    setSending(false);
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;
    await supabase.from("comments").update({ content: editContent.trim() }).eq("id", id);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
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
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-heading text-primary/70 hover:text-primary transition-colors"
      >
        <MessageCircle size={16} />
        <span>Discuss {characterName} ({comments.length})</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {!user && (
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 50))}
                    className="bg-muted/50 border border-border rounded px-3 py-1.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                )}
                {user && (
                  <p className="text-[10px] text-muted-foreground font-body">Commenting as <span className="text-primary">{profile?.display_name || "Cultivator"}</span></p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Share your thoughts on this character..."
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                    className="flex-1 bg-muted/50 border border-border rounded px-3 py-1.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="submit"
                    disabled={!content.trim() || sending}
                    className="px-3 py-1.5 rounded gradient-gold text-primary-foreground disabled:opacity-40 transition-opacity"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground font-body italic">No comments yet. Be the first to discuss!</p>
                )}
                {comments.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-card border border-border rounded p-2.5"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        {c.user_id && (
                          <Avatar className="h-5 w-5 border border-primary/20">
                            <AvatarImage src={avatars[c.user_id] || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-heading">
                              {c.author_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {c.user_id && usernames[c.user_id] ? (
                          <Link to={`/u/${usernames[c.user_id]}`} className="font-heading text-xs text-primary/80 hover:text-primary hover:underline transition-colors">
                            {c.author_name}
                          </Link>
                        ) : (
                          <span className="font-heading text-xs text-primary/80">{c.author_name}</span>
                        )}
                        {c.user_id && roles[c.user_id] && (
                          <RoleBadge role={roles[c.user_id]} size="xs" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {user && c.user_id === user.id && editingId !== c.id && (
                          <>
                            <button onClick={() => { setEditingId(c.id); setEditContent(c.content); }} className="text-muted-foreground hover:text-primary transition-colors">
                              <Pencil size={10} />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-secondary transition-colors">
                              <Trash2 size={10} />
                            </button>
                          </>
                        )}
                        <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                      </div>
                    </div>
                    {editingId === c.id ? (
                      <div className="flex gap-1.5">
                        <input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value.slice(0, 1000))}
                          className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
                        />
                        <button onClick={() => handleEdit(c.id)} className="text-jade"><Check size={12} /></button>
                        <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X size={12} /></button>
                      </div>
                    ) : (
                      <p className="text-sm font-body text-foreground/80">{c.content}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
