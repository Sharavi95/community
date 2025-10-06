-- Create enum for report types
CREATE TYPE report_type AS ENUM ('post', 'comment');

-- Create enum for report status
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- Create enum for content status
CREATE TYPE content_status AS ENUM ('active', 'flagged', 'deleted');

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type report_type NOT NULL,
  reported_by UUID REFERENCES public.users_local(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES public.users_local(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT report_content_check CHECK (
    (report_type = 'post' AND post_id IS NOT NULL AND comment_id IS NULL) OR
    (report_type = 'comment' AND comment_id IS NOT NULL AND post_id IS NULL)
  )
);

-- Add status column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'active';

-- Add status column to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'active';

-- Create moderation_actions table for audit log
CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES public.users_local(id) ON DELETE SET NULL NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
-- Authenticated users can create reports
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (reported_by = auth.uid());

-- Community owners/admins can view reports for their communities
CREATE POLICY "Owners and admins can view community reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.id = reports.community_id
    AND c.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.community_roles cr
    WHERE cr.community_id = reports.community_id
    AND cr.user_id = auth.uid()
    AND cr.role IN ('admin', 'moderator')
  )
);

-- Community owners/admins can update reports
CREATE POLICY "Owners and admins can update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.id = reports.community_id
    AND c.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.community_roles cr
    WHERE cr.community_id = reports.community_id
    AND cr.user_id = auth.uid()
    AND cr.role IN ('admin', 'moderator')
  )
);

-- RLS Policies for moderation_actions
-- Community owners/admins can view moderation actions
CREATE POLICY "Owners and admins can view moderation actions"
ON public.moderation_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.id = moderation_actions.community_id
    AND c.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.community_roles cr
    WHERE cr.community_id = moderation_actions.community_id
    AND cr.user_id = auth.uid()
    AND cr.role IN ('admin', 'moderator')
  )
);

-- Community owners/admins can create moderation actions
CREATE POLICY "Owners and admins can create moderation actions"
ON public.moderation_actions
FOR INSERT
TO authenticated
WITH CHECK (
  moderator_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = moderation_actions.community_id
      AND c.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.community_roles cr
      WHERE cr.community_id = moderation_actions.community_id
      AND cr.user_id = auth.uid()
      AND cr.role IN ('admin', 'moderator')
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_reports_community_id ON public.reports(community_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_moderation_actions_community_id ON public.moderation_actions(community_id);
CREATE INDEX idx_moderation_actions_created_at ON public.moderation_actions(created_at DESC);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_comments_status ON public.comments(status);