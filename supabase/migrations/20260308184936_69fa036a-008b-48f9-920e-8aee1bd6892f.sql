
-- 1. Add category to communities
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';

-- 2. Add target_user_id to notifications for personal filtering
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_user_id uuid DEFAULT NULL;

-- 3. Create community_invites table
CREATE TABLE public.community_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL,
  invited_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invites readable by involved users" ON public.community_invites
  FOR SELECT USING (
    auth.uid() = invited_user_id
    OR auth.uid() = invited_by
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Members can send invites" ON public.community_invites
  FOR INSERT WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_invites.community_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Invited users can update invite status" ON public.community_invites
  FOR UPDATE USING (auth.uid() = invited_user_id);

CREATE POLICY "Inviters can delete invites" ON public.community_invites
  FOR DELETE USING (auth.uid() = invited_by OR has_role(auth.uid(), 'admin'));

-- 4. Create community_reports table
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL,
  reported_by uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reports" ON public.community_reports
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Leaders can view community reports" ON public.community_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_reports.community_id
      AND user_id = auth.uid()
      AND role = 'leader'
    )
  );

CREATE POLICY "Members can submit reports" ON public.community_reports
  FOR INSERT WITH CHECK (
    auth.uid() = reported_by
    AND EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_reports.community_id
      AND user_id = auth.uid()
    )
  );

-- 5. Add community_guidelines column
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS guidelines text DEFAULT '';

-- 6. Update notification triggers to use target_user_id
CREATE OR REPLACE FUNCTION public.notify_community_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _community_name TEXT;
  _joiner_name TEXT;
  _leader_id UUID;
BEGIN
  IF NEW.role = 'leader' THEN RETURN NEW; END IF;

  SELECT name, created_by INTO _community_name, _leader_id
  FROM public.communities WHERE id = NEW.community_id;

  SELECT display_name INTO _joiner_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (title, message, type, page_link, target_user_id)
  VALUES (
    'New Member',
    COALESCE(_joiner_name, 'A cultivator') || ' joined ' || COALESCE(_community_name, 'your community'),
    'community',
    '/communities/' || NEW.community_id,
    _leader_id
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _follower_name TEXT;
  _follower_username TEXT;
BEGIN
  SELECT display_name, username INTO _follower_name, _follower_username
  FROM public.profiles WHERE user_id = NEW.follower_id;

  INSERT INTO public.notifications (title, message, type, page_link, target_user_id)
  VALUES (
    'New Follower',
    COALESCE(_follower_name, 'A cultivator') || ' started following you',
    'follow',
    CASE WHEN _follower_username IS NOT NULL THEN '/u/' || _follower_username ELSE '/communities' END,
    NEW.following_id
  );

  RETURN NEW;
END;
$$;

-- 7. Create invite notification trigger
CREATE OR REPLACE FUNCTION public.notify_community_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _community_name TEXT;
  _inviter_name TEXT;
BEGIN
  SELECT name INTO _community_name FROM public.communities WHERE id = NEW.community_id;
  SELECT display_name INTO _inviter_name FROM public.profiles WHERE user_id = NEW.invited_by;

  INSERT INTO public.notifications (title, message, type, page_link, target_user_id)
  VALUES (
    'Community Invite',
    COALESCE(_inviter_name, 'A cultivator') || ' invited you to ' || COALESCE(_community_name, 'a community'),
    'invite',
    '/communities/' || NEW.community_id,
    NEW.invited_user_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_community_invite
  AFTER INSERT ON public.community_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_community_invite();

-- 8. Allow security definer functions to insert notifications (already handled by SECURITY DEFINER)
-- Also allow the auto-leader insert trigger to work with the new column
-- Update insert policy for notifications to also allow inserts from triggers
CREATE POLICY "Service functions can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
