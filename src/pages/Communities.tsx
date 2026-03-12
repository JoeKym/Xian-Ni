import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Users, Plus, Search, BookOpen, Shield, ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleBadge } from "@/pages/Members";

const COMMUNITY_CATEGORIES = ["general", "lore discussion", "fan art", "theories", "cultivation", "donghua"] as const;

const GENERAL_GUIDELINES = [
  "Be respectful to all cultivators — no harassment, hate speech, or personal attacks.",
  "Keep discussions relevant to Renegade Immortal or the community's topic.",
  "No spam, self-promotion, or off-topic content without permission.",
  "Spoilers must be clearly marked — respect others' reading progress.",
  "Do not share pirated content or links to unofficial translations.",
  "Leaders are responsible for moderating their communities fairly.",
  "Violations may result in warnings, suspensions, or permanent bans.",
];

interface Community {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  is_active: boolean;
  category: string;
}

interface MemberProfile {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  reading_progress: string | null;
  created_at: string;
}

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<string>("general");
  const [creating, setCreating] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  // Members tab state
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) {
      setCommunities(data as Community[]);
      const { data: membersData } = await supabase
        .from("community_members")
        .select("community_id");
      if (membersData) {
        const counts: Record<string, number> = {};
        membersData.forEach((m: any) => {
          counts[m.community_id] = (counts[m.community_id] || 0) + 1;
        });
        setMemberCounts(counts);
      }
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url, bio, reading_progress, created_at")
      .order("created_at", { ascending: false });
    if (data) {
      setMembers(data as MemberProfile[]);
      const userIds = data.map((m) => m.user_id);
      if (userIds.length > 0) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);
        if (rolesData) {
          const map: Record<string, string> = {};
          rolesData.forEach((r) => {
            if (!map[r.user_id] || r.role === "admin") map[r.user_id] = r.role;
          });
          setRoles(map);
        }
      }
    }
    setMembersLoading(false);
  };

  useEffect(() => {
    fetchCommunities();
    fetchMembers();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase.from("communities").insert({
      name: newName.trim(),
      description: newDesc.trim(),
      created_by: user.id,
      category: newCategory,
    });
    if (error) {
      toast.error("Failed to create community");
    } else {
      toast.success("Community created! You are the leader.");
      setNewName("");
      setNewDesc("");
      setNewCategory("general");
      setCreateOpen(false);
      fetchCommunities();
    }
    setCreating(false);
  };

  const filtered = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredMembers = members.filter(
    (m) =>
      m.display_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.username && m.username.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const joinDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short" });

  return (
    <Layout>
      <PageHero
        title="Community"
        subtitle="Join clans, browse cultivators, and forge your path together"
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="communities" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="communities" className="gap-1.5">
              <Users size={14} /> Communities
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users size={14} /> Members
            </TabsTrigger>
          </TabsList>

          {/* Communities Tab */}
          <TabsContent value="communities">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {user && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 gradient-gold text-primary-foreground">
                      <Plus size={16} /> Create Community
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-heading">Create a Community</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {/* General Guidelines */}
                      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-heading text-primary">
                          <ScrollText size={16} />
                          Community Guidelines
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                          {GENERAL_GUIDELINES.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Checkbox
                            id="accept-guidelines"
                            checked={guidelinesAccepted}
                            onCheckedChange={(v) => setGuidelinesAccepted(v === true)}
                          />
                          <label htmlFor="accept-guidelines" className="text-xs font-body text-foreground cursor-pointer">
                            I have read and agree to the community guidelines
                          </label>
                        </div>
                      </div>

                      <Input
                        placeholder="Community name (2-100 chars)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value.slice(0, 100))}
                        disabled={!guidelinesAccepted}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value.slice(0, 500))}
                        rows={3}
                        disabled={!guidelinesAccepted}
                      />
                      <div>
                        <label className="text-xs font-heading text-muted-foreground mb-1 block">Category</label>
                        <Select value={newCategory} onValueChange={setNewCategory} disabled={!guidelinesAccepted}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMUNITY_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreate} disabled={!newName.trim() || creating || !guidelinesAccepted} className="w-full gradient-gold text-primary-foreground">
                        {creating ? "Creating..." : "Create Community"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {!user && (
                <Link to="/login">
                  <Button variant="outline" className="gap-2">
                    <Plus size={16} /> Sign in to create
                  </Button>
                </Link>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["all", ...COMMUNITY_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs font-heading px-3 py-1 rounded-full border transition-colors capitalize ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground font-body animate-pulse">Loading communities...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-body">No communities found. Be the first to create one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/communities/${c.id}`}
                      className="block gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border border-primary/20">
                          <AvatarImage src={c.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-heading text-lg">
                            {c.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-foreground group-hover:text-primary transition-colors truncate">
                            {c.name}
                          </h3>
                          {c.description && (
                            <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{c.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/60">
                              <Users size={10} className="mr-1" /> {memberCounts[c.id] || 1} members
                            </Badge>
                            {c.category !== "general" && (
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground capitalize">
                                {c.category}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="relative max-w-md mx-auto mb-10">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search cultivators..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {membersLoading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body">Gathering cultivators...</p>
              </div>
            ) : (
              <>
                <p className="text-center text-sm text-muted-foreground font-body mb-8">
                  <Users size={14} className="inline mr-1" />
                  {filteredMembers.length} cultivator{filteredMembers.length !== 1 ? "s" : ""}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((m, i) => {
                    const memberRole = roles[m.user_id] || "user";
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
                              <RoleBadge role={memberRole} />
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

                {filteredMembers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground font-body italic py-10">
                    No cultivators found matching your search.
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
