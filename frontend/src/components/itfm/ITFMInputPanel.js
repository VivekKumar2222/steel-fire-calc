import React from 'react';
import SectionPicker from '../SectionPicker';
import SectionDiagram from '../SectionDiagram';

const Field = ({ label, symbol, unit, name, value, onChange, step, min }) => (
  <div className="field">
    <label>
      {symbol && <span className="symbol">{symbol}</span>}
      {label}
      {unit && <span className="unit">{unit}</span>}
    </label>
    <div className="input-wrap">
      <input type="number" value={value} step={step||'any'} min={min||0}
        onChange={e => onChange(name, e.target.value)} />
    </div>
  </div>
);

const EXPOSURES = ['All Sides', 'Three Sides'];

export default function ITFMInputPanel({ inputs, updateInput, results, loading, error }) {

  function handleSectionSelect(sec) {
    ['h','b','tw','tf','r1'].forEach(k => updateInput(k, sec[k]));
  }

  const fp = results?.fireProps;

  return (
    <aside className="sidebar">

      {/* Compartment */}
      <div className="input-section">
        <div className="section-label">Compartment</div>
        <div className="field-row">
          <Field label="Width"  symbol="W" unit="m" name="WIDTH"  value={inputs.WIDTH}  onChange={updateInput} step="0.5" min="1"/>
          <Field label="Height" symbol="H" unit="m" name="HEIGHT" value={inputs.HEIGHT} onChange={updateInput} step="0.1" min="1"/>
        </div>
        <Field label="Compartment Length" symbol="L" unit="m" name="L" value={inputs.L} onChange={updateInput} step="5" min="10"/>
      </div>

      {/* Fire Parameters */}
      <div className="input-section">
        <div className="section-label">Fire Parameters</div>
        <Field label="Fire Size Ratio" symbol="FSIZE" unit="-" name="FSIZE" value={inputs.FSIZE} onChange={updateInput} step="0.01" min="0.01"/>
        <Field label="Heat Release Rate" symbol="QII" unit="kW/m²" name="QII" value={inputs.QII} onChange={updateInput} step="10" min="1"/>
        <Field label="Fire Load" symbol="QF" unit="kJ/m²" name="QF" value={inputs.QF} onChange={updateInput} step="10000" min="1"/>
        <div className="field-row">
          <Field label="Room Temp" symbol="T₀" unit="°C" name="T_ROOM" value={inputs.T_ROOM} onChange={updateInput} step="1"/>
          <Field label="Near Field" symbol="TNF" unit="°C" name="T_NF" value={inputs.T_NF} onChange={updateInput} step="10"/>
        </div>
        <Field label="Flame Angle" symbol="θ" unit="deg" name="FANGLE" value={inputs.FANGLE} onChange={updateInput} step="0.5"/>
      </div>

      {/* Fire Protection */}
      <div className="input-section">
        <div className="section-label">Fire Protection</div>
        <Field label="Specific Heat" symbol="Cp"  unit="J/kg·K" name="Cp"      value={inputs.Cp}      onChange={updateInput} step="10"/>
        <Field label="Thickness"     symbol="dp"  unit="m"      name="dp"      value={inputs.dp}      onChange={updateInput} step="0.001" min="0.001"/>
        <Field label="Conductivity"  symbol="λp"  unit="W/m·K"  name="lambdaP" value={inputs.lambdaP} onChange={updateInput} step="0.001" min="0.001"/>
        <Field label="Density"       symbol="ρp"  unit="kg/m³"  name="rhoP"    value={inputs.rhoP}    onChange={updateInput} step="10"   min="1"/>
      </div>

      {/* Section */}
      <div className="input-section">
        <div className="section-label">I-Section Geometry</div>
        <div className="field">
          <label>Exposure</label>
          <div className="toggle-group">
            {EXPOSURES.map(e => (
              <button key={e} className={`toggle-btn ${inputs.exposure===e?'active':''}`}
                onClick={() => updateInput('exposure', e)}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'0.25rem'}}>
          <div style={{fontSize:'0.7rem',color:'var(--text-secondary)',marginBottom:'0.4rem'}}>Load standard section</div>
          <SectionPicker onSelect={handleSectionSelect}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',color:'var(--text-muted)',fontSize:'0.65rem',margin:'0.25rem 0'}}>
          <div style={{flex:1,height:'1px',background:'var(--border)'}}/>or enter manually
          <div style={{flex:1,height:'1px',background:'var(--border)'}}/>
        </div>
        <SectionDiagram exposure={inputs.exposure}/>
        <div className="field-row">
          <Field label="Height" symbol="h"  unit="mm" name="h"  value={inputs.h}  onChange={updateInput}/>
          <Field label="Width"  symbol="b"  unit="mm" name="b"  value={inputs.b}  onChange={updateInput}/>
        </div>
        <div className="field-row">
          <Field label="Web"    symbol="tw" unit="mm" name="tw" value={inputs.tw} onChange={updateInput} step="0.1"/>
          <Field label="Flange" symbol="tf" unit="mm" name="tf" value={inputs.tf} onChange={updateInput} step="0.1"/>
        </div>
        <Field label="Root Radius" symbol="r1" unit="mm" name="r1" value={inputs.r1} onChange={updateInput} step="0.5"/>
      </div>

      {/* Error */}
      {error && <div className="error-alert"><span>⚠</span><span>{error}</span></div>}

      {/* Status */}
      <div className="calc-status">
        {loading
          ? <><div className="spinner" style={{borderTopColor:'var(--accent-blue)',borderColor:'rgba(56,139,253,0.2)'}}/><span>Computing…</span></>
          : <><span className="status-dot"/><span>Auto-calculating</span></>
        }
      </div>

      {/* Derived Fire Properties */}
      {fp && (
        <div className="input-section">
          <div className="section-label" style={{color:'var(--success)'}}>Computed Fire Properties</div>
          <div className="props-grid">
            {[
              ['TB',      'Burn Duration',    fp.TB_min,     'min'],
              ['TTOTAL',  'Total Duration',   fp.TTOTAL_min, 'min'],
              ['LF',      'Fire Length',      fp.LF,         'm'],
              ['S',       'Spread Speed',     fp.S_mm_s,     'mm/s'],
              ['T_NF',    'Near-Field Temp',  fp.T_NF,       '°C'],
              ['Q',       'Peak HRR',         fp.Q_kW,       'kW'],
            ].map(([sym,lab,val,unit]) => (
              <div className="prop-item" key={sym}>
                <div className="prop-label">{lab}</div>
                <div className="prop-value">{val}<span className="prop-unit"> {unit}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
