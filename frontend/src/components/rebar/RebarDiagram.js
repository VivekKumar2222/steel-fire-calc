import React from 'react';

export default function RebarDiagram({ inputs, finalProfile }) {
  const { Z = 0.13, zr = 0.025, dz = 0.01 } = inputs;
  const svgW = 560, svgH = 340;
  const padL = 80, padR = 40, padT = 30, padB = 50;
  const drawW = svgW - padL - padR;
  const drawH = svgH - padT - padB;

  // Slab cross-section — horizontal bar
  const slabX = padL;
  const slabY = padT + drawH * 0.15;
  const slabW = drawW;
  const slabH = drawH * 0.55;

  // Scale: z=0 at bottom of slab (fire side), z=Z at top (insulated)
  function zToY(z) {
    return slabY + slabH - (z / Z) * slabH;
  }

  const rebarY = zToY(zr);

  // Temperature profile colour mapping
  function tempToColor(T, maxT = 1000) {
    const ratio = Math.min(1, Math.max(0, (T - 20) / (maxT - 20)));
    const r = Math.round(255 * Math.min(1, ratio * 2));
    const g = Math.round(255 * Math.max(0, 1 - Math.abs(ratio - 0.5) * 2));
    const b = Math.round(255 * Math.max(0, 1 - ratio * 2));
    return `rgb(${r},${g},${b})`;
  }

  // Draw temp profile as coloured horizontal bands
  const bands = finalProfile && finalProfile.length > 1
    ? finalProfile.slice(0, -1).map((node, i) => {
        const next = finalProfile[i + 1];
        const y1 = zToY(node.z_mm / 1000);
        const y2 = zToY(next.z_mm / 1000);
        const midT = (node.T + next.T) / 2;
        return { y: Math.min(y1, y2), h: Math.abs(y2 - y1) + 1, color: tempToColor(midT) };
      })
    : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', gap:'0.5rem', alignItems:'center' }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ maxHeight: 340 }}>
        <defs>
          <clipPath id="slabClip">
            <rect x={slabX} y={slabY} width={slabW} height={slabH} />
          </clipPath>
        </defs>

        {/* Slab background */}
        <rect x={slabX} y={slabY} width={slabW} height={slabH}
          fill="#21262d" stroke="#388bfd" strokeWidth="1.5" rx="4" />

        {/* Temperature profile bands */}
        <g clipPath="url(#slabClip)">
          {bands.map((b, i) => (
            <rect key={i} x={slabX} y={b.y} width={slabW} height={b.h} fill={b.color} opacity="0.6" />
          ))}
        </g>

        {/* Slab border on top */}
        <rect x={slabX} y={slabY} width={slabW} height={slabH}
          fill="none" stroke="#388bfd" strokeWidth="1.5" rx="4" />

        {/* Rebar line */}
        <line x1={slabX + 20} x2={slabX + slabW - 20} y1={rebarY} y2={rebarY}
          stroke="#388bfd" strokeWidth="4" strokeLinecap="round" />

        {/* Rebar circle symbol */}
        {[0.25, 0.45, 0.65, 0.85].map((frac, i) => (
          <circle key={i} cx={slabX + slabW * frac} cy={rebarY} r="5"
            fill="#388bfd" stroke="#0d1117" strokeWidth="1.5" />
        ))}

        {/* Fire arrows at bottom */}
        {[0.15, 0.35, 0.55, 0.75, 0.90].map((frac, i) => {
          const x = slabX + slabW * frac;
          const y1 = slabY + slabH + 30;
          const y2 = slabY + slabH + 4;
          return (
            <g key={i}>
              <line x1={x} y1={y1} x2={x} y2={y2} stroke="#ff6b6b" strokeWidth="1.5"
                markerEnd="url(#arrowRed)" />
            </g>
          );
        })}
        <defs>
          <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#ff6b6b" />
          </marker>
        </defs>

        {/* Labels */}
        <text x={slabX - 8} y={slabY + slabH} textAnchor="end" fontSize="10" fill="#8b949e" fontFamily="Space Mono">z=0</text>
        <text x={slabX - 8} y={slabY + 4}      textAnchor="end" fontSize="10" fill="#8b949e" fontFamily="Space Mono">z={Math.round(Z*1000)}mm</text>
        <text x={slabX - 8} y={rebarY + 4}     textAnchor="end" fontSize="10" fill="#79c0ff" fontFamily="Space Mono">{Math.round(zr*1000)}mm</text>

        {/* Dimension arrows */}
        <line x1={slabX + slabW + 12} y1={slabY} x2={slabX + slabW + 12} y2={slabY + slabH}
          stroke="#484f58" strokeWidth="1" />
        <text x={slabX + slabW + 22} y={slabY + slabH/2 + 4} fontSize="10" fill="#8b949e" fontFamily="Space Mono">Z={Math.round(Z*1000)}mm</text>

        {/* Fire label */}
        <text x={slabX + slabW/2} y={slabY + slabH + 44} textAnchor="middle" fontSize="11" fill="#ff6b6b" fontFamily="Space Mono">
          Fire exposure (z = 0)
        </text>

        {/* Insulated top label */}
        <text x={slabX + slabW/2} y={slabY - 10} textAnchor="middle" fontSize="11" fill="#8b949e" fontFamily="Space Mono">
          Insulated top face
        </text>

        {/* Rebar label */}
        <text x={slabX + slabW - 10} y={rebarY - 7} textAnchor="end" fontSize="10" fill="#79c0ff" fontFamily="Space Mono">
          Rebar (cover={Math.round(zr*1000)}mm)
        </text>

        {/* Temperature colour legend */}
        <text x={slabX} y={svgH - 8} fontSize="10" fill="#8b949e" fontFamily="Space Mono">
          {finalProfile ? `Profile at t=${Math.round(inputs.totalDuration/60)}min — blue=cool, red=hot` : 'Run calculation to see temperature profile'}
        </text>
      </svg>
    </div>
  );
}
