import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { MessageCircle, Send, ArrowLeft, Search, Trash2, MoreVertical, Reply, X, CheckCheck, ChevronUp, ChevronDown, Pencil, Check, Forward, Users, Pin, PinOff, Volume2, VolumeX, BellOff, Image } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
}

interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  audio_url: string | null;
  reply_to_id: string | null;
  edited_at: string | null;
  created_at: string;
}

interface ProfileInfo {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  username: string | null;
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function OnlineDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${isOnline ? "bg-green-500" : "bg-muted-foreground/40"}`}
    />
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("with");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [msgContent, setMsgContent] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileInfo[]>([]);
  const [otherTyping, setOtherTyping] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<DirectMessage | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [msgSearchResults, setMsgSearchResults] = useState<string[]>([]);
  const [msgSearchIdx, setMsgSearchIdx] = useState(0);
  const [otherReadAt, setOtherReadAt] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [forwardMsg, setForwardMsg] = useState<DirectMessage | null>(null);
  const [pinnedMsgIds, setPinnedMsgIds] = useState<Set<string>>(new Set());
  const [showPinned, setShowPinned] = useState(false);
  const [deleteMessageTarget, setDeleteMessageTarget] = useState<string | null>(null);
  const [globalMute, setGlobalMute] = useState(() => localStorage.getItem("dm-global-mute") === "true");
  const [mutedConvos, setMutedConvos] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("dm-muted-convos") || "[]")); } catch { return new Set(); }
  });
  const [globalMsgSearch, setGlobalMsgSearch] = useState("");
  const [globalMsgResults, setGlobalMsgResults] = useState<{ conversation_id: string; content: string; created_at: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const dragCounterRef = useRef(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const audioContextRef = useRef<AudioContext | null>(null);

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

  // Notification sound function
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
    } catch (e) {
      // Audio not supported or blocked
    }
  }, []);

  const getOtherUserId = (conv: Conversation) =>
    conv.user1_id === user?.id ? conv.user2_id : conv.user1_id;

  // Presence tracking
  useEffect(() => {
    if (!user) return;
    const presenceChannel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });
    return () => { supabase.removeChannel(presenceChannel); };
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data: convos } = await supabase
        .from("conversations" as any).select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (convos) {
        setConversations(convos as any);
        const otherIds = (convos as any[]).map((c: any) => c.user1_id === user.id ? c.user2_id : c.user1_id);
        if (targetUserId && !otherIds.includes(targetUserId)) otherIds.push(targetUserId);
        if (otherIds.length > 0) {
          const { data: profs } = await supabase.from("profiles")
            .select("user_id, display_name, avatar_url, username")
            .in("user_id", [...new Set(otherIds)]);
          if (profs) {
            const pMap: Record<string, ProfileInfo> = {};
            profs.forEach((p: any) => { pMap[p.user_id] = p; });
            setProfiles(pMap);
          }
        }
        if (targetUserId) {
          const existing = (convos as any[]).find((c: any) =>
            (c.user1_id === user.id && c.user2_id === targetUserId) || (c.user1_id === targetUserId && c.user2_id === user.id)
          );
          if (existing) setActiveConvo(existing.id);
        }
      }
      setLoading(false);
    };
    fetchConversations();
  }, [user, targetUserId]);

  const markAsRead = async (convoId: string) => {
    if (!user) return;
    await supabase.from("conversation_reads" as any).upsert(
      { conversation_id: convoId, user_id: user.id, last_read_at: new Date().toISOString() } as any,
      { onConflict: "conversation_id,user_id" }
    );
  };

  const fetchOtherReadAt = useCallback(async (convoId: string, otherUserId: string) => {
    const { data } = await supabase.from("conversation_reads" as any)
      .select("last_read_at").eq("conversation_id", convoId).eq("user_id", otherUserId).maybeSingle();
    setOtherReadAt(data ? (data as any).last_read_at : null);
  }, []);

  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) { setReactions([]); return; }
    const { data } = await supabase.from("message_reactions" as any).select("*").in("message_id", messageIds);
    if (data) setReactions(data as any);
  }, []);

  // Typing indicator
  useEffect(() => {
    if (!activeConvo || !user) { setOtherTyping(false); return; }
    const channel = supabase.channel(`typing-${activeConvo}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.user_id !== user.id) {
          setOtherTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      }).subscribe();
    typingChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
      setOtherTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeConvo, user]);

  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current || !user) return;
    typingChannelRef.current.send({ type: "broadcast", event: "typing", payload: { user_id: user.id } });
  }, [user]);

  // Load messages + reactions + read receipts
  useEffect(() => {
    if (!activeConvo) { setMessages([]); setReactions([]); setReplyTo(null); setOtherReadAt(null); setEditingMsgId(null); setPinnedMsgIds(new Set()); setShowPinned(false); return; }
    markAsRead(activeConvo);
    const conv = conversations.find(c => c.id === activeConvo);
    const otherUid = conv ? getOtherUserId(conv) : null;
    if (otherUid) fetchOtherReadAt(activeConvo, otherUid);

    const fetchMessages = async () => {
      const { data } = await supabase.from("direct_messages" as any).select("*")
        .eq("conversation_id", activeConvo).order("created_at", { ascending: true }).limit(200);
      if (data) {
        setMessages(data as any);
        fetchReactions((data as any[]).map((m: any) => m.id));
      }
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };
    fetchMessages();

    // Fetch pinned messages
    const fetchPins = async () => {
      const { data } = await supabase.from("pinned_dm_messages" as any).select("message_id").eq("conversation_id", activeConvo);
      if (data) setPinnedMsgIds(new Set((data as any[]).map(p => p.message_id)));
    };
    fetchPins();

    const msgChannel = supabase.channel(`dm-${activeConvo}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${activeConvo}` }, (payload) => {
        const newMsg = payload.new as DirectMessage;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        markAsRead(activeConvo);
        if (newMsg.sender_id !== user?.id && !globalMute && !mutedConvos.has(activeConvo)) {
          playNotificationSound();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${activeConvo}` }, (payload) => {
        setMessages(prev => prev.map(m => m.id === (payload.new as any).id ? payload.new as DirectMessage : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${activeConvo}` }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
      })
      .subscribe();

    const reactChannel = supabase.channel(`reactions-${activeConvo}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => {
        setMessages(prev => { fetchReactions(prev.map(m => m.id)); return prev; });
      }).subscribe();

    const readChannel = supabase.channel(`reads-${activeConvo}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_reads", filter: `conversation_id=eq.${activeConvo}` }, (payload) => {
        const row = payload.new as any;
        if (row && row.user_id !== user?.id) setOtherReadAt(row.last_read_at);
      }).subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reactChannel);
      supabase.removeChannel(readChannel);
    };
  }, [activeConvo, fetchReactions, fetchOtherReadAt]);

  // Message search logic
  useEffect(() => {
    if (!msgSearchQuery.trim()) { setMsgSearchResults([]); setMsgSearchIdx(0); return; }
    const q = msgSearchQuery.toLowerCase();
    const results = messages.filter(m => m.content.toLowerCase().includes(q)).map(m => m.id);
    setMsgSearchResults(results);
    setMsgSearchIdx(0);
    if (results.length > 0) messageRefs.current[results[0]]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [msgSearchQuery, messages]);

  const scrollToSearchResult = (idx: number) => {
    const id = msgSearchResults[idx];
    if (id) messageRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const handleMsgSearchNext = () => { const next = (msgSearchIdx + 1) % msgSearchResults.length; setMsgSearchIdx(next); scrollToSearchResult(next); };
  const handleMsgSearchPrev = () => { const prev = (msgSearchIdx - 1 + msgSearchResults.length) % msgSearchResults.length; setMsgSearchIdx(prev); scrollToSearchResult(prev); };

  const getLastSeenMessageId = (): string | null => {
    if (!otherReadAt || !user) return null;
    const myMessages = messages.filter(m => m.sender_id === user.id && m.created_at <= otherReadAt);
    if (myMessages.length === 0) return null;
    return myMessages[myMessages.length - 1].id;
  };
  const lastSeenMsgId = getLastSeenMessageId();

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    const existing = conversations.find(c => (c.user1_id === user.id && c.user2_id === otherUserId) || (c.user1_id === otherUserId && c.user2_id === user.id));
    if (existing) { setActiveConvo(existing.id); setSearchQuery(""); setSearchResults([]); return; }
    const [u1, u2] = user.id < otherUserId ? [user.id, otherUserId] : [otherUserId, user.id];
    const { data, error } = await supabase.from("conversations" as any).insert({ user1_id: u1, user2_id: u2 } as any).select().single();
    if (error) { toast.error("Failed to start conversation"); return; }
    const newConvo = data as any as Conversation;
    setConversations(prev => [newConvo, ...prev]);
    if (!profiles[otherUserId]) {
      const { data: prof } = await supabase.from("profiles").select("user_id, display_name, avatar_url, username").eq("user_id", otherUserId).single();
      if (prof) setProfiles(prev => ({ ...prev, [otherUserId]: prof as ProfileInfo }));
    }
    setActiveConvo(newConvo.id);
    setSearchQuery(""); setSearchResults([]); setSearchParams({});
  };

  useEffect(() => {
    if (targetUserId && !loading && user && !activeConvo) startConversation(targetUserId);
  }, [targetUserId, loading, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgContent.trim() && !pendingImageUrl) || !user || !activeConvo) return;
    setSending(true);
    const cleanPendingUrl = pendingImageUrl ? getCleanUrl(pendingImageUrl) : null;
    const insertData: any = {
      conversation_id: activeConvo, sender_id: user.id,
      content: msgContent.trim() || (pendingImageUrl ? (
        isVideoUrl(pendingImageUrl) ? "🎬 Video" :
        isImageUrl(pendingImageUrl) ? "📷 Image" : "📎 File"
      ) : ""),
      image_url: pendingImageUrl,
    };
    if (replyTo) insertData.reply_to_id = replyTo.id;
    const { error } = await supabase.from("direct_messages" as any).insert(insertData);
    if (error) toast.error("Failed to send message");
    setMsgContent(""); setPendingImageUrl(null); setReplyTo(null); setSending(false);
  };

  const handleSendVoice = async (audioUrl: string) => {
    if (!user || !activeConvo) return;
    const { error } = await supabase.from("direct_messages" as any).insert({
      conversation_id: activeConvo, sender_id: user.id, content: "🎤 Voice message", audio_url: audioUrl,
    } as any);
    if (error) toast.error("Failed to send voice message");
  };

  const handleEditMessage = async (msgId: string) => {
    if (!editContent.trim()) return;
    const { error } = await supabase.from("direct_messages" as any)
      .update({ content: editContent.trim(), edited_at: new Date().toISOString() } as any)
      .eq("id", msgId);
    if (error) { toast.error("Failed to edit message"); return; }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editContent.trim(), edited_at: new Date().toISOString() } : m));
    setEditingMsgId(null); setEditContent("");
  };

  const handleDeleteConversation = async () => {
    if (!deleteTarget || !user) return;
    await supabase.from("direct_messages" as any).delete().eq("conversation_id", deleteTarget).eq("sender_id", user.id);
    await supabase.from("conversation_reads" as any).delete().eq("conversation_id", deleteTarget).eq("user_id", user.id);
    const { error } = await supabase.from("conversations" as any).delete().eq("id", deleteTarget);
    if (error) { toast.error("Failed to delete conversation"); }
    else {
      setConversations(prev => prev.filter(c => c.id !== deleteTarget));
      if (activeConvo === deleteTarget) { setActiveConvo(null); setMessages([]); }
      toast.success("Conversation deleted");
    }
    setDeleteTarget(null);
  };

  const handlePinMessage = async (msgId: string) => {
    if (!activeConvo || !user) return;
    if (pinnedMsgIds.has(msgId)) {
      await supabase.from("pinned_dm_messages" as any).delete().eq("conversation_id", activeConvo).eq("message_id", msgId);
      setPinnedMsgIds(prev => { const n = new Set(prev); n.delete(msgId); return n; });
      toast.success("Message unpinned");
    } else {
      const { error } = await supabase.from("pinned_dm_messages" as any).insert({ conversation_id: activeConvo, message_id: msgId, pinned_by: user.id } as any);
      if (error) { toast.error("Failed to pin"); return; }
      setPinnedMsgIds(prev => new Set(prev).add(msgId));
      toast.success("Message pinned");
    }
  };

  const handleDeleteMessage = async () => {
    if (!deleteMessageTarget || !user) return;
    const { error } = await supabase.from("direct_messages" as any).delete().eq("id", deleteMessageTarget);
    if (error) { toast.error("Failed to delete message"); }
    else {
      setMessages(prev => prev.filter(m => m.id !== deleteMessageTarget));
      toast.success("Message deleted");
    }
    setDeleteMessageTarget(null);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url, username")
      .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`).neq("user_id", user?.id || "").limit(8);
    if (data) setSearchResults(data as ProfileInfo[]);
  };

  const handleGlobalMsgSearch = async () => {
    if (!globalMsgSearch.trim() || !user) { setGlobalMsgResults([]); return; }
    const convoIds = conversations.map(c => c.id);
    if (convoIds.length === 0) { setGlobalMsgResults([]); return; }
    const { data } = await supabase.from("direct_messages" as any)
      .select("conversation_id, content, created_at")
      .in("conversation_id", convoIds)
      .ilike("content", `%${globalMsgSearch.trim()}%`)
      .order("created_at", { ascending: false })
      .limit(30);
    setGlobalMsgResults(data as any[] || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsgContent(e.target.value.slice(0, 2000));
    broadcastTyping();
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

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const getReplyMessage = (replyToId: string | null) => {
    if (!replyToId) return null;
    return messages.find(m => m.id === replyToId) || null;
  };

  const getMessageSenderName = (senderId: string) => {
    if (senderId === user?.id) return "You";
    return profiles[senderId]?.display_name || "Cultivator";
  };

  const highlightText = (text: string, msgId: string) => {
    if (!msgSearchQuery.trim() || !msgSearchResults.includes(msgId)) return text;
    const q = msgSearchQuery.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-accent text-accent-foreground rounded px-0.5">{text.slice(idx, idx + msgSearchQuery.length)}</mark>
        {text.slice(idx + msgSearchQuery.length)}
      </>
    );
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 py-20">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground font-body">Please <Link to="/login" className="text-primary hover:underline">sign in</Link> to use messages.</p>
        </div>
      </Layout>
    );
  }

  const activeConversation = conversations.find(c => c.id === activeConvo);
  const activeOtherUserId = activeConversation ? getOtherUserId(activeConversation) : null;
  const activeOtherProfile = activeOtherUserId ? profiles[activeOtherUserId] : null;

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-heading font-bold text-foreground">Messages</h1>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.location.href = '/groups'}>
                <Users size={14} /> Group Chats
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[65vh]">
              {/* Conversation list */}
              <div className="gradient-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search users..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="pl-9 h-8 text-xs" />
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search all messages..."
                      value={globalMsgSearch}
                      onChange={(e) => setGlobalMsgSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleGlobalMsgSearch(); }}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Global search results */}
                {globalMsgResults.length > 0 && (
                  <div className="border-b border-border p-2 space-y-1 max-h-60 overflow-y-auto bg-muted/20">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold text-foreground">Search Results ({globalMsgResults.length})</span>
                      <button onClick={() => { setGlobalMsgResults([]); setGlobalMsgSearch(""); }} className="text-[10px] text-muted-foreground hover:text-destructive">Clear</button>
                    </div>
                    {globalMsgResults.map((r, i) => {
                      const conv = conversations.find(c => c.id === r.conversation_id);
                      const otherId = conv ? getOtherUserId(conv) : null;
                      const otherP = otherId ? profiles[otherId] : null;
                      return (
                        <button key={i} onClick={() => { setActiveConvo(r.conversation_id); setGlobalMsgResults([]); }}
                          className="w-full flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left">
                          <Avatar className="h-6 w-6 shrink-0 mt-0.5 border border-primary/20">
                            <AvatarImage src={otherP?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[8px]">{(otherP?.display_name || "?").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-muted-foreground">{otherP?.display_name || "Conversation"}</p>
                            <p className="text-xs text-foreground truncate">{r.content}</p>
                            <p className="text-[9px] text-muted-foreground">{timeAgo(r.created_at)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="border-b border-border p-2 space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map(p => (
                      <button key={p.user_id} onClick={() => startConversation(p.user_id)} className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left">
                        <div className="relative">
                          <Avatar className="h-7 w-7 border border-primary/20">
                            <AvatarImage src={p.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{p.display_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <OnlineDot isOnline={onlineUsers.has(p.user_id)} />
                        </div>
                        <div>
                          <p className="font-heading text-xs text-foreground">{p.display_name}</p>
                          {p.username && <p className="text-[10px] text-muted-foreground">@{p.username}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-muted-foreground text-xs py-8 animate-pulse">Loading...</p>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <p className="text-muted-foreground text-xs font-body">No conversations yet.</p>
                      <p className="text-muted-foreground/60 text-[10px] mt-1">Search for a user above to start chatting.</p>
                    </div>
                  ) : (
                    conversations.map(conv => {
                      const otherId = getOtherUserId(conv);
                      const otherProfile = profiles[otherId];
                      const isOnline = onlineUsers.has(otherId);
                      return (
                        <div key={conv.id} className={`group w-full flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${activeConvo === conv.id ? "bg-muted/50" : ""}`}>
                          <button onClick={() => setActiveConvo(conv.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                            <div className="relative shrink-0">
                              <Avatar className="h-9 w-9 border border-primary/20">
                                <AvatarImage src={otherProfile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary font-heading text-xs">{(otherProfile?.display_name || "?").charAt(0)}</AvatarFallback>
                              </Avatar>
                              <OnlineDot isOnline={isOnline} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading text-sm text-foreground truncate">{otherProfile?.display_name || "Cultivator"}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {isOnline ? <span className="text-green-500">Online</span> : timeAgo(conv.last_message_at)}
                              </p>
                            </div>
                          </button>
                          <button onClick={() => setDeleteTarget(conv.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0" title="Delete conversation">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
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
                {isDragging && activeConvo && <DropZoneOverlay />}
                {!activeConvo ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground font-body text-sm">Select a conversation or search for a user to start chatting</p>
                  </div>
                ) : (
                  <>
                    {/* Chat header */}
                    <div className="p-3 border-b border-border flex items-center gap-3">
                      <button onClick={() => setActiveConvo(null)} className="md:hidden text-muted-foreground hover:text-primary">
                        <ArrowLeft size={16} />
                      </button>
                      <div className="relative">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src={activeOtherProfile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{(activeOtherProfile?.display_name || "?").charAt(0)}</AvatarFallback>
                        </Avatar>
                        {activeOtherUserId && <OnlineDot isOnline={onlineUsers.has(activeOtherUserId)} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-heading text-sm text-foreground">{activeOtherProfile?.display_name || "Cultivator"}</p>
                        {activeOtherUserId && onlineUsers.has(activeOtherUserId) ? (
                          <p className="text-[10px] text-green-500">Online</p>
                        ) : activeOtherProfile?.username ? (
                          <Link to={`/u/${activeOtherProfile.username}`} className="text-[10px] text-primary/60 hover:text-primary">@{activeOtherProfile.username}</Link>
                        ) : null}
                      </div>
                      <button
                        onClick={() => { setMsgSearchOpen(!msgSearchOpen); setMsgSearchQuery(""); setMsgSearchResults([]); }}
                        className={`p-1.5 rounded transition-colors ${msgSearchOpen ? "text-primary bg-muted/50" : "text-muted-foreground hover:text-primary hover:bg-muted/50"}`}
                        title="Search messages"
                      >
                        <Search size={16} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowGallery(true)} className="cursor-pointer">
                            <Image size={14} className="mr-2" />Shared Media
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowPinned(!showPinned)} className="cursor-pointer">
                             <Pin size={14} className="mr-2" />{showPinned ? "Hide" : "View"} Pinned Messages
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const next = new Set(mutedConvos);
                            if (next.has(activeConvo!)) next.delete(activeConvo!); else next.add(activeConvo!);
                            setMutedConvos(next);
                            localStorage.setItem("dm-muted-convos", JSON.stringify([...next]));
                          }} className="cursor-pointer">
                            {mutedConvos.has(activeConvo!) ? <Volume2 size={14} className="mr-2" /> : <VolumeX size={14} className="mr-2" />}
                            {mutedConvos.has(activeConvo!) ? "Unmute Conversation" : "Mute Conversation"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const next = !globalMute;
                            setGlobalMute(next);
                            localStorage.setItem("dm-global-mute", String(next));
                          }} className="cursor-pointer">
                            <BellOff size={14} className="mr-2" />{globalMute ? "Enable All Sounds" : "Mute All Sounds"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(activeConvo)} className="text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 size={14} className="mr-2" />Delete conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Message search bar */}
                    <AnimatePresence>
                      {msgSearchOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-border overflow-hidden">
                          <div className="p-2 flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input value={msgSearchQuery} onChange={(e) => setMsgSearchQuery(e.target.value)} placeholder="Search in conversation..." className="pl-8 h-7 text-xs" autoFocus />
                            </div>
                            {msgSearchResults.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msgSearchIdx + 1}/{msgSearchResults.length}</span>
                                <button onClick={handleMsgSearchPrev} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"><ChevronUp size={14} /></button>
                                <button onClick={handleMsgSearchNext} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"><ChevronDown size={14} /></button>
                              </div>
                            )}
                            {msgSearchQuery && msgSearchResults.length === 0 && <span className="text-[10px] text-muted-foreground">No results</span>}
                            <button onClick={() => { setMsgSearchOpen(false); setMsgSearchQuery(""); setMsgSearchResults([]); }} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
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
                            <span className="font-semibold text-foreground">{getMessageSenderName(m.sender_id)}:</span>
                            <span className="truncate">{m.content}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 && (
                        <p className="text-center text-muted-foreground/50 text-xs py-8">No messages yet. Say hello!</p>
                      )}
                      {messages.map(msg => {
                        const isMe = msg.sender_id === user.id;
                        const msgReactions = reactions.filter(r => r.message_id === msg.id);
                        const repliedMsg = getReplyMessage(msg.reply_to_id);
                        const isSearchMatch = msgSearchResults.includes(msg.id);
                        const isActiveMatch = msgSearchResults[msgSearchIdx] === msg.id;
                        const isLastSeen = msg.id === lastSeenMsgId;
                        const isEditing = editingMsgId === msg.id;
                        return (
                          <div
                            key={msg.id}
                            ref={(el) => { messageRefs.current[msg.id] = el; }}
                            className={`group/msg flex ${isMe ? "justify-end" : "justify-start"} ${isActiveMatch ? "ring-2 ring-primary/50 rounded-lg" : isSearchMatch ? "ring-1 ring-accent/50 rounded-lg" : ""}`}
                          >
                            <div className="max-w-[75%]">
                              {/* Reply quote */}
                              {repliedMsg && (
                                <div className={`mb-1 px-2 py-1 rounded text-[10px] border-l-2 ${isMe ? "border-primary-foreground/40 bg-primary/20 text-primary-foreground/70" : "border-primary/40 bg-muted/80 text-muted-foreground"}`}>
                                  <span className="font-semibold">{getMessageSenderName(repliedMsg.sender_id)}</span>
                                  <p className="truncate">{repliedMsg.content || "📷 Image"}</p>
                                </div>
                              )}
                              <div className={`rounded-lg px-3 py-2 text-sm font-body ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                {/* Audio player */}
                                {msg.audio_url && (
                                  <div className="mb-1">
                                    <AudioPlayer src={msg.audio_url} isOwnMessage={isMe} />
                                  </div>
                                )}
                                {/* Image / Video / Document */}
                                {msg.image_url && (() => {
                                  const rawUrl = msg.image_url!;
                                  const cleanUrl = getCleanUrl(rawUrl);
                                  const isImg = isImageUrl(cleanUrl);
                                  const isVid = isVideoUrl(cleanUrl);
                                  if (isImg) return (
                                    <button onClick={() => setImagePreview(cleanUrl)} className="block mb-1.5">
                                      <img src={cleanUrl} alt="Shared image" className="max-w-full max-h-48 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                    </button>
                                  );
                                  if (isVid) return (
                                    <video src={cleanUrl} controls className="max-w-full max-h-48 rounded mb-1.5" />
                                  );
                                  return <FileAttachmentCard url={rawUrl} isOwnMessage={isMe} />;
                                })()}
                                {/* Text content or edit mode */}
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value.slice(0, 2000))}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleEditMessage(msg.id); if (e.key === "Escape") { setEditingMsgId(null); setEditContent(""); } }}
                                      className="flex-1 bg-transparent border-b border-current/30 outline-none text-sm py-0.5"
                                      autoFocus
                                    />
                                    <button onClick={() => handleEditMessage(msg.id)} className="p-0.5 rounded hover:bg-current/10"><Check size={12} /></button>
                                    <button onClick={() => { setEditingMsgId(null); setEditContent(""); }} className="p-0.5 rounded hover:bg-current/10"><X size={12} /></button>
                                  </div>
                                ) : (
                                  msg.content && !(msg.content === "📷 Image" && msg.image_url) && !(msg.content === "🎤 Voice message" && msg.audio_url) && !(msg.content === "🎬 Video" && msg.image_url) && !(msg.content === "📎 File" && msg.image_url) && (
                                    <p className="whitespace-pre-wrap break-words">{highlightText(msg.content, msg.id)}</p>
                                  )
                                )}
                                <div className="flex items-center gap-1 mt-1">
                                  <p className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                    {timeAgo(msg.created_at)}
                                  </p>
                                  {msg.edited_at && (
                                    <span className={`text-[9px] italic ${isMe ? "text-primary-foreground/40" : "text-muted-foreground/60"}`}>(edited)</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageReactions
                                  messageId={msg.id}
                                  userId={user.id}
                                  reactions={msgReactions}
                                  onReactionChange={() => fetchReactions(messages.map(m => m.id))}
                                  isOwnMessage={isMe}
                                />
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all"
                                  title="Reply"
                                >
                                  <Reply size={12} />
                                </button>
                                <button
                                  onClick={() => setForwardMsg(msg)}
                                  className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all"
                                  title="Forward"
                                >
                                  <Forward size={12} />
                                </button>
                                <button
                                  onClick={() => handlePinMessage(msg.id)}
                                  className={`opacity-0 group-hover/msg:opacity-100 p-1 rounded transition-all hover:bg-muted/50 ${pinnedMsgIds.has(msg.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                                  title={pinnedMsgIds.has(msg.id) ? "Unpin" : "Pin"}
                                >
                                  {pinnedMsgIds.has(msg.id) ? <PinOff size={12} /> : <Pin size={12} />}
                                </button>
                                {isMe && !msg.audio_url && (
                                  <button
                                    onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content); }}
                                    className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all"
                                    title="Edit"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}
                                {isMe && (
                                  <button
                                    onClick={() => setDeleteMessageTarget(msg.id)}
                                    className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                    title="Delete message"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              {isMe && isLastSeen && (
                                <div className="flex items-center justify-end gap-0.5 mt-0.5">
                                  <CheckCheck size={11} className="text-primary" />
                                  <span className="text-[9px] text-primary">Seen</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <AnimatePresence>
                        {otherTyping && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                            <TypingIndicator />
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
                          <span className="font-semibold text-foreground">{getMessageSenderName(replyTo.sender_id)}</span>
                          <p className="truncate">{replyTo.content || "📷 Image"}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0"><X size={14} /></button>
                      </div>
                    )}

                    {/* Pending image preview */}
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

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2">
                      <MediaUpload userId={user.id} onUpload={(url) => setPendingImageUrl(url)} pendingUrl={null} onClear={() => {}} />
                      <VoiceRecorder userId={user.id} onRecorded={handleSendVoice} />
                      <Input
                         value={msgContent}
                         onChange={handleInputChange}
                         onPaste={handlePaste}
                         placeholder={replyTo ? "Reply..." : "Type a message..."}
                         className="flex-1"
                         autoFocus
                       />
                      <Button type="submit" disabled={(!msgContent.trim() && !pendingImageUrl) || sending} size="icon" className="shrink-0">
                        <Send size={16} />
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete conversation confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="font-body">This will permanently delete this conversation and all its messages. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete message confirmation */}
      <AlertDialog open={!!deleteMessageTarget} onOpenChange={(open) => !open && setDeleteMessageTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="font-body">Are you sure you want to delete this message? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image preview lightbox */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setImagePreview(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={imagePreview} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media gallery */}
      <MediaGallery mediaUrls={galleryUrls} open={showGallery} onClose={() => setShowGallery(false)} />

      {/* Forward message modal */}
      <ForwardMessageModal
        open={!!forwardMsg}
        onClose={() => setForwardMsg(null)}
        messageContent={forwardMsg?.content || ""}
        imageUrl={forwardMsg?.image_url}
        userId={user.id}
      />
    </Layout>
  );
}
