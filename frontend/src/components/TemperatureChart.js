import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const COLORS = {
  gas: '#ff6b6b',
  unprot: '#3fb950',
  prot: '#388bfd',
};

const INTERVAL_OPTIONS = [
  { label: '2m',  maxPoints: 300  },
  { label: '4m',  maxPoints: 35   },
  { label: '5m',  maxPoints: 27.55 },
  { label: '7m',  maxPoints: 19.8  },
  { label: '10m', maxPoints: 13.8  },
  { label: '15m', maxPoints: 9.2   },
  { label: '20m', maxPoints: 6.9   },
  { label: '30m', maxPoints: 4.59  },
];

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

export default function TemperatureChart({ results }) {
  const [maxPoints, setMaxPoints] = useState(300);
  const [activeLabel, setActiveLabel] = useState('2m');

  const chartData = useMemo(() => {
    if (!results) return [];
    return sampleData(results.map(r => ({
      t: r.timeMin,
      gas: r.Tg,
      unprot: r.Ts_unprot,
      prot: r.Ts_prot,
    })), maxPoints);
  }, [results, maxPoints]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>

      {/* Legend + interval buttons in one row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>

        {/* Left — legend */}
        <div className="chart-legend" style={{ margin: 0 }}>
          {[
            { color: COLORS.gas,    label: 'Gas Temperature ISO 834' },
            { color: COLORS.unprot, label: 'Steel Unprotected (Eurocode)' },
            { color: COLORS.prot,   label: 'Steel Protected (Eurocode)' },
          ].map(l => (
            <div className="legend-item" key={l.label}>
              <div className="legend-dot" style={{ background: l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Right — interval buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Space Mono', marginRight: '0.2rem' }}>
            INTERVAL
          </span>
          {INTERVAL_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => { setMaxPoints(opt.maxPoints); setActiveLabel(opt.label); }}
              style={{
                padding: '0.18rem 0.5rem',
                fontSize: '0.68rem',
                fontFamily: 'Space Mono',
                border: '1px solid',
                borderColor: activeLabel === opt.label ? 'var(--accent-blue)' : 'var(--border)',
                background: activeLabel === opt.label ? 'rgba(56,139,253,0.12)' : 'var(--bg-input)',
                color: activeLabel === opt.label ? 'var(--accent-blue-light)' : 'var(--text-muted)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {opt.label}
            </button>
          ))}
        </div>

      </div>

      {/* Chart */}
      <div className="chart-container" style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis
              dataKey="t"
              label={{ value: 'Time (min)', position: 'insideBottom', offset: -10, fill: '#8b949e', fontSize: 11 }}
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'Space Mono' }}
              tickLine={false}
            />
            <YAxis
              label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', offset: 10, fill: '#8b949e', fontSize: 11 }}
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'Space Mono' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={550} stroke="#f0883e" strokeDasharray="4 4"
              label={{ value: '550°C critical', position: 'right', fill: '#f0883e', fontSize: 10 }} />
            <Line type="monotone" dataKey="gas"    stroke={COLORS.gas}    strokeWidth={2} dot={false} name="Gas Temp ISO" />
            <Line type="monotone" dataKey="unprot" stroke={COLORS.unprot} strokeWidth={2} dot={false} name="Steel Unprotected" />
            <Line type="monotone" dataKey="prot"   stroke={COLORS.prot}   strokeWidth={2} dot={false} name="Steel Protected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}