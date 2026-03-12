import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight, Search, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface CommunityPreview {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  category: string;
  member_count: number;
  recent_activity: number;
}

const CATEGORIES = ["All", "General", "Lore Discussion", "Fan Art", "Theories", "Cultivation", "Donghua"] as const;

export function CommunityDiscovery() {
  const [communities, setCommunities] = useState<CommunityPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"popular" | "trending">("popular");

  useEffect(() => {
    const fetchData = async () => {
      const { data: comData } = await supabase
        .from("communities")
        .select("id, name, description, avatar_url, category")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!comData || comData.length === 0) { setLoading(false); return; }

      const comIds = comData.map(c => c.id);

      // Fetch member counts
      const { data: members } = await supabase
        .from("community_members")
        .select("community_id")
        .in("community_id", comIds);

      const counts: Record<string, number> = {};
      members?.forEach((m: any) => {
        counts[m.community_id] = (counts[m.community_id] || 0) + 1;
      });

      // Fetch recent activity (posts + messages in last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: recentPosts }, { data: recentMsgs }] = await Promise.all([
        supabase.from("community_posts").select("community_id").in("community_id", comIds).gte("created_at", weekAgo),
        supabase.from("community_messages").select("community_id").in("community_id", comIds).gte("created_at", weekAgo),
      ]);

      const activity: Record<string, number> = {};
      recentPosts?.forEach((p: any) => { activity[p.community_id] = (activity[p.community_id] || 0) + 1; });
      recentMsgs?.forEach((m: any) => { activity[m.community_id] = (activity[m.community_id] || 0) + 1; });

      const withCounts = comData.map(c => ({
        ...c,
        member_count: counts[c.id] || 1,
        recent_activity: activity[c.id] || 0,
      }));

      setCommunities(withCounts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = communities;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") {
      list = list.filter(c => c.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    // Sort
    if (sortBy === "trending") {
      list = [...list].sort((a, b) => b.recent_activity - a.recent_activity);
    } else {
      list = [...list].sort((a, b) => b.member_count - a.member_count);
    }
    return list.slice(0, 6);
  }, [communities, query, categoryFilter, sortBy]);

  if (loading || communities.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl text-primary tracking-wider">Active Communities</h2>
          <Link
            to="/communities"
            className="flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-primary transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 mb-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
              />
            </div>
            {/* Sort toggle */}
            <button
              onClick={() => setSortBy(s => s === "popular" ? "trending" : "popular")}
              className={`flex items-center gap-1.5 text-xs font-heading px-3 py-1.5 rounded-full border transition-colors ${
                sortBy === "trending"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <TrendingUp size={12} />
              {sortBy === "trending" ? "Trending" : "Popular"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs font-heading px-3 py-1 rounded-full border transition-colors ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8 font-body">No communities match your filter.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/communities/${c.id}`}
                  className="block gradient-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage src={c.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-heading">
                        {c.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-muted-foreground font-body line-clamp-1 mt-0.5">{c.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/60">
                        <Users size={10} className="mr-1" /> {c.member_count}
                      </Badge>
                      {c.category !== "general" && (
                        <span className="text-[9px] text-muted-foreground font-heading capitalize">{c.category}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
