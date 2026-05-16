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

export default function RebarChart({ results }) {
  const chartData = useMemo(() => {
    if (!results) return [];
    // Sample every 12 rows (1 per minute) for performance
    return results
      .filter((_, i) => i % 12 === 0 || i === results.length - 1)
      .map(r => ({ t: r.timeMin, tg: r.Tg, tsurf: r.Tsurf, trebar: r.Trebar }));
  }, [results]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', gap:'0.75rem' }}>
      <div className="chart-legend" style={{ margin:0 }}>
        {[
          { color:'#ff6b6b', label:'Gas Temperature (ISO 834)' },
          { color:'#f0883e', label:'Slab Surface (z = 0 mm)' },
          { color:'#388bfd', label:'Rebar Temperature' },
        ].map(l => (
          <div className="legend-item" key={l.label}>
            <div className="legend-dot" style={{ background:l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      <div className="chart-container" style={{ flex:1, minHeight:0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top:10, right:20, bottom:20, left:20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="t"
              label={{ value:'Time (min)', position:'insideBottom', offset:-10, fill:'#8b949e', fontSize:11 }}
              tick={{ fill:'#8b949e', fontSize:11, fontFamily:'Space Mono' }}
              tickLine={false} />
            <YAxis
              label={{ value:'Temperature (°C)', angle:-90, position:'insideLeft', offset:10, fill:'#8b949e', fontSize:11 }}
              tick={{ fill:'#8b949e', fontSize:11, fontFamily:'Space Mono' }}
              tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={500} stroke="#f0883e" strokeDasharray="4 4"
              label={{ value:'500°C rebar critical', position:'right', fill:'#f0883e', fontSize:10 }} />
            <Line type="monotone" dataKey="tg"     stroke="#ff6b6b" strokeWidth={2} dot={false} name="Gas Temp" />
            <Line type="monotone" dataKey="tsurf"  stroke="#f0883e" strokeWidth={2} dot={false} name="Surface" />
            <Line type="monotone" dataKey="trebar" stroke="#388bfd" strokeWidth={2} dot={false} name="Rebar" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
