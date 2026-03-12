
-- Allow admins to insert/update/delete user_roles
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Allow anyone to read roles (needed for displaying badges publicly)
CREATE POLICY "Roles are publicly readable" ON public.user_roles FOR SELECT USING (true);
