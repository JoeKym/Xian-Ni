import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back, Cultivator!");
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
          <h1 className="font-heading text-2xl text-primary text-center mb-2 tracking-wider">Enter the Sect</h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-6">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-heading text-muted-foreground tracking-wider uppercase block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="cultivator@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-heading text-muted-foreground tracking-wider uppercase block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded gradient-gold font-heading text-sm tracking-wider text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Entering..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-body block">
              Forgot your password?
            </Link>
            <p className="text-xs text-muted-foreground font-body">
              No account?{" "}
              <Link to="/signup" className="text-primary hover:underline">Join the Sect</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
