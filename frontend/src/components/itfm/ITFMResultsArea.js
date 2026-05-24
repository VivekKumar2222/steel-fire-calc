import React, { useState } from 'react';
import ITFMChart from './ITFMChart';
import ITFMFormulas from './ITFMFormulas';

const TABS = [
  { id: 'Graph',    label: '📈 Graph' },
];

export default function ITFMResultsArea({ results, inputs, updateInput }) {
  const [activeTab, setActiveTab] = useState('Graph');
  const [showFormulas, setShowFormulas] = useState(false);

  if (!results) {
    return (
      <div className="results-card">
        <div className="empty-state">
          <div className="empty-icon">🔥</div>
          <div className="empty-title">No Results Yet</div>
          <div className="empty-desc">
            Enter compartment geometry and fire parameters. The graph updates automatically.
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
            className={`tab-btn ${activeTab===tab.id?'active':''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
        <button
          className="tab-btn"
          style={{ marginLeft: 'auto', fontSize: '0.72rem', opacity: 0.65 }}
          onClick={() => {
            setShowFormulas(f => !f);
            if (!showFormulas) setActiveTab('Formulas');
            else if (activeTab === 'Formulas') setActiveTab('Graph');
          }}
          title={showFormulas ? 'Hide Formula Workings' : 'Show Formula Workings'}
        >
          {showFormulas ? '🧮 Hide' : '🧮 Formulas'}
        </button>
      </div>

      <div className="tab-panel">
        {activeTab === 'Graph' && (
          <ITFMChart
            results={results.results}
            fireProps={results.fireProps}
            x_position={parseFloat(inputs.x_position)}
            L={parseFloat(inputs.L)}
            onPositionChange={val => updateInput('x_position', val)}
          />
        )}
        {showFormulas && activeTab === 'Formulas' && (
          <ITFMFormulas results={results} inputs={inputs} />
        )}
      </div>
    </div>
  );
}
