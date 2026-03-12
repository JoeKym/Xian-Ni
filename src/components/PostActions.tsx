import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Heart, Bookmark, MessageCircle, Send, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PostComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string | null;
  author_username?: string | null;
}

interface PostActionsProps {
  postId: string;
  likeCount: number;
  isLiked: boolean;
  onLike: (postId: string) => void;
}

export function PostActions({ postId, likeCount, isLiked, onLike }: PostActionsProps) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check bookmark status
    if (user) {
      supabase
        .from("post_bookmarks" as any)
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (data && (data as any[]).length > 0) setBookmarked(true);
        });
    }
    // Get comment count
    supabase
      .from("post_comments" as any)
      .select("id")
      .eq("post_id", postId)
      .then(({ data }) => {
        setCommentCount((data as any[])?.length || 0);
      });
  }, [postId, user]);

  const handleBookmark = async () => {
    if (!user) return;
    if (bookmarked) {
      await supabase.from("post_bookmarks" as any).delete().eq("post_id", postId).eq("user_id", user.id);
      setBookmarked(false);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("post_bookmarks" as any).insert({ post_id: postId, user_id: user.id } as any);
      setBookmarked(true);
      toast.success("Post saved!");
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("post_comments" as any)
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    
    if (data && (data as any[]).length > 0) {
      const userIds = [...new Set((data as any[]).map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, username")
        .in("user_id", userIds);
      
      const profMap: Record<string, any> = {};
      profiles?.forEach((p: any) => { profMap[p.user_id] = p; });

      setComments((data as any[]).map((c: any) => ({
        ...c,
        author_name: profMap[c.user_id]?.display_name || "Cultivator",
        author_avatar: profMap[c.user_id]?.avatar_url,
        author_username: profMap[c.user_id]?.username,
      })));
    } else {
      setComments([]);
    }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("post_comments" as any)
      .insert({ post_id: postId, user_id: user.id, content: commentText.trim() } as any);
    if (error) {
      toast.error("Failed to post comment");
    } else {
      setCommentText("");
      setCommentCount(prev => prev + 1);
      loadComments();
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("post_comments" as any).delete().eq("id", commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    setCommentCount(prev => Math.max(0, prev - 1));
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center gap-4">
        {/* Like */}
        <button
          onClick={() => onLike(postId)}
          disabled={!user}
          className={`flex items-center gap-1.5 text-xs font-heading transition-colors ${
            isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
          } disabled:opacity-50`}
        >
          <Heart size={14} className={isLiked ? "fill-primary" : ""} />
          {likeCount}
        </button>

        {/* Comment toggle */}
        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 text-xs font-heading transition-colors ${
            showComments ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <MessageCircle size={14} />
          {commentCount}
        </button>

        {/* Bookmark */}
        {user && (
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 text-xs font-heading transition-colors ml-auto ${
              bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Bookmark size={14} className={bookmarked ? "fill-primary" : ""} />
          </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 space-y-2">
          {comments.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2 bg-muted/30 rounded-md p-2.5">
                  <Link to={c.author_username ? `/u/${c.author_username}` : "#"}>
                    <Avatar className="h-5 w-5 border border-primary/20">
                      <AvatarImage src={c.author_avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-heading">
                        {(c.author_name || "C").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={c.author_username ? `/u/${c.author_username}` : "#"}
                        className="font-heading text-[11px] text-foreground hover:text-primary transition-colors"
                      >
                        {c.author_name}
                      </Link>
                      <span className="text-[9px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                      {user && c.user_id === user.id && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-body text-foreground/80 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Input
                value={commentText}
                onChange={e => setCommentText(e.target.value.slice(0, 1000))}
                placeholder="Write a comment..."
                className="h-8 text-xs"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                className="text-primary hover:text-primary/80 disabled:opacity-50 transition-colors shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground font-body">
              <Link to="/login" className="text-primary hover:underline">Sign in</Link> to comment
            </p>
          )}
        </div>
      )}
    </div>
  );
}
