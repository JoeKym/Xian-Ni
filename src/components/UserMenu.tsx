import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { User, LogOut, Settings } from "lucide-react";

export function UserMenu() {
  const { user, profile, signOut } = useAuth();

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all text-xs font-heading tracking-wider"
      >
        <User size={14} />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const profileLink = (profile as any)?.username ? `/u/${(profile as any).username}` : "/profile";

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={profileLink}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-primary transition-colors text-xs font-heading tracking-wider"
      >
        <User size={14} />
        <span className="hidden sm:inline max-w-[80px] truncate">{profile?.display_name || "Profile"}</span>
      </Link>
      <Link
        to="/settings"
        className="p-1.5 rounded-md text-muted-foreground hover:text-primary transition-colors"
        title="Settings"
      >
        <Settings size={14} />
      </Link>
      <button
        onClick={signOut}
        className="p-1.5 rounded-md text-muted-foreground hover:text-secondary transition-colors"
        title="Sign Out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
