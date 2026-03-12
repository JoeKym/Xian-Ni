-- Pinned messages for DMs
CREATE TABLE public.pinned_dm_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, message_id)
);

-- Pinned messages for groups
CREATE TABLE public.pinned_group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL,
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, message_id)
);

ALTER TABLE public.pinned_dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_group_messages ENABLE ROW LEVEL SECURITY;

-- DM pin policies
CREATE POLICY "Conversation members can view pins" ON public.pinned_dm_messages FOR SELECT
  USING (is_conversation_member(auth.uid(), conversation_id));

CREATE POLICY "Conversation members can pin" ON public.pinned_dm_messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = pinned_by AND is_conversation_member(auth.uid(), conversation_id)
  );

CREATE POLICY "Conversation members can unpin" ON public.pinned_dm_messages FOR DELETE
  USING (is_conversation_member(auth.uid(), conversation_id));

-- Group pin policies
CREATE POLICY "Group members can view pins" ON public.pinned_group_messages FOR SELECT
  USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Group members can pin" ON public.pinned_group_messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = pinned_by AND is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Group admins can unpin" ON public.pinned_group_messages FOR DELETE
  USING (is_group_admin(auth.uid(), group_id) OR auth.uid() = pinned_by);