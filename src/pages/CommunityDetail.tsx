import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Users, Send, Crown, Shield, UserMinus, LogOut, MessageCircle, FileText, ArrowLeft, Camera, UserPlus, Flag, ScrollText, AlertTriangle, Heart, Trash2, Sparkles } from "lucide-react";
import { PostActions } from "@/components/PostActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  created_by: string;
  is_active: boolean;
  category: string;
  guidelines: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name?: string;
  avatar_url?: string | null;
  username?: string | null;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string; avatar_url: string | null; username: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [chatContent, setChatContent] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const postImageRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<{ user_id: string; display_name: string; username: string | null }[]>([]);
  const [inviting, setInviting] = useState(false);

  // Report state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportUserId, setReportUserId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  // AI violation detection state
  const VIOLATION_KEYWORDS: Record<string, { label: string; severity: "minor" | "moderate" | "severe"; template: string }> = {
    spam: { label: "Spam", severity: "minor", template: "This user is repeatedly posting off-topic spam content, violating guideline #3 (no spam or self-promotion)." },
    "self-promotion": { label: "Self-Promotion", severity: "minor", template: "This user is promoting external content without permission, violating guideline #3." },
    spoiler: { label: "Spoiler", severity: "minor", template: "This user posted unmarked spoilers, violating guideline #4 (spoilers must be clearly marked)." },
    pirac: { label: "Piracy", severity: "moderate", template: "This user shared links to pirated/unofficial content, violating guideline #5." },
    harass: { label: "Harassment", severity: "severe", template: "This user is engaging in harassment and personal attacks against community members, violating guideline #1." },
    bully: { label: "Bullying", severity: "severe", template: "This user is bullying and targeting other members, violating guideline #1." },
    "hate speech": { label: "Hate Speech", severity: "severe", template: "This user posted hate speech targeting members based on identity, violating guideline #1." },
    slur: { label: "Slurs", severity: "severe", template: "This user used discriminatory slurs against community members, violating guideline #1." },
    threat: { label: "Threats", severity: "severe", template: "This user made explicit threats against community members — immediate action required. Violates guideline #1." },
    flood: { label: "Flooding", severity: "minor", template: "This user is flooding the chat with repeated messages, disrupting other members, violating guideline #3." },
    "off-topic": { label: "Off-Topic", severity: "minor", template: "This user consistently posts content unrelated to the community's topic, violating guideline #2." },
  };

  const detectViolations = (text: string) => {
    const lower = text.toLowerCase();
    return Object.entries(VIOLATION_KEYWORDS).filter(([key]) => lower.includes(key)).map(([, v]) => v);
  };

  const getSeverity = (text: string): "minor" | "moderate" | "severe" | null => {
    const matches = detectViolations(text);
    if (matches.some(m => m.severity === "severe")) return "severe";
    if (matches.some(m => m.severity === "moderate")) return "moderate";
    if (matches.length > 0) return "minor";
    return null;
  };

  // Likes state
  const [postLikeCounts, setPostLikeCounts] = useState<Record<string, number>>({});
  const [myPostLikes, setMyPostLikes] = useState<Set<string>>(new Set());

  // Guidelines edit
  const [editingGuidelines, setEditingGuidelines] = useState(false);
  const [guidelinesText, setGuidelinesText] = useState("");

  const isMember = myRole !== null;
  const isLeader = myRole === "leader";

  const fetchAll = async () => {
    if (!id) return;
    const [comRes, memRes, postRes, msgRes] = await Promise.all([
      supabase.from("communities").select("*").eq("id", id).single(),
      supabase.from("community_members").select("*").eq("community_id", id).order("joined_at"),
      supabase.from("community_posts").select("*").eq("community_id", id).order("created_at", { ascending: false }).limit(50),
      supabase.from("community_messages").select("*").eq("community_id", id).order("created_at").limit(100),
    ]);

    if (comRes.data) {
      setCommunity(comRes.data as Community);
      setGuidelinesText((comRes.data as Community).guidelines || "");
    }
    if (memRes.data) {
      setMembers(memRes.data);
      if (user) {
        const me = memRes.data.find((m: any) => m.user_id === user.id);
        setMyRole(me ? me.role : null);
      }
      const userIds = memRes.data.map((m: any) => m.user_id);
      const postIds = postRes.data?.map((p: any) => p.user_id) || [];
      const msgIds = msgRes.data?.map((m: any) => m.user_id) || [];
      const allIds = [...new Set([...userIds, ...postIds, ...msgIds])];
      if (allIds.length > 0) {
        const { data: pData } = await supabase.from("profiles").select("user_id, display_name, avatar_url, username").in("user_id", allIds);
        if (pData) {
          const pMap: Record<string, any> = {};
          pData.forEach((p: any) => { pMap[p.user_id] = p; });
          setProfiles(pMap);
        }
      }
    }
    if (postRes.data) {
      setPosts(postRes.data);
      // Fetch likes for posts
      const pIds = postRes.data.map((p: any) => p.id);
      if (pIds.length > 0) {
        const { data: likesData } = await supabase.from("post_likes" as any).select("post_id, user_id").in("post_id", pIds);
        const lc: Record<string, number> = {};
        const ml = new Set<string>();
        (likesData as any[])?.forEach((l: any) => {
          lc[l.post_id] = (lc[l.post_id] || 0) + 1;
          if (user && l.user_id === user.id) ml.add(l.post_id);
        });
        setPostLikeCounts(lc);
        setMyPostLikes(ml);
      }
    }
    if (msgRes.data) setMessages(msgRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id, user]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`community-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages", filter: `community_id=eq.${id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts", filter: `community_id=eq.${id}` }, (payload) => {
        setPosts(prev => [payload.new as Post, ...prev]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "community_members", filter: `community_id=eq.${id}` }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleJoin = async () => {
    if (!user || !id) return;
    const { error } = await supabase.from("community_members").insert({ community_id: id, user_id: user.id, role: "member" });
    if (error) toast.error("Failed to join");
    else { toast.success("Joined community!"); fetchAll(); }
  };

  const handleLeave = async () => {
    if (!user || !id) return;
    await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", user.id);
    toast.success("Left community");
    setMyRole(null);
    fetchAll();
  };

  const handlePostLike = async (postId: string) => {
    if (!user) return;
    const liked = myPostLikes.has(postId);
    if (liked) {
      await supabase.from("post_likes" as any).delete().eq("post_id", postId).eq("user_id", user.id);
      setMyPostLikes(prev => { const n = new Set(prev); n.delete(postId); return n; });
      setPostLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));
    } else {
      await supabase.from("post_likes" as any).insert({ post_id: postId, user_id: user.id } as any);
      setMyPostLikes(prev => new Set(prev).add(postId));
      setPostLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setPostImage(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if ((!postContent.trim() && !postImage) || !user || !id) return;
    setSending(true);

    let imageUrl: string | null = null;
    if (postImage) {
      const ext = postImage.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("post-media").upload(path, postImage);
      if (upErr) { toast.error("Image upload failed"); setSending(false); return; }
      const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    await supabase.from("community_posts").insert({
      community_id: id,
      user_id: user.id,
      content: postContent.trim(),
      image_url: imageUrl,
    } as any);
    setPostContent("");
    setPostImage(null);
    setPostImagePreview(null);
    setSending(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatContent.trim() || !user || !id) return;
    setSending(true);
    await supabase.from("community_messages").insert({ community_id: id, user_id: user.id, content: chatContent.trim() });
    setChatContent("");
    setSending(false);
  };

  const handlePromote = async (userId: string, newRole: string) => {
    await supabase.from("community_members").update({ role: newRole }).eq("community_id", id).eq("user_id", userId);
    toast.success(`Role updated to ${newRole}`);
    fetchAll();
  };

  const handleKick = async (userId: string) => {
    await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", userId);
    toast.success("Member removed");
    fetchAll();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !community) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `community-${id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase.from("communities").update({ avatar_url: avatarUrl }).eq("id", id);
    if (updateError) { toast.error("Failed to update avatar"); } else {
      setCommunity({ ...community, avatar_url: avatarUrl });
      toast.success("Community avatar updated!");
    }
    setUploadingAvatar(false);
  };

  // Invite search
  const handleInviteSearch = async (q: string) => {
    setInviteSearch(q);
    if (q.trim().length < 2) { setInviteResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, username")
      .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(10);
    if (data) {
      const memberIds = new Set(members.map(m => m.user_id));
      setInviteResults(data.filter(p => !memberIds.has(p.user_id)));
    }
  };

  const handleInvite = async (targetUserId: string) => {
    if (!user || !id) return;
    setInviting(true);
    const { error } = await supabase.from("community_invites").insert({
      community_id: id,
      invited_by: user.id,
      invited_user_id: targetUserId,
    });
    if (error) toast.error("Failed to send invite");
    else toast.success("Invite sent!");
    setInviting(false);
  };

  // Report user
  const handleReport = async () => {
    if (!user || !id || !reportUserId || !reportReason.trim()) return;
    const { error } = await supabase.from("community_reports").insert({
      community_id: id,
      reported_user_id: reportUserId,
      reported_by: user.id,
      reason: reportReason.trim(),
    });
    if (error) { toast.error("Failed to submit report"); return; }

    // Auto-flag severe violations to admin with AI-FLAGGED prefix
    if (getSeverity(reportReason) === "severe") {
      await supabase.from("community_reports").insert({
        community_id: id,
        reported_user_id: reportUserId,
        reported_by: user.id,
        reason: `[AI-FLAGGED 🚨 SEVERE] ${reportReason.trim()}`,
      });
    }

    toast.success("Report submitted. A leader/admin will review it.");
    setReportOpen(false);
    setReportReason("");
    setReportUserId(null);
  };

  // Delete community (creator only)
  const handleDeleteCommunity = async () => {
    if (!user || !id || !community) return;
    if (!window.confirm(`Permanently delete "${community.name}"? This cannot be undone. All members, posts and messages will be lost.`)) return;
    const { error } = await supabase.from("communities").update({ is_active: false }).eq("id", id);
    if (error) { toast.error("Failed to delete community"); return; }
    toast.success("Community deleted.");
    navigate("/communities");
  };

  // Save guidelines
  const handleSaveGuidelines = async () => {
    if (!id) return;
    const { error } = await supabase.from("communities").update({ guidelines: guidelinesText }).eq("id", id);
    if (error) toast.error("Failed to save guidelines");
    else {
      toast.success("Guidelines saved!");
      setEditingGuidelines(false);
      if (community) setCommunity({ ...community, guidelines: guidelinesText });
    }
  };

  const getProfile = (userId: string) => profiles[userId] || { display_name: "Cultivator", avatar_url: null, username: null };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const roleBadge = (role: string) => {
    if (role === "leader") return <Badge variant="outline" className="text-[10px] border-primary/50 text-primary bg-primary/10">Leader</Badge>;
    if (role === "elder") return <Badge variant="outline" className="text-[10px] border-accent/50 text-accent bg-accent/10">Elder</Badge>;
    return <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">Member</Badge>;
  };

  if (loading) {
    return <Layout><div className="min-h-[70vh] flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div></Layout>;
  }

  if (!community) {
    return <Layout><div className="min-h-[70vh] flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Community not found</p><Link to="/communities" className="text-primary hover:underline">Back to communities</Link></div></Layout>;
  }

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/communities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Communities
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="gradient-card border border-border rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={community.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-heading text-2xl">
                      {community.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {(isLeader || isAdmin) && (
                    <>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Change avatar"
                      >
                        <Camera size={18} className="text-primary" />
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-heading text-2xl text-foreground">{community.name}</h1>
                  {community.description && <p className="text-sm text-muted-foreground font-body mt-1">{community.description}</p>}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <Badge variant="outline" className="border-primary/20 text-primary/60">
                      <Users size={12} className="mr-1" /> {members.length} members
                    </Badge>
                    {community.category !== "general" && (
                      <Badge variant="outline" className="border-border text-muted-foreground capitalize text-[10px]">
                        {community.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!isMember && user && (
                    <Button onClick={handleJoin} size="sm" className="gradient-gold text-primary-foreground">Join</Button>
                  )}
                  {isMember && !isLeader && (
                    <Button onClick={handleLeave} variant="outline" size="sm" className="gap-1">
                      <LogOut size={12} /> Leave
                    </Button>
                  )}
                  {user && community && user.id === community.created_by && (
                    <Button onClick={handleDeleteCommunity} variant="destructive" size="sm" className="gap-1">
                      <Trash2 size={12} /> Delete Community
                    </Button>
                  )}
                  {isMember && (
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <UserPlus size={12} /> Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-heading">Invite a Cultivator</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 mt-2">
                          <Input
                            placeholder="Search by name or username..."
                            value={inviteSearch}
                            onChange={(e) => handleInviteSearch(e.target.value)}
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {inviteResults.map(p => (
                              <div key={p.user_id} className="flex items-center justify-between gap-2 p-2 rounded border border-border">
                                <div>
                                  <span className="font-heading text-sm text-foreground">{p.display_name}</span>
                                  {p.username && <span className="text-xs text-muted-foreground ml-1">@{p.username}</span>}
                                </div>
                                <Button size="sm" variant="outline" disabled={inviting} onClick={() => handleInvite(p.user_id)} className="text-xs h-7">
                                  Invite
                                </Button>
                              </div>
                            ))}
                            {inviteSearch.trim().length >= 2 && inviteResults.length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-3">No users found</p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>

            {/* Guidelines */}
            {(community.guidelines || isLeader || isAdmin) && (
              <div className="gradient-card border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-sm text-primary flex items-center gap-1.5">
                    <ScrollText size={14} /> Community Guidelines
                  </h3>
                  {(isLeader || isAdmin) && (
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingGuidelines(!editingGuidelines)}>
                      {editingGuidelines ? "Cancel" : "Edit"}
                    </Button>
                  )}
                </div>
                {editingGuidelines ? (
                  <div className="space-y-2">
                    <Textarea
                      value={guidelinesText}
                      onChange={e => setGuidelinesText(e.target.value.slice(0, 2000))}
                      rows={5}
                      placeholder="Set rules for your community (max 2000 chars)..."
                    />
                    <Button size="sm" onClick={handleSaveGuidelines} className="gradient-gold text-primary-foreground">Save Guidelines</Button>
                  </div>
                ) : (
                  <div className="text-xs font-body text-muted-foreground whitespace-pre-wrap">
                    {community.guidelines || "No guidelines set yet. Leaders can add community rules here."}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground/50 mt-2 flex items-center gap-1">
                  <AlertTriangle size={10} /> Violating guidelines may result in being reported and banned/suspended.
                </p>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="feed" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="feed" className="gap-1.5"><FileText size={14} /> Feed</TabsTrigger>
                {isMember && <TabsTrigger value="chat" className="gap-1.5"><MessageCircle size={14} /> Chat</TabsTrigger>}
                <TabsTrigger value="members" className="gap-1.5"><Users size={14} /> Members</TabsTrigger>
              </TabsList>

              {/* Feed */}
              <TabsContent value="feed" className="space-y-4">
                {isMember && (
                  <div className="gradient-card border border-border rounded-lg p-4">
                    <Textarea
                      placeholder="Share something with the community..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value.slice(0, 2000))}
                      rows={3}
                    />
                    {postImagePreview && (
                      <div className="relative mt-2 inline-block">
                        <img src={postImagePreview} alt="Preview" className="max-h-40 rounded-lg border border-border" />
                        <button
                          onClick={() => { setPostImage(null); setPostImagePreview(null); }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >×</button>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <input ref={postImageRef} type="file" accept="image/*" onChange={handlePostImageSelect} className="hidden" />
                        <Button variant="ghost" size="sm" onClick={() => postImageRef.current?.click()} className="gap-1 text-muted-foreground hover:text-primary">
                          <Camera size={14} /> Image
                        </Button>
                      </div>
                      <Button onClick={handlePost} disabled={(!postContent.trim() && !postImage) || sending} size="sm" className="gap-1 gradient-gold text-primary-foreground">
                        <Send size={14} /> Post
                      </Button>
                    </div>
                  </div>
                )}
                {posts.length === 0 ? (
                  <p className="text-center text-muted-foreground font-body py-8">No posts yet. {isMember ? "Be the first!" : "Join to post."}</p>
                ) : (
                  posts.map((p) => {
                    const author = getProfile(p.user_id);
                    return (
                      <div key={p.id} className="gradient-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6 border border-primary/20">
                            <AvatarImage src={author.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{author.display_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {author.username ? (
                            <Link to={`/u/${author.username}`} className="font-heading text-xs text-primary/80 hover:text-primary hover:underline">{author.display_name}</Link>
                          ) : (
                            <span className="font-heading text-xs text-primary/80">{author.display_name}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(p.created_at)}</span>
                        </div>
                        <p className="text-sm font-body text-foreground/80 whitespace-pre-wrap">{p.content}</p>
                        {(p as any).image_url && (
                          <img src={(p as any).image_url} alt="Post media" className="mt-2 rounded-lg border border-border max-h-80 w-auto" loading="lazy" />
                        )}
                        <PostActions
                          postId={p.id}
                          likeCount={postLikeCounts[p.id] || 0}
                          isLiked={myPostLikes.has(p.id)}
                          onLike={handlePostLike}
                        />
                      </div>
                    );
                  })
                )}
              </TabsContent>

              {/* Chat */}
              {isMember && (
                <TabsContent value="chat">
                  <div className="gradient-card border border-border rounded-lg">
                    <div className="h-80 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 && (
                        <p className="text-center text-muted-foreground font-body py-8">No messages yet. Start chatting!</p>
                      )}
                      {messages.map((m) => {
                        const author = getProfile(m.user_id);
                        const isMe = user?.id === m.user_id;
                        return (
                          <div key={m.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                            <Avatar className="h-6 w-6 border border-primary/20 flex-shrink-0">
                              <AvatarImage src={author.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{author.display_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[70%] ${isMe ? "text-right" : ""}`}>
                              <span className="text-[10px] text-muted-foreground font-heading">{author.display_name}</span>
                              <div className={`rounded-lg px-3 py-1.5 text-sm font-body ${isMe ? "bg-primary/20 text-foreground" : "bg-muted/50 text-foreground"}`}>
                                {m.content}
                              </div>
                              <span className="text-[9px] text-muted-foreground">{timeAgo(m.created_at)}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleChat} className="border-t border-border p-3 flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatContent}
                        onChange={(e) => setChatContent(e.target.value.slice(0, 500))}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!chatContent.trim() || sending} size="icon" className="gradient-gold text-primary-foreground">
                        <Send size={14} />
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              )}

              {/* Members */}
              <TabsContent value="members">
                <div className="gradient-card border border-border rounded-lg p-4 space-y-3">
                  {members.map((m) => {
                    const p = getProfile(m.user_id);
                    return (
                      <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src={p.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{p.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          {p.username ? (
                            <Link to={`/u/${p.username}`} className="font-heading text-sm text-foreground hover:text-primary hover:underline">{p.display_name}</Link>
                          ) : (
                            <span className="font-heading text-sm text-foreground">{p.display_name}</span>
                          )}
                        </div>
                        {roleBadge(m.role)}
                        {/* Report button for other members */}
                        {isMember && user && m.user_id !== user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive"
                            onClick={() => { setReportUserId(m.user_id); setReportOpen(true); }}
                          >
                            <Flag size={10} />
                          </Button>
                        )}
                        {(isLeader || isAdmin) && m.user_id !== user?.id && (
                          <div className="flex gap-1">
                            {m.role === "member" && (
                              <Button variant="ghost" size="sm" onClick={() => handlePromote(m.user_id, "elder")} className="text-xs h-7 px-2">
                                <Shield size={10} className="mr-1" /> Elder
                              </Button>
                            )}
                            {m.role === "elder" && (
                              <Button variant="ghost" size="sm" onClick={() => handlePromote(m.user_id, "member")} className="text-xs h-7 px-2">
                                Demote
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleKick(m.user_id)} className="text-xs h-7 px-2 text-destructive hover:text-destructive">
                              <UserMinus size={10} />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={(open) => { setReportOpen(open); if (!open) { setReportReason(""); setReportUserId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Flag size={16} className="text-destructive" /> Report Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-xs text-muted-foreground font-body">
              Describe the guideline violation. Reports are reviewed by community leaders and admins.
            </p>

            {/* AI Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-muted-foreground font-heading flex items-center gap-1"><Sparkles size={10} className="text-primary" /> Quick tags:</span>
              {Object.entries(VIOLATION_KEYWORDS).map(([key, v]) => (
                <button
                  key={key}
                  onClick={() => setReportReason(v.template)}
                  className={`text-[10px] font-heading px-2 py-0.5 rounded-full border transition-colors ${
                    v.severity === "severe" ? "border-destructive/50 text-destructive hover:bg-destructive/10" :
                    v.severity === "moderate" ? "border-amber-500/50 text-amber-500 hover:bg-amber-500/10" :
                    "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Textarea
                placeholder="Describe the violation..."
                value={reportReason}
                onChange={e => setReportReason(e.target.value.slice(0, 1000))}
                rows={4}
              />
              {/* Severity badge */}
              {getSeverity(reportReason) && (
                <div className={`absolute bottom-2 right-2 text-[10px] font-heading px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  getSeverity(reportReason) === "severe" ? "bg-destructive/20 text-destructive" :
                  getSeverity(reportReason) === "moderate" ? "bg-amber-500/20 text-amber-500" :
                  "bg-muted text-muted-foreground"
                }`}>
                  <AlertTriangle size={9} />
                  {getSeverity(reportReason) === "severe" ? "Severe violation" :
                   getSeverity(reportReason) === "moderate" ? "Moderate violation" : "Minor violation"}
                </div>
              )}
            </div>

            {getSeverity(reportReason) === "severe" && (
              <p className="text-[10px] text-destructive font-body flex items-center gap-1">
                <AlertTriangle size={10} /> Severe violations are automatically escalated to admin.
              </p>
            )}

            <Button onClick={handleReport} disabled={!reportReason.trim()} className="w-full" variant="destructive">
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
