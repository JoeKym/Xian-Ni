import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
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
          <h1 className="font-heading text-2xl text-primary text-center mb-2 tracking-wider">Recover Access</h1>
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-foreground/80 font-body mb-4">Check your email for a password reset link.</p>
              <Link to="/login" className="text-xs text-primary hover:underline font-body">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-body text-center mb-6">Enter your email to reset your password</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  placeholder="cultivator@example.com"
                />
                <button type="submit" disabled={loading} className="w-full py-2.5 rounded gradient-gold font-heading text-sm tracking-wider text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <Link to="/login" className="text-xs text-primary hover:underline font-body block text-center mt-4">Back to Sign In</Link>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
