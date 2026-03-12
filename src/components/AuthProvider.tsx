import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  favorite_characters: string[] | null;
  reading_progress: string | null;
  social_links: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  profile: null,
  refreshProfile: async () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const initUser = async (userId: string, email?: string, displayName?: string) => {
    try {
      const [suspResult, profileResult, adminResult] = await Promise.all([
        supabase.rpc("is_user_suspended", { _user_id: userId }),
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      ]);

      setIsAdmin(!adminResult.error && adminResult.data === true);

      if (suspResult.data && (suspResult.data as any).is_suspended) {
        if (window.location.pathname !== "/suspended") {
          window.location.href = "/suspended";
        }
        return;
      }

      if (profileResult.data) {
        setProfile(profileResult.data as Profile);
        return;
      }

      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ user_id: userId, display_name: displayName || "Cultivator" })
        .select("*")
        .single();

      if (newProfile) {
        setProfile(newProfile as Profile);
        return;
      }

      // Final fallback: re-fetch once in case profile was created concurrently
      const { data: fallbackProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setProfile((fallbackProfile as Profile | null) ?? null);
    } catch (error) {
      console.error("initUser failed", error);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("refreshProfile failed", error);
      return;
    }

    if (data) setProfile(data as Profile);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const meta = session.user.user_metadata;
          // Don't await — let it run in the background so it doesn't block auth state
          initUser(session.user.id, session.user.email, meta?.display_name)
            .catch(console.error)
            .finally(() => setLoading(false));
        } else {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const meta = session.user.user_metadata;
        initUser(session.user.id, session.user.email, meta?.display_name)
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, profile, refreshProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
