-- Add RLS policies for conversations table
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

-- Allow all users to create and view conversations
-- Application logic handles user-specific filtering
CREATE POLICY "Allow all to create conversations"
ON conversations
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Allow all to read conversations"
ON conversations
FOR SELECT
TO authenticated, anon
USING (true);

-- Also add policies for messages table if missing
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages read status" ON messages;

CREATE POLICY "Allow all to insert messages"
ON messages
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Allow all to read messages"
ON messages
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow all to update messages"
ON messages
FOR UPDATE
TO authenticated, anon
USING (true);