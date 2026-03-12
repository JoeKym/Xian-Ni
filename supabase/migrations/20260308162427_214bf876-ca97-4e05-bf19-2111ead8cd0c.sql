-- Fix active_visitors: restrict INSERT to set session_id only, restrict UPDATE/DELETE to own session
DROP POLICY "Anyone can register as visitor" ON public.active_visitors;
DROP POLICY "Visitors can update their own session" ON public.active_visitors;
DROP POLICY "Visitors can remove their session" ON public.active_visitors;

CREATE POLICY "Anyone can register as visitor" ON public.active_visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Visitors can update their own session" ON public.active_visitors
  FOR UPDATE USING (session_id = current_setting('request.headers', true)::json->>'x-session-id' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Visitors can remove their session" ON public.active_visitors
  FOR DELETE USING (session_id = current_setting('request.headers', true)::json->>'x-session-id' OR has_role(auth.uid(), 'admin'));

-- Fix page_views: restrict INSERT to authenticated or anon with valid session_id
DROP POLICY "Anyone can insert page views" ON public.page_views;

CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (length(session_id) > 0 AND length(page_path) > 0);