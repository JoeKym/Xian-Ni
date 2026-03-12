import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  messages: Msg[];
  isLoading: boolean;
  suggestions: string[];
  onSuggestion: (s: string) => void;
}

export function VoidyChatMessages({ messages, isLoading, suggestions, onSuggestion }: Props) {
  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-6"
        >
          <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-10 h-10 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-center text-sm">
            Ask Voidy anything about the Renegade Immortal universe
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-lg">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="px-3 py-1.5 rounded-full text-xs border border-border bg-muted/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-1">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 text-foreground border border-border"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-accent/50 border border-border flex items-center justify-center mt-1">
                <User size={16} className="text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3"
        >
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="bg-muted/70 border border-border rounded-xl px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
