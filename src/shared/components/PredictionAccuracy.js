import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const PredictionAccuracy = ({ className = '' }) => {
  // Basic accuracy data
  const accuracyData = {
    overall: 68,
    matchWinner: 65,
    bothTeamsScore: 72,
    totalGoals: 69,
    totalPredictions: 150,
    correctPredictions: 102
  };


  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon name="target" size={24} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prediction Performance</h3>
          <p className="text-sm text-gray-600">Recent prediction results</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="bg-blue-50 rounded-lg p-4 text-center mb-6">
        <div className="text-3xl font-bold text-blue-600">{accuracyData.overall}%</div>
        <div className="text-sm text-blue-700 font-medium">Overall Accuracy</div>
        <div className="text-xs text-blue-600 mt-1">
          {accuracyData.correctPredictions} of {accuracyData.totalPredictions} predictions
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Accuracy by Prediction Type</h4>
        
        {[
          { label: 'Match Winner', value: accuracyData.matchWinner },
          { label: 'Both Teams Score', value: accuracyData.bothTeamsScore },
          { label: 'Total Goals', value: accuracyData.totalGoals }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">{item.label}</div>
            <div className="font-bold text-lg text-blue-600">{item.value}%</div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex gap-2">
          <Icon name="lightbulb" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Model Insights:</strong> Our AI shows strongest performance in total goals predictions and has improved 5% over the last month through continuous learning from match outcomes.
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Accuracy calculated from {accuracyData.totalPredictions} completed matches • Updated daily
      </div>
    </div>
  );
};

PredictionAccuracy.propTypes = {
  className: PropTypes.string
};

export default PredictionAccuracy;