import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { User, BookOpen, Link2, Calendar, Pencil, UserPlus, UserCheck, Users, MessageCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/pages/Members";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/ShareMenu";
import { characters } from "@/data/charactersData";

interface PublicProfile {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  reading_progress: string | null;
  social_links: Record<string, string> | null;
  favorite_characters: string[] | null;
  created_at: string;
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, profile: myProfile } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [role, setRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url, bio, reading_progress, social_links, favorite_characters, created_at")
        .eq("username", username)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(data as PublicProfile);

      // Fetch role, followers, following, isFollowing in parallel
      const [rolesRes, followersRes, followingRes, isFollowingRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", data.user_id),
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", data.user_id),
        supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", data.user_id),
        user ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", data.user_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      if (rolesRes.data && rolesRes.data.length > 0) {
        const hasAdmin = rolesRes.data.some(r => r.role === "admin");
        setRole(hasAdmin ? "admin" : rolesRes.data[0].role);
      }
      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setIsFollowing(!!isFollowingRes.data);
      setLoading(false);
    };

    fetchProfile();
  }, [username, user]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.user_id });
    if (!error) {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      toast.success(`Following ${profile.display_name}`);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !profile) return;
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
    setIsFollowing(false);
    setFollowersCount(prev => Math.max(0, prev - 1));
    toast.success("Unfollowed");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-muted-foreground font-body">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (notFound || !profile) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
          <User size={48} className="text-muted-foreground/30" />
          <h1 className="font-heading text-2xl text-foreground">Cultivator Not Found</h1>
          <p className="text-sm text-muted-foreground font-body text-center">
            No cultivator goes by the name <span className="text-primary">@{username}</span>
          </p>
          <Link
            to="/"
            className="px-4 py-2 rounded gradient-gold font-heading text-xs tracking-wider text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </Layout>
    );
  }

  const socialLinks = profile.social_links || {};
  const hasSocials = Object.values(socialLinks).some((v) => v && v.trim());
  const isOwnProfile = (myProfile as any)?.username === username;

  const getSocialUrl = (platform: string, handle: string): string | null => {
    const h = handle.trim();
    if (h.startsWith("http://") || h.startsWith("https://")) return h;
    const map: Record<string, string | null> = {
      twitter: `https://twitter.com/${h.replace(/^@/, "")}`,
      x: `https://x.com/${h.replace(/^@/, "")}`,
      instagram: `https://instagram.com/${h.replace(/^@/, "")}`,
      youtube: `https://youtube.com/@${h.replace(/^@/, "")}`,
      tiktok: `https://tiktok.com/@${h.replace(/^@/, "")}`,
      reddit: `https://reddit.com/u/${h.replace(/^u\//, "")}`,
      github: `https://github.com/${h}`,
      discord: null,
      spotify: `https://open.spotify.com/user/${h}`,
      facebook: `https://facebook.com/${h}`,
      pinterest: `https://pinterest.com/${h}`,
      threads: `https://threads.net/@${h.replace(/^@/, "")}`,
      whatsapp: `https://wa.me/${h.replace(/[^0-9+]/g, "")}`,
      linktree: `https://linktr.ee/${h}`,
      twitch: `https://twitch.tv/${h}`,
      linkedin: `https://linkedin.com/in/${h}`,
      website: h,
    };
    return map[platform.toLowerCase()] ?? null;
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="gradient-card border border-border rounded-lg p-8 flex flex-col items-center text-center relative">
              <Avatar className="h-20 w-20 mb-4 border-2 border-primary/30">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
                <AvatarFallback className="bg-primary/10 text-primary font-heading text-xl">
                  {profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h1 className="font-heading text-2xl text-foreground tracking-wider">{profile.display_name}</h1>
              <RoleBadge role={role} />

              {/* Follow stats */}
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <span className="block font-heading text-foreground">{followersCount}</span>
                  <span className="text-[10px] text-muted-foreground">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block font-heading text-foreground">{followingCount}</span>
                  <span className="text-[10px] text-muted-foreground">Following</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1">
                {isOwnProfile && (
                  <Link
                    to="/profile"
                    className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    title="Edit profile"
                  >
                    <Pencil size={16} />
                  </Link>
                )}
                {!isOwnProfile && user && (
                  <>
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      className={`gap-1 text-xs ${!isFollowing ? "gradient-gold text-primary-foreground" : ""}`}
                    >
                      {isFollowing ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
                    </Button>
                    <Link to={`/messages?with=${profile.user_id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <MessageCircle size={12} /> Message
                      </Button>
                    </Link>
                  </>
                )}
                <ShareMenu
                  url={`${window.location.origin}/u/${username}`}
                  text={`Check out ${profile.display_name}'s cultivator profile!`}
                />
              </div>
              {profile.username && (
                <p className="text-sm text-primary font-body mt-1">@{profile.username}</p>
              )}

              {profile.bio && (
                <p className="text-sm text-muted-foreground font-body mt-3 max-w-md leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground font-body">
                <Calendar size={12} />
                Joined {joinDate}
              </div>
            </div>

            {/* Reading Progress */}
            {profile.reading_progress && profile.reading_progress !== "Not started" && (
              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-primary" />
                  <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Reading Progress</h2>
                </div>
                <span className="inline-block px-3 py-1.5 rounded text-xs font-body gradient-gold text-primary-foreground">
                  {profile.reading_progress}
                </span>
              </div>
            )}

            {/* Favorite Characters */}
            {profile.favorite_characters && profile.favorite_characters.length > 0 && (
              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={18} className="text-red-500" />
                  <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Favorite Characters</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_characters.map((name) => {
                    const char = characters.find(c => c.name === name);
                    return (
                      <Link
                        key={name}
                        to="/characters"
                        className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors"
                      >
                        {char?.image && (
                          <img src={char.image} alt={name} className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span className="text-xs font-body text-foreground">{name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social Links */}
            {hasSocials && (
              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={18} className="text-primary" />
                  <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Social Links</h2>
                </div>
                <div className="space-y-2">
                  {Object.entries(socialLinks).map(([platform, handle]) => {
                    if (!handle || !handle.trim()) return null;
                    const url = getSocialUrl(platform, handle);
                    return (
                      <div key={platform} className="flex items-center gap-2">
                        <span className="text-xs font-heading text-muted-foreground w-16 capitalize">{platform}</span>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-body text-primary hover:text-primary/80 hover:underline transition-colors"
                          >
                            {handle}
                          </a>
                        ) : (
                          <span className="text-sm font-body text-foreground">{handle}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
