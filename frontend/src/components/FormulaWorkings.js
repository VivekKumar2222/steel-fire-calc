import React from 'react';

export default function FormulaWorkings({ inputs, results }) {
  if (!results) return null;

  const { sectionProps: sp } = results;
  const { h, b, tw, tf, r1, Cp, dp, lambdaP, rhoP, exposure } = inputs;

  const steps = [
    {
      title: 'Cross-Section Area (A)',
      formula: 'A = 2(b × tf) + (h − 2tf) × tw + 4(1 − π/4) × r1²',
      calc: `A = 2(${b} × ${tf}) + (${h} − 2×${tf}) × ${tw} + 4(1 − π/4) × ${r1}²`,
      result: `A = ${sp.A_mm2.toLocaleString()} mm²`,
      note: 'Includes web, flanges, and fillet radii corrections.',
    },
    {
      title: 'Heated Perimeter (Hp)',
      formula: exposure === 'All Sides'
        ? 'Hp = 2h + 4b − 2tw + (2π − 8)r1  [All Sides]'
        : 'Hp = 2h + 3b − 2tw + (2π − 8)r1  [Three Sides]',
      calc: `Hp = ${sp.Hp_mm} mm`,
      result: `Hp = ${sp.Hp_mm} mm`,
      note: 'Perimeter of steel section exposed to fire.',
    },
    {
      title: 'Section Factor (Hp/A)',
      formula: 'Hp/A = Hp (m) / A (m²)',
      calc: `Hp/A = ${(sp.Hp_mm / 1000).toFixed(4)} / ${(sp.A_mm2 / 1e6).toFixed(6)}`,
      result: `Hp/A = ${sp.HpPerA} m⁻¹`,
      note: 'Higher values → steel heats faster.',
    },
    {
      title: 'Shadow Effect Factor (ksh)',
      formula: 'ksh = 0.9 × (Hpb/A) / (Hp/A)  ≤ 1.0',
      calc: `ksh = 0.9 × ${sp.HpbPerA} / ${sp.HpPerA}`,
      result: `ksh = ${sp.ksh}`,
      note: 'Accounts for shielding between flanges. EN 1993-1-2 §4.2.5.1',
    },
    {
      title: 'ISO 834 Gas Temperature',
      formula: 'Tg(t) = 20 + 345 × log₁₀(8t + 1)',
      calc: 'where t = time in minutes',
      result: 'Tg(60 min) ≈ 945°C',
      note: 'Standard fire curve. Increases rapidly in first 30 min.',
    },
    {
      title: 'Unprotected Steel ΔTs',
      formula: 'ΔTs = (ksh × Hp/A) / (ρa × Ca) × Qnet × Δt',
      calc: `where Qnet = αc(Tg−Ts) + εm×εf×σ[(Tg+273)⁴−(Ts+273)⁴]`,
      result: 'Integrated per 5-second time step',
      note: 'EN 1993-1-2 §4.2.5.1(1). αc=25 W/m²K, ε=0.7',
    },
    {
      title: 'Protected Steel ΔTs',
      formula: 'ΔTs = [λp×(Hp/A)] / [dp×Ca×ρa×(1+φ/3)] × (Tg−Ts)×Δt − (eφ/10−1)×ΔTg',
      calc: `φ = (Cp×ρp×dp×Hp/A) / (Ca×ρa) = (${Cp}×${rhoP}×${dp}×Hp/A) / (Ca×7850)`,
      result: `Using λp=${lambdaP} W/mK, dp=${dp}m, Cp=${Cp} J/kgK, ρp=${rhoP} kg/m³`,
      note: 'EN 1993-1-2 §4.3.4.2. φ accounts for heat stored in protection.',
    },
    {
      title: 'Specific Heat of Steel Ca',
      formula: `Ca = 425 + 7.73×10⁻¹Ts − 1.69×10⁻³Ts² + 2.22×10⁻⁶Ts³  [Ts ≤ 600°C]`,
      calc: 'Piecewise: different formulae at 600–735, 735–900, 900–1200°C',
      result: 'Ca(20°C)=440, Ca(600°C)≈896, Ca(800°C)≈650 J/kgK',
      note: 'EN 1993-1-2 §3.4.1. Peak near 735°C (phase transformation).',
    },
  ];

  return (
    <div className="formula-section">
      {steps.map((step, i) => (
        <div className="formula-step" key={i}>
          <div className="formula-step-header">
            <div className="step-number">{i + 1}</div>
            <div className="step-title">{step.title}</div>
          </div>
          <div className="formula-step-body">
            <div className="formula-expr">{step.formula}</div>
            <div className="formula-expr" style={{ color: 'var(--text-secondary)', fontSize: '0.73rem' }}>
              {step.calc}
            </div>
            <div className="formula-result">→ {step.result}</div>
            <div className="formula-desc">{step.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
