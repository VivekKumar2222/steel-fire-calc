import React from 'react';

export default function SectionDiagram({ exposure }) {
  const threeS = exposure === 'Three Sides';
  const fireColor = '#ff6b6b';
  const arrowLen = 12;

  const arrows = [
    // top — hide on three sides
    { x1: 60, y1: 20, x2: 60, y2: 34, show: !threeS },
    { x1: 100, y1: 20, x2: 100, y2: 34, show: !threeS },
    { x1: 140, y1: 20, x2: 140, y2: 34, show: !threeS },
    // sides — always show
    { x1: 20, y1: 60, x2: 34, y2: 60, show: true },
    { x1: 20, y1: 100, x2: 34, y2: 100, show: true },
    { x1: 180, y1: 60, x2: 166, y2: 60, show: true },
    { x1: 180, y1: 100, x2: 166, y2: 100, show: true },
    // bottom — always show
    { x1: 60, y1: 180, x2: 60, y2: 166, show: true },
    { x1: 100, y1: 180, x2: 100, y2: 166, show: true },
    { x1: 140, y1: 180, x2: 140, y2: 166, show: true },
];

  return (
    <div className="section-diagram">
      <svg viewBox="0 0 200 200" width="160" height="160" aria-label="I-section diagram">
        {/* Fire arrows */}
        {arrows.filter(a => a.show).map((a, i) => (
          <g key={i}>
            <line
              x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
              stroke={fireColor} strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
          </g>
        ))}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={fireColor} />
          </marker>
        </defs>

        {/* I-section shape */}
        <g fill="var(--section-fill)" stroke="var(--section-stroke)" strokeWidth="1.5">
          {/* Top flange */}
          <rect x="38" y="38" width="124" height="20" />
          {/* Web */}
          <rect x="90" y="58" width="20" height="84" />
          {/* Bottom flange */}
          <rect x="38" y="142" width="124" height="20" />
        </g>

        {/* Labels */}
        <text x="100" y="52" textAnchor="middle" fontSize="8" fill="#79c0ff" fontFamily="Space Mono">tf</text>
        <text x="85" y="102" textAnchor="end" fontSize="8" fill="#79c0ff" fontFamily="Space Mono">tw</text>
        <text x="175" y="102" textAnchor="start" fontSize="8" fill="#79c0ff" fontFamily="Space Mono">h</text>
        <line x1="173" y1="38" x2="173" y2="162" stroke="#79c0ff" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Three sides indicator */}
        {threeS && (
          <text x="100" y="28" textAnchor="middle" fontSize="8" fill="#8b949e" fontFamily="Space Mono">
            3-sided (top unexposed)
          </text>
        )}
      </svg>
    </div>
  );
}
