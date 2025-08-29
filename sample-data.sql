-- ===============================================
-- AREBET SAMPLE DATA - REALISTIC SPORTS DATA
-- Run this after database-schema.sql
-- ===============================================

-- Clear existing data (if any)
DELETE FROM predictions;
DELETE FROM standings;
DELETE FROM fixtures;
DELETE FROM teams;
DELETE FROM leagues;

-- ===============================================
-- POPULAR LEAGUES
-- ===============================================
INSERT INTO leagues (id, name, type, country_name, country_code, current_season, logo_url, start_date, end_date) VALUES
(39, 'Premier League', 'League', 'England', 'GB', 2024, 'https://media.api-sports.io/football/leagues/39.png', '2024-08-01', '2025-05-31'),
(140, 'La Liga', 'League', 'Spain', 'ES', 2024, 'https://media.api-sports.io/football/leagues/140.png', '2024-08-01', '2025-05-31'),
(135, 'Serie A', 'League', 'Italy', 'IT', 2024, 'https://media.api-sports.io/football/leagues/135.png', '2024-08-01', '2025-05-31'),
(78, 'Bundesliga', 'League', 'Germany', 'DE', 2024, 'https://media.api-sports.io/football/leagues/78.png', '2024-08-01', '2025-05-31'),
(61, 'Ligue 1', 'League', 'France', 'FR', 2024, 'https://media.api-sports.io/football/leagues/61.png', '2024-08-01', '2025-05-31'),
(2, 'Champions League', 'Cup', 'World', 'EU', 2024, 'https://media.api-sports.io/football/leagues/2.png', '2024-09-01', '2025-06-01'),
(3, 'Europa League', 'Cup', 'World', 'EU', 2024, 'https://media.api-sports.io/football/leagues/3.png', '2024-09-01', '2025-05-31'),
(1, 'World Cup', 'Cup', 'World', 'FIFA', 2026, 'https://media.api-sports.io/football/leagues/1.png', '2026-06-01', '2026-07-31')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  current_season = EXCLUDED.current_season,
  logo_url = EXCLUDED.logo_url;

-- ===============================================
-- PREMIER LEAGUE TEAMS
-- ===============================================
INSERT INTO teams (id, name, code, tla, logo_url, country_name, founded_year, venue_name, venue_city, venue_capacity) VALUES
(33, 'Manchester United', 'MUN', 'MUN', 'https://media.api-sports.io/football/teams/33.png', 'England', 1878, 'Old Trafford', 'Manchester', 76000),
(40, 'Liverpool', 'LIV', 'LIV', 'https://media.api-sports.io/football/teams/40.png', 'England', 1892, 'Anfield', 'Liverpool', 54000),
(50, 'Manchester City', 'MCI', 'MCI', 'https://media.api-sports.io/football/teams/50.png', 'England', 1880, 'Etihad Stadium', 'Manchester', 55000),
(42, 'Arsenal', 'ARS', 'ARS', 'https://media.api-sports.io/football/teams/42.png', 'England', 1886, 'Emirates Stadium', 'London', 60000),
(49, 'Chelsea', 'CHE', 'CHE', 'https://media.api-sports.io/football/teams/49.png', 'England', 1905, 'Stamford Bridge', 'London', 41000),
(47, 'Tottenham', 'TOT', 'TOT', 'https://media.api-sports.io/football/teams/47.png', 'England', 1882, 'Tottenham Hotspur Stadium', 'London', 62000),
(34, 'Newcastle', 'NEW', 'NEW', 'https://media.api-sports.io/football/teams/34.png', 'England', 1892, 'St James Park', 'Newcastle', 52000),
(66, 'Aston Villa', 'AVL', 'AVL', 'https://media.api-sports.io/football/teams/66.png', 'England', 1874, 'Villa Park', 'Birmingham', 42000),
(48, 'West Ham', 'WHU', 'WHU', 'https://media.api-sports.io/football/teams/48.png', 'England', 1895, 'London Stadium', 'London', 66000),
(35, 'Brighton', 'BHA', 'BHA', 'https://media.api-sports.io/football/teams/35.png', 'England', 1901, 'American Express Community Stadium', 'Brighton', 31000)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  venue_name = EXCLUDED.venue_name,
  venue_capacity = EXCLUDED.venue_capacity;

-- ===============================================
-- LA LIGA TEAMS
-- ===============================================
INSERT INTO teams (id, name, code, tla, logo_url, country_name, founded_year, venue_name, venue_city, venue_capacity) VALUES
(541, 'Real Madrid', 'RMA', 'RMA', 'https://media.api-sports.io/football/teams/541.png', 'Spain', 1902, 'Santiago Bernabéu', 'Madrid', 81000),
(529, 'Barcelona', 'BAR', 'BAR', 'https://media.api-sports.io/football/teams/529.png', 'Spain', 1899, 'Camp Nou', 'Barcelona', 99000),
(530, 'Atletico Madrid', 'ATM', 'ATM', 'https://media.api-sports.io/football/teams/530.png', 'Spain', 1903, 'Wanda Metropolitano', 'Madrid', 68000),
(548, 'Real Sociedad', 'RSO', 'RSO', 'https://media.api-sports.io/football/teams/548.png', 'Spain', 1909, 'Reale Arena', 'San Sebastian', 39500),
(533, 'Villarreal', 'VIL', 'VIL', 'https://media.api-sports.io/football/teams/533.png', 'Spain', 1923, 'Estadio de la Cerámica', 'Villarreal', 23500),
(532, 'Valencia', 'VAL', 'VAL', 'https://media.api-sports.io/football/teams/532.png', 'Spain', 1919, 'Mestalla', 'Valencia', 49000)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  venue_name = EXCLUDED.venue_name,
  venue_capacity = EXCLUDED.venue_capacity;

-- ===============================================
-- RECENT AND UPCOMING FIXTURES
-- ===============================================
INSERT INTO fixtures (id, league_id, season, round, date, home_team_id, away_team_id, status_long, status_short, venue_name, venue_city, home_goals, away_goals, home_goals_halftime, away_goals_halftime) VALUES
-- Premier League Recent Matches
(1001, 39, 2024, 'Regular Season - 15', '2024-12-15 15:00:00+00', 50, 33, 'Match Finished', 'FT', 'Etihad Stadium', 'Manchester', 2, 1, 1, 0),
(1002, 39, 2024, 'Regular Season - 15', '2024-12-15 17:30:00+00', 40, 47, 'Match Finished', 'FT', 'Anfield', 'Liverpool', 3, 1, 2, 1),
(1003, 39, 2024, 'Regular Season - 15', '2024-12-14 12:30:00+00', 42, 49, 'Match Finished', 'FT', 'Emirates Stadium', 'London', 1, 2, 0, 1),
(1004, 39, 2024, 'Regular Season - 15', '2024-12-14 15:00:00+00', 34, 66, 'Match Finished', 'FT', 'St James Park', 'Newcastle', 2, 0, 1, 0),

-- Live Matches (in progress)
(1005, 39, 2024, 'Regular Season - 16', NOW() - INTERVAL '45 minutes', 48, 35, 'Second Half', '2H', 'London Stadium', 'London', 1, 1, 0, 1),
(1006, 140, 2024, 'Regular Season - 16', NOW() - INTERVAL '30 minutes', 541, 529, 'Second Half', '2H', 'Santiago Bernabéu', 'Madrid', 0, 1, 0, 1),

-- Upcoming Matches (today and tomorrow)
(1007, 39, 2024, 'Regular Season - 16', NOW() + INTERVAL '3 hours', 33, 40, 'Not Started', 'NS', 'Old Trafford', 'Manchester', NULL, NULL, NULL, NULL),
(1008, 39, 2024, 'Regular Season - 16', NOW() + INTERVAL '1 day', 49, 50, 'Not Started', 'NS', 'Stamford Bridge', 'London', NULL, NULL, NULL, NULL),
(1009, 140, 2024, 'Regular Season - 16', NOW() + INTERVAL '1 day 2 hours', 530, 532, 'Not Started', 'NS', 'Wanda Metropolitano', 'Madrid', NULL, NULL, NULL, NULL),
(1010, 135, 2024, 'Regular Season - 16', NOW() + INTERVAL '2 days', 489, 487, 'Not Started', 'NS', 'San Siro', 'Milan', NULL, NULL, NULL, NULL),

-- Champions League
(1011, 2, 2024, 'Round of 16', NOW() + INTERVAL '3 days', 541, 50, 'Not Started', 'NS', 'Santiago Bernabéu', 'Madrid', NULL, NULL, NULL, NULL),
(1012, 2, 2024, 'Round of 16', NOW() + INTERVAL '4 days', 529, 42, 'Not Started', 'NS', 'Camp Nou', 'Barcelona', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  home_goals = EXCLUDED.home_goals,
  away_goals = EXCLUDED.away_goals,
  status_long = EXCLUDED.status_long,
  status_short = EXCLUDED.status_short;

-- ===============================================
-- LEAGUE STANDINGS (Premier League Sample)
-- ===============================================
INSERT INTO standings (league_id, season, team_id, rank, points, goals_diff, form, played, win, draw, lose, goals_for, goals_against) VALUES
(39, 2024, 40, 1, 35, 21, 'WWDWW', 15, 11, 2, 2, 32, 11),
(39, 2024, 42, 2, 33, 18, 'WWLWW', 15, 10, 3, 2, 29, 11),
(39, 2024, 50, 3, 32, 15, 'WLWWW', 15, 10, 2, 3, 28, 13),
(39, 2024, 49, 4, 28, 8, 'DWLWW', 15, 8, 4, 3, 25, 17),
(39, 2024, 33, 5, 27, 5, 'LWWDL', 15, 8, 3, 4, 22, 17),
(39, 2024, 47, 6, 24, 3, 'DDWLL', 15, 7, 3, 5, 24, 21),
(39, 2024, 34, 7, 23, 2, 'WLDWW', 15, 7, 2, 6, 23, 21),
(39, 2024, 66, 8, 22, 0, 'LLWDW', 15, 6, 4, 5, 20, 20),
(39, 2024, 48, 9, 21, -2, 'LDWLD', 15, 6, 3, 6, 18, 20),
(39, 2024, 35, 10, 19, -5, 'DLLWL', 15, 5, 4, 6, 17, 22)
ON CONFLICT (league_id, season, team_id) DO UPDATE SET
  rank = EXCLUDED.rank,
  points = EXCLUDED.points,
  goals_diff = EXCLUDED.goals_diff,
  form = EXCLUDED.form;

-- ===============================================
-- SAMPLE PREDICTIONS (Premium Feature)
-- ===============================================
INSERT INTO predictions (fixture_id, winner_id, winner_comment, home_percentage, draw_percentage, away_percentage, goals_home, goals_away, under_over, advice, confidence_score) VALUES
(1007, 40, 'Liverpool favored based on current form and home advantage', 35.5, 28.2, 36.3, 1.8, 2.1, 'Over 2.5', 'Liverpool slight favorites but close match expected', 72),
(1008, 50, 'Manchester City expected to dominate possession and create chances', 58.7, 24.1, 17.2, 2.3, 1.2, 'Over 2.5', 'City strong favorites with superior squad depth', 84),
(1009, 530, 'Atletico Madrid solid at home with defensive strength', 42.8, 31.5, 25.7, 1.6, 1.1, 'Under 2.5', 'Tight defensive battle expected', 67),
(1011, 541, 'Real Madrid slight edge in Champions League experience', 48.3, 26.4, 25.3, 2.0, 1.7, 'Over 2.5', 'Classic encounter with both teams capable of scoring', 78),
(1012, 529, 'Barcelona strong at Camp Nou with attacking firepower', 51.2, 25.8, 23.0, 2.4, 1.8, 'Over 2.5', 'Barcelona favorites with home advantage', 73)
ON CONFLICT (fixture_id) DO UPDATE SET
  home_percentage = EXCLUDED.home_percentage,
  draw_percentage = EXCLUDED.draw_percentage,
  away_percentage = EXCLUDED.away_percentage,
  confidence_score = EXCLUDED.confidence_score;

-- ===============================================
-- TEST USER PROFILES (for development)
-- ===============================================
-- Note: These will be created when users sign up through your app
-- This is just sample data structure for reference

COMMIT;

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================
-- Run these to verify your data loaded correctly:

-- Check leagues
SELECT name, country_name, current_season FROM leagues ORDER BY name;

-- Check teams
SELECT name, venue_name, venue_city FROM teams ORDER BY name LIMIT 10;

-- Check fixtures
SELECT 
  f.id,
  ht.name as home_team,
  at.name as away_team,
  f.date,
  f.status_short,
  f.home_goals,
  f.away_goals
FROM fixtures f
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id
ORDER BY f.date DESC
LIMIT 10;

-- Check standings
SELECT 
  t.name as team,
  s.rank,
  s.points,
  s.form
FROM standings s
JOIN teams t ON s.team_id = t.id
WHERE s.league_id = 39
ORDER BY s.rank
LIMIT 10;