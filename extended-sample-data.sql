-- ===============================================
-- EXTENDED SAMPLE DATA - MORE TEAMS & LEAGUES
-- Run this after sample-data.sql for more content
-- ===============================================

-- ===============================================
-- BUNDESLIGA TEAMS
-- ===============================================
INSERT INTO teams (id, name, code, tla, logo_url, country_name, founded_year, venue_name, venue_city, venue_capacity) VALUES
(157, 'Bayern Munich', 'BAY', 'FCB', 'https://media.api-sports.io/football/teams/157.png', 'Germany', 1900, 'Allianz Arena', 'Munich', 75000),
(165, 'Borussia Dortmund', 'BVB', 'BVB', 'https://media.api-sports.io/football/teams/165.png', 'Germany', 1909, 'Signal Iduna Park', 'Dortmund', 81000),
(173, 'RB Leipzig', 'RBL', 'RBL', 'https://media.api-sports.io/football/teams/173.png', 'Germany', 2009, 'Red Bull Arena', 'Leipzig', 47000),
(164, 'Bayer Leverkusen', 'B04', 'B04', 'https://media.api-sports.io/football/teams/164.png', 'Germany', 1904, 'BayArena', 'Leverkusen', 30000)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  venue_name = EXCLUDED.venue_name;

-- ===============================================
-- SERIE A TEAMS
-- ===============================================
INSERT INTO teams (id, name, code, tla, logo_url, country_name, founded_year, venue_name, venue_city, venue_capacity) VALUES
(489, 'AC Milan', 'MIL', 'ACM', 'https://media.api-sports.io/football/teams/489.png', 'Italy', 1899, 'San Siro', 'Milan', 80000),
(505, 'Inter', 'INT', 'INT', 'https://media.api-sports.io/football/teams/505.png', 'Italy', 1908, 'San Siro', 'Milan', 80000),
(496, 'Juventus', 'JUV', 'JUV', 'https://media.api-sports.io/football/teams/496.png', 'Italy', 1897, 'Allianz Stadium', 'Turin', 41000),
(487, 'AS Roma', 'ROM', 'ROM', 'https://media.api-sports.io/football/teams/487.png', 'Italy', 1927, 'Stadio Olimpico', 'Rome', 70000),
(492, 'Napoli', 'NAP', 'NAP', 'https://media.api-sports.io/football/teams/492.png', 'Italy', 1926, 'Stadio Diego Armando Maradona', 'Naples', 55000)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  venue_name = EXCLUDED.venue_name;

-- ===============================================
-- LIGUE 1 TEAMS  
-- ===============================================
INSERT INTO teams (id, name, code, tla, logo_url, country_name, founded_year, venue_name, venue_city, venue_capacity) VALUES
(85, 'Paris Saint Germain', 'PSG', 'PSG', 'https://media.api-sports.io/football/teams/85.png', 'France', 1970, 'Parc des Princes', 'Paris', 48000),
(80, 'Lyon', 'LYO', 'OL', 'https://media.api-sports.io/football/teams/80.png', 'France', 1950, 'Groupama Stadium', 'Lyon', 59000),
(81, 'Marseille', 'MRS', 'OM', 'https://media.api-sports.io/football/teams/81.png', 'France', 1899, 'Stade Vélodrome', 'Marseille', 67000),
(84, 'Nice', 'NIC', 'OGCN', 'https://media.api-sports.io/football/teams/84.png', 'France', 1904, 'Allianz Riviera', 'Nice', 35000)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  venue_name = EXCLUDED.venue_name;

-- ===============================================
-- MORE REALISTIC FIXTURES (Next 7 Days)
-- ===============================================
INSERT INTO fixtures (id, league_id, season, round, date, home_team_id, away_team_id, status_long, status_short, venue_name, venue_city) VALUES
-- Bundesliga
(2001, 78, 2024, 'Regular Season - 16', NOW() + INTERVAL '1 day 5 hours', 157, 165, 'Not Started', 'NS', 'Allianz Arena', 'Munich'),
(2002, 78, 2024, 'Regular Season - 16', NOW() + INTERVAL '2 days 3 hours', 173, 164, 'Not Started', 'NS', 'Red Bull Arena', 'Leipzig'),

-- Serie A  
(2003, 135, 2024, 'Regular Season - 16', NOW() + INTERVAL '3 days', 489, 505, 'Not Started', 'NS', 'San Siro', 'Milan'),
(2004, 135, 2024, 'Regular Season - 16', NOW() + INTERVAL '3 days 2 hours', 496, 487, 'Not Started', 'NS', 'Allianz Stadium', 'Turin'),
(2005, 135, 2024, 'Regular Season - 16', NOW() + INTERVAL '4 days', 492, 489, 'Not Started', 'NS', 'Stadio Diego Armando Maradona', 'Naples'),

-- Ligue 1
(2006, 61, 2024, 'Regular Season - 16', NOW() + INTERVAL '4 days 2 hours', 85, 80, 'Not Started', 'NS', 'Parc des Princes', 'Paris'),
(2007, 61, 2024, 'Regular Season - 16', NOW() + INTERVAL '5 days', 81, 84, 'Not Started', 'NS', 'Stade Vélodrome', 'Marseille'),

-- More Premier League
(2008, 39, 2024, 'Regular Season - 16', NOW() + INTERVAL '5 days 2 hours', 42, 34, 'Not Started', 'NS', 'Emirates Stadium', 'London'),
(2009, 39, 2024, 'Regular Season - 16', NOW() + INTERVAL '6 days', 66, 48, 'Not Started', 'NS', 'Villa Park', 'Birmingham'),
(2010, 39, 2024, 'Regular Season - 16', NOW() + INTERVAL '7 days', 35, 47, 'Not Started', 'NS', 'American Express Community Stadium', 'Brighton')

ON CONFLICT (id) DO UPDATE SET
  date = EXCLUDED.date,
  status_long = EXCLUDED.status_long,
  status_short = EXCLUDED.status_short;

-- ===============================================
-- EXTENDED STANDINGS (Bundesliga)
-- ===============================================
INSERT INTO standings (league_id, season, team_id, rank, points, goals_diff, form, played, win, draw, lose, goals_for, goals_against) VALUES
(78, 2024, 157, 1, 39, 28, 'WWWWW', 15, 13, 0, 2, 45, 17),
(78, 2024, 165, 2, 31, 12, 'WWLWL', 15, 9, 4, 2, 32, 20),
(78, 2024, 173, 3, 28, 8, 'DWWLW', 15, 8, 4, 3, 28, 20),
(78, 2024, 164, 4, 25, 3, 'WLWDL', 15, 7, 4, 4, 24, 21)
ON CONFLICT (league_id, season, team_id) DO UPDATE SET
  rank = EXCLUDED.rank,
  points = EXCLUDED.points,
  goals_diff = EXCLUDED.goals_diff,
  form = EXCLUDED.form;

-- ===============================================
-- MORE PREDICTIONS FOR UPCOMING MATCHES
-- ===============================================
INSERT INTO predictions (fixture_id, winner_id, winner_comment, home_percentage, draw_percentage, away_percentage, goals_home, goals_away, under_over, advice, confidence_score) VALUES
(2001, 157, 'Bayern Munich dominant at home with superior squad quality', 68.4, 19.8, 11.8, 2.8, 1.3, 'Over 2.5', 'Bayern strong favorites in Der Klassiker', 87),
(2002, 173, 'RB Leipzig solid home record against Leverkusen', 45.2, 28.9, 25.9, 1.9, 1.5, 'Over 2.5', 'Close contest with slight edge to Leipzig', 71),
(2003, 489, 'AC Milan slight edge in Derby della Madonnina', 42.1, 32.4, 25.5, 1.7, 1.4, 'Under 2.5', 'Derby matches often cagey affairs', 69),
(2006, 85, 'PSG overwhelming favorites with star power', 74.8, 16.2, 9.0, 3.1, 1.1, 'Over 2.5', 'PSG expected to dominate possession and chances', 91),
(2008, 42, 'Arsenal strong at Emirates with attacking style', 56.7, 25.3, 18.0, 2.2, 1.4, 'Over 2.5', 'Arsenal favorites with home advantage', 76)
ON CONFLICT (fixture_id) DO UPDATE SET
  home_percentage = EXCLUDED.home_percentage,
  draw_percentage = EXCLUDED.draw_percentage,
  away_percentage = EXCLUDED.away_percentage,
  confidence_score = EXCLUDED.confidence_score;

-- ===============================================
-- SAMPLE USER PROFILES FOR TESTING
-- ===============================================
-- Note: In production, these will be created via auth signup
-- This is for development/testing with sample subscription data

-- Example profiles would be inserted here when users sign up
-- For now, we'll just ensure the table structure is ready

COMMIT;

-- ===============================================
-- EXTENDED VERIFICATION QUERIES
-- ===============================================

-- Check total teams by league
SELECT 
  l.name as league,
  COUNT(DISTINCT CASE WHEN f.home_team_id IS NOT NULL THEN f.home_team_id END +
                 CASE WHEN f.away_team_id IS NOT NULL THEN f.away_team_id END) as teams_with_fixtures
FROM leagues l
LEFT JOIN fixtures f ON l.id = f.league_id
GROUP BY l.id, l.name
ORDER BY teams_with_fixtures DESC;

-- Check fixtures by status
SELECT 
  status_short,
  COUNT(*) as count
FROM fixtures 
GROUP BY status_short
ORDER BY count DESC;

-- Check upcoming matches (next 7 days)
SELECT 
  f.date,
  l.name as league,
  ht.name as home_team,
  at.name as away_team,
  f.status_short
FROM fixtures f
JOIN leagues l ON f.league_id = l.id
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id
WHERE f.date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY f.date;