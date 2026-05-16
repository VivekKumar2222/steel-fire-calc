import React, { useState } from 'react';
import RebarChart   from './RebarChart';
import RebarTable   from './RebarTable';
import RebarDiagram from './RebarDiagram';
import RebarFormulas from './RebarFormulas';

const TABS = [
  { id: 'Graph',    label: '📈 Graph' },
  { id: 'Table',    label: '📋 Data Table' },
  { id: 'Diagram',  label: '🏗️ Cross-Section' },
  { id: 'Formulas', label: '🧮 Formula Workings' },
];

export default function RebarResultsArea({ results, inputs }) {
  const [activeTab, setActiveTab] = useState('Graph');

  if (!results) {
    return (
      <div className="results-card">
        <div className="empty-state">
          <div className="empty-icon">🔥</div>
          <div className="empty-title">No Results Yet</div>
          <div className="empty-desc">
            Enter slab geometry and concrete properties. Results update automatically.
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
      </div>

      <div className="tab-panel">
        {activeTab === 'Graph'    && <RebarChart   results={results.results} />}
        {activeTab === 'Table'    && <RebarTable   results={results.results} inputs={inputs} />}
        {activeTab === 'Diagram'  && <RebarDiagram inputs={inputs} finalProfile={results.finalProfile} />}
        {activeTab === 'Formulas' && <RebarFormulas results={results} inputs={inputs} />}
      </div>
    </div>
  );
}
