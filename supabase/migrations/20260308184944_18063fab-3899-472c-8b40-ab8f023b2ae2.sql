
-- Fix the overly permissive notification insert policy
DROP POLICY IF EXISTS "Service functions can insert notifications" ON public.notifications;
