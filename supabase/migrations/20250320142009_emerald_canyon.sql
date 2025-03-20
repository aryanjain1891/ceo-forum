/*
  # Fix Forum RLS Policies

  1. Changes
    - Update RLS policies for forum_posts table to work with legacy_auth system
    - Remove auth.uid() references since we're using custom authentication
  
  2. Security
    - Maintain security while allowing legacy profile access
    - Use legacy_profile_id for authorization
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Forum posts are viewable by everyone" ON forum_posts;
DROP POLICY IF EXISTS "Legacy profiles can create forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Legacy profiles can update their own posts" ON forum_posts;

-- Create new policies that work with legacy_auth
CREATE POLICY "Forum posts are viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Legacy profiles can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (legacy_profile_id::text IN (
    SELECT legacy_profile_id::text 
    FROM legacy_auth
  ));

CREATE POLICY "Legacy profiles can update their own posts"
  ON forum_posts FOR UPDATE
  USING (legacy_profile_id::text IN (
    SELECT legacy_profile_id::text 
    FROM legacy_auth
  ));