import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, BookOpen, Heart, Link2, Save, Camera, Loader2, Search, X, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { characters } from "@/data/charactersData";

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

const readingOptions = [
  "Not started",
  "Planet Suzaku Arc",
  "Allheaven Arc",
  "Cave World Arc",
  "Ancient God Arc",
  "Star System War",
  "Immortal Palace Trials",
  "Completed Novel",
  "Watching Donghua Only",
];

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [bio, setBio] = useState("");
  const [readingProgress, setReadingProgress] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [favoriteChars, setFavoriteChars] = useState<string[]>([]);
  const [charSearch, setCharSearch] = useState("");
  const [showCharPicker, setShowCharPicker] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setUsername((profile as any).username || "");
      setBio(profile.bio || "");
      setReadingProgress(profile.reading_progress);
      setSocialLinks(profile.social_links || {});
      setAvatarUrl(profile.avatar_url);
      setFavoriteChars(profile.favorite_characters || []);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user.id);
    setAvatarUrl(newUrl);
    await refreshProfile();
    toast.success("Avatar updated!");
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setUsernameError("");

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername && !usernameRegex.test(trimmedUsername)) {
      setUsernameError("3-30 chars, letters, numbers, _ or - only");
      return;
    }

    setSaving(true);
    const updateData: Record<string, any> = {
      display_name: displayName.trim() || "Cultivator",
      bio: bio.trim(),
      reading_progress: readingProgress,
      social_links: socialLinks,
      username: trimmedUsername || null,
      favorite_characters: favoriteChars,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      if (error.message.includes("unique") || error.code === "23505") {
        setUsernameError("This username is already taken");
      } else {
        toast.error("Failed to save: " + error.message);
      }
    } else {
      toast.success("Profile updated!");
      await refreshProfile();
      if (trimmedUsername) {
        navigate(`/u/${trimmedUsername}`);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-muted-foreground font-body">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-muted-foreground font-body text-center">
            We couldn’t load your profile yet.
          </p>
          <button
            onClick={refreshProfile}
            className="px-4 py-2 rounded gradient-gold font-heading text-xs tracking-wider text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Retry Loading Profile
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl text-primary text-center mb-2 tracking-wider">Cultivator Profile</h1>
            <p className="text-sm text-muted-foreground font-body text-center mb-8">Customize your identity in the sect</p>

            <div className="space-y-6">
              {/* Identity */}
              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-primary" />
                  <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Identity</h2>
                </div>
                <div className="space-y-3">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-2">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 border-2 border-primary/30">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-heading text-xl">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {uploadingAvatar ? (
                          <Loader2 size={20} className="text-primary animate-spin" />
                        ) : (
                          <Camera size={20} className="text-primary" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body mt-1">Hover to change avatar</p>
                  </div>
                  <div>
                    <label className="text-xs font-heading text-muted-foreground tracking-wider uppercase block mb-1">Display Name</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                      className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-heading text-muted-foreground tracking-wider uppercase block mb-1">Username</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-body">@</span>
                      <input
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.slice(0, 30).toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                          setUsernameError("");
                        }}
                        className="flex-1 bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                        placeholder="your-username"
                      />
                    </div>
                    {usernameError && <p className="text-xs text-destructive font-body mt-1">{usernameError}</p>}
                    {username && !usernameError && (
                      <p className="text-[10px] text-muted-foreground font-body mt-1">
                        Your profile will be visible at{" "}
                        <span className="text-primary">/u/{username}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-heading text-muted-foreground tracking-wider uppercase block mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 500))}
                      rows={3}
                      className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 resize-none"
                      placeholder="Tell us about your cultivation journey..."
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-body">Email: {user?.email}</p>
                </div>
              </div>

              {/* Reading Progress */}
              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} className="text-primary" />
                  <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Reading Progress</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {readingOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setReadingProgress(opt)}
                      className={`px-3 py-1.5 rounded text-xs font-body transition-colors ${
                        readingProgress === opt
                          ? "gradient-gold text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 size={18} className="text-primary" />
                  <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Social Links</h2>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {[
                    { key: "youtube", label: "YouTube", placeholder: "@channel or URL" },
                    { key: "instagram", label: "Instagram", placeholder: "@username" },
                    { key: "facebook", label: "Facebook", placeholder: "username or URL" },
                    { key: "threads", label: "Threads", placeholder: "@username" },
                    { key: "twitter", label: "X / Twitter", placeholder: "@handle" },
                    { key: "tiktok", label: "TikTok", placeholder: "@username" },
                    { key: "discord", label: "Discord", placeholder: "username#0000 or server link" },
                    { key: "reddit", label: "Reddit", placeholder: "u/username" },
                    { key: "github", label: "GitHub", placeholder: "username" },
                    { key: "spotify", label: "Spotify", placeholder: "profile URL or username" },
                    { key: "whatsapp", label: "WhatsApp", placeholder: "phone number or link" },
                    { key: "linktree", label: "Linktree", placeholder: "username or URL" },
                    { key: "pinterest", label: "Pinterest", placeholder: "username" },
                    { key: "twitch", label: "Twitch", placeholder: "username" },
                    { key: "linkedin", label: "LinkedIn", placeholder: "profile URL" },
                    { key: "website", label: "Website", placeholder: "https://..." },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs font-heading text-muted-foreground w-20 shrink-0">{label}</span>
                      <input
                        value={socialLinks[key] || ""}
                        onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                        className="flex-1 bg-muted/50 border border-border rounded px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="gradient-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart size={18} className="text-primary" />
                    <h2 className="font-heading text-sm text-primary tracking-wider uppercase">Favorite Characters</h2>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-body">{favoriteChars.length}/10</span>
                </div>

                {/* Selected favorites */}
                {favoriteChars.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favoriteChars.map((name) => {
                      const char = characters.find((c) => c.name === name);
                      return (
                        <motion.div
                          key={name}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1"
                        >
                          {char?.image ? (
                            <img src={char.image} alt={name} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <Star size={12} className="text-primary" />
                          )}
                          <span className="text-xs font-body text-foreground">{name}</span>
                          <button
                            onClick={() => setFavoriteChars(favoriteChars.filter((n) => n !== name))}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Search & picker */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-muted/50 border border-border rounded px-3 py-2">
                    <Search size={14} className="text-muted-foreground shrink-0" />
                    <input
                      value={charSearch}
                      onChange={(e) => {
                        setCharSearch(e.target.value);
                        setShowCharPicker(true);
                      }}
                      onFocus={() => setShowCharPicker(true)}
                      className="flex-1 bg-transparent text-sm font-body text-foreground focus:outline-none"
                      placeholder="Search characters to add..."
                    />
                    {charSearch && (
                      <button onClick={() => { setCharSearch(""); setShowCharPicker(false); }}>
                        <X size={14} className="text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showCharPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto"
                      >
                        {characters
                          .filter((c) =>
                            c.name.toLowerCase().includes(charSearch.toLowerCase()) &&
                            !favoriteChars.includes(c.name)
                          )
                          .slice(0, 20)
                          .map((c) => (
                            <button
                              key={c.name}
                              onClick={() => {
                                if (favoriteChars.length >= 10) {
                                  toast.error("Maximum 10 favorites");
                                  return;
                                }
                                setFavoriteChars([...favoriteChars, c.name]);
                                setCharSearch("");
                                setShowCharPicker(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                            >
                              {c.image ? (
                                <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full object-cover border border-border" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-[10px] font-heading text-primary">{c.name.charAt(0)}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-sm font-body text-foreground block">{c.name}</span>
                                <span className="text-[10px] text-muted-foreground font-body">{c.subtitle}</span>
                              </div>
                            </button>
                          ))}
                        {characters.filter((c) =>
                          c.name.toLowerCase().includes(charSearch.toLowerCase()) &&
                          !favoriteChars.includes(c.name)
                        ).length === 0 && (
                          <p className="text-xs text-muted-foreground font-body p-3 text-center">No characters found</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded gradient-gold font-heading text-sm tracking-wider text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
