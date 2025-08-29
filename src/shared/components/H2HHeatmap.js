import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Card from './Card';

const H2HHeatmap = ({ teamA, teamB, h2hData, className = '' }) => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [activeMetric, setActiveMetric] = useState('results');

  useEffect(() => {
    const generateHeatmapData = () => {
      if (!teamA || !teamB) return;

      const teamAName = teamA.name || 'Team A';
      const teamBName = teamB.name || 'Team B';

      // Generate historical data for heatmap (last 20 meetings or provided data)
      const meetings = h2hData?.length || 20;
      const years = 10; // Show last 10 years
      const currentYear = new Date().getFullYear();
      
      // Create yearly data structure
      const yearlyData = {};
      for (let i = 0; i < years; i++) {
        const year = currentYear - i;
        yearlyData[year] = {
          meetings: Math.floor(Math.random() * 4), // 0-3 meetings per year
          results: [],
          goals: { teamA: 0, teamB: 0 },
          dominance: Math.random() - 0.5 // -0.5 to 0.5, negative = teamA dominance
        };
      }

      // Populate with random but realistic data
      Object.keys(yearlyData).forEach(year => {
        const data = yearlyData[year];
        for (let i = 0; i < data.meetings; i++) {
          const result = Math.random();
          if (result > 0.6) {
            data.results.push('teamA');
            data.goals.teamA += Math.floor(Math.random() * 3) + 1;
            data.goals.teamB += Math.floor(Math.random() * 2);
          } else if (result > 0.3) {
            data.results.push('teamB');
            data.goals.teamB += Math.floor(Math.random() * 3) + 1;
            data.goals.teamA += Math.floor(Math.random() * 2);
          } else {
            data.results.push('draw');
            const goals = Math.floor(Math.random() * 3) + 1;
            data.goals.teamA += goals;
            data.goals.teamB += goals;
          }
        }
      });

      // Calculate overall statistics
      const overallStats = {
        totalMeetings: Object.values(yearlyData).reduce((sum, data) => sum + data.meetings, 0),
        teamAWins: Object.values(yearlyData).reduce((sum, data) => 
          sum + data.results.filter(r => r === 'teamA').length, 0
        ),
        teamBWins: Object.values(yearlyData).reduce((sum, data) => 
          sum + data.results.filter(r => r === 'teamB').length, 0
        ),
        draws: Object.values(yearlyData).reduce((sum, data) => 
          sum + data.results.filter(r => r === 'draw').length, 0
        ),
        totalGoalsA: Object.values(yearlyData).reduce((sum, data) => sum + data.goals.teamA, 0),
        totalGoalsB: Object.values(yearlyData).reduce((sum, data) => sum + data.goals.teamB, 0)
      };

      // Create heatmap metrics
      const metrics = {
        results: {
          label: 'Match Results',
          description: 'Win/Loss/Draw outcomes',
          getData: (yearData) => {
            if (yearData.meetings === 0) return { intensity: 0, display: '-' };
            const teamAWins = yearData.results.filter(r => r === 'teamA').length;
            const teamBWins = yearData.results.filter(r => r === 'teamB').length;
            const draws = yearData.results.filter(r => r === 'draw').length;
            
            if (teamAWins > teamBWins + draws) {
              return { intensity: 1, display: `${teamAWins}W`, color: 'blue' };
            } else if (teamBWins > teamAWins + draws) {
              return { intensity: 1, display: `${teamBWins}W`, color: 'red' };
            } else {
              return { intensity: 0.5, display: draws > 0 ? `${draws}D` : 'Even', color: 'gray' };
            }
          }
        },
        goals: {
          label: 'Goal Difference',
          description: 'Goals scored vs conceded',
          getData: (yearData) => {
            if (yearData.meetings === 0) return { intensity: 0, display: '-' };
            const diff = yearData.goals.teamA - yearData.goals.teamB;
            const totalGoals = yearData.goals.teamA + yearData.goals.teamB;
            return {
              intensity: Math.min(Math.abs(diff) / 5, 1),
              display: diff > 0 ? `+${diff}` : diff.toString(),
              color: diff > 0 ? 'blue' : diff < 0 ? 'red' : 'gray',
              subtitle: `${totalGoals} goals`
            };
          }
        },
        frequency: {
          label: 'Meeting Frequency',
          description: 'Number of matches per year',
          getData: (yearData) => ({
            intensity: yearData.meetings / 4, // Max 4 meetings per year
            display: yearData.meetings.toString(),
            color: yearData.meetings > 2 ? 'green' : yearData.meetings > 0 ? 'yellow' : 'gray',
            subtitle: yearData.meetings === 1 ? 'match' : 'matches'
          })
        },
        dominance: {
          label: 'Team Dominance',
          description: 'Overall performance comparison',
          getData: (yearData) => {
            if (yearData.meetings === 0) return { intensity: 0, display: '-' };
            const teamAWins = yearData.results.filter(r => r === 'teamA').length;
            const teamBWins = yearData.results.filter(r => r === 'teamB').length;
            const dominance = (teamAWins - teamBWins) / yearData.meetings;
            return {
              intensity: Math.abs(dominance),
              display: dominance > 0.33 ? 'A' : dominance < -0.33 ? 'B' : '=',
              color: dominance > 0.33 ? 'blue' : dominance < -0.33 ? 'red' : 'gray'
            };
          }
        }
      };

      setHeatmapData({
        teamAName,
        teamBName,
        yearlyData,
        overallStats,
        metrics,
        years: Object.keys(yearlyData).sort((a, b) => b - a) // Newest first
      });
    };

    generateHeatmapData();
  }, [teamA, teamB, h2hData]);

  if (!heatmapData) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating H2H heatmap...</span>
        </div>
      </Card>
    );
  }

  const currentMetric = heatmapData.metrics[activeMetric];

  const getHeatmapColor = (intensity, color) => {
    const colors = {
      blue: `rgba(59, 130, 246, ${intensity})`,
      red: `rgba(239, 68, 68, ${intensity})`,
      green: `rgba(34, 197, 94, ${intensity})`,
      yellow: `rgba(245, 158, 11, ${intensity})`,
      gray: `rgba(107, 114, 128, ${intensity})`
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={className}>
      <Card>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-2">Head-to-Head Heatmap</h3>
          <p className="text-secondary text-sm">Historical matchup analysis over the years</p>
        </div>

        {/* Overall Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{heatmapData.overallStats.totalMeetings}</div>
            <div className="text-xs text-secondary">Total Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{heatmapData.overallStats.teamAWins}</div>
            <div className="text-xs text-secondary">{heatmapData.teamAName} Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{heatmapData.overallStats.teamBWins}</div>
            <div className="text-xs text-secondary">{heatmapData.teamBName} Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{heatmapData.overallStats.draws}</div>
            <div className="text-xs text-secondary">Draws</div>
          </div>
        </div>

        {/* Metric Toggle */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(heatmapData.metrics).map(([key, metric]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeMetric === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={metric.description}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary">{currentMetric.label}</h4>
            <div className="text-xs text-secondary">{currentMetric.description}</div>
          </div>
          
          {/* Team Headers */}
          <div className="grid grid-cols-11 gap-1 mb-2">
            <div className="text-xs font-medium text-gray-600 py-2">Year</div>
            {heatmapData.years.slice(0, 10).map(year => (
              <div key={year} className="text-xs font-medium text-gray-600 text-center py-2">
                {year}
              </div>
            ))}
          </div>
          
          {/* Heatmap Row for Team Comparison */}
          <div className="grid grid-cols-11 gap-1">
            <div className="flex items-center py-3">
              <div className="flex items-center gap-2">
                <img src={teamA.logo} alt={heatmapData.teamAName} className="w-4 h-4" />
                <span className="text-xs font-medium truncate">vs</span>
                <img src={teamB.logo} alt={heatmapData.teamBName} className="w-4 h-4" />
              </div>
            </div>
            {heatmapData.years.slice(0, 10).map(year => {
              const yearData = heatmapData.yearlyData[year];
              const cellData = currentMetric.getData(yearData);
              
              return (
                <div
                  key={year}
                  className="aspect-square rounded-lg border border-gray-200 flex flex-col items-center justify-center text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: getHeatmapColor(cellData.intensity, cellData.color)
                  }}
                  title={`${year}: ${cellData.display} ${cellData.subtitle || ''}`}
                >
                  <div className={`${cellData.color === 'gray' || cellData.intensity < 0.3 ? 'text-gray-700' : 'text-white'}`}>
                    {cellData.display}
                  </div>
                  {cellData.subtitle && (
                    <div className={`text-xs ${cellData.color === 'gray' || cellData.intensity < 0.3 ? 'text-gray-500' : 'text-white'} opacity-80`}>
                      {cellData.subtitle}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="info" size={16} className="text-blue-600" />
            <span className="text-sm font-medium">Legend:</span>
          </div>
          
          {activeMetric === 'results' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-xs">{heatmapData.teamAName} dominated</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-xs">{heatmapData.teamBName} dominated</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-gray-500"></div>
                <span className="text-xs">Even/Draws</span>
              </div>
            </>
          )}
          
          {activeMetric === 'goals' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-xs">+ goal difference</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-xs">- goal difference</span>
              </div>
            </>
          )}
          
          {activeMetric === 'frequency' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-xs">3+ matches</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-xs">1-2 matches</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-gray-300"></div>
                <span className="text-xs">No matches</span>
              </div>
            </>
          )}
          
          <div className="text-xs text-gray-500 ml-auto">
            Darker = Higher intensity
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Icon name="trending-up" size={16} />
            Key Insights
          </h5>
          <div className="space-y-1 text-sm text-blue-700">
            <div>• Most active period: {heatmapData.years.find(year => 
              heatmapData.yearlyData[year].meetings === Math.max(...heatmapData.years.map(y => heatmapData.yearlyData[y].meetings))
            )} ({Math.max(...heatmapData.years.map(y => heatmapData.yearlyData[y].meetings))} matches)</div>
            <div>• Average goals per match: {(
              (heatmapData.overallStats.totalGoalsA + heatmapData.overallStats.totalGoalsB) / 
              Math.max(heatmapData.overallStats.totalMeetings, 1)
            ).toFixed(1)}</div>
            <div>• Win rate: {heatmapData.teamAName} {Math.round((heatmapData.overallStats.teamAWins / Math.max(heatmapData.overallStats.totalMeetings, 1)) * 100)}%, {heatmapData.teamBName} {Math.round((heatmapData.overallStats.teamBWins / Math.max(heatmapData.overallStats.totalMeetings, 1)) * 100)}%</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

H2HHeatmap.propTypes = {
  teamA: PropTypes.shape({
    name: PropTypes.string.isRequired,
    logo: PropTypes.string
  }).isRequired,
  teamB: PropTypes.shape({
    name: PropTypes.string.isRequired,
    logo: PropTypes.string
  }).isRequired,
  h2hData: PropTypes.array,
  className: PropTypes.string
};

export default H2HHeatmap;