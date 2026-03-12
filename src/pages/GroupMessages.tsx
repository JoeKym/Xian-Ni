import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import {
  Users, Send, ArrowLeft, Search, Trash2, MoreVertical, Reply, X,
  ChevronUp, ChevronDown, Pencil, Check, Plus, Settings, UserPlus,
  UserMinus, Volume2, VolumeX, Crown, Forward, LogOut, Pin, PinOff, CheckCheck, BellOff, Image,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageReactions } from "@/components/messages/MessageReactions";
import { MediaUpload } from "@/components/messages/MediaUpload";
import { FileAttachmentCard } from "@/components/messages/FileAttachmentCard";
import { DropZoneOverlay } from "@/components/messages/DropZoneOverlay";
import { MediaGallery } from "@/components/messages/MediaGallery";
import { uploadFile, getCleanUrl, isImageUrl, isVideoUrl } from "@/components/messages/fileUtils";
import { VoiceRecorder } from "@/components/messages/VoiceRecorder";
import { AudioPlayer } from "@/components/messages/AudioPlayer";
import { ForwardMessageModal } from "@/components/messages/ForwardMessageModal";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function OnlineDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`} />
  );
}

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label = names.length === 1 ? `${names[0]} is typing` : names.length === 2 ? `${names[0]} and ${names[1]} are typing` : `${names[0]} and ${names.length - 1} others are typing`;
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

interface GroupChat { id: string; name: string; description: string; avatar_url: string | null; created_by: string; created_at: string; updated_at: string; }
interface GroupMember { id: string; group_id: string; user_id: string; role: string; is_muted: boolean; joined_at: string; }
interface GroupMessage { id: string; group_id: string; sender_id: string; content: string; image_url: string | null; audio_url: string | null; reply_to_id: string | null; edited_at: string | null; created_at: string; }
interface ProfileInfo { user_id: string; display_name: string; avatar_url: string | null; username: string | null; }
interface Reaction { id: string; message_id: string; user_id: string; emoji: string; }

export default function GroupMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [msgContent, setMsgContent] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [forwardMsg, setForwardMsg] = useState<GroupMessage | null>(null);
  const [pinnedMsgIds, setPinnedMsgIds] = useState<Set<string>>(new Set());
  const [showPinned, setShowPinned] = useState(false);
  const [deleteMessageTarget, setDeleteMessageTarget] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [groupReads, setGroupReads] = useState<Record<string, string>>({});
  const [globalMute, setGlobalMute] = useState(() => localStorage.getItem("group-global-mute") === "true");
  const [isDragging, setIsDragging] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [msgSearchResults, setMsgSearchResults] = useState<string[]>([]);
  const [msgSearchIdx, setMsgSearchIdx] = useState(0);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<ProfileInfo[]>([]);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const dragCounterRef = useRef(0);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !user) return;
    const result = await uploadFile(file, user.id);
    if (result) setPendingImageUrl(result.url);
  }, [user]);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) { /* Audio not supported */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    const presenceChannel = supabase.channel("online-users-groups", { config: { presence: { key: user.id } } });
    presenceChannel
      .on("presence", { event: "sync" }, () => { setOnlineUsers(new Set(Object.keys(presenceChannel.presenceState()))); })
      .subscribe(async (status) => { if (status === "SUBSCRIBED") await presenceChannel.track({ user_id: user.id, online_at: new Date().toISOString() }); });
    return () => { supabase.removeChannel(presenceChannel); };
  }, [user]);

  useEffect(() => {
    if (!activeGroup || !user) { setTypingUsers(new Set()); return; }
    const channel = supabase.channel(`group-typing-${activeGroup}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        const typerId = payload.payload?.user_id;
        if (typerId && typerId !== user.id) {
          setTypingUsers(prev => new Set(prev).add(typerId));
          if (typingTimeoutsRef.current[typerId]) clearTimeout(typingTimeoutsRef.current[typerId]);
          typingTimeoutsRef.current[typerId] = setTimeout(() => {
            setTypingUsers(prev => { const n = new Set(prev); n.delete(typerId); return n; });
          }, 3000);
        }
      }).subscribe();
    typingChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
      setTypingUsers(new Set());
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [activeGroup, user]);

  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current || !user) return;
    typingChannelRef.current.send({ type: "broadcast", event: "typing", payload: { user_id: user.id } });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: grps } = await supabase.from("group_chats" as any).select("*").order("updated_at", { ascending: false });
      if (grps) setGroups(grps as any);
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!activeGroup) { setMembers([]); setMessages([]); setReactions([]); setPinnedMsgIds(new Set()); setShowPinned(false); return; }
    const load = async () => {
      const { data: mems } = await supabase.from("group_members" as any).select("*").eq("group_id", activeGroup);
      if (mems) {
        setMembers(mems as any);
        const userIds = (mems as any[]).map((m: any) => m.user_id);
        if (userIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("user_id, display_name, avatar_url, username").in("user_id", userIds);
          if (profs) {
            const pMap: Record<string, ProfileInfo> = { ...profiles };
            (profs as any[]).forEach(p => { pMap[p.user_id] = p; });
            setProfiles(pMap);
          }
        }
      }
      const { data: msgs } = await supabase.from("group_messages" as any).select("*").eq("group_id", activeGroup).order("created_at", { ascending: true }).limit(200);
      if (msgs) { setMessages(msgs as any); fetchReactions((msgs as any[]).map((m: any) => m.id)); }
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      const { data: pins } = await supabase.from("pinned_group_messages" as any).select("message_id").eq("group_id", activeGroup);
      if (pins) setPinnedMsgIds(new Set((pins as any[]).map(p => p.message_id)));
      await supabase.from("group_reads" as any).upsert({ group_id: activeGroup, user_id: user!.id, last_read_at: new Date().toISOString() } as any, { onConflict: "group_id,user_id" });
      const { data: reads } = await supabase.from("group_reads" as any).select("user_id, last_read_at").eq("group_id", activeGroup);
      if (reads) { const rMap: Record<string, string> = {}; (reads as any[]).forEach(r => { rMap[r.user_id] = r.last_read_at; }); setGroupReads(rMap); }
    };
    load();

    const msgChannel = supabase.channel(`group-msgs-${activeGroup}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${activeGroup}` }, (payload) => {
        const newMsg = payload.new as GroupMessage;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        if (newMsg.sender_id !== user?.id && !globalMute) {
          const myMem = members.find(m => m.user_id === user?.id);
          if (!myMem?.is_muted) playNotificationSound();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "group_messages", filter: `group_id=eq.${activeGroup}` }, (payload) => {
        setMessages(prev => prev.map(m => m.id === (payload.new as any).id ? payload.new as GroupMessage : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "group_messages", filter: `group_id=eq.${activeGroup}` }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
      })
      .subscribe();

    const memChannel = supabase.channel(`group-mems-${activeGroup}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members", filter: `group_id=eq.${activeGroup}` }, () => {
        supabase.from("group_members" as any).select("*").eq("group_id", activeGroup).then(({ data }) => { if (data) setMembers(data as any); });
      }).subscribe();

    const readsChannel = supabase.channel(`group-reads-${activeGroup}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_reads", filter: `group_id=eq.${activeGroup}` }, (payload) => {
        const row = payload.new as any;
        if (row?.user_id) setGroupReads(prev => ({ ...prev, [row.user_id]: row.last_read_at }));
      }).subscribe();

    return () => { supabase.removeChannel(msgChannel); supabase.removeChannel(memChannel); supabase.removeChannel(readsChannel); };
  }, [activeGroup]);

  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) { setReactions([]); return; }
    const { data } = await supabase.from("group_message_reactions" as any).select("*").in("message_id", messageIds);
    if (data) setReactions(data as any);
  }, []);

  useEffect(() => {
    if (!msgSearchQuery.trim()) { setMsgSearchResults([]); setMsgSearchIdx(0); return; }
    const q = msgSearchQuery.toLowerCase();
    const results = messages.filter(m => m.content.toLowerCase().includes(q)).map(m => m.id);
    setMsgSearchResults(results); setMsgSearchIdx(0);
    if (results.length > 0) messageRefs.current[results[0]]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [msgSearchQuery, messages]);

  const scrollToSearchResult = (idx: number) => { const id = msgSearchResults[idx]; if (id) messageRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const handleMsgSearchNext = () => { const n = (msgSearchIdx + 1) % msgSearchResults.length; setMsgSearchIdx(n); scrollToSearchResult(n); };
  const handleMsgSearchPrev = () => { const p = (msgSearchIdx - 1 + msgSearchResults.length) % msgSearchResults.length; setMsgSearchIdx(p); scrollToSearchResult(p); };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const { data, error } = await supabase.from("group_chats" as any).insert({ name: newGroupName.trim(), description: newGroupDesc.trim(), created_by: user.id } as any).select().single();
    if (error) { toast.error("Failed to create group"); return; }
    setGroups(prev => [data as any, ...prev]); setActiveGroup((data as any).id); setCreateGroupOpen(false); setNewGroupName(""); setNewGroupDesc(""); toast.success("Group created!");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgContent.trim() && !pendingImageUrl) || !user || !activeGroup) return;
    setSending(true);
    const insertData: any = {
      group_id: activeGroup, sender_id: user.id,
      content: msgContent.trim() || (pendingImageUrl ? (
        isVideoUrl(pendingImageUrl) ? "🎬 Video" :
        isImageUrl(pendingImageUrl) ? "📷 Image" : "📎 File"
      ) : ""),
      image_url: pendingImageUrl,
    };
    if (replyTo) insertData.reply_to_id = replyTo.id;
    const { error } = await supabase.from("group_messages" as any).insert(insertData);
    if (error) toast.error("Failed to send message");
    setMsgContent(""); setPendingImageUrl(null); setReplyTo(null); setSending(false);
  };

  const handleSendVoice = async (audioUrl: string) => {
    if (!user || !activeGroup) return;
    const { error } = await supabase.from("group_messages" as any).insert({ group_id: activeGroup, sender_id: user.id, content: "🎤 Voice message", audio_url: audioUrl } as any);
    if (error) toast.error("Failed to send voice message");
  };

  const handleEditMessage = async (msgId: string) => {
    if (!editContent.trim()) return;
    const { error } = await supabase.from("group_messages" as any).update({ content: editContent.trim(), edited_at: new Date().toISOString() } as any).eq("id", msgId);
    if (error) { toast.error("Failed to edit"); return; }
    setEditingMsgId(null); setEditContent("");
  };

  const handleAddMember = async (targetUserId: string) => {
    if (!activeGroup) return;
    const { error } = await supabase.from("group_members" as any).insert({ group_id: activeGroup, user_id: targetUserId, role: "member" } as any);
    if (error) { toast.error("Failed to add member"); return; }
    toast.success("Member added"); setMemberSearch(""); setMemberSearchResults([]);
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!activeGroup) return;
    await supabase.from("group_members" as any).delete().eq("group_id", activeGroup).eq("user_id", targetUserId);
    toast.success("Member removed");
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup || !user) return;
    await supabase.from("group_members" as any).delete().eq("group_id", activeGroup).eq("user_id", user.id);
    setGroups(prev => prev.filter(g => g.id !== activeGroup)); setActiveGroup(null); toast.success("Left group");
  };

  const handleToggleMute = async () => {
    if (!activeGroup || !user) return;
    const myMembership = members.find(m => m.user_id === user.id);
    if (!myMembership) return;
    await supabase.from("group_members" as any).update({ is_muted: !myMembership.is_muted } as any).eq("group_id", activeGroup).eq("user_id", user.id);
    setMembers(prev => prev.map(m => m.user_id === user.id ? { ...m, is_muted: !m.is_muted } : m));
    toast.success(myMembership.is_muted ? "Unmuted" : "Muted");
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupTarget) return;
    await supabase.from("group_chats" as any).delete().eq("id", deleteGroupTarget);
    setGroups(prev => prev.filter(g => g.id !== deleteGroupTarget));
    if (activeGroup === deleteGroupTarget) { setActiveGroup(null); setMessages([]); }
    setDeleteGroupTarget(null); toast.success("Group deleted");
  };

  const handlePinMessage = async (msgId: string) => {
    if (!activeGroup || !user) return;
    if (pinnedMsgIds.has(msgId)) {
      await supabase.from("pinned_group_messages" as any).delete().eq("group_id", activeGroup).eq("message_id", msgId);
      setPinnedMsgIds(prev => { const n = new Set(prev); n.delete(msgId); return n; }); toast.success("Message unpinned");
    } else {
      const { error } = await supabase.from("pinned_group_messages" as any).insert({ group_id: activeGroup, message_id: msgId, pinned_by: user.id } as any);
      if (error) { toast.error("Failed to pin"); return; }
      setPinnedMsgIds(prev => new Set(prev).add(msgId)); toast.success("Message pinned");
    }
  };

  const handleDeleteMessage = async () => {
    if (!deleteMessageTarget || !user) return;
    const { error } = await supabase.from("group_messages" as any).delete().eq("id", deleteMessageTarget);
    if (error) { toast.error("Failed to delete message"); }
    else { setMessages(prev => prev.filter(m => m.id !== deleteMessageTarget)); toast.success("Message deleted"); }
    setDeleteMessageTarget(null);
  };

  const searchMembers = async (q: string) => {
    setMemberSearch(q);
    if (q.trim().length < 2) { setMemberSearchResults([]); return; }
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url, username").or(`display_name.ilike.%${q}%,username.ilike.%${q}%`).neq("user_id", user?.id || "").limit(8);
    if (data) { const existingIds = members.map(m => m.user_id); setMemberSearchResults((data as ProfileInfo[]).filter(p => !existingIds.includes(p.user_id))); }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || !user) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const result = await uploadFile(file, user.id);
        if (result) setPendingImageUrl(result.url);
        return;
      }
    }
  }, [user]);

  const galleryUrls = messages.filter(m => m.image_url).map(m => m.image_url!);

  const timeAgo = (date: string) => { const diff = Date.now() - new Date(date).getTime(); const mins = Math.floor(diff / 60000); if (mins < 1) return "now"; if (mins < 60) return `${mins}m`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h`; return `${Math.floor(hrs / 24)}d`; };
  const getReplyMessage = (id: string | null) => id ? messages.find(m => m.id === id) || null : null;
  const getSenderName = (senderId: string) => senderId === user?.id ? "You" : profiles[senderId]?.display_name || "Cultivator";

  const getReadByUsers = (msg: GroupMessage): string[] => {
    if (msg.sender_id !== user?.id) return [];
    return Object.entries(groupReads).filter(([uid, readAt]) => uid !== user?.id && readAt >= msg.created_at).map(([uid]) => uid);
  };

  const activeGroupData = groups.find(g => g.id === activeGroup);
  const myMembership = members.find(m => m.user_id === user?.id);
  const isAdmin = myMembership?.role === "admin";

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 py-20">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground font-body">Please sign in to use group messages.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-heading font-bold text-foreground">Group Chats</h1>
              </div>
              <Button onClick={() => setCreateGroupOpen(true)} size="sm" className="gap-1.5">
                <Plus size={14} /> New Group
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[65vh]">
              {/* Group list */}
              <div className="gradient-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-muted-foreground text-xs py-8 animate-pulse">Loading...</p>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <p className="text-muted-foreground text-xs">No groups yet.</p>
                      <p className="text-muted-foreground/60 text-[10px] mt-1">Create a group to start chatting.</p>
                    </div>
                  ) : (
                    groups.map(g => (
                      <button key={g.id} onClick={() => setActiveGroup(g.id)}
                        className={`w-full flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 transition-colors text-left ${activeGroup === g.id ? "bg-muted/50" : ""}`}>
                        <Avatar className="h-9 w-9 border border-primary/20">
                          <AvatarImage src={g.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-heading text-xs">{g.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm text-foreground truncate">{g.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{g.description || "Group chat"}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat area */}
              <div
                className="md:col-span-2 gradient-card border border-border rounded-lg overflow-hidden flex flex-col relative"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {isDragging && activeGroup && <DropZoneOverlay />}
                {!activeGroup ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <Users className="h-12 w-12 text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground font-body text-sm">Select a group or create a new one</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="p-3 border-b border-border flex items-center gap-3">
                      <button onClick={() => setActiveGroup(null)} className="md:hidden text-muted-foreground hover:text-primary"><ArrowLeft size={16} /></button>
                      <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarImage src={activeGroupData?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{(activeGroupData?.name || "?").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-heading text-sm text-foreground">{activeGroupData?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{members.length} members</p>
                      </div>
                      <button onClick={() => { setMsgSearchOpen(!msgSearchOpen); setMsgSearchQuery(""); }}
                        className={`p-1.5 rounded transition-colors ${msgSearchOpen ? "text-primary bg-muted/50" : "text-muted-foreground hover:text-primary hover:bg-muted/50"}`}><Search size={16} /></button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"><MoreVertical size={16} /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && <DropdownMenuItem onClick={() => setAddMemberOpen(true)} className="cursor-pointer"><UserPlus size={14} className="mr-2" />Add Members</DropdownMenuItem>}
                          {isAdmin && <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer"><Settings size={14} className="mr-2" />Group Settings</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => setShowGallery(true)} className="cursor-pointer"><Image size={14} className="mr-2" />Shared Media</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowPinned(!showPinned)} className="cursor-pointer"><Pin size={14} className="mr-2" />{showPinned ? "Hide" : "View"} Pinned Messages</DropdownMenuItem>
                          <DropdownMenuItem onClick={handleToggleMute} className="cursor-pointer">
                            {myMembership?.is_muted ? <Volume2 size={14} className="mr-2" /> : <VolumeX size={14} className="mr-2" />}
                            {myMembership?.is_muted ? "Unmute Group" : "Mute Group"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { const next = !globalMute; setGlobalMute(next); localStorage.setItem("group-global-mute", String(next)); }} className="cursor-pointer">
                            <BellOff size={14} className="mr-2" />{globalMute ? "Enable All Sounds" : "Mute All Sounds"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLeaveGroup} className="text-destructive focus:text-destructive cursor-pointer"><LogOut size={14} className="mr-2" />Leave Group</DropdownMenuItem>
                          {isAdmin && <DropdownMenuItem onClick={() => setDeleteGroupTarget(activeGroup)} className="text-destructive focus:text-destructive cursor-pointer"><Trash2 size={14} className="mr-2" />Delete Group</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Message search */}
                    <AnimatePresence>
                      {msgSearchOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-border overflow-hidden">
                          <div className="p-2 flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input value={msgSearchQuery} onChange={e => setMsgSearchQuery(e.target.value)} placeholder="Search..." className="pl-8 h-7 text-xs" autoFocus />
                            </div>
                            {msgSearchResults.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msgSearchIdx + 1}/{msgSearchResults.length}</span>
                                <button onClick={handleMsgSearchPrev} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"><ChevronUp size={14} /></button>
                                <button onClick={handleMsgSearchNext} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"><ChevronDown size={14} /></button>
                              </div>
                            )}
                            <button onClick={() => { setMsgSearchOpen(false); setMsgSearchQuery(""); }} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Pinned messages banner */}
                    {showPinned && pinnedMsgIds.size > 0 && (
                      <div className="border-b border-border bg-muted/30 p-2 max-h-32 overflow-y-auto">
                        <div className="flex items-center gap-1 mb-1">
                          <Pin size={12} className="text-primary" />
                          <span className="text-[10px] font-semibold text-foreground">Pinned Messages ({pinnedMsgIds.size})</span>
                        </div>
                        {messages.filter(m => pinnedMsgIds.has(m.id)).map(m => (
                          <button key={m.id} onClick={() => messageRefs.current[m.id]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                            className="w-full text-left px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted/50 transition-colors truncate flex items-center gap-2">
                            <span className="font-semibold text-foreground">{getSenderName(m.sender_id)}:</span>
                            <span className="truncate">{m.content}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 && <p className="text-center text-muted-foreground/50 text-xs py-8">No messages yet. Say hello!</p>}
                      {messages.map(msg => {
                        const isMe = msg.sender_id === user.id;
                        const msgReactions = reactions.filter(r => r.message_id === msg.id);
                        const repliedMsg = getReplyMessage(msg.reply_to_id);
                        const isSearchMatch = msgSearchResults.includes(msg.id);
                        const isActiveMatch = msgSearchResults[msgSearchIdx] === msg.id;
                        const isEditing = editingMsgId === msg.id;
                        return (
                          <div key={msg.id} ref={el => { messageRefs.current[msg.id] = el; }}
                            className={`group/msg flex ${isMe ? "justify-end" : "justify-start"} ${isActiveMatch ? "ring-2 ring-primary/50 rounded-lg" : isSearchMatch ? "ring-1 ring-accent/50 rounded-lg" : ""}`}>
                            {!isMe && (
                              <div className="relative mr-2 mt-1 shrink-0">
                                <Avatar className="h-6 w-6 border border-primary/20">
                                  <AvatarImage src={profiles[msg.sender_id]?.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-[8px]">{getSenderName(msg.sender_id).charAt(0)}</AvatarFallback>
                                </Avatar>
                                <OnlineDot isOnline={onlineUsers.has(msg.sender_id)} />
                              </div>
                            )}
                            <div className="max-w-[70%]">
                              {!isMe && <p className="text-[10px] text-muted-foreground mb-0.5 font-semibold">{getSenderName(msg.sender_id)}</p>}
                              {repliedMsg && (
                                <div className={`mb-1 px-2 py-1 rounded text-[10px] border-l-2 ${isMe ? "border-primary-foreground/40 bg-primary/20 text-primary-foreground/70" : "border-primary/40 bg-muted/80 text-muted-foreground"}`}>
                                  <span className="font-semibold">{getSenderName(repliedMsg.sender_id)}</span>
                                  <p className="truncate">{repliedMsg.content}</p>
                                </div>
                              )}
                              <div className={`rounded-lg px-3 py-2 text-sm font-body ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                {msg.audio_url && <div className="mb-1"><AudioPlayer src={msg.audio_url} isOwnMessage={isMe} /></div>}
                                {msg.image_url && (() => {
                                  const rawUrl = msg.image_url!;
                                  const cleanUrl = getCleanUrl(rawUrl);
                                  const isImg = isImageUrl(cleanUrl);
                                  const isVid = isVideoUrl(cleanUrl);
                                  if (isImg) return (
                                    <button onClick={() => setImagePreview(cleanUrl)} className="block mb-1.5">
                                      <img src={cleanUrl} alt="" className="max-w-full max-h-48 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                    </button>
                                  );
                                  if (isVid) return <video src={cleanUrl} controls className="max-w-full max-h-48 rounded mb-1.5" />;
                                  return <FileAttachmentCard url={rawUrl} isOwnMessage={isMe} />;
                                })()}
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <input value={editContent} onChange={e => setEditContent(e.target.value.slice(0, 2000))}
                                      onKeyDown={e => { if (e.key === "Enter") handleEditMessage(msg.id); if (e.key === "Escape") { setEditingMsgId(null); setEditContent(""); } }}
                                      className="flex-1 bg-transparent border-b border-current/30 outline-none text-sm py-0.5" autoFocus />
                                    <button onClick={() => handleEditMessage(msg.id)} className="p-0.5 rounded hover:bg-current/10"><Check size={12} /></button>
                                    <button onClick={() => { setEditingMsgId(null); setEditContent(""); }} className="p-0.5 rounded hover:bg-current/10"><X size={12} /></button>
                                  </div>
                                ) : (
                                  msg.content && !(msg.content === "📷 Image" && msg.image_url) && !(msg.content === "🎤 Voice message" && msg.audio_url) && !(msg.content === "🎬 Video" && msg.image_url) && !(msg.content === "📎 File" && msg.image_url) && (
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                  )
                                )}
                                <div className="flex items-center gap-1 mt-1">
                                  <p className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{timeAgo(msg.created_at)}</p>
                                  {msg.edited_at && <span className={`text-[9px] italic ${isMe ? "text-primary-foreground/40" : "text-muted-foreground/60"}`}>(edited)</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageReactions messageId={msg.id} userId={user.id} reactions={msgReactions}
                                  onReactionChange={() => fetchReactions(messages.map(m => m.id))} isOwnMessage={isMe} />
                                <button onClick={() => setReplyTo(msg)} className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all" title="Reply"><Reply size={12} /></button>
                                <button onClick={() => setForwardMsg(msg)} className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all" title="Forward"><Forward size={12} /></button>
                                <button onClick={() => handlePinMessage(msg.id)} className={`opacity-0 group-hover/msg:opacity-100 p-1 rounded transition-all hover:bg-muted/50 ${pinnedMsgIds.has(msg.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`} title={pinnedMsgIds.has(msg.id) ? "Unpin" : "Pin"}>
                                  {pinnedMsgIds.has(msg.id) ? <PinOff size={12} /> : <Pin size={12} />}
                                </button>
                                {isMe && !msg.audio_url && (
                                  <button onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content); }} className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all" title="Edit"><Pencil size={12} /></button>
                                )}
                                {(isMe || isAdmin) && (
                                  <button onClick={() => setDeleteMessageTarget(msg.id)} className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Delete message"><Trash2 size={12} /></button>
                                )}
                              </div>
                              {isMe && (() => {
                                const readBy = getReadByUsers(msg);
                                if (readBy.length === 0) return null;
                                return (
                                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                                    <CheckCheck size={10} className="text-primary shrink-0" />
                                    <div className="flex -space-x-1">
                                      {readBy.slice(0, 5).map(uid => (
                                        <Avatar key={uid} className="h-3.5 w-3.5 border border-background">
                                          <AvatarImage src={profiles[uid]?.avatar_url || undefined} />
                                          <AvatarFallback className="bg-primary/10 text-primary text-[6px]">{(profiles[uid]?.display_name || "?").charAt(0)}</AvatarFallback>
                                        </Avatar>
                                      ))}
                                    </div>
                                    {readBy.length > 5 && <span className="text-[8px] text-muted-foreground">+{readBy.length - 5}</span>}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                      <AnimatePresence>
                        {typingUsers.size > 0 && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                            <TypingIndicator names={Array.from(typingUsers).map(id => profiles[id]?.display_name || "Someone")} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={chatEndRef} />
                    </div>

                    {/* Reply preview */}
                    {replyTo && (
                      <div className="px-3 pt-2 border-t border-border/50 flex items-center gap-2">
                        <Reply size={14} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{getSenderName(replyTo.sender_id)}</span>
                          <p className="truncate">{replyTo.content}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0"><X size={14} /></button>
                      </div>
                    )}

                    {pendingImageUrl && (
                      <div className="px-3 pt-2 border-t border-border/50">
                        <div className="relative inline-block">
                          {isImageUrl(pendingImageUrl) ? (
                            <img src={getCleanUrl(pendingImageUrl)} alt="Pending" className="h-16 rounded border border-border object-cover" />
                          ) : (
                            <div className="h-16 px-4 rounded border border-border bg-muted/30 flex items-center justify-center">
                              <FileAttachmentCard url={pendingImageUrl} isOwnMessage={false} />
                            </div>
                          )}
                          <button onClick={() => setPendingImageUrl(null)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px]">×</button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2">
                      <MediaUpload userId={user.id} onUpload={url => setPendingImageUrl(url)} pendingUrl={null} onClear={() => {}} />
                      <VoiceRecorder userId={user.id} onRecorded={handleSendVoice} />
                      <Input value={msgContent} onChange={e => { setMsgContent(e.target.value.slice(0, 2000)); broadcastTyping(); }} onPaste={handlePaste} placeholder={replyTo ? "Reply..." : "Type a message..."} className="flex-1" autoFocus />
                      <Button type="submit" disabled={(!msgContent.trim() && !pendingImageUrl) || sending} size="icon" className="shrink-0"><Send size={16} /></Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create group modal */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Create Group</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name" maxLength={50} />
            <Textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Description (optional)" maxLength={200} rows={2} />
          </div>
          <DialogFooter><Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add member modal */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Add Members</DialogTitle></DialogHeader>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={memberSearch} onChange={e => searchMembers(e.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {memberSearchResults.map(p => (
              <button key={p.user_id} onClick={() => handleAddMember(p.user_id)}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left">
                <Avatar className="h-7 w-7"><AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{p.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1"><p className="font-heading text-xs">{p.display_name}</p></div>
                <UserPlus size={14} className="text-primary" />
              </button>
            ))}
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-xs text-muted-foreground mb-2">Current Members ({members.length})</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-1.5 rounded text-xs">
                  <Avatar className="h-6 w-6"><AvatarImage src={profiles[m.user_id]?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[8px]">{(profiles[m.user_id]?.display_name || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-foreground">{profiles[m.user_id]?.display_name || "Cultivator"}</span>
                  {m.role === "admin" && <Crown size={12} className="text-amber-500" />}
                  {isAdmin && m.user_id !== user.id && (
                    <button onClick={() => handleRemoveMember(m.user_id)} className="p-1 text-muted-foreground hover:text-destructive"><UserMinus size={12} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Group Settings</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input defaultValue={activeGroupData?.name} placeholder="Group name"
              onBlur={async (e) => {
                if (e.target.value.trim() && activeGroup) {
                  await supabase.from("group_chats" as any).update({ name: e.target.value.trim() } as any).eq("id", activeGroup);
                  setGroups(prev => prev.map(g => g.id === activeGroup ? { ...g, name: e.target.value.trim() } : g));
                }
              }} />
            <Textarea defaultValue={activeGroupData?.description} placeholder="Description"
              onBlur={async (e) => {
                if (activeGroup) {
                  await supabase.from("group_chats" as any).update({ description: e.target.value.trim() } as any).eq("id", activeGroup);
                  setGroups(prev => prev.map(g => g.id === activeGroup ? { ...g, description: e.target.value.trim() } : g));
                }
              }} rows={2} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete group confirmation */}
      <AlertDialog open={!!deleteGroupTarget} onOpenChange={o => !o && setDeleteGroupTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Group</AlertDialogTitle>
            <AlertDialogDescription className="font-body">This will permanently delete this group and all messages. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete message confirmation */}
      <AlertDialog open={!!deleteMessageTarget} onOpenChange={o => !o && setDeleteMessageTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="font-body">Are you sure you want to delete this message? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media gallery */}
      <MediaGallery mediaUrls={galleryUrls} open={showGallery} onClose={() => setShowGallery(false)} />

      {/* Forward modal */}
      <ForwardMessageModal
        open={!!forwardMsg}
        onClose={() => setForwardMsg(null)}
        messageContent={forwardMsg?.content || ""}
        imageUrl={forwardMsg?.image_url}
        userId={user.id}
      />

      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setImagePreview(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={imagePreview} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg object-contain" onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
