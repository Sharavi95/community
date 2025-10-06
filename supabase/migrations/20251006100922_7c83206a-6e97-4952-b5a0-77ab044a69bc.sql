-- Fix infinite recursion in conversation_participants RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update participant roles" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their participant records" ON conversation_participants;

-- Create security definer function to check if user is participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  );
$$;

-- Create security definer function to check if user has admin role in conversation
CREATE OR REPLACE FUNCTION public.has_conversation_role(_conversation_id uuid, _user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
      AND role = _role
  );
$$;

-- Create new policies using security definer functions
CREATE POLICY "Users can view their participant records"
ON conversation_participants
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert participant records"
ON conversation_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own participant records"
ON conversation_participants
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins and owners can update participant records"
ON conversation_participants
FOR UPDATE
USING (
  public.has_conversation_role(conversation_id, auth.uid(), 'owner') 
  OR public.has_conversation_role(conversation_id, auth.uid(), 'admin')
);