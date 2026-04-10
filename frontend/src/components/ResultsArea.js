import React, { useState } from 'react';
import TemperatureChart from './TemperatureChart';
import DataTable from './DataTable';
import FormulaWorkings from './FormulaWorkings';

const TABS = [
  { id: 'Graph',    label: '📈 Graph' },
  { id: 'Table',    label: '📋 Data Table' },
  { id: 'Formulas', label: '🧮 Formula Workings' },
];

export default function ResultsArea({ results, inputs }) {
  const [activeTab, setActiveTab] = useState('Graph');

  if (!results) {
    return (
      <div className="results-card">
        <div className="empty-state">
          <div className="empty-icon">🔥</div>
          <div className="empty-title">No Results Yet</div>
          <div className="empty-desc">
            Enter your section geometry and fire protection parameters, then click Calculate.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-card">
      {/* Tab bar — always visible, never scrolls away */}
      <div className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel — fills remaining height, scrolls only for Formula Workings */}
      <div className="tab-panel">
        {activeTab === 'Graph' && (
          <TemperatureChart results={results.results} />
        )}
        {activeTab === 'Table' && (
          <DataTable results={results.results} isPremium={false} inputs={inputs} />
        )}
        {activeTab === 'Formulas' && (
          <FormulaWorkings results={results} inputs={inputs} />
        )}
      </div>
    </div>
  );
}
