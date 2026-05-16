import React from 'react';

export default function RebarFormulas({ inputs, results }) {
  if (!results) return null;
  const { derivedProps: dp } = results;
  const { dt, dz, Z, zr, rho, c_p, k, h_c, eps, T_amb, isoMode } = inputs;

  const steps = [
    {
      title: 'ISO 834 Gas Temperature',
      formula: 'Tg(t) = T₀ + 345 × log₁₀(8t + 1)   [t in minutes]',
      calc: isoMode === 'custom' ? 'Using user-provided custom gas temperature data' : `T₀ = ${T_amb}°C`,
      result: `${isoMode === 'auto' ? 'Auto ISO 834 curve' : 'Custom CSV data'} used as boundary condition`,
      note: 'Standard fire curve per ISO 834. Can be replaced with any user-defined gas temperature.',
    },
    {
      title: 'Fourier Number (Stability Check)',
      formula: 'Fo = k × Δt / (ρ × c × Δz²)   must be ≤ 0.5',
      calc: `Fo = ${k} × ${dt} / (${rho} × ${c_p} × ${dz}²)`,
      result: `Fo = ${dp.Fo}  —  ${dp.stable ? '✓ Stable' : '✗ UNSTABLE'}`,
      note: 'Explicit finite differences are conditionally stable. If Fo > 0.5 reduce Δt or increase Δz.',
    },
    {
      title: 'Slab Discretisation',
      formula: 'N = round(Z / Δz)   |   i_low = floor(zr / Δz)   |   f = (zr − i_low×Δz) / Δz',
      calc: `N = round(${Z}/${dz}) = ${dp.N}   |   i_low = ${dp.i_low}   |   f = ${dp.f}`,
      result: `${dp.N} layers of ${dz*1000}mm each. Rebar between nodes ${dp.i_low} and ${dp.i_low+1}`,
      note: 'The rebar temperature is linearly interpolated between the two surrounding nodes using fraction f.',
    },
    {
      title: 'Surface Node (z = 0) — Fire Boundary',
      formula: 'T₀ⁿ⁺¹ = T₀ⁿ + (2Δt/ρcΔz) × [h(Tg_K − T₀_K) + εσ(Tg_K⁴ − T₀_K⁴) + (k/Δz)(T₁ⁿ − T₀ⁿ)]',
      calc: `h=${h_c} W/m²K, ε=${eps}, σ=5.67×10⁻⁸ W/m²K⁴`,
      result: 'Mixed convective + radiative + conductive boundary at heated face',
      note: 'The factor 2 comes from the ghost-node trick for the half-cell at the boundary. Explicit: uses gas temp from previous timestep.',
    },
    {
      title: 'Interior Nodes (z = iΔz, i = 1 … N−1)',
      formula: 'Tᵢⁿ⁺¹ = Tᵢⁿ + Fo × (Tᵢ₊₁ⁿ − 2Tᵢⁿ + Tᵢ₋₁ⁿ)',
      calc: `Fo = ${dp.Fo}`,
      result: 'Classic 1D explicit central-difference heat equation',
      note: 'Pure conduction through homogeneous concrete. Thermal properties assumed constant.',
    },
    {
      title: 'Back Face (z = Z) — Insulated',
      formula: 'T_Nⁿ⁺¹ = T_Nⁿ + 2 × Fo × (T_{N-1}ⁿ − T_Nⁿ)',
      calc: `Adiabatic (zero heat flux at z = ${Z*1000}mm)`,
      result: 'Top face of slab is thermally insulated — models a composite floor slab',
      note: 'The factor 2 again comes from ghost-node symmetry for a zero-flux Neumann boundary.',
    },
    {
      title: 'Rebar Temperature (interpolated)',
      formula: 'T_rebar = T[i_low] + f × (T[i_low+1] − T[i_low])',
      calc: `i_low = ${dp.i_low}, f = ${dp.f}, zr = ${zr*1000}mm`,
      result: 'Linear interpolation between the two nodes bracketing the rebar depth',
      note: 'This avoids having to place a node exactly at zr and keeps the grid uniform.',
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
            <div className="formula-expr" style={{color:'var(--text-secondary)',fontSize:'0.73rem'}}>{step.calc}</div>
            <div className="formula-result">→ {step.result}</div>
            <div className="formula-desc">{step.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
