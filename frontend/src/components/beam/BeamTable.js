import React, { useMemo } from 'react';

const UNIT_SETS = {
  SI:  { fromBase: { F: 1/1000, M: 1/1000, def: 1000 }, force: 'kN', moment: 'kN·m', length: 'm', deflection: 'mm' },
  NMM: { fromBase: { F: 1,      M: 1000,   def: 1000 }, force: 'N',  moment: 'N·mm', length: 'mm', deflection: 'mm' },
};

export default function BeamTable({ diagram, reactions, unitsKey = 'SI' }) {
  const U = UNIT_SETS[unitsKey] || UNIT_SETS.SI;

  const rows = useMemo(() => {
    if (!diagram?.length) return [];
    // Show every 20th point (~20 rows from 401)
    return diagram.filter((_, i) => i % 20 === 0 || i === diagram.length - 1);
  }, [diagram]);

  const Lscale = unitsKey === 'NMM' ? 1/0.001 : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Reactions */}
      {reactions?.length > 0 && (
        <div>
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>Support Reactions</div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Support</th>
                  <th>Type</th>
                  <th>Position ({U.length})</th>
                  <th>Fy ({U.force})</th>
                  <th>M ({U.moment})</th>
                </tr>
              </thead>
              <tbody>
                {reactions.map((r, i) => (
                  <tr key={r.id || i}>
                    <td>S{i + 1}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                    <td className="mono">{(r.x * Lscale).toFixed(3)}</td>
                    <td className="mono" style={{ color: r.Ry >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {(r.Ry * U.fromBase.F).toFixed(4)}
                    </td>
                    <td className="mono" style={{ color: 'var(--color-premium)' }}>
                      {(r.M  * U.fromBase.M).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagram values */}
      <div>
        <div className="section-label" style={{ marginBottom: '0.5rem' }}>Values Along Beam</div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>x ({U.length})</th>
                <th>Shear V ({U.force})</th>
                <th>Moment M ({U.moment})</th>
                <th>Deflection δ ({U.deflection})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={i}>
                  <td className="mono">{(p.x * Lscale).toFixed(3)}</td>
                  <td className="mono" style={{ color: p.V < 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {(p.V * U.fromBase.F).toFixed(4)}
                  </td>
                  <td className="mono" style={{ color: p.M < 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {(p.M * U.fromBase.M).toFixed(4)}
                  </td>
                  <td className="mono" style={{ color: 'var(--color-premium)' }}>
                    {(p.d * U.fromBase.def).toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
