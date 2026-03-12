import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Smile } from "lucide-react";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "⚔️", "🙏"];

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

interface MessageReactionsProps {
  messageId: string;
  userId: string;
  reactions: Reaction[];
  onReactionChange: () => void;
  isOwnMessage: boolean;
}

export function MessageReactions({ messageId, userId, reactions, onReactionChange, isOwnMessage }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Group reactions by emoji
  const grouped: Record<string, { count: number; userReacted: boolean; ids: string[] }> = {};
  reactions.forEach(r => {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, userReacted: false, ids: [] };
    grouped[r.emoji].count++;
    grouped[r.emoji].ids.push(r.id);
    if (r.user_id === userId) grouped[r.emoji].userReacted = true;
  });

  const toggleReaction = async (emoji: string) => {
    const existing = reactions.find(r => r.user_id === userId && r.emoji === emoji);
    if (existing) {
      await supabase.from("message_reactions" as any).delete().eq("id", existing.id);
    } else {
      await supabase.from("message_reactions" as any).insert({
        message_id: messageId,
        user_id: userId,
        emoji,
      } as any);
    }
    onReactionChange();
    setShowPicker(false);
  };

  return (
    <div className={`flex items-center gap-1 mt-1 flex-wrap ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {/* Existing reaction badges */}
      {Object.entries(grouped).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors border ${
            data.userReacted
              ? "bg-primary/15 border-primary/30 text-foreground"
              : "bg-muted/50 border-border hover:bg-muted text-muted-foreground"
          }`}
        >
          <span>{emoji}</span>
          <span className="font-heading">{data.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors opacity-0 group-hover/msg:opacity-100"
        >
          <Smile size={12} />
        </button>

        <AnimatePresence>
          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <motion.div
                ref={pickerRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute z-50 bottom-6 ${isOwnMessage ? "right-0" : "left-0"} bg-popover border border-border rounded-lg shadow-lg p-2 flex gap-1`}
              >
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(emoji)}
                    className="p-1 hover:bg-muted rounded transition-colors text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
