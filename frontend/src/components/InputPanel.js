import React from 'react';
import SectionDiagram from './SectionDiagram';
import SectionProps from './SectionProps';
import SectionPicker from './SectionPicker';

const NumericField = ({ label, symbol, unit, name, value, onChange, step, min }) => (
  <div className="field">
    <label>
      <span className="symbol">{symbol}</span>
      {label}
      <span className="unit">{unit}</span>
    </label>
    <div className="input-wrap">
      <input
        type="number"
        value={value}
        step={step || 'any'}
        min={min || 0}
        onChange={e => onChange(name, e.target.value)}
      />
    </div>
  </div>
);

export default function InputPanel({ inputs, updateInput, results, loading, error, onCalculate }) {

  function handleSectionSelect(section) {
    updateInput('h',  section.h);
    updateInput('b',  section.b);
    updateInput('tw', section.tw);
    updateInput('tf', section.tf);
    updateInput('r1', section.r1);
  }

  return (
    <aside className="sidebar">
      {/* Fire Protection */}
      <div className="input-section">
        <div className="section-label">Fire Protection Data</div>
        <NumericField label="Specific Heat"         symbol="Cp"  unit="J/kg·K" name="Cp"      value={inputs.Cp}      onChange={updateInput} step="10" />
        <NumericField label="Protection Thickness"  symbol="dp"  unit="m"      name="dp"      value={inputs.dp}      onChange={updateInput} step="0.001" min="0.001" />
        <NumericField label="Thermal Conductivity"  symbol="λp"  unit="W/m·K"  name="lambdaP" value={inputs.lambdaP} onChange={updateInput} step="0.001" min="0.001" />
        <NumericField label="Density of Protection" symbol="ρp"  unit="kg/m³"  name="rhoP"    value={inputs.rhoP}    onChange={updateInput} step="10" min="1" />
      </div>

      {/* Exposure */}
      <div className="input-section">
        <div className="section-label">Exposure</div>
        <div className="toggle-group">
          {['All Sides', 'Three Sides'].map(opt => (
            <button
              key={opt}
              className={`toggle-btn ${inputs.exposure === opt ? 'active' : ''}`}
              onClick={() => updateInput('exposure', opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Section Geometry */}
      <div className="input-section">
        <div className="section-label">I-Section Geometry</div>

        {/* Standard section picker */}
        <div style={{ marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Load standard section
          </div>
          <SectionPicker onSelect={handleSectionSelect} />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-muted)', fontSize: '0.65rem', margin: '0.25rem 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          or enter manually
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <SectionDiagram exposure={inputs.exposure} />

        <div className="field-row">
          <NumericField label="Height"       symbol="h"  unit="mm" name="h"  value={inputs.h}  onChange={updateInput} />
          <NumericField label="Width"        symbol="b"  unit="mm" name="b"  value={inputs.b}  onChange={updateInput} />
        </div>
        <div className="field-row">
          <NumericField label="Web thick."   symbol="tw" unit="mm" name="tw" value={inputs.tw} onChange={updateInput} step="0.1" />
          <NumericField label="Flange thick." symbol="tf" unit="mm" name="tf" value={inputs.tf} onChange={updateInput} step="0.1" />
        </div>
        <NumericField   label="Root Radius"  symbol="r1" unit="mm" name="r1" value={inputs.r1} onChange={updateInput} step="0.5" />
      </div>

      {/* Error */}
      {error && (
        <div className="error-alert">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Status */}
      <div className="calc-status">
        {loading
          ? <><div className="spinner" style={{ borderTopColor: 'var(--accent-blue)', borderColor: 'rgba(56,139,253,0.2)' }} /> <span>Computing…</span></>
          : <><span className="status-dot" /> <span>Auto-calculating</span></>
        }
      </div>

      {/* Section Properties */}
      {results && <SectionProps props={results.sectionProps} />}
    </aside>
  );
}
