
-- Comments table for character pages (anonymous - no auth required)
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous Cultivator',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (true);

-- Anyone can post comments (anonymous)
CREATE POLICY "Anyone can post comments" ON public.comments FOR INSERT WITH CHECK (
  length(content) > 0 AND length(content) <= 1000 AND
  length(author_name) > 0 AND length(author_name) <= 50
);

-- Notifications table for lore content alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'lore',
  page_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can read notifications
CREATE POLICY "Notifications are publicly readable" ON public.notifications FOR SELECT USING (true);

-- Visitor presence table
CREATE TABLE public.active_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  current_page TEXT NOT NULL DEFAULT '/',
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors are publicly readable" ON public.active_visitors FOR SELECT USING (true);
CREATE POLICY "Anyone can register as visitor" ON public.active_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitors can update their own session" ON public.active_visitors FOR UPDATE USING (true);
CREATE POLICY "Visitors can remove their session" ON public.active_visitors FOR DELETE USING (true);

-- Clean up stale visitors (older than 5 min)
CREATE OR REPLACE FUNCTION public.cleanup_stale_visitors()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.active_visitors WHERE last_seen < now() - interval '5 minutes';
$$;

-- Enable realtime for comments and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_visitors;
