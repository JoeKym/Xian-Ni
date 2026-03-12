
-- Add image_url column to community_posts
ALTER TABLE public.community_posts ADD COLUMN image_url text DEFAULT NULL;

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);

-- Storage policies for post-media bucket
CREATE POLICY "Post media publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');
CREATE POLICY "Authenticated users can upload post media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-media');
CREATE POLICY "Users can delete own post media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);
