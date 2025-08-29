import React from 'react';
import PropTypes from 'prop-types';

const ProbabilityWheel = ({ 
  homeTeam, 
  awayTeam, 
  homeWinProbability, 
  drawProbability, 
  awayWinProbability,
  size = 200 
}) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  
  // Convert percentages to stroke-dash values
  const homeStroke = (homeWinProbability / 100) * circumference;
  const drawStroke = (drawProbability / 100) * circumference;
  const awayStroke = (awayWinProbability / 100) * circumference;
  
  // Calculate starting positions for each segment
  const homeStart = 0;
  const drawStart = homeStroke;
  const awayStart = homeStroke + drawStroke;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
          />
          
          {/* Home team segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${homeStroke} ${circumference - homeStroke}`}
            strokeDashoffset={-homeStart}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Draw segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${drawStroke} ${circumference - drawStroke}`}
            strokeDashoffset={-drawStart}
            className="transition-all duration-1000 ease-out"
            style={{ transitionDelay: '200ms' }}
          />
          
          {/* Away team segment */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${awayStroke} ${circumference - awayStroke}`}
            strokeDashoffset={-awayStart}
            className="transition-all duration-1000 ease-out"
            style={{ transitionDelay: '400ms' }}
          />
          
          {/* Center text */}
          <text
            x={size / 2}
            y={size / 2 - 10}
            textAnchor="middle"
            className="fill-gray-900 text-sm font-bold transform rotate-90"
            style={{ fontSize: '14px' }}
          >
            Win
          </text>
          <text
            x={size / 2}
            y={size / 2 + 10}
            textAnchor="middle"
            className="fill-gray-600 text-xs transform rotate-90"
            style={{ fontSize: '12px' }}
          >
            Probability
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 space-y-2 w-full max-w-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">{homeTeam} Win</span>
          </div>
          <span className="text-sm font-bold text-blue-600">{homeWinProbability}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Draw</span>
          </div>
          <span className="text-sm font-bold text-green-600">{drawProbability}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">{awayTeam} Win</span>
          </div>
          <span className="text-sm font-bold text-red-600">{awayWinProbability}%</span>
        </div>
      </div>
    </div>
  );
};

ProbabilityWheel.propTypes = {
  homeTeam: PropTypes.string.isRequired,
  awayTeam: PropTypes.string.isRequired,
  homeWinProbability: PropTypes.number.isRequired,
  drawProbability: PropTypes.number.isRequired,
  awayWinProbability: PropTypes.number.isRequired,
  size: PropTypes.number
};

export default ProbabilityWheel;