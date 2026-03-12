
-- Allow participants to delete their own conversations
CREATE POLICY "Participants can delete conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Allow participants to delete conversation reads  
CREATE POLICY "Users can delete own reads" ON public.conversation_reads
  FOR DELETE USING (auth.uid() = user_id);
