import React from 'react';

const UNIT_SETS = {
  SI:  { length: 'm',  force: 'kN',  fromBase: { F: 1/1000, M: 1/1000 } },
  NMM: { length: 'mm', force: 'N',   fromBase: { F: 1,      M: 1000   } },
};

export default function BeamSketch({ lengthInput, supports, loads, reactions, unitsKey = 'SI' }) {
  const U  = UNIT_SETS[unitsKey] || UNIT_SETS.SI;
  const L  = parseFloat(lengthInput) || 8;
  const W  = 800, H = 180;
  const PAD = 48, beamY = 80, beamH = 10;
  const bW = W - 2 * PAD;
  const xMap = x => PAD + (parseFloat(x) / L) * bW;

  return (
    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 4px 4px', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>

        {/* Beam */}
        <rect x={PAD} y={beamY - beamH/2} width={bW} height={beamH} rx="2" fill="var(--accent-blue, #388bfd)" />

        {/* X labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <text key={t} x={PAD + t * bW} y={H - 6} textAnchor="middle"
            fill="var(--text-muted, #484f58)" fontSize="10" fontFamily="Space Mono, monospace">
            {(t * L).toFixed(1)}
          </text>
        ))}

        {/* Supports */}
        {supports.map((s, i) => {
          const sx = xMap(s.x);
          const rxn = reactions?.find((_, ri) => ri === i);
          const ryStr = rxn ? (rxn.Ry * U.fromBase.F).toFixed(2) : null;
          if (s.type === 'fixed') {
            return (
              <g key={s.id}>
                <rect x={sx - 8} y={beamY - beamH/2 - 20} width={14} height={20} fill="var(--color-premium, #f0883e)" opacity="0.9" rx="2" />
                {[0,5,10,15].map(dy => (
                  <line key={dy} x1={sx - 8} x2={sx + 6} y1={beamY - beamH/2 - 18 + dy} y2={beamY - beamH/2 - 18 + dy}
                    stroke="var(--color-premium, #f0883e)" strokeWidth="0.8" opacity="0.5" />
                ))}
                {ryStr && <text x={sx + 10} y={beamY + 20} fill="var(--success, #3fb950)" fontSize="9" fontFamily="Space Mono, monospace">Ry={ryStr}</text>}
              </g>
            );
          }
          return (
            <g key={s.id}>
              <polygon
                points={`${sx},${beamY + beamH/2} ${sx - 12},${beamY + beamH/2 + 22} ${sx + 12},${beamY + beamH/2 + 22}`}
                fill="var(--color-premium, #f0883e)" opacity="0.85"
              />
              {s.type === 'roller' && (
                <ellipse cx={sx} cy={beamY + beamH/2 + 28} rx="5" ry="5"
                  fill="none" stroke="var(--color-premium, #f0883e)" strokeWidth="1.5" />
              )}
              {ryStr && (
                <text x={sx + 14} y={beamY + beamH/2 + 40} fill="var(--success, #3fb950)" fontSize="9" fontFamily="Space Mono, monospace">
                  Ry={ryStr}
                </text>
              )}
            </g>
          );
        })}

        {/* Loads */}
        {loads.map(ld => {
          const lx = xMap(ld.x);
          if (ld.type === 'point') {
            const mag = parseFloat(ld.P) || 0;
            const dir = mag >= 0 ? 1 : -1;
            const tipY  = beamY - beamH/2;
            const tailY = tipY - dir * 28;
            return (
              <g key={ld.id}>
                <line x1={lx} y1={tailY} x2={lx} y2={tipY - dir*2} stroke="var(--danger, #f85149)" strokeWidth="2" />
                <polygon points={`${lx},${tipY} ${lx-5},${tipY - dir*9} ${lx+5},${tipY - dir*9}`} fill="var(--danger, #f85149)" />
                <text x={lx} y={tailY - 3} textAnchor="middle" fill="var(--danger, #f85149)" fontSize="9" fontFamily="Space Mono, monospace">
                  {Math.abs(mag).toFixed(1)}
                </text>
              </g>
            );
          }
          if (ld.type === 'moment') {
            return (
              <g key={ld.id}>
                <path d={`M${lx - 14},${beamY - 14} A18,18 0 1,1 ${lx + 10},${beamY - 5}`}
                  fill="none" stroke="#a371f7" strokeWidth="2" />
                <text x={lx} y={beamY - 28} textAnchor="middle" fill="#a371f7" fontSize="9" fontFamily="Space Mono, monospace">M</text>
              </g>
            );
          }
          if (ld.type === 'udl' || ld.type === 'uvl') {
            const xa = xMap(ld.x), xb = xMap(ld.x2 || L);
            const w1 = parseFloat(ld.w1) || 0, w2 = parseFloat(ld.w2 || ld.w1) || 0;
            const h1 = Math.min(24, Math.abs(w1) * 1.2 + 5);
            const h2 = Math.min(24, Math.abs(w2) * 1.2 + 5);
            const tipY = beamY - beamH/2;
            const arrowCount = Math.max(2, Math.floor((xb - xa) / 30)) + 1;
            return (
              <g key={ld.id}>
                <polygon
                  points={`${xa},${tipY} ${xa},${tipY - h1} ${xb},${tipY - h2} ${xb},${tipY}`}
                  fill="var(--danger, #f85149)" opacity="0.18"
                />
                <line x1={xa} y1={tipY - h1} x2={xb} y2={tipY - h2} stroke="var(--danger, #f85149)" strokeWidth="1.5" />
                {Array.from({ length: arrowCount }, (_, i) => {
                  const ax = xa + (xb - xa) * i / (arrowCount - 1);
                  const ah = h1 + (h2 - h1) * i / (arrowCount - 1);
                  return (
                    <g key={i}>
                      <line x1={ax} y1={tipY - ah} x2={ax} y2={tipY - 2} stroke="var(--danger, #f85149)" strokeWidth="1.2" />
                      <polygon points={`${ax},${tipY} ${ax-3},${tipY-7} ${ax+3},${tipY-7}`} fill="var(--danger, #f85149)" />
                    </g>
                  );
                })}
                <text x={(xa+xb)/2} y={tipY - Math.max(h1,h2) - 3} textAnchor="middle"
                  fill="var(--danger, #f85149)" fontSize="9" fontFamily="Space Mono, monospace">
                  {Math.abs(w1).toFixed(1)}{ld.type === 'uvl' ? `→${Math.abs(w2).toFixed(1)}` : ''}
                </text>
              </g>
            );
          }
          return null;
        })}

      </svg>
    </div>
  );
}
