import { useState, useRef, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Send, Bot, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { VoidyBackground } from "@/components/voidy/VoidyBackground";
import { VoidyChatMessages, type Msg } from "@/components/voidy/VoidyChatMessages";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voidy-chat`;
const STORAGE_KEY = "voidy-chat-history";

const suggestions = [
  "Who is Wang Lin?",
  "Explain the cultivation realms",
  "Tell me about Li Muwan",
  "What are the Ancient Gods?",
  "Summarize the novel's plot",
];

function loadHistory(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-100) : [];
  } catch { return []; }
}

function saveHistory(msgs: Msg[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100)));
  } catch { /* quota */ }
}

export default function Voidy() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => { saveHistory(messages); }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const updated = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: updated } : m);
                }
                return [...prev, { role: "assistant", content: updated }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const updated = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: updated } : m);
                }
                return [...prev, { role: "assistant", content: updated }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
      if (!assistantSoFar) setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const MAX_CHARS = 2000;

  const exportChat = () => {
    if (messages.length === 0) return;
    const text = messages.map(m => `[${m.role === "user" ? "You" : "Voidy"}]\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([`Voidy Chat Export - ${new Date().toLocaleString()}\n${"=".repeat(40)}\n\n${text}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voidy-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <VoidyBackground />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-4xl min-h-screen flex flex-col relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/20 border border-primary/30">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground tracking-wider">Voidy</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your AI companion for all things Renegade Immortal. Ask about characters, cultivation, lore, and more.
          </p>
        </motion.div>

        <div className="flex-1 flex flex-col border border-border rounded-xl bg-card/80 backdrop-blur-md overflow-hidden min-h-[500px]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
            <VoidyChatMessages
              messages={messages}
              isLoading={isLoading}
              suggestions={suggestions}
              onSuggestion={sendMessage}
            />
          </ScrollArea>

          <div className="border-t border-border p-3 bg-background/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 px-1">
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY); }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Clear chat
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={exportChat}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors ml-2"
                >
                  <Download size={12} /> Export
                </button>
              )}
              <span className="text-xs text-muted-foreground ml-auto flex items-center gap-2">
                {isLoading && (
                  <span className="text-primary/70 animate-pulse">Voidy is thinking…</span>
                )}
                {user ? "" : "Sign in for best experience"}
              </span>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Voidy a question..."
                  className="min-h-[44px] max-h-[120px] resize-none text-sm bg-background/50 pr-16"
                  rows={1}
                  disabled={isLoading}
                />
                <span className={`absolute right-2 bottom-1.5 text-[10px] ${input.length > MAX_CHARS * 0.9 ? "text-destructive" : "text-muted-foreground/50"}`}>
                  {input.length}/{MAX_CHARS}
                </span>
              </div>
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 h-[44px] w-[44px]">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
