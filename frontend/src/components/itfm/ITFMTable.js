import React, { useMemo, useState } from 'react';

function filterByMinute(results) {
  return results.filter((_, i) => i % 12 === 0);
}

export default function ITFMTable({ results, isPremium = false }) {
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    if (!results) return [];
    return showAll ? results : filterByMinute(results);
  }, [results, showAll]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Showing {rows.length} of {results.length} rows
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="premium-badge">🔒 Premium: Protected Ts</span>
          <button className="export-btn" onClick={() => setShowAll(p => !p)}>
            {showAll ? '1-min view' : 'All rows (5s)'}
          </button>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time (min)</th>
              <th className="col-gas">Gas Temp Tg (°C)</th>
              <th className="col-unprot">Ts Unprotected (°C)</th>
              <th className={isPremium ? 'col-prot' : ''} style={!isPremium ? { color: 'var(--text-muted)' } : {}}>
                Ts Protected (°C){!isPremium && <span style={{ marginLeft: '0.3rem', fontSize: '0.65rem' }}>🔒</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="mono">{row.timeMin.toFixed(2)}</td>
                <td className="col-gas mono">{row.Tg.toFixed(1)}</td>
                <td className="col-unprot mono">{row.Ts_unprot.toFixed(1)}</td>
                <td>
                  {isPremium
                    ? <span className="col-prot mono">{row.Ts_prot.toFixed(1)}</span>
                    : <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Upgrade to unlock</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
