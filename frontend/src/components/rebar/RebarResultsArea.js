import React, { useState } from 'react';
import RebarChart   from './RebarChart';
import RebarTable   from './RebarTable';
import RebarDiagram from './RebarDiagram';
import RebarFormulas from './RebarFormulas';

const TABS = [
  { id: 'Graph',    label: '📈 Graph' },
  { id: 'Table',    label: '📋 Data Table' },
  { id: 'Diagram',  label: '🏗️ Cross-Section' },
];

export default function RebarResultsArea({ results, inputs }) {
  const [activeTab, setActiveTab] = useState('Graph');
  const [showFormulas, setShowFormulas] = useState(false);

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
        {activeTab === 'Graph'    && <RebarChart   results={results.results} visibleDepths={inputs.visibleDepths || ['base','rebar']} />}
        {activeTab === 'Table'    && <RebarTable   results={results.results} inputs={inputs} visibleDepths={inputs.visibleDepths || ['base','rebar']} />}
        {activeTab === 'Diagram'  && <RebarDiagram inputs={inputs} finalProfile={results.finalProfile} />}
        {showFormulas && activeTab === 'Formulas' && <RebarFormulas results={results} inputs={inputs} />}
      </div>
    </div>
  );
}
