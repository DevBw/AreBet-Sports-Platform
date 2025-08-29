-- ===============================================
-- AREBET DATABASE SCHEMA - PRODUCTION VERSION
-- Run this in your Supabase SQL Editor
-- ===============================================

-- Note: auth.users table is managed by Supabase automatically
-- We only work with public tables

-- ===============================================
-- USER PROFILES & SUBSCRIPTION MANAGEMENT
-- ===============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Subscription Management
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  
  -- Usage Tracking
  api_quota_used INTEGER DEFAULT 0,
  api_quota_reset_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- User Preferences
  preferences JSONB DEFAULT '{}',
  favorite_leagues INTEGER[] DEFAULT '{}',
  favorite_teams INTEGER[] DEFAULT '{}',
  notification_settings JSONB DEFAULT '{
    "live_scores": true,
    "predictions": false,
    "value_bets": false
  }',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===============================================
-- ENHANCED FIXTURES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS fixtures (
  id BIGINT PRIMARY KEY,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  round TEXT,
  
  -- Match Details
  date TIMESTAMPTZ NOT NULL,
  timestamp BIGINT,
  timezone TEXT DEFAULT 'UTC',
  referee TEXT,
  
  -- Teams
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  
  -- Status
  status_long TEXT,
  status_short TEXT,
  status_elapsed INTEGER,
  
  -- Venue
  venue_id INTEGER,
  venue_name TEXT,
  venue_city TEXT,
  
  -- Scores
  home_goals INTEGER,
  away_goals INTEGER,
  home_goals_halftime INTEGER,
  away_goals_halftime INTEGER,
  home_goals_extratime INTEGER,
  away_goals_extratime INTEGER,
  home_goals_penalty INTEGER,
  away_goals_penalty INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fixtures
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON fixtures(date);
CREATE INDEX IF NOT EXISTS idx_fixtures_league_season ON fixtures(league_id, season);
CREATE INDEX IF NOT EXISTS idx_fixtures_teams ON fixtures(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_live ON fixtures(status_short) 
  WHERE status_short IN ('1H', '2H', 'HT', 'ET', 'BT', 'P');

-- ===============================================
-- TEAMS & LEAGUES (ENHANCED)
-- ===============================================

CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  logo_url TEXT,
  country_id INTEGER,
  country_name TEXT,
  country_code TEXT,
  country_flag_url TEXT,
  current_season INTEGER,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  tla TEXT,
  logo_url TEXT,
  country_name TEXT,
  founded_year INTEGER,
  national BOOLEAN DEFAULT FALSE,
  venue_id INTEGER,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- PREDICTIONS TABLE (PREMIUM FEATURE)
-- ===============================================

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  fixture_id BIGINT REFERENCES fixtures(id),
  
  -- Winner Prediction
  winner_id INTEGER, -- NULL for draw
  winner_comment TEXT,
  
  -- Percentages
  home_percentage DECIMAL(5,2),
  draw_percentage DECIMAL(5,2),
  away_percentage DECIMAL(5,2),
  
  -- Goals Prediction
  goals_home DECIMAL(3,1),
  goals_away DECIMAL(3,1),
  under_over TEXT,
  
  -- Analysis
  advice TEXT,
  
  -- Team Strengths (for comparison)
  home_att_strength DECIMAL(5,2),
  home_def_strength DECIMAL(5,2),
  away_att_strength DECIMAL(5,2),
  away_def_strength DECIMAL(5,2),
  
  -- Poisson Distribution
  home_poisson_distribution DECIMAL(5,2),
  away_poisson_distribution DECIMAL(5,2),
  
  -- Confidence Score (custom calculation)
  confidence_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for predictions (subscription-based access)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Predictions access based on subscription" ON predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier IN ('pro', 'elite')
      AND profiles.subscription_status = 'active'
    )
  );

-- ===============================================
-- STANDINGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS standings (
  id SERIAL PRIMARY KEY,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  
  -- Position
  rank INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  goals_diff INTEGER DEFAULT 0,
  
  -- Form & Status
  form TEXT, -- e.g., "WLDWW"
  status TEXT,
  description TEXT,
  
  -- Overall Stats
  played INTEGER DEFAULT 0,
  win INTEGER DEFAULT 0,
  draw INTEGER DEFAULT 0,
  lose INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  
  -- Home Stats
  home_played INTEGER DEFAULT 0,
  home_win INTEGER DEFAULT 0,
  home_draw INTEGER DEFAULT 0,
  home_lose INTEGER DEFAULT 0,
  home_goals_for INTEGER DEFAULT 0,
  home_goals_against INTEGER DEFAULT 0,
  
  -- Away Stats
  away_played INTEGER DEFAULT 0,
  away_win INTEGER DEFAULT 0,
  away_draw INTEGER DEFAULT 0,
  away_lose INTEGER DEFAULT 0,
  away_goals_for INTEGER DEFAULT 0,
  away_goals_against INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, season, team_id)
);

-- ===============================================
-- USAGE TRACKING & ANALYTICS
-- ===============================================

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  endpoint TEXT NOT NULL,
  subscription_tier TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON api_usage_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint, timestamp);

-- ===============================================
-- FUNCTIONS & TRIGGERS
-- ===============================================

-- Function to reset API quota daily
CREATE OR REPLACE FUNCTION reset_api_quotas()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    api_quota_used = 0,
    api_quota_reset_date = NOW()
  WHERE api_quota_reset_date < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixtures_updated_at BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SAMPLE DATA INSERTION
-- ===============================================

-- Insert popular leagues
INSERT INTO leagues (id, name, type, country_name, country_code, current_season, logo_url) VALUES
(39, 'Premier League', 'League', 'England', 'GB', 2024, 'https://media.api-sports.io/football/leagues/39.png'),
(140, 'La Liga', 'League', 'Spain', 'ES', 2024, 'https://media.api-sports.io/football/leagues/140.png'),
(135, 'Serie A', 'League', 'Italy', 'IT', 2024, 'https://media.api-sports.io/football/leagues/135.png'),
(78, 'Bundesliga', 'League', 'Germany', 'DE', 2024, 'https://media.api-sports.io/football/leagues/78.png'),
(61, 'Ligue 1', 'League', 'France', 'FR', 2024, 'https://media.api-sports.io/football/leagues/61.png')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  current_season = EXCLUDED.current_season,
  logo_url = EXCLUDED.logo_url;

-- Insert popular teams (Premier League sample)
INSERT INTO teams (id, name, code, logo_url, country_name, venue_name, venue_city) VALUES
(33, 'Manchester United', 'MUN', 'https://media.api-sports.io/football/teams/33.png', 'England', 'Old Trafford', 'Manchester'),
(40, 'Liverpool', 'LIV', 'https://media.api-sports.io/football/teams/40.png', 'England', 'Anfield', 'Liverpool'),
(50, 'Manchester City', 'MCI', 'https://media.api-sports.io/football/teams/50.png', 'England', 'Etihad Stadium', 'Manchester'),
(42, 'Arsenal', 'ARS', 'https://media.api-sports.io/football/teams/42.png', 'England', 'Emirates Stadium', 'London'),
(49, 'Chelsea', 'CHE', 'https://media.api-sports.io/football/teams/49.png', 'England', 'Stamford Bridge', 'London')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  venue_name = EXCLUDED.venue_name;

COMMIT;