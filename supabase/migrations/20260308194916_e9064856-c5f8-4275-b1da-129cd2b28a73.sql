
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _post_author_id UUID;
  _liker_name TEXT;
  _community_id UUID;
BEGIN
  SELECT user_id, community_id INTO _post_author_id, _community_id
  FROM public.community_posts WHERE id = NEW.post_id;

  IF _post_author_id IS NULL OR _post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO _liker_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (title, message, type, page_link, target_user_id)
  VALUES (
    'Post Liked',
    COALESCE(_liker_name, 'A cultivator') || ' liked your post',
    'like',
    '/communities/' || _community_id,
    _post_author_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_like_notify
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_like();
