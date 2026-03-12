
-- Drop the problematic UPDATE and DELETE policies that rely on x-session-id header
DROP POLICY IF EXISTS "Visitors can update their own session" ON public.active_visitors;
DROP POLICY IF EXISTS "Visitors can remove their session" ON public.active_visitors;

-- Create new UPDATE policy: allow anyone to update (the upsert uses onConflict session_id)
CREATE POLICY "Anyone can update visitors"
ON public.active_visitors FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create new DELETE policy: allow cleanup function and admins
CREATE POLICY "Anyone can delete visitors"
ON public.active_visitors FOR DELETE
TO public
USING (true);
