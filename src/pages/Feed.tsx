import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { TrendingUp, MessageSquare, Users, Clock, Heart, ArrowRight, Bookmark } from "lucide-react";
import { PostActions } from "@/components/PostActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  community_id: string;
  image_url?: string | null;
  community_name?: string;
  community_avatar?: string | null;
  author_name?: string;
  author_avatar?: string | null;
  author_username?: string | null;
  like_count?: number;
}

interface TrendingCommunity {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  activity: number;
}

interface ActiveMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  username: string | null;
  post_count: number;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [trending, setTrending] = useState<TrendingCommunity[]>([]);
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"trending" | "recent" | "saved">("trending");
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFeed = async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch recent posts
      const { data: postData } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (postData && postData.length > 0) {
        const comIds = [...new Set(postData.map(p => p.community_id))];
        const userIds = [...new Set(postData.map(p => p.user_id))];
        const postIds = postData.map(p => p.id);

        const [{ data: coms }, { data: profiles }, { data: allLikes }] = await Promise.all([
          supabase.from("communities").select("id, name, avatar_url").in("id", comIds),
          supabase.from("profiles").select("user_id, display_name, avatar_url, username").in("user_id", userIds),
          supabase.from("post_likes" as any).select("post_id, user_id").in("post_id", postIds),
        ]);

        const comMap: Record<string, any> = {};
        coms?.forEach((c: any) => { comMap[c.id] = c; });
        const profMap: Record<string, any> = {};
        profiles?.forEach((p: any) => { profMap[p.user_id] = p; });

        // Count likes per post
        const lc: Record<string, number> = {};
        const ul = new Set<string>();
        (allLikes as any[])?.forEach((l: any) => {
          lc[l.post_id] = (lc[l.post_id] || 0) + 1;
          if (user && l.user_id === user.id) ul.add(l.post_id);
        });
        setLikeCounts(lc);
        setUserLikes(ul);

        // Fetch bookmarks
        if (user) {
          const { data: bookmarks } = await supabase
            .from("post_bookmarks" as any)
            .select("post_id")
            .eq("user_id", user.id);
          if (bookmarks) {
            setSavedPostIds(new Set((bookmarks as any[]).map((b: any) => b.post_id)));
          }
        }

        setPosts(postData.map(p => ({
          ...p,
          community_name: comMap[p.community_id]?.name || "Unknown",
          community_avatar: comMap[p.community_id]?.avatar_url,
          author_name: profMap[p.user_id]?.display_name || "Cultivator",
          author_avatar: profMap[p.user_id]?.avatar_url,
          author_username: profMap[p.user_id]?.username,
          like_count: lc[p.id] || 0,
        })));
      }

      // Trending communities
      const { data: allComs } = await supabase
        .from("communities")
        .select("id, name, avatar_url")
        .eq("is_active", true)
        .limit(20);

      if (allComs && allComs.length > 0) {
        const ids = allComs.map(c => c.id);
        const [{ data: members }, { data: recentPosts }, { data: recentMsgs }] = await Promise.all([
          supabase.from("community_members").select("community_id").in("community_id", ids),
          supabase.from("community_posts").select("community_id").in("community_id", ids).gte("created_at", weekAgo),
          supabase.from("community_messages").select("community_id").in("community_id", ids).gte("created_at", weekAgo),
        ]);

        const memCount: Record<string, number> = {};
        members?.forEach((m: any) => { memCount[m.community_id] = (memCount[m.community_id] || 0) + 1; });
        const actCount: Record<string, number> = {};
        recentPosts?.forEach((p: any) => { actCount[p.community_id] = (actCount[p.community_id] || 0) + 1; });
        recentMsgs?.forEach((m: any) => { actCount[m.community_id] = (actCount[m.community_id] || 0) + 1; });

        setTrending(
          allComs.map(c => ({
            ...c,
            member_count: memCount[c.id] || 0,
            activity: actCount[c.id] || 0,
          }))
          .sort((a, b) => b.activity - a.activity)
          .slice(0, 5)
        );
      }

      // Most active members (by post count this week)
      const { data: weekPosts } = await supabase
        .from("community_posts")
        .select("user_id")
        .gte("created_at", weekAgo);

      if (weekPosts && weekPosts.length > 0) {
        const countMap: Record<string, number> = {};
        weekPosts.forEach((p: any) => { countMap[p.user_id] = (countMap[p.user_id] || 0) + 1; });
        const topIds = Object.entries(countMap).sort(([,a],[,b]) => b - a).slice(0, 5).map(([id]) => id);

        const { data: topProfiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, username")
          .in("user_id", topIds);

        if (topProfiles) {
          setActiveMembers(
            topProfiles.map(p => ({
              ...p,
              post_count: countMap[p.user_id] || 0,
            })).sort((a, b) => b.post_count - a.post_count)
          );
        }
      }

      setLoading(false);
    };
    fetchFeed();

    // Realtime: refresh on new posts
    const channel = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, () => fetchFeed())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const liked = userLikes.has(postId);
    if (liked) {
      await supabase.from("post_likes" as any).delete().eq("post_id", postId).eq("user_id", user.id);
      setUserLikes(prev => { const n = new Set(prev); n.delete(postId); return n; });
      setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));
    } else {
      await supabase.from("post_likes" as any).insert({ post_id: postId, user_id: user.id } as any);
      setUserLikes(prev => new Set(prev).add(postId));
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
  };

  const displayPosts = tab === "trending"
    ? [...posts].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0))
    : tab === "saved"
    ? posts.filter(p => savedPostIds.has(p.id))
    : posts;

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Community Feed</h1>
                <p className="text-muted-foreground font-body text-sm">Trending posts from communities & members</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Tab switcher */}
                <div className="flex gap-2 mb-4">
                  {(["trending", "recent", ...(user ? ["saved" as const] : [])] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t as any)}
                      className={`text-xs font-heading px-4 py-1.5 rounded-full border transition-colors capitalize ${
                        tab === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t === "trending" ? "🔥 Trending" : t === "saved" ? "🔖 Saved" : "🕐 Recent"}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground animate-pulse font-body">Loading feed...</p>
                  </div>
                ) : displayPosts.length === 0 ? (
                  <div className="gradient-card border border-border rounded-lg p-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-body">No posts yet. Join a community and start the conversation!</p>
                    <Link to="/communities" className="text-primary text-sm font-heading hover:underline mt-2 inline-block">
                      Browse Communities →
                    </Link>
                  </div>
                ) : (
                  displayPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="gradient-card border border-border rounded-lg p-5 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Link to={post.author_username ? `/u/${post.author_username}` : "#"}>
                          <Avatar className="h-8 w-8 border border-primary/20">
                            <AvatarImage src={post.author_avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-heading text-xs">
                              {(post.author_name || "C").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={post.author_username ? `/u/${post.author_username}` : "#"}
                              className="font-heading text-sm text-foreground hover:text-primary transition-colors"
                            >
                              {post.author_name}
                            </Link>
                            <span className="text-muted-foreground text-[10px]">in</span>
                            <Link
                              to={`/communities/${post.community_id}`}
                              className="font-heading text-xs text-primary/70 hover:text-primary transition-colors"
                            >
                              {post.community_name}
                            </Link>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock size={9} /> {timeAgo(post.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-body text-foreground/85 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                      {post.image_url && (
                        <img src={post.image_url} alt="Post media" className="mt-2 rounded-lg border border-border max-h-80 w-auto" loading="lazy" />
                      )}
                      <PostActions
                        postId={post.id}
                        likeCount={likeCounts[post.id] || 0}
                        isLiked={userLikes.has(post.id)}
                        onLike={handleLike}
                      />
                    </motion.div>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending communities */}
                <div className="gradient-card border border-border rounded-lg p-5">
                  <h3 className="font-heading text-sm text-primary tracking-wider uppercase mb-4 flex items-center gap-1.5">
                    <TrendingUp size={14} /> Trending Communities
                  </h3>
                  {trending.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-body">No communities yet</p>
                  ) : (
                    <div className="space-y-3">
                      {trending.map((c, i) => (
                        <Link
                          key={c.id}
                          to={`/communities/${c.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <span className="text-xs text-muted-foreground font-heading w-4">{i + 1}</span>
                          <Avatar className="h-7 w-7 border border-primary/20">
                            <AvatarImage src={c.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-heading text-[10px]">
                              {c.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-xs text-foreground group-hover:text-primary transition-colors truncate">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {c.member_count} members · {c.activity} activity
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active members */}
                <div className="gradient-card border border-border rounded-lg p-5">
                  <h3 className="font-heading text-sm text-primary tracking-wider uppercase mb-4 flex items-center gap-1.5">
                    <Users size={14} /> Active Members
                  </h3>
                  {activeMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-body">No active members this week</p>
                  ) : (
                    <div className="space-y-3">
                      {activeMembers.map((m) => (
                        <Link
                          key={m.user_id}
                          to={m.username ? `/u/${m.username}` : "#"}
                          className="flex items-center gap-3 group"
                        >
                          <Avatar className="h-7 w-7 border border-primary/20">
                            <AvatarImage src={m.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-heading text-[10px]">
                              {m.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-xs text-foreground group-hover:text-primary transition-colors truncate">
                              {m.display_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{m.post_count} posts this week</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="gradient-card border border-border rounded-lg p-5">
                  <h3 className="font-heading text-sm text-primary tracking-wider uppercase mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <Link to="/communities" className="flex items-center justify-between text-xs font-body text-muted-foreground hover:text-primary transition-colors">
                      Browse Communities <ArrowRight size={12} />
                    </Link>
                    <Link to="/members" className="flex items-center justify-between text-xs font-body text-muted-foreground hover:text-primary transition-colors">
                      All Members <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
