import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom">
      <div className="tooltip-label">{label} min</div>
      {payload.map(p => (
        <div className="tooltip-row" key={p.dataKey}>
          <div className="tooltip-dot" style={{ background: p.color }} />
          <span style={{ color: p.color, fontSize: '0.75rem' }}>
            {p.name}: <strong>{p.value?.toFixed(1)}°C</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ITFMChart({ results, fireProps, x_position, L, onPositionChange }) {
  const chartData = useMemo(() => {
    if (!results) return [];
    return results.map(r => ({
      t: r.timeMin, gas: r.Tg, unprot: r.Ts_unprot, prot: r.Ts_prot,
    }));
  }, [results]);

  const totalMin = fireProps?.TTOTAL_min || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>

      {/* Legend */}
      <div className="chart-legend" style={{ margin: 0 }}>
        {[
          { color: '#ff6b6b', label: 'Gas Temperature (iTFM)' },
          { color: '#3fb950', label: 'Steel Unprotected' },
          { color: '#388bfd', label: 'Steel Protected' },
        ].map(l => (
          <div className="legend-item" key={l.label}>
            <div className="legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Distance slider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.5rem 0.75rem',
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontFamily:'Space Mono', whiteSpace:'nowrap' }}>
          BEAM POSITION
        </span>
        <input
          type="range"
          min="0" max={L || 100} step="0.5"
          value={x_position}
          onChange={e => onPositionChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
        />
        <span style={{
          fontSize: '0.8rem', fontFamily: 'Space Mono', fontWeight: 700,
          color: 'var(--accent-blue-light)', minWidth: '4rem', textAlign: 'right',
        }}>
          x = {x_position} m
        </span>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="t"
              label={{ value: 'Time (min)', position: 'insideBottom', offset: -10, fill: '#8b949e', fontSize: 11 }}
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'Space Mono' }}
              tickLine={false} />
            <YAxis
              label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', offset: 10, fill: '#8b949e', fontSize: 11 }}
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'Space Mono' }}
              tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {totalMin > 0 && (
              <ReferenceLine x={totalMin} stroke="#8b949e" strokeDasharray="4 4"
                label={{ value: `Fire ends ${totalMin}min`, position: 'top', fill: '#8b949e', fontSize: 9 }} />
            )}
            <ReferenceLine y={550} stroke="#f0883e" strokeDasharray="4 4"
              label={{ value: '550°C', position: 'right', fill: '#f0883e', fontSize: 10 }} />
            <Line type="monotone" dataKey="gas"    stroke="#ff6b6b" strokeWidth={2} dot={false} name="Gas Temp" />
            <Line type="monotone" dataKey="unprot" stroke="#3fb950" strokeWidth={2} dot={false} name="Steel Unprotected" />
            <Line type="monotone" dataKey="prot"   stroke="#388bfd" strokeWidth={2} dot={false} name="Steel Protected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}