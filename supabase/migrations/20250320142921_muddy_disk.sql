/*
  # Enhance Legacy Profiles and Add Contributions

  1. Changes
    - Drop unused tables (profiles, posts)
    - Add contributions table
    - Add description field to legacy_profiles
    - Add sample contributions
  
  2. New Tables
    - contributions
      - id (uuid, primary key)
      - title (text)
      - resource_url (text)
      - description (text)
      - legacy_profile_id (uuid, foreign key)
      - created_at (timestamptz)

  3. Security
    - Enable RLS on contributions table
    - Add policies for viewing and creating contributions
*/

-- Drop unused tables
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS profiles;

-- Add description field to legacy_profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'legacy_profiles' 
    AND column_name = 'one_liner'
  ) THEN
    ALTER TABLE legacy_profiles ADD COLUMN one_liner text;
  END IF;
END $$;

-- Create contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  resource_url text NOT NULL,
  description text NOT NULL,
  legacy_profile_id uuid REFERENCES legacy_profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Contributions are viewable by everyone"
  ON contributions FOR SELECT
  USING (true);

CREATE POLICY "Legacy profiles can create contributions"
  ON contributions FOR INSERT
  WITH CHECK (legacy_profile_id::text IN (
    SELECT legacy_profile_id::text 
    FROM legacy_auth
  ));

-- Update legacy profiles with one-liners
UPDATE legacy_profiles
SET one_liner = CASE id
  WHEN (SELECT id FROM legacy_profiles ORDER BY tenure_start LIMIT 1)
    THEN 'Pioneering leader who established our core values'
  WHEN (SELECT id FROM legacy_profiles ORDER BY tenure_start LIMIT 1 OFFSET 1)
    THEN 'Transformed our organization through technological innovation'
  WHEN (SELECT id FROM legacy_profiles ORDER BY tenure_start LIMIT 1 OFFSET 2)
    THEN 'Expanded our global reach and impact'
  WHEN (SELECT id FROM legacy_profiles ORDER BY tenure_start LIMIT 1 OFFSET 3)
    THEN 'Championed sustainability and social responsibility'
  WHEN (SELECT id FROM legacy_profiles ORDER BY tenure_start LIMIT 1 OFFSET 4)
    THEN 'Modernized our operations and digital presence'
  END
WHERE id IN (SELECT id FROM legacy_profiles ORDER BY tenure_start LIMIT 5);

-- Add sample contributions
INSERT INTO contributions (title, resource_url, description, legacy_profile_id)
SELECT 
  CASE profiles.row_num
    WHEN 1 THEN 'Founding Documents Archive'
    WHEN 2 THEN 'Digital Transformation Whitepaper'
    WHEN 3 THEN 'Global Expansion Strategy Guide'
    WHEN 4 THEN 'Sustainability Framework'
    WHEN 5 THEN 'Modern Tech Stack Documentation'
  END as title,
  CASE profiles.row_num
    WHEN 1 THEN 'https://example.com/founding-documents'
    WHEN 2 THEN 'https://example.com/digital-transformation'
    WHEN 3 THEN 'https://example.com/global-expansion'
    WHEN 4 THEN 'https://example.com/sustainability'
    WHEN 5 THEN 'https://example.com/tech-stack'
  END as resource_url,
  CASE profiles.row_num
    WHEN 1 THEN 'Original documents outlining our mission and values'
    WHEN 2 THEN 'Comprehensive guide on digital transformation implementation'
    WHEN 3 THEN 'Strategic framework for international market entry'
    WHEN 4 THEN 'Detailed approach to environmental responsibility'
    WHEN 5 THEN 'Documentation of our modernized technology infrastructure'
  END as description,
  profiles.id as legacy_profile_id
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY tenure_start) as row_num
  FROM legacy_profiles
  LIMIT 5
) profiles;