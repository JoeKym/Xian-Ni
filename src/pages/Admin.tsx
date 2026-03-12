import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { AdminRoute } from "@/components/AdminRoute";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import { Users, Eye, MessageSquare, Bell, Activity, Trash2, Send, Globe, Shield, Ban, UserX, Check, AlertTriangle, Flag, Wrench, Mail, MailOpen, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  reading_progress: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  character_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

interface ActiveVisitor {
  id: string;
  session_id: string;
  current_page: string;
  last_seen: string;
}

interface PageView {
  id: string;
  page_path: string;
  session_id: string;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  page_link: string | null;
  created_at: string;
}

interface Suspension {
  id: string;
  user_id: string;
  type: string;
  reason: string;
  expires_at: string | null;
  created_at: string;
}

interface Appeal {
  id: string;
  user_id: string;
  email: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

interface CommunityReport {
  id: string;
  community_id: string;
  reported_user_id: string;
  reported_by: string;
  reason: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  community_name?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  user_id: string | null;
  read: boolean;
  created_at: string;
}

interface AdminReview {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  page_path: string;
  user_id: string | null;
  created_at: string;
}

interface AdminCommunity {
  id: string;
  name: string;
  is_active: boolean;
  category: string;
  created_by: string;
  created_at: string;
}

function parseContactReview(row: any): ContactMessage {
  const parts = (row.content as string).split("|||");
  return {
    id: row.id,
    name: row.author_name,
    email: parts[0] || "",
    message: parts.slice(1).join("|||"),
    user_id: row.user_id,
    read: row.rating === 1,
    created_at: row.created_at,
  };
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-body">{title}</p>
            <p className="text-3xl font-heading font-bold text-foreground mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ profiles, comments, visitors, pageViews }: {
  profiles: Profile[]; comments: Comment[]; visitors: ActiveVisitor[]; pageViews: PageView[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={profiles.length} icon={Users} color="bg-primary/20 text-primary" />
        <StatCard title="Active Visitors" value={visitors.length} icon={Eye} color="bg-green-500/20 text-green-500" />
        <StatCard title="Total Comments" value={comments.length} icon={MessageSquare} color="bg-blue-500/20 text-blue-500" />
        <StatCard title="Page Views" value={pageViews.length} icon={Activity} color="bg-amber-500/20 text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Active Visitors Now</CardTitle>
          </CardHeader>
          <CardContent>
            {visitors.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active visitors</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visitors.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-body text-foreground">{v.current_page}</span>
                    </span>
                    <span className="text-muted-foreground text-xs">{v.session_id.slice(0, 8)}...</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.slice(0, 10).map((c) => (
                <div key={c.id} className="p-2 rounded bg-muted/50 text-sm">
                  <div className="flex justify-between">
                    <span className="font-body font-medium text-foreground">{c.author_name}</span>
                    <span className="text-muted-foreground text-xs">{c.character_id}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-1">{c.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrafficTab({ pageViews, visitors }: { pageViews: PageView[]; visitors: ActiveVisitor[] }) {
  const chartData = useMemo(() => {
    const hourMap: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const hour = new Date(pv.created_at).toISOString().slice(0, 13);
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    return Object.entries(hourMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24)
      .map(([hour, count]) => ({
        hour: new Date(hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        views: count,
      }));
  }, [pageViews]);

  const pageStats = useMemo(() => {
    const map: Record<string, number> = {};
    pageViews.forEach((pv) => { map[pv.page_path] = (map[pv.page_path] || 0) + 1; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10);
  }, [pageViews]);

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Page Views (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No traffic data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {pageStats.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
                <BarChart data={pageStats.map(([page, views]) => ({ page, views }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="page" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Live Visitors</CardTitle>
            <CardDescription>{visitors.length} active now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead className="hidden sm:table-cell">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.session_id.slice(0, 12)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{v.current_page}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(v.last_seen).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersTab({ profiles, onDeleteUser }: { profiles: Profile[]; onDeleteUser: (id: string) => void }) {
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState<string>("moderator");

  useEffect(() => {
    const fetchRoles = async () => {
      const { data } = await supabase.from("user_roles").select("user_id, role");
      if (data) {
        const rMap: Record<string, string> = {};
        data.forEach((r: any) => {
          if (!rMap[r.user_id] || r.role === "admin") rMap[r.user_id] = r.role;
        });
        setRoles(rMap);
      }
    };
    fetchRoles();
  }, []);

  const handleAssignRole = async () => {
    if (!assignUserId) return;
    // Remove existing non-admin roles first
    await supabase.from("user_roles").delete().eq("user_id", assignUserId).neq("role", "admin");
    if (assignRole !== "user") {
      const { error } = await supabase.from("user_roles").insert({ user_id: assignUserId, role: assignRole as any });
      if (error) { toast.error("Failed to assign role"); return; }
    }
    setRoles(prev => ({ ...prev, [assignUserId]: assignRole }));
    toast.success(`Role updated to ${assignRole}`);
    setAssignUserId("");
  };

  const handleRemoveRole = async (userId: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId).neq("role", "admin");
    setRoles(prev => { const n = { ...prev }; delete n[userId]; return n; });
    toast.success("Role removed");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Assign Role</CardTitle>
          <CardDescription>Grant moderator or user roles to community members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={assignUserId} onValueChange={setAssignUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {profiles.filter(p => roles[p.user_id] !== "admin").map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>{p.display_name} {roles[p.user_id] ? `(${roles[p.user_id]})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Select value={assignRole} onValueChange={setAssignRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User (remove role)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAssignRole} disabled={!assignUserId} className="gap-1">
                <Shield size={14} /> Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Registered Users ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Reading Progress</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">{p.display_name}</TableCell>
                  <TableCell>
                    {roles[p.user_id] === "admin" ? (
                      <Badge variant="destructive" className="text-[10px]">Admin</Badge>
                    ) : roles[p.user_id] === "moderator" ? (
                      <Badge className="text-[10px] bg-accent text-accent-foreground">Moderator</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">User</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">{p.reading_progress || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    {roles[p.user_id] === "moderator" && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveRole(p.user_id)} className="text-muted-foreground hover:text-primary" title="Remove role">
                        <UserX size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDeleteUser(p.user_id)} className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CommentsTab({ comments, onDeleteComment }: { comments: Comment[]; onDeleteComment: (id: string) => void }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg">All Comments ({comments.length})</CardTitle>
      </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead className="hidden sm:table-cell">Character</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">{c.author_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">{c.character_id}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-xs truncate text-sm">{c.content}</TableCell>
                  <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteComment(c.id)} className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
    </Card>
  );
}

function NotificationsTab({ notifications, onDelete, onSend }: {
  notifications: Notification[];
  onDelete: (id: string) => void;
  onSend: (n: { title: string; message: string; type: string; page_link: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("lore");
  const [pageLink, setPageLink] = useState("");

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    onSend({ title, message, type, page_link: pageLink || "" });
    setTitle(""); setMessage(""); setPageLink("");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Broadcast Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lore">Lore</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="donghua">Donghua</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Page link (optional, e.g. /characters)" value={pageLink} onChange={(e) => setPageLink(e.target.value)} className="flex-1" />
          </div>
          <Button onClick={handleSend} disabled={!title.trim() || !message.trim()} className="gap-2">
            <Send size={14} /> Send Notification
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">All Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:table-cell">Message</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">{n.title}</TableCell>
                  <TableCell><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{n.type}</span></TableCell>
                  <TableCell className="max-w-xs truncate text-sm hidden sm:table-cell">{n.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{new Date(n.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(n.id)} className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ModerationTab({ suspensions, profiles, communities, onLift, onSuspend, onBan, onBanCommunity, onRestoreCommunity }: {
  suspensions: Suspension[];
  profiles: Profile[];
  communities: AdminCommunity[];
  onLift: (id: string) => void;
  onSuspend: (userId: string, reason: string) => void;
  onBan: (userId: string, reason: string) => void;
  onBanCommunity: (id: string, reason: string) => void;
  onRestoreCommunity: (id: string) => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reason, setReason] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [communityReason, setCommunityReason] = useState("");

  const getUserName = (userId: string) => {
    const p = profiles.find((pr) => pr.user_id === userId);
    return p?.display_name || userId.slice(0, 8) + "...";
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Suspend / Ban User</CardTitle>
          <CardDescription>Manually suspend (7 days) or ban a user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.user_id} value={p.user_id}>{p.display_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => { if (selectedUserId && reason) { onSuspend(selectedUserId, reason); setSelectedUserId(""); setReason(""); } }}
              disabled={!selectedUserId || !reason}
              className="gap-2 text-amber-500 border-amber-500/30"
            >
              <UserX size={14} /> Suspend (7 days)
            </Button>
            <Button
              variant="destructive"
              onClick={() => { if (selectedUserId && reason) { onBan(selectedUserId, reason); setSelectedUserId(""); setReason(""); } }}
              disabled={!selectedUserId || !reason}
              className="gap-2"
            >
              <Ban size={14} /> Ban Permanently
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Ban */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Ban size={16} className="text-destructive" /> Community Management
          </CardTitle>
          <CardDescription>Ban communities that violate platform guidelines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an active community..." />
            </SelectTrigger>
            <SelectContent>
              {communities.filter(c => c.is_active).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} <span className="text-muted-foreground text-xs ml-1 capitalize">({c.category})</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Reason for ban (e.g. guidelines violation)" value={communityReason} onChange={(e) => setCommunityReason(e.target.value)} />
          <Button
            variant="destructive"
            onClick={() => { if (selectedCommunityId && communityReason) { onBanCommunity(selectedCommunityId, communityReason); setSelectedCommunityId(""); setCommunityReason(""); } }}
            disabled={!selectedCommunityId || !communityReason}
            className="gap-2"
          >
            <Ban size={14} /> Ban Community
          </Button>

          {/* Banned communities list */}
          {communities.filter(c => !c.is_active).length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-heading text-muted-foreground uppercase tracking-wider">Banned Communities ({communities.filter(c => !c.is_active).length})</p>
              {communities.filter(c => !c.is_active).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div>
                    <span className="font-heading text-sm text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">({c.category})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-green-500 border-green-500/30 hover:bg-green-500/10 h-7 text-xs"
                    onClick={() => onRestoreCommunity(c.id)}
                  >
                    <Check size={12} /> Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Active Suspensions & Bans ({suspensions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {suspensions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active suspensions or bans</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Reason</TableHead>
                    <TableHead className="hidden sm:table-cell">Expires</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspensions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">{getUserName(s.user_id)}</TableCell>
                      <TableCell>
                        <Badge variant={s.type === "banned" ? "destructive" : "secondary"}>
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm hidden sm:table-cell">{s.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                        {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => onLift(s.id)} className="text-green-500 hover:text-green-400" title="Lift suspension">
                          <Check size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppealsTab({ appeals, profiles, onRespond, onDelete, onLiftSuspension }: {
  appeals: Appeal[];
  profiles: Profile[];
  onRespond: (id: string, status: string, response: string) => void;
  onDelete: (id: string) => void;
  onLiftSuspension: (userId: string) => void;
}) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const getUserName = (userId: string) => {
    const p = profiles.find((pr) => pr.user_id === userId);
    return p?.display_name || userId.slice(0, 8) + "...";
  };

  const pendingCount = appeals.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            User Appeals ({appeals.length})
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
            )}
          </CardTitle>
          <CardDescription>Review and respond to user suspension/ban appeals</CardDescription>
        </CardHeader>
        <CardContent>
          {appeals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No appeals submitted</p>
          ) : (
            <div className="space-y-4">
              {appeals.map((a) => (
                <div key={a.id} className={`border rounded-lg p-4 space-y-3 ${a.status === "pending" ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm text-foreground">{getUserName(a.user_id)}</span>
                      <Badge variant={
                        a.status === "approved" ? "default" :
                        a.status === "rejected" ? "destructive" : "secondary"
                      }>
                        {a.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(a.id)} className="text-destructive hover:text-destructive h-7 w-7">
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  {a.email && (
                    <p className="text-xs text-muted-foreground font-body">Email: <a href={`mailto:${a.email}`} className="text-primary hover:underline">{a.email}</a></p>
                  )}

                  <p className="text-sm font-body text-foreground/80 bg-muted/50 rounded p-3">{a.message}</p>

                  {a.admin_response && (
                    <div className="bg-primary/5 border border-primary/20 rounded p-3">
                      <p className="text-xs font-heading text-primary mb-1">Admin Response:</p>
                      <p className="text-sm text-foreground/80 font-body">{a.admin_response}</p>
                    </div>
                  )}

                  {a.status === "pending" && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <Textarea
                        placeholder="Write your response..."
                        value={responses[a.id] || ""}
                        onChange={(e) => setResponses((prev) => ({ ...prev, [a.id]: e.target.value }))}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onRespond(a.id, "approved", responses[a.id] || "Appeal approved.");
                            onLiftSuspension(a.user_id);
                            setResponses((prev) => { const n = { ...prev }; delete n[a.id]; return n; });
                          }}
                          className="gap-1.5 bg-green-600 hover:bg-green-700"
                        >
                          <Check size={12} /> Approve & Unban
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            onRespond(a.id, "rejected", responses[a.id] || "Appeal denied.");
                            setResponses((prev) => { const n = { ...prev }; delete n[a.id]; return n; });
                          }}
                          className="gap-1.5"
                        >
                          <Ban size={12} /> Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommunityReportsTab({ reports, profiles, onUpdateStatus, onSuspendUser, onBanUser }: {
  reports: CommunityReport[];
  profiles: Profile[];
  onUpdateStatus: (id: string, status: string, note: string) => void;
  onSuspendUser: (userId: string, reason: string) => void;
  onBanUser: (userId: string, reason: string) => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const getUserName = (userId: string) => {
    const p = profiles.find((pr) => pr.user_id === userId);
    return p?.display_name || userId.slice(0, 8) + "...";
  };
  const pendingCount = reports.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Flag size={18} className="text-destructive" />
            Community Reports ({reports.length})
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
            )}
          </CardTitle>
          <CardDescription>Review reports from community members</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports submitted</p>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className={`border rounded-lg p-4 space-y-3 ${r.status === "pending" ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-body">Reported:</span>
                      <span className="font-heading text-sm text-foreground">{getUserName(r.reported_user_id)}</span>
                      <span className="text-xs text-muted-foreground">by</span>
                      <span className="font-heading text-sm text-foreground">{getUserName(r.reported_by)}</span>
                      {r.community_name && (
                        <Badge variant="outline" className="text-[10px]">{r.community_name}</Badge>
                      )}
                      <Badge variant={r.status === "pending" ? "secondary" : r.status === "resolved" ? "default" : "destructive"}>
                        {r.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-body text-foreground/80 bg-muted/50 rounded p-3">{r.reason}</p>
                  {r.admin_note && (
                    <div className="bg-primary/5 border border-primary/20 rounded p-3">
                      <p className="text-xs font-heading text-primary mb-1">Admin Note:</p>
                      <p className="text-sm text-foreground/80 font-body">{r.admin_note}</p>
                    </div>
                  )}
                  {r.status === "pending" && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <Textarea
                        placeholder="Admin note..."
                        value={notes[r.id] || ""}
                        onChange={(e) => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onUpdateStatus(r.id, "resolved", notes[r.id] || "Reviewed.");
                            setNotes(prev => { const n = { ...prev }; delete n[r.id]; return n; });
                          }}
                          className="gap-1.5"
                        >
                          <Check size={12} /> Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            onSuspendUser(r.reported_user_id, `Community report: ${r.reason}`);
                            onUpdateStatus(r.id, "actioned", notes[r.id] || "User suspended.");
                            setNotes(prev => { const n = { ...prev }; delete n[r.id]; return n; });
                          }}
                          className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-primary-foreground"
                        >
                          <UserX size={12} /> Suspend User
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            onBanUser(r.reported_user_id, `Community report: ${r.reason}`);
                            onUpdateStatus(r.id, "actioned", notes[r.id] || "User banned.");
                            setNotes(prev => { const n = { ...prev }; delete n[r.id]; return n; });
                          }}
                          className="gap-1.5"
                        >
                          <Ban size={12} /> Ban User
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactsTab({
  messages,
  onMarkRead,
  onDelete,
  onDeleteAll,
}: {
  messages: ContactMessage[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}) {
  const unread = messages.filter((m) => !m.read).length;
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Mail size={18} className="text-primary" />
          Contact Inbox
          {unread > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {unread} new
            </span>
          )}
        </CardTitle>
        <CardDescription>Messages submitted via the Contact page</CardDescription>
      </CardHeader>
      {messages.length > 0 && (
        <div className="px-6 pb-2 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onDeleteAll}
          >
            <Trash2 size={12} /> Delete All ({messages.length})
          </Button>
        </div>
      )}
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">No contact messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border p-4 transition-colors ${
                  m.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {m.read ? (
                      <MailOpen size={14} className="text-muted-foreground shrink-0" />
                    ) : (
                      <Mail size={14} className="text-primary shrink-0" />
                    )}
                    <span className="font-heading text-sm text-foreground">{m.name}</span>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs text-primary hover:underline font-body"
                    >
                      {m.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground font-body">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                    {!m.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] px-2 gap-1"
                        onClick={() => onMarkRead(m.id)}
                      >
                        <Check size={10} /> Mark read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] px-2 text-destructive hover:text-destructive"
                      onClick={() => onDelete(m.id)}
                    >
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-wrap">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewsTab({
  reviews,
  onDelete,
}: {
  reviews: AdminReview[];
  onDelete: (id: string) => void;
}) {
  const pageLabel = (path: string) => {
    const map: Record<string, string> = {
      "/": "Homepage", "/characters": "Characters", "/daos": "Daos",
      "/cultivation": "Cultivation", "/timeline": "Timeline", "/multiverse": "Multiverse",
      "/donghua": "Donghua", "/lore": "Lore", "/guide": "Guide",
      "/artifacts": "Artifacts", "/locations": "Locations",
    };
    return map[path] || path;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Star size={18} className="text-primary" />
          All Reviews ({reviews.length})
        </CardTitle>
        <CardDescription>User-submitted ratings and feedback across all pages</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="hidden md:table-cell">Review</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">{r.author_name}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            className={s <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {pageLabel(r.page_path)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground hidden md:table-cell">
                      {r.content}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(r.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [visitors, setVisitors] = useState<ActiveVisitor[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [adminCommunities, setAdminCommunities] = useState<AdminCommunity[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceEta, setMaintenanceEta] = useState("");
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [pRes, cRes, vRes, pvRes, nRes, sRes, aRes, rRes, cmRes, revRes, comRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("comments").select("*").order("created_at", { ascending: false }),
        supabase.from("active_visitors").select("*"),
        supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
        supabase.from("user_suspensions").select("*").order("created_at", { ascending: false }),
        supabase.from("appeals").select("*").order("created_at", { ascending: false }),
        supabase.from("community_reports").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").eq("page_path", "/_contact_inbox").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").neq("page_path", "/_contact_inbox").order("created_at", { ascending: false }),
        supabase.from("communities").select("id, name, is_active, category, created_by, created_at").order("created_at", { ascending: false }),
      ]);
      if (pRes.data) setProfiles(pRes.data as Profile[]);
      if (cRes.data) setComments(cRes.data as Comment[]);
      if (vRes.data) setVisitors(vRes.data as ActiveVisitor[]);
      if (pvRes.data) setPageViews(pvRes.data as PageView[]);
      if (nRes.data) setNotifications(nRes.data as Notification[]);
      if (sRes.data) setSuspensions(sRes.data as Suspension[]);
      if (aRes.data) setAppeals(aRes.data as Appeal[]);
      if (cmRes.data) setContactMessages((cmRes.data as any[]).map(parseContactReview));
      if (revRes.data) setAdminReviews(revRes.data as AdminReview[]);
      if (comRes.data) setAdminCommunities(comRes.data as AdminCommunity[]);
      if (rRes.data) {
        const comIds = [...new Set(rRes.data.map((r: any) => r.community_id))];
        if (comIds.length > 0) {
          const { data: coms } = await supabase.from("communities").select("id, name").in("id", comIds);
          const comMap: Record<string, string> = {};
          coms?.forEach((c: any) => { comMap[c.id] = c.name; });
          setReports(rRes.data.map((r: any) => ({ ...r, community_name: comMap[r.community_id] || "Unknown" })));
        } else {
          setReports(rRes.data as CommunityReport[]);
        }
      }

      // Load maintenance settings
      const { data: settingsData } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .in("key", ["maintenance_mode", "maintenance_eta"]);
      if (settingsData) {
        (settingsData as any[]).forEach((row: any) => {
          if (row.key === "maintenance_mode") setMaintenanceMode(row.value === "true");
          if (row.key === "maintenance_eta") setMaintenanceEta(row.value || "");
        });
      }
    };
    loadData();

    // Realtime subscriptions
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "active_visitors" }, () => {
        supabase.from("active_visitors").select("*").then(({ data }) => {
          if (data) setVisitors(data as ActiveVisitor[]);
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, (payload) => {
        setPageViews((prev) => [payload.new as PageView, ...prev]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        supabase.from("comments").select("*").order("created_at", { ascending: false }).then(({ data }) => {
          if (data) setComments(data as Comment[]);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDeleteComment = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) { toast.error("Failed to delete comment"); return; }
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("Comment deleted");
  };

  const handleDeleteUser = async (userId: string) => {
    // Delete their profile (user account stays in auth)
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) { toast.error("Failed to delete user profile"); return; }
    setProfiles((prev) => prev.filter((p) => p.user_id !== userId));
    toast.success("User profile deleted");
  };

  const handleSendNotification = async (n: { title: string; message: string; type: string; page_link: string }) => {
    const { data, error } = await supabase.from("notifications").insert({
      title: n.title,
      message: n.message,
      type: n.type,
      page_link: n.page_link || null,
    }).select().single();
    if (error) { toast.error("Failed to send notification"); return; }
    if (data) setNotifications((prev) => [data as Notification, ...prev]);
    toast.success("Notification sent");
  };

  const handleDeleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleLiftSuspension = async (id: string) => {
    const { error } = await supabase.from("user_suspensions").delete().eq("id", id);
    if (error) { toast.error("Failed to lift suspension"); return; }
    setSuspensions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Suspension lifted");
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const { data, error } = await supabase.from("user_suspensions").insert({
      user_id: userId,
      type: "suspended",
      reason,
      expires_at: expiresAt.toISOString(),
    }).select().single();
    if (error) { toast.error("Failed to suspend user"); return; }
    if (data) setSuspensions((prev) => [data as Suspension, ...prev]);
    toast.success("User suspended for 7 days");
  };

  const handleBanUser = async (userId: string, reason: string) => {
    const { data, error } = await supabase.from("user_suspensions").insert({
      user_id: userId,
      type: "banned",
      reason,
    }).select().single();
    if (error) { toast.error("Failed to ban user"); return; }
    if (data) setSuspensions((prev) => [data as Suspension, ...prev]);
    toast.success("User banned permanently");
  };

  const handleRespondAppeal = async (id: string, status: string, response: string) => {
    const { error } = await supabase.from("appeals").update({
      status,
      admin_response: response,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast.error("Failed to respond"); return; }
    setAppeals((prev) => prev.map((a) => a.id === id ? { ...a, status, admin_response: response } : a));
    toast.success(`Appeal ${status}`);
  };

  const handleDeleteAppeal = async (id: string) => {
    const { error } = await supabase.from("appeals").delete().eq("id", id);
    if (error) { toast.error("Failed to delete appeal"); return; }
    setAppeals((prev) => prev.filter((a) => a.id !== id));
    toast.success("Appeal deleted");
  };

  const handleLiftSuspensionByUser = async (userId: string) => {
    const { error } = await supabase.from("user_suspensions").delete().eq("user_id", userId);
    if (error) { toast.error("Failed to lift suspension"); return; }
    setSuspensions((prev) => prev.filter((s) => s.user_id !== userId));
    toast.success("Suspension lifted for user");
  };

  const handleMarkContactRead = async (id: string) => {
    // rating=1 is repurposed as "read" marker for contact inbox entries
    const { error } = await supabase.from("reviews").update({ rating: 1 }).eq("id", id);
    if (error) { toast.error("Failed to mark as read"); return; }
    setContactMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error("Failed to delete message"); return; }
    setContactMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success("Message deleted");
  };

  const handleDeleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error("Failed to delete review"); return; }
    setAdminReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted");
  };

  const handleBanCommunity = async (id: string, reason: string) => {
    if (!window.confirm(`Ban this community? It will be hidden from all users. Reason: ${reason}`)) return;
    const { error } = await supabase.from("communities").update({ is_active: false }).eq("id", id);
    if (error) { toast.error("Failed to ban community"); return; }
    setAdminCommunities(prev => prev.map(c => c.id === id ? { ...c, is_active: false } : c));
    toast.success("Community banned");
  };

  const handleRestoreCommunity = async (id: string) => {
    const { error } = await supabase.from("communities").update({ is_active: true }).eq("id", id);
    if (error) { toast.error("Failed to restore community"); return; }
    setAdminCommunities(prev => prev.map(c => c.id === id ? { ...c, is_active: true } : c));
    toast.success("Community restored");
  };

  const handleDeleteAllContacts = async () => {
    if (!window.confirm(`Delete all ${contactMessages.length} contact message(s)? This cannot be undone.`)) return;
    const { error } = await supabase.from("reviews").delete().eq("page_path", "/_contact_inbox");
    if (error) { toast.error("Failed to delete all messages"); return; }
    setContactMessages([]);
    toast.success("All contact messages deleted");
  };

  const handleToggleMaintenance = async () => {
    setTogglingMaintenance(true);
    const newValue = maintenanceMode ? "false" : "true";
    const { error } = await supabase
      .from("site_settings" as any)
      .update({ value: newValue, updated_at: new Date().toISOString() } as any)
      .eq("key", "maintenance_mode");
    if (error) {
      toast.error("Failed to toggle maintenance mode");
    } else {
      setMaintenanceMode(!maintenanceMode);
      toast.success(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled — site is now restricted");
    }
    setTogglingMaintenance(false);
  };

  const handleUpdateEta = async () => {
    const { error } = await supabase
      .from("site_settings" as any)
      .update({ value: maintenanceEta, updated_at: new Date().toISOString() } as any)
      .eq("key", "maintenance_eta");
    if (error) {
      toast.error("Failed to update ETA");
    } else {
      toast.success("Maintenance ETA updated");
    }
  };

  return (
    <AdminRoute>
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-10"
        >
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl sm:text-3xl font-heading font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground font-body text-xs sm:text-sm">Real-time site management</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={maintenanceMode ? "destructive" : "outline"}
                onClick={handleToggleMaintenance}
                disabled={togglingMaintenance}
                className="gap-2"
              >
                <Wrench size={16} />
                {togglingMaintenance ? "Toggling..." : maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
              </Button>
              {maintenanceMode && (
                <div className="flex items-center gap-2">
                  <Input
                    type="datetime-local"
                    value={maintenanceEta}
                    onChange={(e) => setMaintenanceEta(e.target.value)}
                    className="w-52"
                    placeholder="Set ETA"
                  />
                  <Button variant="outline" size="sm" onClick={handleUpdateEta}>
                    Set ETA
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4">
              <TabsList className="bg-muted/50 w-max min-w-full sm:w-auto">
                <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm"><Globe size={14} /> <span className="hidden sm:inline">Overview</span><span className="sm:hidden">Home</span></TabsTrigger>
                <TabsTrigger value="traffic" className="gap-1.5 text-xs sm:text-sm"><Activity size={14} /> Traffic</TabsTrigger>
                <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm"><Users size={14} /> Users</TabsTrigger>
                <TabsTrigger value="comments" className="gap-1.5 text-xs sm:text-sm"><MessageSquare size={14} /> <span className="hidden sm:inline">Comments</span><span className="sm:hidden">Cmts</span></TabsTrigger>
                <TabsTrigger value="moderation" className="gap-1.5 text-xs sm:text-sm"><Ban size={14} /> <span className="hidden sm:inline">Moderation</span><span className="sm:hidden">Mod</span></TabsTrigger>
                <TabsTrigger value="appeals" className="gap-1.5 text-xs sm:text-sm">
                  <AlertTriangle size={14} /> Appeals
                  {appeals.filter(a => a.status === "pending").length > 0 && (
                    <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5">
                      {appeals.filter(a => a.status === "pending").length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm">
                  <Flag size={14} /> Reports
                  {reports.filter(r => r.status === "pending").length > 0 && (
                    <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5">
                      {reports.filter(r => r.status === "pending").length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm"><Bell size={14} /> <span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Notif</span></TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm"><Star size={14} /> <span className="hidden sm:inline">Reviews</span><span className="sm:hidden">Revs</span></TabsTrigger>
                <TabsTrigger value="inbox" className="gap-1.5 text-xs sm:text-sm">
                  <Mail size={14} /> Inbox
                  {contactMessages.filter((m) => !m.read).length > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5">
                      {contactMessages.filter((m) => !m.read).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <OverviewTab profiles={profiles} comments={comments} visitors={visitors} pageViews={pageViews} />
            </TabsContent>
            <TabsContent value="traffic">
              <TrafficTab pageViews={pageViews} visitors={visitors} />
            </TabsContent>
            <TabsContent value="users">
              <UsersTab profiles={profiles} onDeleteUser={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="comments">
              <CommentsTab comments={comments} onDeleteComment={handleDeleteComment} />
            </TabsContent>
            <TabsContent value="moderation">
              <ModerationTab
                suspensions={suspensions}
                profiles={profiles}
                communities={adminCommunities}
                onLift={handleLiftSuspension}
                onSuspend={handleSuspendUser}
                onBan={handleBanUser}
                onBanCommunity={handleBanCommunity}
                onRestoreCommunity={handleRestoreCommunity}
              />
            </TabsContent>
            <TabsContent value="appeals">
              <AppealsTab
                appeals={appeals}
                profiles={profiles}
                onRespond={handleRespondAppeal}
                onDelete={handleDeleteAppeal}
                onLiftSuspension={handleLiftSuspensionByUser}
              />
            </TabsContent>
            <TabsContent value="reports">
              <CommunityReportsTab
                reports={reports}
                profiles={profiles}
                onUpdateStatus={async (id, status, note) => {
                  const { error } = await supabase.from("community_reports").update({ status, admin_note: note }).eq("id", id);
                  if (error) { toast.error("Failed to update report"); return; }
                  setReports(prev => prev.map(r => r.id === id ? { ...r, status, admin_note: note } : r));
                  toast.success(`Report ${status}`);
                }}
                onSuspendUser={handleSuspendUser}
                onBanUser={handleBanUser}
              />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab notifications={notifications} onDelete={handleDeleteNotification} onSend={handleSendNotification} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab reviews={adminReviews} onDelete={handleDeleteReview} />
            </TabsContent>
            <TabsContent value="inbox">
              <ContactsTab
                messages={contactMessages}
                onMarkRead={handleMarkContactRead}
                onDelete={handleDeleteContact}
                onDeleteAll={handleDeleteAllContacts}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </Layout>
    </AdminRoute>
  );
}
