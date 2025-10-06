-- Drop existing restrictive SELECT policies on users_local
DROP POLICY IF EXISTS "Users can view minimal info" ON users_local;
DROP POLICY IF EXISTS "Users can view user profiles" ON users_local;

-- Create new policy that allows anonymous SELECT for login
CREATE POLICY "Allow anonymous read for login"
ON users_local
FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy to allow authenticated users to view all profiles
CREATE POLICY "Authenticated users can view profiles"
ON users_local
FOR SELECT
TO authenticated
USING (true);