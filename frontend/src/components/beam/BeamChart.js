import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const UNIT_SETS = {
  SI:  { fromBase: { F: 1/1000, M: 1/1000, def: 1000 }, force: 'kN', moment: 'kN·m', length: 'm', deflection: 'mm' },
  NMM: { fromBase: { F: 1,      M: 1000,   def: 1000 }, force: 'N',  moment: 'N·mm', length: 'mm', deflection: 'mm' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom">
      <div className="tooltip-label">{Number(label).toFixed(2)}</div>
      {payload.map(p => (
        <div className="tooltip-row" key={p.dataKey}>
          <div className="tooltip-dot" style={{ background: p.color }} />
          <span style={{ color: p.color, fontSize: '0.75rem' }}>
            {p.name}: <strong>{Number(p.value).toFixed(3)}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

export default function BeamChart({ diagram, unitsKey = 'SI', activeChart = 'sfd' }) {
  const U = UNIT_SETS[unitsKey] || UNIT_SETS.SI;

  const chartData = useMemo(() => {
    if (!diagram?.length) return [];
    // Sample every 4th point — 401 total → ~100 in chart
    return diagram
      .filter((_, i) => i % 4 === 0 || i === diagram.length - 1)
      .map(p => ({
        x:    parseFloat((p.x / (unitsKey === 'NMM' ? 0.001 : 1)).toFixed(3)),
        V:    parseFloat((p.V  * U.fromBase.F).toFixed(4)),
        M:    parseFloat((p.M  * U.fromBase.M).toFixed(4)),
        d:    parseFloat((p.d  * U.fromBase.def).toFixed(5)),
      }));
  }, [diagram, unitsKey, U]);

  if (!chartData.length) return null;

  const configs = {
    sfd: { dataKey: 'V', name: `Shear Force (${U.force})`,    color: '#388bfd', label: `V (${U.force})` },
    bmd: { dataKey: 'M', name: `Bending Moment (${U.moment})`, color: '#3fb950', label: `M (${U.moment})` },
    def: { dataKey: 'd', name: `Deflection (${U.deflection})`, color: '#f0883e', label: `δ (${U.deflection})` },
  };

  const cfg = configs[activeChart];

  const allY = chartData.map(p => p[cfg.dataKey]);
  const maxY = Math.max(...allY.map(Math.abs));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
      <div className="chart-legend" style={{ margin: 0 }}>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: cfg.color }} />
          <span>{cfg.name}</span>
        </div>
        {maxY > 0 && (
          <div className="legend-item" style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
              peak: {Math.max(...allY.map(Math.abs)).toFixed(3)} | min: {Math.min(...allY).toFixed(3)}
            </span>
          </div>
        )}
      </div>

      <div className="chart-container" style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis
              dataKey="x"
              label={{ value: `Position (${U.length})`, position: 'insideBottom', offset: -10, fill: '#8b949e', fontSize: 11 }}
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'Space Mono' }}
              tickLine={false}
            />
            <YAxis
              label={{ value: cfg.label, angle: -90, position: 'insideLeft', offset: 10, fill: '#8b949e', fontSize: 11 }}
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'Space Mono' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#484f58" strokeWidth={1.5} />
            <Line
              type="monotone"
              dataKey={cfg.dataKey}
              stroke={cfg.color}
              strokeWidth={2}
              dot={false}
              name={cfg.name}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
