import React from 'react';

export default function ITFMFormulas({ inputs, results }) {
  if (!results) return null;
  const { fireProps: fp, sectionProps: sp } = results;
  const { WIDTH: W, HEIGHT: H, L, FSIZE, QII, QF, T_ROOM, T_NF, FANGLE, x_position, exposure } = inputs;

  const steps = [
    {
      title: 'Burn Time (TB)',
      formula: 'TB = QF / QII',
      calc: `TB = ${QF} / ${QII}`,
      result: `TB = ${fp.TB_min} min`,
      note: 'Time for the fire to consume all fuel at the near-field heat release rate.',
    },
    {
      title: 'Total Fire Duration (TTOTAL)',
      formula: 'TTOTAL = TB × (1/FSIZE + 1)',
      calc: `TTOTAL = ${fp.TB_min}min × (1/${FSIZE} + 1)`,
      result: `TTOTAL = ${fp.TTOTAL_min} min`,
      note: 'Total time including the travelling phase. Fire ends and room returns to T_ROOM after this.',
    },
    {
      title: 'Fire Length & Spread Speed',
      formula: 'LF = L × FSIZE     S = LF / TB',
      calc: `LF = ${L} × ${FSIZE} = ${fp.LF}m     S = ${fp.LF}/(${fp.TB_min}×60)`,
      result: `LF = ${fp.LF} m   |   S = ${fp.S_mm_s} mm/s`,
      note: 'Fire occupies FSIZE fraction of compartment length and travels at speed S.',
    },
    {
      title: 'Near-Field Temperature (T_NF)',
      formula: 'T_NF = T_ROOM + ΔT_integrated_over_flapping_length / F',
      calc: `F = LF + 2×H×tan(${FANGLE}°) = ${fp.LF}m flapping length`,
      result: `T_NF = ${fp.T_NF} °C`,
      note: 'Average temperature over the flapping (flame) length. This is the near-field cap temperature.',
    },
    {
      title: 'Gas Temperature at Position x',
      formula: `IF point inside fire footprint → Tg = T_NF
ELSE Tg = T_ROOM + (5.38/H) × (Q_current / dist)^(2/3)`,
      calc: `x = ${x_position}m, fire front position = S×t - ½×L×Ft`,
      result: `Tg varies from T_ROOM=${T_ROOM}°C to T_NF=${fp.T_NF}°C as fire passes x`,
      note: 'The travelling fire creates a pulse of high temperature as it passes the beam location. Drag the slider on the graph to see different positions.',
    },
    {
      title: 'Section Factor (Hp/A) & Shadow Factor (ksh)',
      formula: exposure === 'All Sides'
        ? 'Hp = 2h + 4b − 2tw + (2π−8)r1  [All Sides]'
        : 'Hp = 2h + 3b − 2tw + (2π−8)r1  [Three Sides]',
      calc: `A = ${sp.A_mm2} mm²  |  Hp = ${sp.Hp_m}m`,
      result: `Hp/A = ${sp.HpA} m⁻¹  |  ksh = ${sp.ksh}`,
      note: 'Same Eurocode shadow factor method as ISO and Parametric calculators.',
    },
    {
      title: 'Unprotected Steel Temperature',
      formula: 'ΔTs = (ksh × Hp/A) / (ρa × Ca) × Qnet × Δt',
      calc: 'Qnet = αc(Tg−Ts) + εσ[(Tg+273)⁴−(Ts+273)⁴]',
      result: 'Integrated per 5-second timestep throughout fire duration',
      note: 'EN 1993-1-2 §4.2.5.1. αc=25 W/m²K, ε=0.7. Steel tracks the gas temperature pulse.',
    },
    {
      title: 'Protected Steel Temperature',
      formula: 'ΔTs = (λp/dp)/(Ca×ρa) × HpA × [1/(1+φ/3)] × [(Tg−Ts)×dt − (e^φ/10−1)×ΔTg]',
      calc: `φ = (Cp×ρp×dp×HpA)/(Ca×ρa)  |  λp=${inputs.lambdaP}, dp=${inputs.dp}m`,
      result: `Using Cp=${inputs.Cp} J/kgK, ρp=${inputs.rhoP} kg/m³`,
      note: 'EN 1993-1-2 §4.3.4.2. Protected steel lags behind gas temperature and stays cooler after fire passes.',
    },
  ];

  return (
    <div className="formula-section">
      {steps.map((step, i) => (
        <div className="formula-step" key={i}>
          <div className="formula-step-header">
            <div className="step-number">{i+1}</div>
            <div className="step-title">{step.title}</div>
          </div>
          <div className="formula-step-body">
            <div className="formula-expr">{step.formula}</div>
            <div className="formula-expr" style={{ color:'var(--text-secondary)', fontSize:'0.73rem' }}>{step.calc}</div>
            <div className="formula-result">→ {step.result}</div>
            <div className="formula-desc">{step.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
