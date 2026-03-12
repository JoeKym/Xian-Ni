import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function TopReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});
  const [roles, setRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTopReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .gte("rating", 4)
        .neq("page_path", "/_contact_inbox")
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);
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
    fetchTopReviews();
  }, []);

  if (reviews.length === 0) return null;

  const pageLabel = (path: string) => {
    const map: Record<string, string> = {
      "/": "Homepage", "/characters": "Characters", "/daos": "Daos",
      "/cultivation": "Cultivation", "/timeline": "Timeline", "/multiverse": "Multiverse",
      "/donghua": "Donghua", "/lore": "Lore", "/guide": "Guide",
      "/artifacts": "Artifacts", "/locations": "Locations",
    };
    return map[path] || path;
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl text-primary tracking-wider mb-2">What Cultivators Say</h2>
          <p className="text-sm text-muted-foreground font-body">Top reviews from our community</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.slice(0, 5).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`gradient-card border border-border rounded-lg p-5 relative ${i === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <Quote size={24} className="text-primary/10 absolute top-3 right-3" />
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <p className="text-sm font-body text-foreground/80 mb-3 line-clamp-3">"{r.content}"</p>
              <div className="flex items-center justify-between">
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
                    <Link to={`/u/${usernames[r.user_id]}`} className="font-heading text-xs text-primary/70 hover:text-primary hover:underline transition-colors">
                      — {r.author_name}
                    </Link>
                  ) : (
                    <span className="font-heading text-xs text-primary/70">— {r.author_name}</span>
                  )}
                  {r.user_id && roles[r.user_id] && (
                    <RoleBadge role={roles[r.user_id]} size="xs" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50">{pageLabel(r.page_path)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
