import { useState } from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Mail, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function Contact() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (message.length > 2000) {
      toast.error("Message must be under 2000 characters");
      return;
    }

    setSending(true);

    // Store in the reviews table under a hidden internal path never shown publicly.
    // Format: "EMAIL|||MESSAGE" so admin can parse both fields.
    // rating=5 means unread, rating=1 means read (repurposed for inbox state).
    const { error } = await supabase.from("reviews").insert({
      author_name: name.trim(),
      content: `${email.trim()}|||${message.trim()}`,
      page_path: "/_contact_inbox",
      rating: 5,
      user_id: user?.id || null,
    });

    if (error) {
      toast.error("Failed to send message. Please email us directly at mail.jkyme@gmail.com");
      console.error("Contact submit error:", error);
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    }
    setSending(false);
  };

  return (
    <Layout>
      <div className="py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Mail className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Contact Us</h1>
              <p className="text-muted-foreground font-body text-sm">We'd love to hear from you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="gradient-card border border-border rounded-lg p-6">
              <h2 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                <MessageCircle size={16} className="text-primary" /> Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  data-testid="input-contact-name"
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  data-testid="input-contact-email"
                />
                <Textarea
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  data-testid="input-contact-message"
                />
                <Button type="submit" disabled={sending} className="w-full gap-2" data-testid="button-contact-submit">
                  <Send size={14} />
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="gradient-card border border-border rounded-lg p-6">
                <h2 className="font-heading text-lg text-foreground mb-3">Direct Contact</h2>
                <div className="space-y-3 font-body text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Email</p>
                    <a href="mailto:mail.jkyme@gmail.com" className="text-primary hover:underline">
                      mail.jkyme@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">WhatsApp</p>
                    <a
                      href="https://wa.me/254117412271?text=Hi%21%20I%E2%80%99d%20like%20to%20get%20in%20touch%20with%20you."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      +254 117 412 271
                    </a>
                  </div>
                </div>
              </div>

              <div className="gradient-card border border-border rounded-lg p-6">
                <h2 className="font-heading text-lg text-foreground mb-3">Response Time</h2>
                <p className="font-body text-sm text-muted-foreground">
                  We typically respond within 24–48 hours. For urgent matters, please reach out via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
