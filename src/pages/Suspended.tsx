import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, Mail, Phone, MessageCircle, LogOut, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SuspensionInfo {
  is_suspended: boolean;
  type?: string;
  reason?: string;
  expires_at?: string;
}

interface Appeal {
  id: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export default function Suspended() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState<SuspensionInfo | null>(null);
  const [appealMsg, setAppealMsg] = useState("");
  const [appealEmail, setAppealEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    const check = async () => {
      const { data } = await supabase.rpc("is_user_suspended", { _user_id: user.id });
      if (data) setInfo(data as unknown as SuspensionInfo);
    };
    const fetchAppeals = async () => {
      const { data } = await supabase
        .from("appeals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setAppeals(data as Appeal[]);
    };
    check();
    fetchAppeals();
  }, [user, authLoading, navigate]);

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMsg.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("appeals").insert({
      user_id: user.id,
      email: appealEmail.trim() || user.email || "",
      message: appealMsg.trim(),
    });
    if (error) {
      toast.error("Failed to submit appeal");
    } else {
      toast.success("Appeal submitted! The admin will review it.");
      setAppealMsg("");
      // Refresh appeals list
      const { data } = await supabase.from("appeals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      if (data) setAppeals(data as Appeal[]);
    }
    setSending(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isBanned = info?.type === "banned";
  const expiresDate = info?.expires_at ? new Date(info.expires_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }) : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${isBanned ? "bg-destructive/20" : "bg-amber-500/20"}`}>
          <ShieldAlert className={`h-10 w-10 ${isBanned ? "text-destructive" : "text-amber-500"}`} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isBanned ? "Account Banned" : "Account Suspended"}
          </h1>
          <p className="text-muted-foreground font-body">
            {isBanned
              ? "Your account has been permanently banned due to severe violations of our community guidelines."
              : `Your account has been temporarily suspended. ${expiresDate ? `Your suspension expires on ${expiresDate}.` : ""}`}
          </p>
        </div>

        {info?.reason && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-left">
            <p className="text-sm font-heading text-foreground mb-1">Reason:</p>
            <p className="text-sm text-muted-foreground font-body">{info.reason}</p>
          </div>
        )}

        {/* Appeal Form */}
        <div className="bg-muted/50 border border-border rounded-lg p-6 text-left space-y-4">
          <p className="text-sm font-heading text-foreground">Submit an Appeal</p>
          <form onSubmit={handleAppeal} className="space-y-3">
            <input
              type="email"
              placeholder="Your email (for reply)"
              value={appealEmail}
              onChange={(e) => setAppealEmail(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <textarea
              placeholder="Explain why your suspension/ban should be lifted..."
              value={appealMsg}
              onChange={(e) => setAppealMsg(e.target.value.slice(0, 2000))}
              rows={4}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{appealMsg.length}/2000</span>
              <Button type="submit" size="sm" disabled={!appealMsg.trim() || sending} className="gap-1.5">
                <Send size={14} /> Submit Appeal
              </Button>
            </div>
          </form>
        </div>

        {/* Previous Appeals */}
        {appeals.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-left space-y-3">
            <p className="text-sm font-heading text-foreground">Your Appeals</p>
            {appeals.map((a) => (
              <div key={a.id} className="border border-border rounded p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-heading px-2 py-0.5 rounded-full ${
                    a.status === "approved" ? "bg-green-500/20 text-green-500" :
                    a.status === "rejected" ? "bg-destructive/20 text-destructive" :
                    "bg-amber-500/20 text-amber-500"
                  }`}>
                    {a.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 font-body line-clamp-2">{a.message}</p>
                {a.admin_response && (
                  <div className="flex items-start gap-2 mt-1 pt-1 border-t border-border">
                    <CheckCircle size={12} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground font-body">{a.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-muted/50 border border-border rounded-lg p-6 text-left space-y-4">
          <p className="text-sm font-heading text-foreground">Or contact the administrator directly:</p>
          <div className="space-y-3">
            <a href="mailto:mail.jkyme@gmail.com" className="flex items-center gap-3 text-sm text-primary hover:text-primary/80 transition-colors font-body">
              <Mail size={16} /> mail.jkyme@gmail.com
            </a>
            <a href="tel:+254117412271" className="flex items-center gap-3 text-sm text-primary hover:text-primary/80 transition-colors font-body">
              <Phone size={16} /> +254 117 412 271
            </a>
            <a href="https://wa.me/254117412271?text=Hello%2C%20I%20would%20like%20to%20appeal%20my%20suspension%20on%20Renegade%20Immortal.%20My%20account%20email%20is%3A%20" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary hover:text-primary/80 transition-colors font-body">
              <MessageCircle size={16} /> WhatsApp: +254 117 412 271
            </a>
          </div>
        </div>

        <Button onClick={handleSignOut} variant="outline" className="gap-2">
          <LogOut size={16} /> Sign Out
        </Button>
      </div>
    </div>
  );
}
