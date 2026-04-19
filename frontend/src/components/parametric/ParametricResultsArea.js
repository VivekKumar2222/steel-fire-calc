import React, { useState } from 'react';
import ParametricChart   from './ParametricChart';
import ParametricTable   from './ParametricTable';
import ParametricFormulas from './ParametricFormulas';

const TABS = [
  { id: 'Graph',    label: '📈 Graph' },
  { id: 'Table',    label: '📋 Data Table' },
  { id: 'Formulas', label: '🧮 Formula Workings' },
];

export default function ParametricResultsArea({ results, inputs }) {
  const [activeTab, setActiveTab] = useState('Graph');

  if (!results) {
    return (
      <div className="results-card">
        <div className="empty-state">
          <div className="empty-icon">🔥</div>
          <div className="empty-title">No Results Yet</div>
          <div className="empty-desc">
            Enter your compartment geometry and fire parameters, then the graph will appear automatically.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-card">
      <div className="tab-bar">
        {TABS.map(tab => (
          <button key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-panel">
        {activeTab === 'Graph' && (
          <ParametricChart
            results={results.results}
            tmax_min={results.compartmentProps?.tmax_min}
          />
        )}
        {activeTab === 'Table' && (
          <ParametricTable
            results={results.results}
            isPremium={false}
            inputs={inputs}
          />
        )}
        {activeTab === 'Formulas' && (
          <ParametricFormulas results={results} inputs={inputs} />
        )}
      </div>
    </div>
  );
}
