
-- Table to track when each user last read a conversation
CREATE TABLE public.conversation_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reads" ON public.conversation_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own reads" ON public.conversation_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reads" ON public.conversation_reads
  FOR UPDATE USING (auth.uid() = user_id);
