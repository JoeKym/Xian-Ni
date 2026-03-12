
-- Conversations table (each row = a unique pair of users)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Helper function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_member(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id
      AND (_user_id = user1_id OR _user_id = user2_id)
  )
$$;

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Participants can update conversation" ON public.conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Direct messages table
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages" ON public.direct_messages
  FOR SELECT USING (public.is_conversation_member(auth.uid(), conversation_id));

CREATE POLICY "Participants can send messages" ON public.direct_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_member(auth.uid(), conversation_id)
    AND length(content) > 0
    AND length(content) <= 2000
  );

CREATE POLICY "Senders can delete own messages" ON public.direct_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Notification trigger for new DMs
CREATE OR REPLACE FUNCTION public.notify_direct_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _sender_name TEXT;
  _recipient_id UUID;
  _user1 UUID;
  _user2 UUID;
BEGIN
  SELECT user1_id, user2_id INTO _user1, _user2
  FROM public.conversations WHERE id = NEW.conversation_id;

  IF NEW.sender_id = _user1 THEN _recipient_id := _user2;
  ELSE _recipient_id := _user1;
  END IF;

  SELECT display_name INTO _sender_name
  FROM public.profiles WHERE user_id = NEW.sender_id;

  INSERT INTO public.notifications (title, message, type, page_link, target_user_id)
  VALUES (
    'New Message',
    COALESCE(_sender_name, 'A cultivator') || ' sent you a message',
    'message',
    '/messages',
    _recipient_id
  );

  -- Update conversation timestamp
  UPDATE public.conversations SET last_message_at = now() WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_direct_message_notify
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_direct_message();
