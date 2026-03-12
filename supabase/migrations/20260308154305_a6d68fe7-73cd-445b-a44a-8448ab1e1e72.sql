
-- Create user_suspensions table
CREATE TABLE public.user_suspensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('suspended', 'banned')),
  reason text NOT NULL DEFAULT '',
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage suspensions"
  ON public.user_suspensions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read their own suspensions
CREATE POLICY "Users can read own suspensions"
  ON public.user_suspensions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to check if user is suspended/banned
CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'is_suspended', true,
      'type', type,
      'reason', reason,
      'expires_at', expires_at
    )
    FROM public.user_suspensions
    WHERE user_id = _user_id
      AND (type = 'banned' OR (type = 'suspended' AND expires_at > now()))
    ORDER BY created_at DESC
    LIMIT 1),
    '{"is_suspended": false}'::jsonb
  )
$$;

-- Enable realtime for admin monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_suspensions;
