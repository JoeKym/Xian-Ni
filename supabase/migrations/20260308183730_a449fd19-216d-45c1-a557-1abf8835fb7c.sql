
-- Notify community leader when someone joins their community
CREATE OR REPLACE FUNCTION public.notify_community_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _community_name TEXT;
  _joiner_name TEXT;
  _leader_id UUID;
BEGIN
  -- Only notify for regular member joins, not the auto-leader insert
  IF NEW.role = 'leader' THEN RETURN NEW; END IF;

  SELECT name, created_by INTO _community_name, _leader_id
  FROM public.communities WHERE id = NEW.community_id;

  SELECT display_name INTO _joiner_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (title, message, type, page_link)
  VALUES (
    'New Member',
    COALESCE(_joiner_name, 'A cultivator') || ' joined ' || COALESCE(_community_name, 'your community'),
    'community',
    '/communities/' || NEW.community_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_community_member_join
  AFTER INSERT ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_community_join();

-- Notify user when someone follows them
CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _follower_name TEXT;
  _follower_username TEXT;
  _following_name TEXT;
BEGIN
  SELECT display_name, username INTO _follower_name, _follower_username
  FROM public.profiles WHERE user_id = NEW.follower_id;

  SELECT display_name INTO _following_name
  FROM public.profiles WHERE user_id = NEW.following_id;

  INSERT INTO public.notifications (title, message, type, page_link)
  VALUES (
    'New Follower',
    COALESCE(_follower_name, 'A cultivator') || ' started following ' || COALESCE(_following_name, 'you'),
    'follow',
    CASE WHEN _follower_username IS NOT NULL THEN '/u/' || _follower_username ELSE '/communities' END
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_follow();
