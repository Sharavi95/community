-- Enable users to search for other users
CREATE OR REPLACE FUNCTION public.search_users(query text)
RETURNS SETOF users_local AS $$
  SELECT id, email, password, username, avatar_url, created_at, role, notification_settings
  FROM users_local
  WHERE (username ILIKE '%' || query || '%' OR email ILIKE '%' || query || '%')
    AND id != auth.uid()
  LIMIT 10;
$$ LANGUAGE sql STABLE;

-- Allow authenticated users to view minimal user info
CREATE POLICY "Users can view user profiles"
ON users_local
FOR SELECT
TO authenticated
USING (true);

-- Ensure users can manage their own conversation participants
CREATE POLICY "Users can view their participant records"
ON conversation_participants
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = conversation_participants.conversation_id
  AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can delete their participant records"
ON conversation_participants
FOR DELETE
TO authenticated
USING (user_id = auth.uid());