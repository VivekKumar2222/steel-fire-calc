import React, { useState } from 'react';
import BeamChart  from './BeamChart';
import BeamTable  from './BeamTable';
import BeamSketch from './BeamSketch';

const TABS = [
  { id: 'SFD',       label: '📊 Shear Force' },
  { id: 'BMD',       label: '📈 Bending Moment' },
  { id: 'Deflection',label: '↕️ Deflection' },
  { id: 'Table',     label: '📋 Data Table' },
];

const CHART_MAP = { SFD: 'sfd', BMD: 'bmd', Deflection: 'def' };

export default function BeamResultsArea({ results, inputs, supports, loads }) {
  const [activeTab, setActiveTab] = useState('SFD');

  if (!results?.ok) {
    return (
      <div className="results-card">
        {results?.warnings?.length ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {results.warnings.map((w, i) => (
              <div key={i} className="error-alert"><span>⚠</span><span>{w}</span></div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📐</div>
            <div className="empty-title">No Results Yet</div>
            <div className="empty-desc">
              Configure beam length, supports and loads. Results update automatically.
            </div>
          </div>
        )}
      </div>
    );
  }

  const U_SETS = {
    SI:  { fromBase: { F: 1/1000, M: 1/1000, def: 1000 }, force: 'kN', moment: 'kN·m', deflection: 'mm' },
    NMM: { fromBase: { F: 1,      M: 1000,   def: 1000 }, force: 'N',  moment: 'N·mm',  deflection: 'mm' },
  };
  const U = U_SETS[inputs.unitsKey] || U_SETS.SI;

  const peakV = Math.max(...results.diagram.map(p => Math.abs(p.V))) * U.fromBase.F;
  const peakM = Math.max(...results.diagram.map(p => Math.abs(p.M))) * U.fromBase.M;
  const peakD = Math.max(...results.diagram.map(p => Math.abs(p.d))) * U.fromBase.def;

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

        {/* ── Beam sketch always shown at top of diagram tabs ── */}
        {['SFD', 'BMD', 'Deflection'].includes(activeTab) && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Beam diagram
            </div>
            <BeamSketch
              lengthInput={inputs.lengthInput}
              supports={supports}
              loads={loads}
              reactions={results.reactions}
              unitsKey={inputs.unitsKey}
            />
          </div>
        )}

        {/* ── Peak summary ── */}
        {['SFD', 'BMD', 'Deflection'].includes(activeTab) && (
          <div className="props-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1rem' }}>
            {[
              ['V_max', 'Max Shear',   peakV.toFixed(3), U.force],
              ['M_max', 'Max Moment',  peakM.toFixed(3), U.moment],
              ['δ_max', 'Max Deflect', peakD.toFixed(4), U.deflection],
            ].map(([sym, lbl, val, u]) => (
              <div className="prop-item" key={sym}>
                <div className="prop-label">{lbl}</div>
                <div className="prop-value">{val}<span className="prop-unit"> {u}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* ── Chart ── */}
        {activeTab in CHART_MAP && (
          <BeamChart
            diagram={results.diagram}
            unitsKey={inputs.unitsKey}
            activeChart={CHART_MAP[activeTab]}
          />
        )}

        {/* ── Table ── */}
        {activeTab === 'Table' && (
          <BeamTable
            diagram={results.diagram}
            reactions={results.reactions}
            unitsKey={inputs.unitsKey}
          />
        )}

      </div>
    </div>
  );
}
