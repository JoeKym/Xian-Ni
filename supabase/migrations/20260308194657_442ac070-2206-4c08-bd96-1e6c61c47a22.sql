
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _post_author_id UUID;
  _commenter_name TEXT;
  _community_id UUID;
BEGIN
  -- Get the post author and community
  SELECT user_id, community_id INTO _post_author_id, _community_id
  FROM public.community_posts WHERE id = NEW.post_id;

  -- Don't notify if commenting on own post
  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter name
  SELECT display_name INTO _commenter_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (title, message, type, page_link, target_user_id)
  VALUES (
    'New Comment',
    COALESCE(_commenter_name, 'A cultivator') || ' commented on your post',
    'comment',
    '/communities/' || _community_id,
    _post_author_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_comment_notify
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_comment();
