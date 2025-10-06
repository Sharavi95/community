-- Create enum for notification types
CREATE TYPE notification_type AS ENUM ('reply', 'mention', 'comment', 'moderation_alert', 'community_update', 'system');

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users_local(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  related_user_id UUID REFERENCES public.users_local(id) ON DELETE SET NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add notification_settings column to users_local
ALTER TABLE public.users_local
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "reply": true,
  "mention": true,
  "comment": true,
  "moderation_alert": true,
  "community_update": true,
  "system": true
}'::jsonb;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;