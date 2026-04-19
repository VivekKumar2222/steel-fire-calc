import React from 'react';
import SectionPicker from '../SectionPicker';
import SectionDiagram from '../SectionDiagram';

const Field = ({ label, symbol, unit, name, value, onChange, step, min, type='number' }) => (
  <div className="field">
    <label>
      {symbol && <span className="symbol">{symbol}</span>}
      {label}
      {unit && <span className="unit">{unit}</span>}
    </label>
    <div className="input-wrap">
      <input type={type} value={value} step={step||'any'} min={min||0}
        onChange={e => onChange(name, e.target.value)} />
    </div>
  </div>
);

const FIRE_MODES = ['Slow','Medium','Fast'];
const MATERIALS  = ['Heavy Bricks','Normal Bricks','LW Concrete','NW Concrete','Gypsum Plasterboard','Glass'];
const EXPOSURES  = ['All Sides','Three Sides'];

export default function ParametricInputPanel({ inputs, updateInput, results, loading, error }) {

  function handleSectionSelect(sec) {
    ['h','b','tw','tf','r1'].forEach(k => updateInput(k, sec[k]));
  }

  const cp = results?.compartmentProps;

  return (
    <aside className="sidebar">

      {/* Compartment Geometry */}
      <div className="input-section">
        <div className="section-label">Compartment Geometry</div>
        <div className="field-row">
          <Field label="Width" symbol="B" unit="m" name="B_room" value={inputs.B_room} onChange={updateInput} step="0.5" min="1"/>
          <Field label="Depth" symbol="H" unit="m" name="H_room" value={inputs.H_room} onChange={updateInput} step="0.5" min="1"/>
        </div>
        <Field label="Compartment Height" symbol="Hc" unit="m" name="H_comp" value={inputs.H_comp} onChange={updateInput} step="0.1" min="1"/>
      </div>

      {/* Openings */}
      <div className="input-section">
        <div className="section-label">Openings</div>
        <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:'0.4rem'}}>Doors</div>
        <div className="field-row">
          <Field label="Count" symbol="n" unit="" name="n_doors" value={inputs.n_doors} onChange={updateInput} step="1" min="0"/>
          <Field label="Width" symbol="W" unit="m" name="W_door" value={inputs.W_door} onChange={updateInput} step="0.1"/>
        </div>
        <Field label="Height" symbol="H" unit="m" name="H_door" value={inputs.H_door} onChange={updateInput} step="0.1"/>
        <div style={{fontSize:'0.7rem',color:'var(--text-muted)',margin:'0.5rem 0 0.4rem'}}>Windows</div>
        <div className="field-row">
          <Field label="Count" symbol="n" unit="" name="n_windows" value={inputs.n_windows} onChange={updateInput} step="1" min="0"/>
          <Field label="Width" symbol="W" unit="m" name="W_win" value={inputs.W_win} onChange={updateInput} step="0.1"/>
        </div>
        <Field label="Height" symbol="H" unit="m" name="H_win" value={inputs.H_win} onChange={updateInput} step="0.1"/>
      </div>

      {/* Fire Load */}
      <div className="input-section">
        <div className="section-label">Design Fire Load</div>
        <div className="field">
          <label>Fire Growth Rate</label>
          <div className="toggle-group">
            {FIRE_MODES.map(m => (
              <button key={m} className={`toggle-btn ${inputs.fire_mode===m?'active':''}`}
                onClick={() => updateInput('fire_mode', m)}>{m}</button>
            ))}
          </div>
        </div>
        <Field label="Char. fire load qf,k" symbol="qf,k" unit="MJ/m²" name="qfk" value={inputs.qfk} onChange={updateInput} step="10" min="1"/>
        <div className="field-row">
          <Field label="Occupancy δq2" symbol="δq2" unit="" name="dq2" value={inputs.dq2} onChange={updateInput} step="0.1"/>
          <Field label="Active δn" symbol="δn" unit="" name="dn" value={inputs.dn} onChange={updateInput} step="0.1"/>
        </div>
      </div>

      {/* Wall Materials */}
      <div className="input-section">
        <div className="section-label">Compartment Materials</div>
        <div className="field">
          <label>Wall material</label>
          <div className="input-wrap">
            <select value={inputs.wall_material}
              onChange={e => updateInput('wall_material', e.target.value)}
              style={{width:'100%',background:'var(--bg-input)',border:'1px solid var(--border)',
                borderRadius:'var(--radius)',color:'var(--text-primary)',padding:'0.5rem 0.75rem',
                fontSize:'0.82rem',fontFamily:'Space Mono,monospace'}}>
              {MATERIALS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Roof / Floor material</label>
          <div className="input-wrap">
            <select value={inputs.roof_material}
              onChange={e => updateInput('roof_material', e.target.value)}
              style={{width:'100%',background:'var(--bg-input)',border:'1px solid var(--border)',
                borderRadius:'var(--radius)',color:'var(--text-primary)',padding:'0.5rem 0.75rem',
                fontSize:'0.82rem',fontFamily:'Space Mono,monospace'}}>
              {MATERIALS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Fire Protection */}
      <div className="input-section">
        <div className="section-label">Fire Protection</div>
        <Field label="Specific Heat" symbol="Cp" unit="J/kg·K" name="Cp" value={inputs.Cp} onChange={updateInput} step="10"/>
        <Field label="Thickness" symbol="dp" unit="m" name="dp" value={inputs.dp} onChange={updateInput} step="0.001" min="0.001"/>
        <Field label="Conductivity" symbol="λp" unit="W/m·K" name="lambdaP" value={inputs.lambdaP} onChange={updateInput} step="0.001" min="0.001"/>
        <Field label="Density" symbol="ρp" unit="kg/m³" name="rhoP" value={inputs.rhoP} onChange={updateInput} step="10" min="1"/>
      </div>

      {/* Section Geometry */}
      <div className="input-section">
        <div className="section-label">I-Section Geometry</div>
        <div className="field">
          <label style={{fontSize:'0.7rem',color:'var(--text-secondary)'}}>Exposure</label>
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
          <Field label="Height" symbol="h" unit="mm" name="h" value={inputs.h} onChange={updateInput}/>
          <Field label="Width"  symbol="b" unit="mm" name="b" value={inputs.b} onChange={updateInput}/>
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

      {/* Compartment Results */}
      {cp && (
        <div className="input-section">
          <div className="section-label" style={{color:'var(--success)'}}>Compartment Results</div>
          <div className="props-grid">
            {[
              ['Af','Floor Area',cp.Af,'m²'],
              ['Av','Vent Area',cp.Av,'m²'],
              ['O','Opening Factor',cp.O,'m½'],
              ['b','Thermal Inertia',cp.b_thermal,'J/m²s½K'],
              ['qt,d','Design Load',cp.qtd,'MJ/m²'],
              ['tmax','Peak Time',cp.tmax_min,'min'],
              ['Γ','Gamma',cp.Gamma,''],
              ['θg,max','Max Gas Temp',cp.theta_g_max,'°C'],
            ].map(([sym,lab,val,unit]) => (
              <div className="prop-item" key={sym}>
                <div className="prop-label">{lab}</div>
                <div className="prop-value">{val}<span className="prop-unit"> {unit}</span></div>
              </div>
            ))}
          </div>
          <div style={{fontSize:'0.72rem',padding:'0.4rem 0.5rem',background:'var(--bg-input)',
            border:'1px solid var(--border)',borderRadius:'var(--radius)',
            color: cp.fire_type.includes('Vent') ? 'var(--color-gas)' : 'var(--success)'}}>
            🔥 {cp.fire_type} · Eq. {cp.cool_eq}
          </div>
        </div>
      )}

    </aside>
  );
}
