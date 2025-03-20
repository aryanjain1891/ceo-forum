/*
  # Add Legacy Profiles and Authentication Data

  1. Sample Data
    - Add 5 legacy profiles with their details
    - Add corresponding blog posts
    - Add authentication credentials
*/

-- Insert legacy profiles
INSERT INTO legacy_profiles (id, name, image_url, description, tenure_start, tenure_end) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Margaret Thompson', 'https://images.unsplash.com/photo-1580489944761-15a19d654956', 'Pioneer in sustainable technology initiatives. Led the company through its digital transformation phase from 1995-2005. Established our core values of innovation and environmental responsibility.', '1995-01-01', '2005-12-31'),
  ('22222222-2222-2222-2222-222222222222', 'Robert Chen', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'Visionary leader who expanded our global presence. Transformed the company from a regional player to a multinational corporation during his tenure from 2005-2010.', '2005-01-01', '2010-12-31'),
  ('33333333-3333-3333-3333-333333333333', 'Sarah Williams', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e', 'Innovation champion who revolutionized our product development cycle. Her leadership from 2010-2015 saw the launch of our most successful product lines.', '2010-01-01', '2015-12-31'),
  ('44444444-4444-4444-4444-444444444444', 'James Martinez', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', 'Financial strategist who steered the company through global economic challenges. His tenure from 2015-2020 strengthened our market position.', '2015-01-01', '2020-12-31'),
  ('55555555-5555-5555-5555-555555555555', 'Emily Zhang', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', 'Current CEO leading our AI and machine learning initiatives. Taking the company into the future of technology since 2020.', '2020-01-01', NULL);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_profile_id uuid REFERENCES legacy_profiles(id),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blogs are viewable by everyone"
  ON blogs FOR SELECT
  USING (true);

-- Insert blog posts
INSERT INTO blogs (legacy_profile_id, title, content) VALUES
  ('11111111-1111-1111-1111-111111111111', 'The Dawn of Digital Transformation', 'When I took the helm in 1995, our industry was at a crossroads. The internet was emerging as a transformative force, and we had to make bold decisions...'),
  ('22222222-2222-2222-2222-222222222222', 'Going Global: A Journey of Growth', 'Expanding into international markets was more than just opening new offices. It was about understanding diverse cultures and adapting our approach...'),
  ('33333333-3333-3333-3333-333333333333', 'Innovation at the Core', 'Innovation isn''t just about new products; it''s about reimagining possibilities. During my tenure, we established our Innovation Lab, which became the birthplace of...'),
  ('44444444-4444-4444-4444-444444444444', 'Navigating Through Economic Storms', 'The 2008 financial crisis taught us valuable lessons about resilience. Our strategy focused on maintaining stability while preparing for future opportunities...'),
  ('55555555-5555-5555-5555-555555555555', 'The AI Revolution: Our Path Forward', 'As we embrace the era of artificial intelligence, our focus remains on responsible innovation. We''re not just adopting new technologies; we''re shaping their impact...');

-- Create auth table for legacy profiles
CREATE TABLE legacy_auth (
  username text PRIMARY KEY,
  password text NOT NULL,
  legacy_profile_id uuid REFERENCES legacy_profiles(id)
);

ALTER TABLE legacy_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legacy auth is queryable by everyone"
  ON legacy_auth FOR SELECT
  USING (true);

-- Insert authentication credentials
INSERT INTO legacy_auth (username, password, legacy_profile_id) VALUES
  ('mthompson', 'pioneer1995', '11111111-1111-1111-1111-111111111111'),
  ('rchen', 'global2005', '22222222-2222-2222-2222-222222222222'),
  ('swilliams', 'innovate2010', '33333333-3333-3333-3333-333333333333'),
  ('jmartinez', 'finance2015', '44444444-4444-4444-4444-444444444444'),
  ('ezhang', 'future2020', '55555555-5555-5555-5555-555555555555');