/**
 * Parametric Fire Temperature Calculations
 * Based on Eurocode EN 1991-1-2 Annex A + EN 1993-1-2
 * Verified against Excel: Final_Parametric_Fire-Rainder.xlsx
 */

const CONSTANTS = {
  TIME_STEP:        5,        // seconds
  CONV_COEFF:       25,       // W/m²K
  EMISSIVITY:       0.7,
  STEFAN_BOLTZMANN: 5.67e-8,  // W/m²K⁴
  DENSITY_STEEL:    7850,     // kg/m³
};

// dq1 lookup table (EN 1991-1-2 Table E.1)
const DQ1_TABLE = { x: [25,250,2500,5000,10000], y: [1.1,1.5,1.9,2.0,2.13] };

function interpolate(x, xs, ys) {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length-1]) return ys[xs.length-1];
  for (let i = 0; i < xs.length-1; i++) {
    if (xs[i] <= x && x <= xs[i+1])
      return ys[i] + (ys[i+1]-ys[i])*(x-xs[i])/(xs[i+1]-xs[i]);
  }
  return ys[ys.length-1];
}

function specificHeatSteel(Ts) {
  if (Ts <= 600) return 425 + 7.73e-1*Ts - 1.69e-3*Ts**2 + 2.22e-6*Ts**3;
  if (Ts <= 735) return 666 - 13002/(Ts-738);
  if (Ts <= 900) return 545 + 17820/(Ts-731);
  return 650;
}

// Wall material thermal inertia table (EN 1994-1-2 / EN 12524)
const WALL_MATERIALS = {
  'Heavy Bricks':       { rho: 2000, cp: 1000, lambda: 1.2 },
  'Normal Bricks':      { rho: 1600, cp:  840, lambda: 0.7 },
  'LW Concrete':        { rho: 1600, cp:  840, lambda: 0.8 },
  'NW Concrete':        { rho: 2300, cp: 1000, lambda: 1.6 },
  'Gypsum Plasterboard':{ rho:  900, cp: 1000, lambda: 0.25 },
  'Glass':              { rho: 2200, cp:  750, lambda: 1.4 },
};

function materialB(mat) {
  const { rho, cp, lambda } = WALL_MATERIALS[mat] || WALL_MATERIALS['Normal Bricks'];
  return Math.sqrt(rho * cp * lambda);
}

function calcSectionProps(h, b, tw, tf, r1, exposure) {
  const A_mm2 = 2*(b*tf) + (h-2*tf)*tw + 4*(1-Math.PI/4)*r1**2;
  const A_m2  = A_mm2 / 1e6;
  const Hp_m  = exposure === 'Three Sides'
    ? (2*h + 3*b - 2*tw + (2*Math.PI-8)*r1)/1000
    : (2*h + 4*b - 2*tw + (2*Math.PI-8)*r1)/1000;
  const boxF  = exposure === 'Three Sides'
    ? ((2*h+b)/A_mm2)*1000
    : ((2*b+2*h)/A_mm2)*1000;
  const HpA = Hp_m / A_m2;
  const ksh = Math.min(1.0, 0.9*(boxF/HpA));
  return { A_mm2, Hp_m, HpA, ksh };
}

function calculateParametricFire(inputs) {
  const {
    // Compartment geometry
    B_room, H_room, H_comp,
    // Openings
    n_doors, W_door, H_door,
    n_windows, W_win, H_win,
    // Fire load
    fire_mode,  // 'Slow'|'Medium'|'Fast'
    qfk,        // characteristic fire load MJ/m²
    dq2, dn, m, // factors (default 1)
    // Wall materials
    wall_material,  // for net walls
    roof_material,  // for roof & floor
    // Steel section (mm)
    h, b, tw, tf, r1,
    exposure,
    // Fire protection
    Cp, dp, lambdaP, rhoP,
    T0 = 20,   // initial steel temp
  } = inputs;

  const dt      = CONSTANTS.TIME_STEP;
  const rhoA    = CONSTANTS.DENSITY_STEEL;
  const tlimMap = { Slow: 25/60, Medium: 20/60, Fast: 15/60 };
  const tlim    = tlimMap[fire_mode] || tlimMap.Medium;

  // ── 1. Compartment areas ─────────────────────────────────────────
  const Af        = B_room * H_room;
  const Av        = n_doors*W_door*H_door + n_windows*W_win*H_win;
  const wall_area = (B_room + H_room) * 2 * H_comp;
  const roof_area = Af;
  const At        = wall_area + roof_area + Af;
  const net_wall  = wall_area - Av;
  const heq       = (n_doors*W_door*H_door*H_door + n_windows*W_win*H_win*H_win) / Av;

  // ── 2. Design fire load ──────────────────────────────────────────
  const dq1 = Math.round(interpolate(Af, DQ1_TABLE.x, DQ1_TABLE.y) * 100) / 100;
  const qfd = Math.round(qfk * dq1 * dq2 * dn * m);
  const qtd = qfd * Af / At;

  // ── 3. Thermal inertia b ─────────────────────────────────────────
  const b_wall  = materialB(wall_material  || 'Normal Bricks');
  const b_roof  = materialB(roof_material  || 'NW Concrete');
  const b_th    = (b_roof*Af + b_roof*roof_area + b_wall*net_wall) / (roof_area + roof_area + net_wall);

  // ── 4. Opening factor O ──────────────────────────────────────────
  const O_raw = Av * Math.sqrt(heq) / At;
  const O     = Math.max(0.02, Math.min(0.2, O_raw));

  // ── 5. Heating duration ──────────────────────────────────────────
  const tv   = 0.0002 * qtd / O;   // ventilation controlled (hrs)
  const tmax = Math.max(tv, tlim);
  const fire_type = tv > tlim ? 'Ventilation Controlled' : 'Fuel Controlled';

  // ── 6. Gamma, t*, theta_g_max ────────────────────────────────────
  const Gamma      = Math.round(((O/b_th)**2 / (0.04/1160)**2) * 1000) / 1000;
  const Olim       = Math.round(0.1*qtd/(tlim*1000) * 100) / 100;
  const Gamma_lim  = Math.round(((Olim/b_th)**2 / (0.04/1160)**2) * 1000) / 1000;
  const t_star_max_v = tv * Gamma;
  const x          = tmax === tlim ? (tlim*Gamma)/t_star_max_v : 1.0;
  const Gamma_curve = tmax === tlim ? Gamma_lim : Gamma;
  const t_star_max  = Math.round(tmax * Gamma * 1000) / 1000;
  const t47         = Gamma_lim * tmax;
  const t_star_tg   = tmax === tlim ? t47 : t_star_max;
  const theta_g_max = Math.round((1325*(1 - 0.324*Math.exp(-0.2*t_star_tg)
                        - 0.204*Math.exp(-1.7*t_star_tg)
                        - 0.472*Math.exp(-19*t_star_tg)) + 20) * 10) / 10;

  // ── 7. Cooling equation selector ────────────────────────────────
  const cool_eq = t_star_max <= 0.5 ? '1.16' : (t_star_max <= 2.0 ? '1.17' : '1.18');

  // ── 8. Gas temperature function ─────────────────────────────────
  function gasTemp(t_hrs) {
    if (t_hrs <= tmax) {
      const tstar = t_hrs * Gamma_curve;
      return Math.round((1325*(1 - 0.324*Math.exp(-0.2*tstar)
               - 0.204*Math.exp(-1.7*tstar)
               - 0.472*Math.exp(-19*tstar)) + 20) * 10) / 10;
    }
    const tstar     = t_hrs * Gamma;
    const tstar_piv = t_star_max_v * x;  // = tmax*Gamma
    let val;
    if (cool_eq === '1.17') val = theta_g_max - 250*(3 - t_star_max_v)*(tstar - tstar_piv);
    else if (cool_eq === '1.18') val = theta_g_max - 250*(tstar - tstar_piv);
    else                         val = theta_g_max - 625*(tstar - tstar_piv);
    return Math.max(20, Math.round(val * 10) / 10);
  }

  // ── 9. Section properties ────────────────────────────────────────
  const { A_mm2, Hp_m, HpA, ksh } = calcSectionProps(h, b, tw, tf, r1, exposure);

  // ── 10. Time-step simulation ─────────────────────────────────────
  const TOTAL_TIME = 120 * 60; // 2 hrs max
  const results    = [];
  let Ts_u = T0, Ts_p = T0, Tg_prev = T0;

  results.push({ timeSec:0, timeMin:0, Tg:gasTemp(0), Ts_unprot:Ts_u, Ts_prot:Ts_p });

  for (let t = dt; t <= TOTAL_TIME; t += dt) {
    const t_min = t/60;
    const Tg    = gasTemp(t_min/60);

    // Unprotected steel
    const Ca_u  = specificHeatSteel(Ts_u);
    const Qc    = CONSTANTS.CONV_COEFF * (Tg - Ts_u);
    const Qr    = CONSTANTS.STEFAN_BOLTZMANN * CONSTANTS.EMISSIVITY *
                  ((Tg+273)**4 - (Ts_u+273)**4);
    Ts_u = Math.max(T0, Ts_u + (ksh*HpA/(rhoA*Ca_u))*(Qc+Qr)*dt);

    // Protected steel — Excel AK formula:
    // coeff × [(Tg−Ts)×dt − (e^(φ/10)−1)×ΔTg]   (both terms × coeff)
    // Always apply — no condition — steel must cool during decay phase
    const Ca_p   = specificHeatSteel(Ts_p);
    const phi    = (Cp * rhoP * dp * HpA) / (Ca_p * rhoA);
    const coeff  = (lambdaP / dp) / (Ca_p * rhoA) * HpA * (1 / (1 + phi / 3));
    const dTs_p  = coeff * ((Tg - Ts_p) * dt - (Math.exp(phi / 10) - 1) * (Tg - Tg_prev));
    Ts_p = Math.max(T0, Ts_p + dTs_p);

    results.push({
      timeSec:  t,
      timeMin:  Math.round(t_min * 100) / 100,
      Tg,
      Ts_unprot: Math.round(Ts_u * 100) / 100,
      Ts_prot:   Math.round(Ts_p * 100) / 100,
    });

    // Stop simulation when Tg has returned to ambient and steel is cooling
    if (t_min > 30 && Tg <= 20 && Ts_u < 50 && Ts_p < 50) break;

    Tg_prev = Tg;
  }

  return {
    results,
    compartmentProps: {
      Af:        Math.round(Af*10)/10,
      Av:        Math.round(Av*10)/10,
      At:        Math.round(At*10)/10,
      heq:       Math.round(heq*1000)/1000,
      O:         Math.round(O*1000)/1000,
      b_thermal: Math.round(b_th*1)/1,
      qtd:       Math.round(qtd*10)/10,
      qfd,
      tmax_min:  Math.round(tmax*60*10)/10,
      fire_type,
      Gamma:     Math.round(Gamma*1000)/1000,
      cool_eq,
      theta_g_max,
    },
    sectionProps: {
      A_mm2: Math.round(A_mm2),
      Hp_m:  Math.round(Hp_m*1000)/1000,
      HpA:   Math.round(HpA*10)/10,
      ksh:   Math.round(ksh*1000)/1000,
    },
    wallMaterials: Object.keys(WALL_MATERIALS),
  };
}

module.exports = { calculateParametricFire, WALL_MATERIALS };
