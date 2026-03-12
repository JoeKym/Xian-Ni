
-- Add audio_url and edited_at columns to direct_messages
ALTER TABLE public.direct_messages ADD COLUMN audio_url text;
ALTER TABLE public.direct_messages ADD COLUMN edited_at timestamptz;

-- Allow senders to update their own messages (for editing)
CREATE POLICY "Senders can update own messages"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Create voice-messages storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-messages', 'voice-messages', true);

-- Storage policies for voice-messages bucket
CREATE POLICY "Authenticated users can upload voice messages"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'voice-messages' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Voice messages are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'voice-messages');

CREATE POLICY "Users can delete own voice messages"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'voice-messages' AND (storage.foldername(name))[1] = auth.uid()::text);
