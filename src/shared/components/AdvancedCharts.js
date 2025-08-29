// ===============================================
// ADVANCED CHARTS COMPONENT
// Premium analytics charts for elite users
// ===============================================

import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

// Simple chart component using CSS for visualization
const BarChart = ({ data, title, color = 'indigo' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const colorClasses = {
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-xs text-gray-600 truncate">
              {item.label}
            </div>
            <div className="flex-1 mx-2">
              <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div 
                  className={`${colorClasses[color]} h-4 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs font-medium text-gray-700">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data, title, color = 'indigo' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const colorClasses = {
    indigo: 'stroke-indigo-500',
    cyan: 'stroke-cyan-500',
    green: 'stroke-green-500',
    amber: 'stroke-amber-500',
    red: 'stroke-red-500'
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="relative h-32 bg-gray-50 rounded-lg p-4">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={colorClasses[color]}
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 60 - ((point.value - minValue) / range) * 60;
              return `${x},${y}`;
            }).join(' ')}
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 60 - ((point.value - minValue) / range) * 60;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                className={colorClasses[color].replace('stroke', 'fill')}
              />
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {data.map((point, index) => (
            <span key={index} className="truncate">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;


  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="flex items-center space-x-4">
        {/* Simple donut chart using CSS */}
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full bg-gray-200">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const rotation = (cumulativePercentage / 100) * 360;
              cumulativePercentage += percentage;
              
              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from ${rotation}deg, ${
                      index === 0 ? '#6366f1' : 
                      index === 1 ? '#06b6d4' : 
                      index === 2 ? '#10b981' : 
                      index === 3 ? '#f59e0b' : '#ef4444'
                    } 0deg ${percentage}deg, transparent ${percentage}deg 360deg)`
                  }}
                />
              );
            })}
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-900">{total}</span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: 
                    index === 0 ? '#6366f1' : 
                    index === 1 ? '#06b6d4' : 
                    index === 2 ? '#10b981' : 
                    index === 3 ? '#f59e0b' : '#ef4444'
                }}
              />
              <span className="text-xs text-gray-700">{item.label}</span>
              <span className="text-xs font-medium text-gray-900">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Team Form Analysis Chart
export const TeamFormChart = ({ homeTeam, awayTeam }) => {
  // Mock data - in production, this would come from your API
  const homeForm = [
    { label: 'W', value: 3, result: 'win' },
    { label: 'L', value: 1, result: 'loss' },
    { label: 'W', value: 3, result: 'win' },
    { label: 'D', value: 1, result: 'draw' },
    { label: 'W', value: 3, result: 'win' }
  ];

  const awayForm = [
    { label: 'W', value: 3, result: 'win' },
    { label: 'W', value: 3, result: 'win' },
    { label: 'L', value: 0, result: 'loss' },
    { label: 'D', value: 1, result: 'draw' },
    { label: 'L', value: 0, result: 'loss' }
  ];

  const getFormColor = (result) => {
    switch (result) {
      case 'win': return 'bg-green-500';
      case 'draw': return 'bg-yellow-500';
      case 'loss': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Form (Last 5 Games)</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Home Team Form */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <h4 className="font-semibold text-gray-900">{homeTeam}</h4>
            <span className="text-sm text-gray-600">(Home)</span>
          </div>
          
          <div className="flex space-x-2 mb-4">
            {homeForm.map((game, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getFormColor(game.result)}`}
              >
                {game.label}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Points: {homeForm.reduce((sum, game) => sum + game.value, 0)}/15
          </div>
        </div>

        {/* Away Team Form */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <h4 className="font-semibold text-gray-900">{awayTeam}</h4>
            <span className="text-sm text-gray-600">(Away)</span>
          </div>
          
          <div className="flex space-x-2 mb-4">
            {awayForm.map((game, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getFormColor(game.result)}`}
              >
                {game.label}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Points: {awayForm.reduce((sum, game) => sum + game.value, 0)}/15
          </div>
        </div>
      </div>
    </Card>
  );
};

// Advanced Team Statistics
export const AdvancedTeamStats = ({ homeTeam, awayTeam }) => {
  // Mock statistical data
  const homeStats = [
    { label: 'Goals/Game', value: 2.1 },
    { label: 'Shots/Game', value: 14.3 },
    { label: 'Possession %', value: 58.2 },
    { label: 'Pass Accuracy', value: 84.7 }
  ];

  const awayStats = [
    { label: 'Goals/Game', value: 1.8 },
    { label: 'Shots/Game', value: 11.9 },
    { label: 'Possession %', value: 52.1 },
    { label: 'Pass Accuracy', value: 81.3 }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Advanced Statistics</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <BarChart data={homeStats} title={`${homeTeam} Stats`} color="indigo" />
        </div>
        <div>
          <BarChart data={awayStats} title={`${awayTeam} Stats`} color="cyan" />
        </div>
      </div>
    </Card>
  );
};

// Performance Trends Chart
export const PerformanceTrends = ({ teamName }) => {
  // Mock trend data
  const performanceData = [
    { label: 'Aug', value: 75 },
    { label: 'Sep', value: 82 },
    { label: 'Oct', value: 68 },
    { label: 'Nov', value: 88 },
    { label: 'Dec', value: 91 },
    { label: 'Jan', value: 85 }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Trend</h3>
      <LineChart data={performanceData} title={`${teamName} Monthly Performance Rating`} color="green" />
    </Card>
  );
};

// Match Outcome Prediction Chart
export const PredictionChart = ({ prediction }) => {
  if (!prediction) return null;

  const outcomeData = [
    { label: 'Home Win', value: parseInt(prediction.home) },
    { label: 'Draw', value: parseInt(prediction.draw) },
    { label: 'Away Win', value: parseInt(prediction.away) }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">AI Prediction Analysis</h3>
      <PieChart data={outcomeData} title="Win Probability Distribution" />
      
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-700">Confidence Score</span>
          <span className="text-2xl font-bold text-indigo-900">
            {Math.max(...outcomeData.map(d => d.value))}%
          </span>
        </div>
        <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(...outcomeData.map(d => d.value))}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

// Prop types
TeamFormChart.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired
};

AdvancedTeamStats.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired
};

PerformanceTrends.propTypes = {
  teamName: PropTypes.string.isRequired
};

PredictionChart.propTypes = {
  prediction: PropTypes.shape({
    home: PropTypes.string,
    draw: PropTypes.string,
    away: PropTypes.string
  })
};

const AdvancedCharts = {
  TeamFormChart,
  AdvancedTeamStats,
  PerformanceTrends,
  PredictionChart
};

export default AdvancedCharts;