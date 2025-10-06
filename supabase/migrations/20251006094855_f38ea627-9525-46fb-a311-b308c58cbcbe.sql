-- Add role and left_at columns to conversation_participants if not present
ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS left_at timestamptz;

-- Update RLS policies for conversation_participants
CREATE POLICY "Users can update participant roles"
ON conversation_participants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
    AND cp.role IN ('owner', 'admin')
  )
);

-- Enable realtime for conversation_participants
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;