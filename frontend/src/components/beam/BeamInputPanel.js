import React from 'react';

const Field = ({ label, symbol, unit, name, value, onChange, step, min, max }) => (
  <div className="field">
    <label>
      {symbol && <span className="symbol">{symbol}</span>}
      {label}
      {unit && <span className="unit"> {unit}</span>}
    </label>
    <div className="input-wrap">
      <input
        type="number" value={value} step={step || 'any'} min={min} max={max}
        onChange={e => onChange(name, e.target.value)}
      />
    </div>
  </div>
);

const UNIT_SETS = {
  SI:  { length: 'm',  force: 'kN',  moment: 'kN·m', E: 'GPa', I: 'm⁴',  udl: 'kN/m',  deflection: 'mm' },
  NMM: { length: 'mm', force: 'N',   moment: 'N·mm', E: 'MPa', I: 'mm⁴', udl: 'N/mm',  deflection: 'mm' },
};

export default function BeamInputPanel({
  inputs, updateInput,
  supports, addSupport, updateSupport, removeSupport,
  loads,   addLoad,    updateLoad,    removeLoad,
  results, loading, error,
}) {
  const U = UNIT_SETS[inputs.unitsKey] || UNIT_SETS.SI;
  const L = parseFloat(inputs.lengthInput) || 8;

  const peakV = results?.ok ? Math.max(...results.diagram.map(p => Math.abs(p.V))) : null;
  const peakM = results?.ok ? Math.max(...results.diagram.map(p => Math.abs(p.M))) : null;

  return (
    <aside className="sidebar">

      {/* Units */}
      <div className="input-section">
        <div className="section-label">Unit System</div>
        <div className="toggle-group">
          {Object.keys(UNIT_SETS).map(key => (
            <button key={key}
              className={`toggle-btn ${inputs.unitsKey === key ? 'active' : ''}`}
              onClick={() => updateInput('unitsKey', key)}>
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Beam Properties */}
      <div className="input-section">
        <div className="section-label">Beam Properties</div>
        <Field label="Length"         symbol="L" unit={U.length}   name="lengthInput" value={inputs.lengthInput} onChange={updateInput} step="0.5" min="0.1" />
        <Field label="Young's Modulus" symbol="E" unit={U.E}        name="EInput"      value={inputs.EInput}      onChange={updateInput} step="1"   min="0.001" />
        <Field label="Moment of Inertia" symbol="I" unit={U.I}      name="IInput"      value={inputs.IInput}      onChange={updateInput} step="any" min="0.000001" />
      </div>

      {/* Supports */}
      <div className="input-section">
        <div className="section-label">Supports</div>

        {supports.length === 0 && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            No supports — beam is unstable
          </div>
        )}

        {supports.map((s, i) => (
          <div key={s.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-premium)' }}>
                {{ pin: '△ Pin', roller: '○ Roller', fixed: '▪ Fixed' }[s.type]} — S{i + 1}
              </span>
              <button onClick={() => removeSupport(s.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1,
              }}>✕</button>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Type</label>
                <div className="input-wrap">
                  <select value={s.type}
                    onChange={e => updateSupport(s.id, 'type', e.target.value)}
                    style={{ width: '100%', padding: '0.35rem 0.4rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                    <option value="pin">Pin</option>
                    <option value="roller">Roller</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>
              <Field label={`Position (${U.length})`} value={s.x}
                name="x" onChange={(_, v) => updateSupport(s.id, 'x', v)}
                step="0.1" min="0" max={L} />
            </div>
          </div>
        ))}

        <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
          <button className="toggle-btn" onClick={() => addSupport('pin')}>+ Pin</button>
          <button className="toggle-btn" onClick={() => addSupport('roller')}>+ Roller</button>
          <button className="toggle-btn" onClick={() => addSupport('fixed')}>+ Fixed</button>
        </div>
      </div>

      {/* Loads */}
      <div className="input-section">
        <div className="section-label">Loads</div>

        {loads.length === 0 && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            No loads added
          </div>
        )}

        {loads.map(ld => (
          <div key={ld.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)' }}>
                {{ point: '↓ Point Load', moment: '↻ Moment', udl: '▬ UDL', uvl: '◁ UVL' }[ld.type]}
              </span>
              <button onClick={() => removeLoad(ld.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1,
              }}>✕</button>
            </div>

            {/* Load type selector */}
            <div className="field" style={{ marginBottom: '0.4rem' }}>
              <div className="input-wrap">
                <select value={ld.type}
                  onChange={e => updateLoad(ld.id, 'type', e.target.value)}
                  style={{ width: '100%', padding: '0.35rem 0.4rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                  <option value="point">Point Load</option>
                  <option value="udl">UDL</option>
                  <option value="uvl">UVL / Trapezoidal</option>
                  <option value="moment">Applied Moment</option>
                </select>
              </div>
            </div>

            {ld.type === 'point' && (
              <div className="field-row">
                <Field label={`x (${U.length})`} value={ld.x} name="x" onChange={(_, v) => updateLoad(ld.id, 'x', v)} step="0.1" min="0" max={L} />
                <Field label={`P ↓ (${U.force})`} value={ld.P} name="P" onChange={(_, v) => updateLoad(ld.id, 'P', v)} step="1" />
              </div>
            )}

            {ld.type === 'moment' && (
              <div className="field-row">
                <Field label={`x (${U.length})`} value={ld.x} name="x" onChange={(_, v) => updateLoad(ld.id, 'x', v)} step="0.1" min="0" max={L} />
                <Field label={`M (${U.moment})`} value={ld.M} name="M" onChange={(_, v) => updateLoad(ld.id, 'M', v)} step="1" />
              </div>
            )}

            {ld.type === 'udl' && (
              <>
                <div className="field-row">
                  <Field label={`From (${U.length})`} value={ld.x}  name="x"  onChange={(_, v) => updateLoad(ld.id, 'x',  v)} step="0.1" min="0" max={L} />
                  <Field label={`To (${U.length})`}   value={ld.x2} name="x2" onChange={(_, v) => updateLoad(ld.id, 'x2', v)} step="0.1" min="0" max={L} />
                </div>
                <Field label={`w ↓ (${U.udl})`} value={ld.w1} name="w1" onChange={(_, v) => { updateLoad(ld.id, 'w1', v); updateLoad(ld.id, 'w2', v); }} step="0.5" />
              </>
            )}

            {ld.type === 'uvl' && (
              <>
                <div className="field-row">
                  <Field label={`From (${U.length})`} value={ld.x}  name="x"  onChange={(_, v) => updateLoad(ld.id, 'x',  v)} step="0.1" min="0" max={L} />
                  <Field label={`To (${U.length})`}   value={ld.x2} name="x2" onChange={(_, v) => updateLoad(ld.id, 'x2', v)} step="0.1" min="0" max={L} />
                </div>
                <div className="field-row">
                  <Field label={`w₁ ↓ (${U.udl})`} value={ld.w1} name="w1" onChange={(_, v) => updateLoad(ld.id, 'w1', v)} step="0.5" />
                  <Field label={`w₂ ↓ (${U.udl})`} value={ld.w2} name="w2" onChange={(_, v) => updateLoad(ld.id, 'w2', v)} step="0.5" />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
          <button className="toggle-btn" onClick={() => addLoad('point')}>+ Point</button>
          <button className="toggle-btn" onClick={() => addLoad('moment')}>+ Moment</button>
          <button className="toggle-btn" onClick={() => addLoad('udl')}>+ UDL</button>
          <button className="toggle-btn" onClick={() => addLoad('uvl')}>+ UVL</button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="error-alert"><span>⚠</span><span>{error}</span></div>}

      {/* Status */}
      <div className="calc-status">
        {loading
          ? <><div className="spinner" style={{ borderTopColor: 'var(--accent-blue)', borderColor: 'rgba(56,139,253,0.2)' }} /><span>Computing…</span></>
          : <><span className="status-dot" /><span>Auto-calculating</span></>
        }
      </div>

      {/* Peak results */}
      {results?.ok && (
        <div className="input-section">
          <div className="section-label" style={{ color: 'var(--success)' }}>Peak Results</div>
          <div className="props-grid">
            {[
              ['V_max', 'Max Shear',   peakV?.toFixed(3), U.force],
              ['M_max', 'Max Moment',  peakM?.toFixed(3), U.moment],
            ].map(([sym, lbl, val, u]) => (
              <div className="prop-item" key={sym}>
                <div className="prop-label">{lbl}</div>
                <div className="prop-value">{val}<span className="prop-unit"> {u}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
