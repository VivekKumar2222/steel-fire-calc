import React from 'react';

export default function ParametricFormulas({ inputs, results }) {
  if (!results) return null;
  const { compartmentProps: cp, sectionProps: sp } = results;
  const { B_room, H_room, H_comp, n_doors, W_door, H_door,
          n_windows, W_win, H_win, qfk, dq2, dn, m,
          wall_material, roof_material, fire_mode,
          h, b, tw, tf, r1, exposure } = inputs;

  const steps = [
    {
      title: 'Compartment Floor Area (Af)',
      formula: 'Af = B × H',
      calc: `Af = ${B_room} × ${H_room}`,
      result: `Af = ${cp.Af} m²`,
      note: 'Total floor area of the fire compartment. EN 1991-1-2 Annex A.',
    },
    {
      title: 'Ventilation Area (Av)',
      formula: 'Av = (n_d × W_d × H_d) + (n_w × W_w × H_w)',
      calc: `Av = (${n_doors}×${W_door}×${H_door}) + (${n_windows}×${W_win}×${H_win})`,
      result: `Av = ${cp.Av} m²`,
      note: 'Sum of all opening areas — assumes all doors open and windows broken.',
    },
    {
      title: 'Opening Factor (O)',
      formula: 'O = Av × √heq / At   [clamped 0.02–0.20]',
      calc: `heq = ${(n_doors*W_door*H_door*H_door + n_windows*W_win*H_win*H_win)/cp.Av >= 0 ? cp.heq : ''}m, At = ${cp.At}m²`,
      result: `O = ${cp.O} m½`,
      note: 'Opening factor represents the ventilation condition. EN 1991-1-2 §A.2.',
    },
    {
      title: 'Thermal Inertia (b)',
      formula: 'b = √(ρ × cp × λ)   [weighted average of wall/roof/floor]',
      calc: `Walls: ${wall_material}, Roof/Floor: ${roof_material}`,
      result: `b = ${cp.b_thermal} J/m²s½K`,
      note: 'Thermal absorptivity of the boundary. Higher b = slower temperature rise.',
    },
    {
      title: 'Design Fire Load (qt,d)',
      formula: 'qf,d = qf,k × δq1 × δq2 × δn × m\nqt,d = qf,d × Af / At',
      calc: `qf,d = ${qfk} × δq1 × ${dq2} × ${dn} × ${m} = ${cp.qfd} MJ/m²`,
      result: `qt,d = ${cp.qtd} MJ/m²`,
      note: 'Fire load density related to total enclosure area.',
    },
    {
      title: `Fire Duration — ${cp.fire_type}`,
      formula: 'tv = 0.0002 × qt,d / O  [ventilation]\ntlim = fire mode duration  [fuel]\ntmax = max(tv, tlim)',
      calc: `Fire mode: ${fire_mode} → tlim = ${fire_mode==='Slow'?'25':fire_mode==='Medium'?'20':'15'} min`,
      result: `tmax = ${cp.tmax_min} min  (${cp.fire_type})`,
      note: cp.fire_type.includes('Vent')
        ? 'Ventilation controlled — fire limited by oxygen supply.'
        : 'Fuel controlled — fire limited by available fuel.',
    },
    {
      title: 'Time Scale Factor (Γ)',
      formula: 'Γ = (O/b)² / (0.04/1160)²',
      calc: `Γ = (${cp.O}/${cp.b_thermal})² / (0.04/1160)²`,
      result: `Γ = ${cp.Gamma}`,
      note: 'Scales real time to normalised time t*. Γ=1 → parametric ≈ standard ISO curve.',
    },
    {
      title: 'Max Gas Temperature (θg,max)',
      formula: 'θg = 1325×(1 − 0.324e^(−0.2t*) − 0.204e^(−1.7t*) − 0.472e^(−19t*)) + 20',
      calc: 'Equation A.1 (EN 1991-1-2 Annex A)',
      result: `θg,max = ${cp.theta_g_max}°C`,
      note: 'Maximum gas temperature at end of heating phase.',
    },
    {
      title: `Cooling Phase — Equation ${cp.cool_eq}`,
      formula: cp.cool_eq === '1.16'
        ? 'θg = θg,max − 625 × (t* − t*max × x)'
        : cp.cool_eq === '1.17'
        ? 'θg = θg,max − 250 × (3 − t*max,v) × (t* − t*max × x)'
        : 'θg = θg,max − 250 × (t* − t*max × x)',
      calc: `Selected based on t*max = ${Math.round(cp.tmax_min/60*cp.Gamma*1000)/1000} hrs`,
      result: 'Temperature decreases until 20°C',
      note: 'Equation selected: t*max ≤ 0.5 → 1.16, ≤ 2.0 → 1.17, > 2.0 → 1.18.',
    },
    {
      title: 'Section Factor (Hp/A)',
      formula: exposure === 'All Sides'
        ? 'Hp = 2h + 4b − 2tw + (2π−8)r1  [All Sides]'
        : 'Hp = 2h + 3b − 2tw + (2π−8)r1  [Three Sides]',
      calc: `h=${h}, b=${b}, tw=${tw}, tf=${tf}, r1=${r1} mm`,
      result: `Hp/A = ${sp.HpA} m⁻¹  |  ksh = ${sp.ksh}`,
      note: 'Same Eurocode shadow factor method as ISO calculator. EN 1993-1-2 §4.2.5.1.',
    },
    {
      title: 'Unprotected Steel Temperature',
      formula: 'ΔTs = (ksh × Hp/A) / (ρa × Ca) × Qnet × Δt',
      calc: `Qnet = αc(Tg−Ts) + εmεfσ[(Tg+273)⁴−(Ts+273)⁴]`,
      result: 'Integrated per 5-second time step',
      note: 'EN 1993-1-2 §4.2.5.1. αc=25 W/m²K, ε=0.7, σ=5.67×10⁻⁸.',
    },
    {
      title: 'Protected Steel Temperature',
      formula: 'ΔTs = [λp×(Hp/A)] / [dp×Ca×ρa×(1+φ/3)] × (Tg−Ts)×Δt − (e^(φ/10)−1)×ΔTg',
      calc: `φ = (Cp×ρp×dp×Hp/A) / (Ca×ρa)`,
      result: `Using λp=${inputs.lambdaP} W/mK, dp=${inputs.dp}m`,
      note: 'EN 1993-1-2 §4.3.4.2. Same formulation as ISO calculator.',
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
            <div className="formula-expr" style={{ color:'var(--text-secondary)', fontSize:'0.73rem' }}>
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
