
CREATE TABLE public.appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an appeal (even suspended users need to be able to insert)
CREATE POLICY "Anyone can submit appeals"
  ON public.appeals FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND length(message) > 0
    AND length(message) <= 2000
  );

-- Users can read their own appeals
CREATE POLICY "Users can read own appeals"
  ON public.appeals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all appeals
CREATE POLICY "Admins can read all appeals"
  ON public.appeals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update appeals (respond)
CREATE POLICY "Admins can update appeals"
  ON public.appeals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete appeals
CREATE POLICY "Admins can delete appeals"
  ON public.appeals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.appeals;
