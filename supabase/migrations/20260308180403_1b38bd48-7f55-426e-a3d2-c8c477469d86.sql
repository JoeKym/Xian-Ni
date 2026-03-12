
-- Communities table
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  avatar_url text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT communities_name_length CHECK (length(name) >= 2 AND length(name) <= 100)
);

-- Community members table
CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('leader', 'elder', 'member'))
);

-- Community posts table
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_content_length CHECK (length(content) > 0 AND length(content) <= 2000)
);

-- Community messages (chat) table
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_content_length CHECK (length(content) > 0 AND length(content) <= 500)
);

-- Follows table
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Enable realtime for chat and posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;

-- Communities RLS
CREATE POLICY "Communities are publicly readable" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Leaders can update their community" ON public.communities FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members WHERE community_id = communities.id AND user_id = auth.uid() AND role = 'leader')
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can delete communities" ON public.communities FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Community members RLS
CREATE POLICY "Members are publicly readable" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join communities" ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'member');
CREATE POLICY "Leaders can update member roles" ON public.community_members FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_members.community_id AND cm.user_id = auth.uid() AND cm.role = 'leader')
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Leaders can remove members" ON public.community_members FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_members.community_id AND cm.user_id = auth.uid() AND cm.role = 'leader')
);
CREATE POLICY "Admins can manage members" ON public.community_members FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Community posts RLS
CREATE POLICY "Posts are publicly readable" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Members can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_members WHERE community_id = community_posts.community_id AND user_id = auth.uid())
);
CREATE POLICY "Authors can delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete posts" ON public.community_posts FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Community messages RLS
CREATE POLICY "Messages readable by members" ON public.community_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.community_members WHERE community_id = community_messages.community_id AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Members can send messages" ON public.community_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_members WHERE community_id = community_messages.community_id AND user_id = auth.uid())
);
CREATE POLICY "Authors can delete own messages" ON public.community_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete messages" ON public.community_messages FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Follows RLS
CREATE POLICY "Follows are publicly readable" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Auto-add creator as leader when community is created
CREATE OR REPLACE FUNCTION public.auto_add_community_leader()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'leader');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.auto_add_community_leader();

-- Updated_at trigger for communities
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
