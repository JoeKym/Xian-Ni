import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, MessageSquare, Users, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  weekly_posts: number;
  weekly_messages: number;
  new_members: number;
  score: number;
}

export function CommunityLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: coms } = await supabase
      .from("communities")
      .select("id, name, avatar_url")
      .eq("is_active", true)
      .limit(50);

    if (!coms || coms.length === 0) { setLoading(false); return; }

    const ids = coms.map(c => c.id);

    const [{ data: posts }, { data: msgs }, { data: members }] = await Promise.all([
      supabase.from("community_posts").select("community_id").in("community_id", ids).gte("created_at", weekAgo),
      supabase.from("community_messages").select("community_id").in("community_id", ids).gte("created_at", weekAgo),
      supabase.from("community_members").select("community_id").in("community_id", ids).gte("joined_at", weekAgo),
    ]);

    const postCount: Record<string, number> = {};
    const msgCount: Record<string, number> = {};
    const memCount: Record<string, number> = {};

    posts?.forEach((p: any) => { postCount[p.community_id] = (postCount[p.community_id] || 0) + 1; });
    msgs?.forEach((m: any) => { msgCount[m.community_id] = (msgCount[m.community_id] || 0) + 1; });
    members?.forEach((m: any) => { memCount[m.community_id] = (memCount[m.community_id] || 0) + 1; });

    const ranked = coms.map(c => ({
      ...c,
      weekly_posts: postCount[c.id] || 0,
      weekly_messages: msgCount[c.id] || 0,
      new_members: memCount[c.id] || 0,
      score: (postCount[c.id] || 0) * 3 + (msgCount[c.id] || 0) * 2 + (memCount[c.id] || 0) * 5,
    }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

    setEntries(ranked);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Realtime refresh on new activity
    const channel = supabase
      .channel("leaderboard-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, () => fetchLeaderboard())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages" }, () => fetchLeaderboard())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_members" }, () => fetchLeaderboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading || entries.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="font-heading text-2xl text-primary tracking-wider">Weekly Leaderboard</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/communities/${entry.id}`}
                className={`flex items-center gap-4 gradient-card border rounded-lg p-4 hover:border-primary/30 transition-all group ${
                  i === 0 ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
              >
                <span className="text-lg w-8 text-center font-heading">
                  {i < 3 ? medals[i] : <span className="text-muted-foreground text-sm">#{i + 1}</span>}
                </span>
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-heading">
                    {entry.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {entry.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <FileText size={10} /> {entry.weekly_posts} posts
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MessageSquare size={10} /> {entry.weekly_messages} messages
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users size={10} /> {entry.new_members} new
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-heading shrink-0">
                  {entry.score} pts
                </Badge>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
