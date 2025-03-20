/*
  # Add Forum Functionality

  1. New Tables
    - `forum_posts` table for storing forum discussions
  
  2. Security
    - Enable RLS on forum_posts table
    - Add policies for CRUD operations
*/

-- Create forum posts table
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  legacy_profile_id uuid REFERENCES legacy_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Forum posts are viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Legacy profiles can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM legacy_profiles
    WHERE id = legacy_profile_id
  ));

CREATE POLICY "Legacy profiles can update their own posts"
  ON forum_posts FOR UPDATE
  USING (legacy_profile_id = (
    SELECT legacy_profile_id FROM legacy_auth
    WHERE legacy_profile_id = auth.uid()
  ));