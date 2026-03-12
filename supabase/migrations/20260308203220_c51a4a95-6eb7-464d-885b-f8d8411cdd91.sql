-- Group chats table
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  avatar_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  is_muted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  reply_to_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group message reactions
CREATE TABLE public.group_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Group read receipts
CREATE TABLE public.group_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_reads ENABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_reads;

-- Helper function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

-- Helper function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id AND role = 'admin'
  )
$$;

-- RLS Policies for group_chats
CREATE POLICY "Group chats readable by members" ON public.group_chats FOR SELECT
  USING (is_group_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create groups" ON public.group_chats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update groups" ON public.group_chats FOR UPDATE
  USING (is_group_admin(auth.uid(), id));

CREATE POLICY "Admins can delete groups" ON public.group_chats FOR DELETE
  USING (is_group_admin(auth.uid(), id) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for group_members
CREATE POLICY "Group members are readable by group members" ON public.group_members FOR SELECT
  USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Admins can add members" ON public.group_members FOR INSERT
  TO authenticated WITH CHECK (
    is_group_admin(auth.uid(), group_id) OR 
    (SELECT created_by FROM group_chats WHERE id = group_id) = auth.uid()
  );

CREATE POLICY "Members can leave groups" ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can remove members" ON public.group_members FOR DELETE
  USING (is_group_admin(auth.uid(), group_id));

CREATE POLICY "Admins can update member roles" ON public.group_members FOR UPDATE
  USING (is_group_admin(auth.uid(), group_id));

CREATE POLICY "Members can update their own settings" ON public.group_members FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for group_messages
CREATE POLICY "Members can read group messages" ON public.group_messages FOR SELECT
  USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can send messages" ON public.group_messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND 
    is_group_member(auth.uid(), group_id) AND
    length(content) > 0 AND length(content) <= 2000
  );

CREATE POLICY "Senders can update own messages" ON public.group_messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can delete own messages" ON public.group_messages FOR DELETE
  USING (auth.uid() = sender_id OR is_group_admin(auth.uid(), group_id));

-- RLS Policies for group_message_reactions
CREATE POLICY "Members can view reactions" ON public.group_message_reactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM group_messages gm WHERE gm.id = message_id AND is_group_member(auth.uid(), gm.group_id)
  ));

CREATE POLICY "Members can add reactions" ON public.group_message_reactions FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM group_messages gm WHERE gm.id = message_id AND is_group_member(auth.uid(), gm.group_id)
    )
  );

CREATE POLICY "Users can remove own reactions" ON public.group_message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for group_reads
CREATE POLICY "Users can read own group reads" ON public.group_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own reads" ON public.group_reads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reads" ON public.group_reads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reads" ON public.group_reads FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-add creator as admin
CREATE OR REPLACE FUNCTION public.auto_add_group_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_group_created
AFTER INSERT ON public.group_chats
FOR EACH ROW EXECUTE FUNCTION public.auto_add_group_admin();

-- Update timestamp trigger for groups
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();