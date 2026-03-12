
-- Add image_url column to direct_messages for media sharing
ALTER TABLE public.direct_messages ADD COLUMN image_url text DEFAULT NULL;

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS: users can only react on messages in their conversations
CREATE POLICY "Users can read reactions on their messages" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.direct_messages dm
      WHERE dm.id = message_reactions.message_id
        AND is_conversation_member(auth.uid(), dm.conversation_id)
    )
  );

CREATE POLICY "Users can add reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.direct_messages dm
      WHERE dm.id = message_reactions.message_id
        AND is_conversation_member(auth.uid(), dm.conversation_id)
    )
  );

CREATE POLICY "Users can remove own reactions" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create dm-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('dm-media', 'dm-media', true);

-- Storage policies for dm-media
CREATE POLICY "Authenticated users can upload dm media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dm-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "DM media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dm-media');

CREATE POLICY "Users can delete own dm media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'dm-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
