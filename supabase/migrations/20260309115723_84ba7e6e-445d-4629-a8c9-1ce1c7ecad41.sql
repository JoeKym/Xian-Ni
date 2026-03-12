-- Prevent admins from being suspended/banned
CREATE OR REPLACE FUNCTION public.prevent_admin_suspension()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(NEW.user_id, 'admin') THEN
    RAISE EXCEPTION 'Cannot suspend or ban an admin user';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_admin_suspension_trigger
BEFORE INSERT ON public.user_suspensions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_suspension();