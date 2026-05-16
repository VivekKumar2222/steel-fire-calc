import React, { useRef } from 'react';

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

export default function RebarInputPanel({ inputs, updateInput, results, loading, error }) {
  const fileRef = useRef(null);
  const dp = results?.derivedProps;

  function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const lines = ev.target.result.trim().split('\n');
        const rows = lines.slice(1).map(l => {
          const [ts, tg] = l.split(',').map(x => parseFloat(x.trim()));
          return { timeSec: ts, Tg: tg };
        }).filter(r => !isNaN(r.timeSec) && !isNaN(r.Tg));
        if (rows.length < 2) throw new Error('Need at least 2 rows');
        updateInput('customTg', rows);
        updateInput('isoMode', 'custom');
      } catch(err) {
        alert('CSV error: ' + err.message + '\nExpected format: timeSec,Tg');
      }
    };
    reader.readAsText(file);
  }

  return (
    <aside className="sidebar">

      {/* Slab geometry */}
      <div className="input-section">
        <div className="section-label">Slab Geometry</div>
        <Field label="Slab Depth"        symbol="Z"  unit="m" name="Z"  value={inputs.Z}  onChange={updateInput} step="0.01" min="0.05"/>
        <Field label="Rebar Cover Depth" symbol="zr" unit="m" name="zr" value={inputs.zr} onChange={updateInput} step="0.005" min="0.005"/>
      </div>

      {/* Concrete thermal properties */}
      <div className="input-section">
        <div className="section-label">Concrete Properties</div>
        <Field label="Density"        symbol="ρ"  unit="kg/m³"  name="rho" value={inputs.rho} onChange={updateInput} step="50" min="1"/>
        <Field label="Specific Heat"  symbol="c"  unit="J/kg·K" name="c_p" value={inputs.c_p} onChange={updateInput} step="10" min="1"/>
        <Field label="Conductivity"   symbol="k"  unit="W/m·K"  name="k"   value={inputs.k}   onChange={updateInput} step="0.1" min="0.1"/>
        <div className="field-row">
          <Field label="Convection h" symbol="h"  unit="W/m²·K" name="h_c" value={inputs.h_c} onChange={updateInput} step="1"/>
          <Field label="Emissivity"   symbol="ε"  unit="-"      name="eps" value={inputs.eps} onChange={updateInput} step="0.05"/>
        </div>
        <Field label="Ambient / Initial Temp" symbol="T₀" unit="°C" name="T_amb" value={inputs.T_amb} onChange={updateInput} step="1"/>
      </div>

      {/* Discretisation */}
      <div className="input-section">
        <div className="section-label">Discretisation</div>
        <div className="field-row">
          <Field label="Time step" symbol="Δt" unit="s" name="dt" value={inputs.dt} onChange={updateInput} step="1" min="1"/>
          <Field label="Space step" symbol="Δz" unit="m" name="dz" value={inputs.dz} onChange={updateInput} step="0.005" min="0.005"/>
        </div>
        <Field label="Total Duration" symbol="T" unit="s" name="totalDuration" value={inputs.totalDuration} onChange={updateInput} step="300" min="60"/>

        {/* Stability indicator */}
        {dp && (
          <div style={{
            padding:'0.5rem 0.75rem', borderRadius:'var(--radius)',
            background: dp.stable ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
            border: `1px solid ${dp.stable ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
            fontSize:'0.75rem',
            color: dp.stable ? 'var(--success)' : 'var(--danger)',
          }}>
            {dp.stable ? '✓' : '✗'} Fo = {dp.Fo} — {dp.stable ? 'Stable' : 'UNSTABLE — reduce Δt'}
          </div>
        )}
      </div>

      {/* ISO Gas Temperature */}
      <div className="input-section">
        <div className="section-label">Gas Temperature (ISO)</div>
        <div className="toggle-group">
          <button className={`toggle-btn ${inputs.isoMode==='auto'?'active':''}`}
            onClick={() => updateInput('isoMode','auto')}>Auto ISO 834</button>
          <button className={`toggle-btn ${inputs.isoMode==='custom'?'active':''}`}
            onClick={() => updateInput('isoMode','custom')}>Custom CSV</button>
        </div>

        {inputs.isoMode === 'auto' && (
          <div style={{fontSize:'0.72rem',color:'var(--text-secondary)',padding:'0.4rem 0'}}>
            Uses ISO 834: Tg = T₀ + 345 × log₁₀(8t + 1)
          </div>
        )}

        {inputs.isoMode === 'custom' && (
          <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
            <div style={{fontSize:'0.72rem',color:'var(--text-secondary)'}}>
              Upload a CSV with two columns: <span style={{fontFamily:'Space Mono',fontSize:'0.68rem'}}>timeSec,Tg</span>
            </div>
            <button className="calc-btn" style={{padding:'0.45rem'}}
              onClick={() => fileRef.current?.click()}>
              📂 Upload CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}}
              onChange={handleCSVUpload}/>
            {inputs.customTg.length > 0 && (
              <div style={{fontSize:'0.72rem',color:'var(--success)'}}>
                ✓ {inputs.customTg.length} rows loaded (t={inputs.customTg[0].timeSec}s – {inputs.customTg[inputs.customTg.length-1].timeSec}s)
              </div>
            )}
            <button style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.7rem',cursor:'pointer',textAlign:'left'}}
              onClick={() => { updateInput('customTg',[]); updateInput('isoMode','auto'); }}>
              ✕ Clear &amp; use ISO 834
            </button>
          </div>
        )}
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

      {/* Derived props */}
      {dp && (
        <div className="input-section">
          <div className="section-label" style={{color:'var(--success)'}}>Computed Properties</div>
          <div className="props-grid">
            {[
              ['N',     'Layers',         dp.N,     ''],
              ['Fo',    'Fourier No.',     dp.Fo,    ''],
              ['i_low', 'Rebar Node',      dp.i_low, ''],
              ['f',     'Interp. Fraction',dp.f,     ''],
            ].map(([sym,lab,val,unit]) => (
              <div className="prop-item" key={sym}>
                <div className="prop-label">{lab}</div>
                <div className="prop-value">{val}{unit && <span className="prop-unit"> {unit}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
