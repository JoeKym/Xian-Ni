import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md gradient-card border border-border rounded-lg p-8"
        >
          <h1 className="font-heading text-2xl text-primary text-center mb-6 tracking-wider">Set New Password</h1>
          {ready ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="New password (min 6 characters)"
              />
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded gradient-gold font-heading text-sm tracking-wider text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground font-body text-center">Invalid or expired reset link. Please request a new one.</p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
