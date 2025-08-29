// ===============================================
// DATA SEEDING UTILITY
// Populate database with sample data programmatically
// ===============================================

import { supabase } from '../config/supabase';

export class DataSeeder {
  constructor() {
    this.results = {
      leagues: { status: 'pending', count: 0, errors: [] },
      teams: { status: 'pending', count: 0, errors: [] },
      fixtures: { status: 'pending', count: 0, errors: [] },
      standings: { status: 'pending', count: 0, errors: [] },
      predictions: { status: 'pending', count: 0, errors: [] }
    };
  }

  async seedAllData() {
    console.log('🌱 Starting data seeding...');
    
    try {
      await this.seedLeagues();
      await this.seedTeams();  
      await this.seedFixtures();
      await this.seedStandings();
      await this.seedPredictions();
      
      console.log('✅ Data seeding completed successfully');
      return this.results;
    } catch (error) {
      console.error('❌ Data seeding failed:', error);
      throw error;
    }
  }

  async seedLeagues() {
    try {
      console.log('📊 Seeding leagues...');
      
      const leagues = [
        {
          id: 39,
          name: 'Premier League',
          type: 'League',
          country_name: 'England',
          country_code: 'GB',
          current_season: 2024,
          logo_url: 'https://media.api-sports.io/football/leagues/39.png',
          start_date: '2024-08-01',
          end_date: '2025-05-31'
        },
        {
          id: 140,
          name: 'La Liga',
          type: 'League',
          country_name: 'Spain',
          country_code: 'ES',
          current_season: 2024,
          logo_url: 'https://media.api-sports.io/football/leagues/140.png',
          start_date: '2024-08-01',
          end_date: '2025-05-31'
        },
        {
          id: 135,
          name: 'Serie A',
          type: 'League',
          country_name: 'Italy',
          country_code: 'IT',
          current_season: 2024,
          logo_url: 'https://media.api-sports.io/football/leagues/135.png',
          start_date: '2024-08-01',
          end_date: '2025-05-31'
        },
        {
          id: 78,
          name: 'Bundesliga',
          type: 'League',
          country_name: 'Germany',
          country_code: 'DE',
          current_season: 2024,
          logo_url: 'https://media.api-sports.io/football/leagues/78.png',
          start_date: '2024-08-01',
          end_date: '2025-05-31'
        },
        {
          id: 61,
          name: 'Ligue 1',
          type: 'League',
          country_name: 'France',
          country_code: 'FR',
          current_season: 2024,
          logo_url: 'https://media.api-sports.io/football/leagues/61.png',
          start_date: '2024-08-01',
          end_date: '2025-05-31'
        },
        {
          id: 2,
          name: 'Champions League',
          type: 'Cup',
          country_name: 'World',
          country_code: 'EU',
          current_season: 2024,
          logo_url: 'https://media.api-sports.io/football/leagues/2.png',
          start_date: '2024-09-01',
          end_date: '2025-06-01'
        }
      ];

      const { data: _data, error } = await supabase
        .from('leagues')
        .upsert(leagues, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      this.results.leagues = {
        status: 'success',
        count: leagues.length,
        errors: []
      };

      console.log(`✅ Seeded ${leagues.length} leagues`);
    } catch (error) {
      console.error('❌ League seeding failed:', error);
      this.results.leagues = {
        status: 'error',
        count: 0,
        errors: [error.message]
      };
    }
  }

  async seedTeams() {
    try {
      console.log('⚽ Seeding teams...');

      const teams = [
        // Premier League
        { id: 33, name: 'Manchester United', code: 'MUN', logo_url: 'https://media.api-sports.io/football/teams/33.png', country_name: 'England', venue_name: 'Old Trafford', venue_city: 'Manchester', venue_capacity: 76000 },
        { id: 40, name: 'Liverpool', code: 'LIV', logo_url: 'https://media.api-sports.io/football/teams/40.png', country_name: 'England', venue_name: 'Anfield', venue_city: 'Liverpool', venue_capacity: 54000 },
        { id: 50, name: 'Manchester City', code: 'MCI', logo_url: 'https://media.api-sports.io/football/teams/50.png', country_name: 'England', venue_name: 'Etihad Stadium', venue_city: 'Manchester', venue_capacity: 55000 },
        { id: 42, name: 'Arsenal', code: 'ARS', logo_url: 'https://media.api-sports.io/football/teams/42.png', country_name: 'England', venue_name: 'Emirates Stadium', venue_city: 'London', venue_capacity: 60000 },
        { id: 49, name: 'Chelsea', code: 'CHE', logo_url: 'https://media.api-sports.io/football/teams/49.png', country_name: 'England', venue_name: 'Stamford Bridge', venue_city: 'London', venue_capacity: 41000 },
        { id: 47, name: 'Tottenham', code: 'TOT', logo_url: 'https://media.api-sports.io/football/teams/47.png', country_name: 'England', venue_name: 'Tottenham Hotspur Stadium', venue_city: 'London', venue_capacity: 62000 },
        
        // La Liga
        { id: 541, name: 'Real Madrid', code: 'RMA', logo_url: 'https://media.api-sports.io/football/teams/541.png', country_name: 'Spain', venue_name: 'Santiago Bernabéu', venue_city: 'Madrid', venue_capacity: 81000 },
        { id: 529, name: 'Barcelona', code: 'BAR', logo_url: 'https://media.api-sports.io/football/teams/529.png', country_name: 'Spain', venue_name: 'Camp Nou', venue_city: 'Barcelona', venue_capacity: 99000 },
        { id: 530, name: 'Atletico Madrid', code: 'ATM', logo_url: 'https://media.api-sports.io/football/teams/530.png', country_name: 'Spain', venue_name: 'Wanda Metropolitano', venue_city: 'Madrid', venue_capacity: 68000 },
        
        // Bundesliga
        { id: 157, name: 'Bayern Munich', code: 'BAY', logo_url: 'https://media.api-sports.io/football/teams/157.png', country_name: 'Germany', venue_name: 'Allianz Arena', venue_city: 'Munich', venue_capacity: 75000 },
        { id: 165, name: 'Borussia Dortmund', code: 'BVB', logo_url: 'https://media.api-sports.io/football/teams/165.png', country_name: 'Germany', venue_name: 'Signal Iduna Park', venue_city: 'Dortmund', venue_capacity: 81000 },
        
        // Serie A
        { id: 489, name: 'AC Milan', code: 'MIL', logo_url: 'https://media.api-sports.io/football/teams/489.png', country_name: 'Italy', venue_name: 'San Siro', venue_city: 'Milan', venue_capacity: 80000 },
        { id: 505, name: 'Inter', code: 'INT', logo_url: 'https://media.api-sports.io/football/teams/505.png', country_name: 'Italy', venue_name: 'San Siro', venue_city: 'Milan', venue_capacity: 80000 },
        { id: 496, name: 'Juventus', code: 'JUV', logo_url: 'https://media.api-sports.io/football/teams/496.png', country_name: 'Italy', venue_name: 'Allianz Stadium', venue_city: 'Turin', venue_capacity: 41000 },
        
        // Ligue 1
        { id: 85, name: 'Paris Saint Germain', code: 'PSG', logo_url: 'https://media.api-sports.io/football/teams/85.png', country_name: 'France', venue_name: 'Parc des Princes', venue_city: 'Paris', venue_capacity: 48000 }
      ];

      const { data: _data, error } = await supabase
        .from('teams')
        .upsert(teams, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      this.results.teams = {
        status: 'success',
        count: teams.length,
        errors: []
      };

      console.log(`✅ Seeded ${teams.length} teams`);
    } catch (error) {
      console.error('❌ Team seeding failed:', error);
      this.results.teams = {
        status: 'error',
        count: 0,
        errors: [error.message]
      };
    }
  }

  async seedFixtures() {
    try {
      console.log('🗓️ Seeding fixtures...');

      const now = new Date();
      const fixtures = [
        // Live match
        {
          id: 1001,
          league_id: 39,
          season: 2024,
          round: 'Regular Season - 16',
          date: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          home_team_id: 40,
          away_team_id: 33,
          status_long: 'Second Half',
          status_short: '2H',
          venue_name: 'Anfield',
          venue_city: 'Liverpool',
          home_goals: 2,
          away_goals: 1,
          home_goals_halftime: 1,
          away_goals_halftime: 1
        },
        // Upcoming matches
        {
          id: 1002,
          league_id: 39,
          season: 2024,
          round: 'Regular Season - 16',
          date: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
          home_team_id: 50,
          away_team_id: 42,
          status_long: 'Not Started',
          status_short: 'NS',
          venue_name: 'Etihad Stadium',
          venue_city: 'Manchester'
        },
        {
          id: 1003,
          league_id: 140,
          season: 2024,
          round: 'Regular Season - 16',
          date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
          home_team_id: 541,
          away_team_id: 529,
          status_long: 'Not Started',
          status_short: 'NS',
          venue_name: 'Santiago Bernabéu',
          venue_city: 'Madrid'
        },
        // Finished match
        {
          id: 1004,
          league_id: 39,
          season: 2024,
          round: 'Regular Season - 15',
          date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
          home_team_id: 49,
          away_team_id: 47,
          status_long: 'Match Finished',
          status_short: 'FT',
          venue_name: 'Stamford Bridge',
          venue_city: 'London',
          home_goals: 1,
          away_goals: 2,
          home_goals_halftime: 0,
          away_goals_halftime: 1
        }
      ];

      const { data: _data, error } = await supabase
        .from('fixtures')
        .upsert(fixtures, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      this.results.fixtures = {
        status: 'success',
        count: fixtures.length,
        errors: []
      };

      console.log(`✅ Seeded ${fixtures.length} fixtures`);
    } catch (error) {
      console.error('❌ Fixture seeding failed:', error);
      this.results.fixtures = {
        status: 'error',
        count: 0,
        errors: [error.message]
      };
    }
  }

  async seedStandings() {
    try {
      console.log('🏆 Seeding standings...');

      const standings = [
        // Premier League standings (top 6)
        { league_id: 39, season: 2024, team_id: 40, rank: 1, points: 38, goals_diff: 23, form: 'WWWWL', played: 16, win: 12, draw: 2, lose: 2, goals_for: 35, goals_against: 12 },
        { league_id: 39, season: 2024, team_id: 42, rank: 2, points: 36, goals_diff: 20, form: 'WWLWW', played: 16, win: 11, draw: 3, lose: 2, goals_for: 32, goals_against: 12 },
        { league_id: 39, season: 2024, team_id: 50, rank: 3, points: 35, goals_diff: 18, form: 'WLWWW', played: 16, win: 11, draw: 2, lose: 3, goals_for: 31, goals_against: 13 },
        { league_id: 39, season: 2024, team_id: 49, rank: 4, points: 31, goals_diff: 11, form: 'DWLWW', played: 16, win: 9, draw: 4, lose: 3, goals_for: 28, goals_against: 17 },
        { league_id: 39, season: 2024, team_id: 33, rank: 5, points: 30, goals_diff: 8, form: 'LWWDL', played: 16, win: 9, draw: 3, lose: 4, goals_for: 25, goals_against: 17 },
        { league_id: 39, season: 2024, team_id: 47, rank: 6, points: 27, goals_diff: 5, form: 'DDWLL', played: 16, win: 8, draw: 3, lose: 5, goals_for: 27, goals_against: 22 }
      ];

      const { data: _data, error } = await supabase
        .from('standings')
        .upsert(standings, { 
          onConflict: 'league_id,season,team_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      this.results.standings = {
        status: 'success',
        count: standings.length,
        errors: []
      };

      console.log(`✅ Seeded ${standings.length} standings`);
    } catch (error) {
      console.error('❌ Standing seeding failed:', error);
      this.results.standings = {
        status: 'error',
        count: 0,
        errors: [error.message]
      };
    }
  }

  async seedPredictions() {
    try {
      console.log('🎯 Seeding predictions...');

      const predictions = [
        {
          fixture_id: 1002,
          winner_id: 50,
          winner_comment: 'Manchester City favored with superior squad depth',
          home_percentage: 58.7,
          draw_percentage: 24.1,
          away_percentage: 17.2,
          goals_home: 2.3,
          goals_away: 1.2,
          under_over: 'Over 2.5',
          advice: 'City strong favorites at home',
          confidence_score: 84
        },
        {
          fixture_id: 1003,
          winner_id: 541,
          winner_comment: 'Real Madrid slight edge in El Clasico',
          home_percentage: 48.3,
          draw_percentage: 26.4,
          away_percentage: 25.3,
          goals_home: 2.0,
          goals_away: 1.7,
          under_over: 'Over 2.5',
          advice: 'Classic encounter with both teams capable of scoring',
          confidence_score: 78
        }
      ];

      const { data: _data, error } = await supabase
        .from('predictions')
        .upsert(predictions, { 
          onConflict: 'fixture_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      this.results.predictions = {
        status: 'success',
        count: predictions.length,
        errors: []
      };

      console.log(`✅ Seeded ${predictions.length} predictions`);
    } catch (error) {
      console.error('❌ Prediction seeding failed:', error);
      this.results.predictions = {
        status: 'error',
        count: 0,
        errors: [error.message]
      };
    }
  }

  async clearAllData() {
    console.log('🗑️ Clearing existing data...');
    
    const tables = ['predictions', 'standings', 'fixtures', 'teams', 'leagues'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 0); // Delete all records
        
        if (error) {
          console.warn(`Warning: Could not clear ${table}:`, error.message);
        }
      } catch (error) {
        console.warn(`Warning: Could not clear ${table}:`, error.message);
      }
    }
  }

  getResults() {
    return this.results;
  }

  getSummary() {
    const total = Object.values(this.results).reduce((sum, result) => {
      return sum + (result.count || 0);
    }, 0);

    const errors = Object.values(this.results).reduce((all, result) => {
      return all.concat(result.errors || []);
    }, []);

    return {
      totalRecords: total,
      totalErrors: errors.length,
      success: errors.length === 0,
      details: this.results
    };
  }
}

export default new DataSeeder();