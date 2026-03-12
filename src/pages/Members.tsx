import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Shield, BookOpen } from "lucide-react";

interface MemberProfile {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  reading_progress: string | null;
  created_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url, bio, reading_progress, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setMembers(data as MemberProfile[]);
        // Fetch roles for all users
        const userIds = data.map((m) => m.user_id);
        if (userIds.length > 0) {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", userIds);
          if (rolesData) {
            const map: Record<string, string> = {};
            rolesData.forEach((r) => {
              // Keep highest role
              if (!map[r.user_id] || r.role === "admin") map[r.user_id] = r.role;
            });
            setRoles(map);
          }
        }
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(
    (m) =>
      m.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.username && m.username.toLowerCase().includes(search.toLowerCase()))
  );

  const joinDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short" });

  return (
    <Layout>
      <PageHero
        title="Community"
        subtitle="Fellow cultivators who walk the path of the Renegade Immortal"
      />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cultivators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">Gathering cultivators...</p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground font-body mb-8">
              <Users size={14} className="inline mr-1" />
              {filtered.length} cultivator{filtered.length !== 1 ? "s" : ""}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m, i) => {
                const role = roles[m.user_id] || "user";
                return (
                  <motion.div
                    key={m.user_id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <Link
                      to={m.username ? `/u/${m.username}` : "#"}
                      className={`gradient-card border border-border rounded-lg p-5 flex items-start gap-4 hover:border-primary/30 transition-colors block ${!m.username ? "pointer-events-none" : ""}`}
                    >
                      <Avatar className="h-12 w-12 shrink-0 border border-primary/20">
                        <AvatarImage src={m.avatar_url || undefined} alt={m.display_name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-heading text-sm">
                          {m.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading text-sm text-foreground truncate">
                            {m.display_name}
                          </span>
                          <RoleBadge role={role} />
                        </div>
                        {m.username && (
                          <p className="text-xs text-primary/60 font-body">@{m.username}</p>
                        )}
                        {m.bio && (
                          <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">
                            {m.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground/60">
                            Joined {joinDate(m.created_at)}
                          </span>
                          {m.reading_progress && m.reading_progress !== "Not started" && (
                            <span className="text-[10px] text-primary/50 flex items-center gap-0.5">
                              <BookOpen size={8} /> {m.reading_progress}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground font-body italic py-10">
                No cultivators found matching your search.
              </p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export function RoleBadge({ role, size = "sm" }: { role: string; size?: "sm" | "xs" }) {
  if (role === "admin") {
    return (
      <Badge
        variant="outline"
        className={`border-destructive/50 text-destructive bg-destructive/10 font-heading tracking-wider ${size === "xs" ? "text-[8px] px-1 py-0" : "text-[10px] px-1.5 py-0"}`}
      >
        <Shield size={size === "xs" ? 7 : 8} className="mr-0.5" />
        Admin
      </Badge>
    );
  }
  if (role === "moderator") {
    return (
      <Badge
        variant="outline"
        className={`border-accent/50 text-accent-foreground bg-accent/20 font-heading tracking-wider ${size === "xs" ? "text-[8px] px-1 py-0" : "text-[10px] px-1.5 py-0"}`}
      >
        <Shield size={size === "xs" ? 7 : 8} className="mr-0.5" />
        Moderator
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={`border-primary/30 text-primary/60 bg-primary/5 font-heading tracking-wider ${size === "xs" ? "text-[8px] px-1 py-0" : "text-[10px] px-1.5 py-0"}`}
    >
      User
    </Badge>
  );
}
