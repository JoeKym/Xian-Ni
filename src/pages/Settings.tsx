import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, User, Bell, Palette, Eye, EyeOff, Trash2, Save, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Account state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification state
  const [dmSounds, setDmSounds] = useState(() => localStorage.getItem("dm-global-mute") !== "true");
  const [groupSounds, setGroupSounds] = useState(() => localStorage.getItem("group-global-mute") !== "true");
  const [emailNotifs, setEmailNotifs] = useState(true);

  // Appearance state
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("app-font-size") || "normal");

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (profile) {
      setDisplayName((profile as any).display_name || "");
      setUsername((profile as any).username || "");
      setBio((profile as any).bio || "");
      setAvatarUrl((profile as any).avatar_url || "");
    }
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim() || "Cultivator",
      username: username.trim() || null,
      bio: bio.trim(),
      avatar_url: avatarUrl.trim() || null,
    }).eq("user_id", user.id);
    if (error) toast.error("Failed to save profile");
    else toast.success("Profile updated!");
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setNewPassword(""); setConfirmPassword(""); }
    setChangingPassword(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) { toast.error("Upload failed"); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    toast.success("Avatar uploaded — save to apply");
  };

  const handleDmSoundsToggle = (val: boolean) => {
    setDmSounds(val);
    localStorage.setItem("dm-global-mute", val ? "false" : "true");
  };

  const handleGroupSoundsToggle = (val: boolean) => {
    setGroupSounds(val);
    localStorage.setItem("group-global-mute", val ? "false" : "true");
  };

  const handleFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem("app-font-size", size);
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    if (size === "small") document.documentElement.classList.add("text-sm");
    else if (size === "large") document.documentElement.classList.add("text-lg");
    else document.documentElement.classList.add("text-base");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    // Delete profile data, then sign out
    await supabase.from("profiles").delete().eq("user_id", user.id);
    await signOut();
    toast.success("Account data deleted. You have been signed out.");
    navigate("/");
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <SettingsIcon className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="account" className="gap-1.5 text-xs sm:text-sm">
                  <User size={14} /> Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
                  <Bell size={14} /> Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm">
                  <Palette size={14} /> Appearance
                </TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <div className="gradient-card border border-border rounded-lg p-6 space-y-5">
                  <h2 className="font-heading text-lg text-foreground">Profile</h2>

                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/30">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-heading text-lg">{displayName.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-xs text-primary hover:underline font-body">Change avatar</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                      <p className="text-[10px] text-muted-foreground">Max 2MB, JPG/PNG</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-body mb-1 block">Display Name</label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={30} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-body mb-1 block">Username</label>
                      <Input value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))} maxLength={20} placeholder="your-username" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-body mb-1 block">Bio</label>
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={3} placeholder="Tell others about yourself..." />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-1.5">
                    <Save size={14} /> {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>

                {/* Password */}
                <div className="gradient-card border border-border rounded-lg p-6 space-y-4">
                  <h2 className="font-heading text-lg text-foreground">Change Password</h2>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                  </div>
                  <Button onClick={handleChangePassword} disabled={changingPassword} variant="secondary" className="gap-1.5">
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>

                {/* Email */}
                <div className="gradient-card border border-border rounded-lg p-6 space-y-3">
                  <h2 className="font-heading text-lg text-foreground">Email</h2>
                  <p className="text-sm text-muted-foreground font-body">{user.email}</p>
                  <p className="text-[10px] text-muted-foreground/60">Email changes are not supported at this time.</p>
                </div>

                {/* Danger Zone */}
                <div className="gradient-card border border-destructive/30 rounded-lg p-6 space-y-3">
                  <h2 className="font-heading text-lg text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground font-body">Permanently delete your profile data and sign out. This cannot be undone.</p>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="gap-1.5">
                    <Trash2 size={14} /> Delete Account Data
                  </Button>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="gradient-card border border-border rounded-lg p-6 space-y-5">
                  <h2 className="font-heading text-lg text-foreground">Sound Notifications</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground font-body">DM notification sounds</p>
                        <p className="text-[10px] text-muted-foreground">Play a sound when receiving direct messages</p>
                      </div>
                      <Switch checked={dmSounds} onCheckedChange={handleDmSoundsToggle} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground font-body">Group chat notification sounds</p>
                        <p className="text-[10px] text-muted-foreground">Play a sound when receiving group messages</p>
                      </div>
                      <Switch checked={groupSounds} onCheckedChange={handleGroupSoundsToggle} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground font-body">Email notifications</p>
                        <p className="text-[10px] text-muted-foreground">Receive email notifications for important updates</p>
                      </div>
                      <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <div className="gradient-card border border-border rounded-lg p-6 space-y-5">
                  <h2 className="font-heading text-lg text-foreground">Theme</h2>
                  <div className="flex gap-3">
                    {[
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "light", label: "Light", icon: Sun },
                      { value: "system", label: "System", icon: Monitor },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                            theme === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-xs font-body">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="gradient-card border border-border rounded-lg p-6 space-y-5">
                  <h2 className="font-heading text-lg text-foreground">Font Size</h2>
                  <div className="flex gap-3">
                    {[
                      { value: "small", label: "Small", sample: "Aa" },
                      { value: "normal", label: "Normal", sample: "Aa" },
                      { value: "large", label: "Large", sample: "Aa" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleFontSize(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                          fontSize === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        <span className={opt.value === "small" ? "text-sm" : opt.value === "large" ? "text-xl" : "text-base"}>{opt.sample}</span>
                        <span className="text-xs font-body">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Delete account confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Account Data</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete your profile data and sign you out. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}