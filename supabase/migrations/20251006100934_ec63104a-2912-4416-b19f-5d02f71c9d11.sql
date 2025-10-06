-- Update RLS policies to work without Supabase auth
-- Since we're using custom auth (users_local), we need to allow operations without auth.uid()

DROP POLICY IF EXISTS "Users can view their participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Admins and owners can update participant records" ON conversation_participants;

-- Allow all authenticated users to perform operations
-- Application logic will handle user-specific filtering
CREATE POLICY "Allow read access to conversation participants"
ON conversation_participants
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow insert conversation participants"
ON conversation_participants
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Allow delete conversation participants"
ON conversation_participants
FOR DELETE
TO authenticated, anon
USING (true);

CREATE POLICY "Allow update conversation participants"
ON conversation_participants
FOR UPDATE
TO authenticated, anon
USING (true);