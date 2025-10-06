-- Fix search_users function to work with custom auth
-- The issue is that auth.uid() returns null since we're using users_local table
DROP FUNCTION IF EXISTS public.search_users(text);

CREATE OR REPLACE FUNCTION public.search_users(query text, current_user_id uuid DEFAULT NULL)
RETURNS SETOF users_local
LANGUAGE sql
STABLE
AS $$
  SELECT id, email, password, username, avatar_url, created_at, role, notification_settings
  FROM users_local
  WHERE (username ILIKE '%' || query || '%' OR email ILIKE '%' || query || '%')
    AND (current_user_id IS NULL OR id != current_user_id)
  LIMIT 10;
$$;