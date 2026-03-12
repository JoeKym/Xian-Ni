import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, MessageSquareHeart, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { RoleBadge } from "@/pages/Members";

interface Review {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  page_path: string;
  created_at: string;
  user_id: string | null;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            size={interactive ? 18 : 14}
            className={star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function FeedbackReviews({ pagePath }: { pagePath: string }) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("page_path", pagePath)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setReviews(data as Review[]);
        const userIds = [...new Set(data.filter(r => r.user_id).map(r => r.user_id as string))];
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
    fetchReviews();

    const channel = supabase
      .channel(`reviews-${pagePath}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pagePath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setSending(true);

    // AI moderation
    try {
      const { data: modData } = await supabase.functions.invoke("moderate-content", {
        body: { content: content.trim(), user_id: user.id },
      });
      if (modData && !modData.allowed) {
        alert("Your review was flagged as inappropriate. Please keep feedback constructive.");
        if (modData.severity === "severe" || modData.severity === "moderate") {
          window.location.href = "/suspended";
        }
        setSending(false);
        return;
      }
    } catch {}

    await supabase.from("reviews").insert({
      page_path: pagePath,
      author_name: profile?.display_name || "Cultivator",
      content: content.trim(),
      rating,
      user_id: user.id,
    });
    setContent("");
    setRating(5);
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <section className="py-12 border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 mx-auto text-primary hover:text-primary/80 transition-colors"
        >
          <MessageSquareHeart size={20} />
          <span className="font-heading text-lg tracking-wider">
            Feedback & Reviews ({reviews.length})
          </span>
          <span className="text-sm text-muted-foreground">★ {avgRating}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-6">
                {/* Submit form */}
                {user ? (
                  <form onSubmit={handleSubmit} className="gradient-card border border-border rounded-lg p-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-body">
                      Reviewing as <span className="text-primary">{profile?.display_name || "Cultivator"}</span>
                    </p>
                    <StarRating rating={rating} onRate={setRating} interactive />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Share your thoughts about this page..."
                        value={content}
                        onChange={(e) => setContent(e.target.value.slice(0, 500))}
                        className="flex-1 bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                      <Button type="submit" disabled={!content.trim() || sending} size="sm" className="gap-1.5">
                        <Send size={14} /> Post
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{content.length}/500</p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground font-body">
                      <a href="/login" className="text-primary hover:underline">Sign in</a> to leave a review
                    </p>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center italic font-body">
                      No reviews yet. Be the first to share your thoughts!
                    </p>
                  )}
                  {reviews.map((r) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="gradient-card border border-border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {r.user_id && (
                            <Avatar className="h-5 w-5 border border-primary/20">
                              <AvatarImage src={avatars[r.user_id] || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-heading">
                                {r.author_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {r.user_id && usernames[r.user_id] ? (
                            <Link to={`/u/${usernames[r.user_id]}`} className="font-heading text-xs text-primary/80 hover:text-primary hover:underline transition-colors">
                              {r.author_name}
                            </Link>
                          ) : (
                            <span className="font-heading text-xs text-primary/80">{r.author_name}</span>
                          )}
                          {r.user_id && roles[r.user_id] && (
                            <RoleBadge role={roles[r.user_id]} size="xs" />
                          )}
                          <StarRating rating={r.rating} />
                        </div>
                        <div className="flex items-center gap-1">
                          {user && r.user_id === user.id && (
                            <button onClick={() => handleDelete(r.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 size={12} />
                            </button>
                          )}
                          <span className="text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-body text-foreground/80">{r.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
