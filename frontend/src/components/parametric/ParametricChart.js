import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

function sampleData(data, maxPoints = 300) {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0 || i === data.length - 1);
}

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

export default function ParametricChart({ results, tmax_min }) {
  const chartData = useMemo(() => {
    if (!results) return [];
    return sampleData(results.map(r => ({
      t: r.timeMin,
      gas: r.Tg,
      unprot: r.Ts_unprot,
      prot: r.Ts_prot,
    })));
  }, [results]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
      <div className="chart-legend" style={{ marginBottom: '0.25rem' }}>
        {[
          { color: '#ff6b6b', label: 'Parametric Gas Temperature' },
          { color: '#3fb950', label: 'Steel Unprotected (Eurocode)' },
          { color: '#388bfd', label: 'Steel Protected (Eurocode)' },
        ].map(l => (
          <div className="legend-item" key={l.label}>
            <div className="legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

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
            {tmax_min && (
              <ReferenceLine x={tmax_min} stroke="#f0883e" strokeDasharray="4 4"
                label={{ value: `Peak ${tmax_min}min`, position: 'top', fill: '#f0883e', fontSize: 10 }} />
            )}
            <ReferenceLine y={550} stroke="#f0883e" strokeDasharray="2 4"
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