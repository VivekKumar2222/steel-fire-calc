/**
 * iTFM — Improved Travelling Fire Model
 * Based on Eurocode EN 1991-1-2 + iTFM research
 * Verified against Excel: iTFM_Model__1_.xlsx
 *
 * Key concept: Unlike ISO 834 (uniform fire), a travelling fire moves
 * along a long compartment. Gas temperature varies by both TIME and
 * POSITION x along the compartment length.
 *
 * The user selects a position x (metres from one end) and sees the
 * gas temperature time-history at that point, together with steel temps.
 */

const CONSTANTS = {
  TIME_STEP:        5,       // seconds (dt)
  CONV_COEFF:       25,      // W/m²K
  EMISSIVITY:       0.7,
  STEFAN_BOLTZMANN: 5.67e-8, // W/m²K⁴
  DENSITY_STEEL:    7850,    // kg/m³
};

// ── Section properties (same as ISO/Parametric calculators) ──────────────────
function calcSectionProps(h, b, tw, tf, r1, exposure) {
  const A_mm2 = 2*(b*tf) + (h-2*tf)*tw + 4*(1-Math.PI/4)*r1**2;
  const A_m2  = A_mm2 / 1e6;
  const Hp_m  = exposure === 'Three Sides'
    ? (2*h + 3*b - 2*tw + (2*Math.PI-8)*r1) / 1000
    : (2*h + 4*b - 2*tw + (2*Math.PI-8)*r1) / 1000;
  const boxF  = exposure === 'Three Sides'
    ? ((2*h + b) / A_mm2) * 1000
    : ((2*b + 2*h) / A_mm2) * 1000;
  const HpA = Hp_m / A_m2;
  const ksh = Math.min(1.0, 0.9 * (boxF / HpA));
  return { A_mm2, Hp_m, HpA, ksh };
}

// ── Specific heat of steel (EN 1993-1-2) ────────────────────────────────────
function specificHeatSteel(Ts) {
  if (Ts <= 600) return 425 + 7.73e-1*Ts - 1.69e-3*Ts**2 + 2.22e-6*Ts**3;
  if (Ts <= 735) return 666 - 13002/(Ts - 738);
  if (Ts <= 900) return 545 + 17820/(Ts - 731);
  return 650;
}

// ── iTFM Gas Temperature at position x and time t ───────────────────────────
// Formula from Excel cell F39:
// IF(t > TTOTAL, T_ROOM,
//   IF(|x - Lt + 0.5*L*Ft| <= 0.5*L*Ft,
//     T_NF,
//     MIN(T_NF, T_ROOM + 5.38/H * (L*Ft*W*QII / |x - Lt + 0.5*L*Ft|)^(2/3))
//   )
// )
function gasTempAtPosition(t_sec, x_pos, params) {
  const { TTOTAL, LF, L, S, T_ROOM, T_NF_calc, W, H, QII, FSIZE } = params;

  // Fire has ended
  if (t_sec > TTOTAL) return T_ROOM;

  // Fire trail position — how far the fire front has travelled
  const L_trail = S * t_sec;
  const Lt      = Math.min(L_trail, L);

  // Fire size factor Ft (fraction of compartment length currently burning)
  let Ft;
  if (L_trail < L) {
    Ft = Math.min(FSIZE, L_trail / L);
  } else {
    Ft = Math.max(0, 1 + (LF - L_trail) / L);
  }

  if (Ft <= 0) return T_ROOM;

  // Fire footprint: rear edge = Lt - L*Ft, front edge = Lt
  // When L_trail > L, Lt is clamped to L so the rear edge = L - L*Ft
  const rear_edge  = Lt - L * Ft;   // rear of fire footprint
  const front_edge = Lt;             // front of fire footprint (clamped to L)

  // Point is inside the fire footprint → near-field temperature
  if (x_pos >= rear_edge && x_pos <= front_edge) return T_NF_calc;

  // Distance to nearest edge of fire footprint (not centre)
  // This prevents the oscillation at the compartment boundary
  const dist_to_rear  = Math.abs(x_pos - rear_edge);
  const dist_to_front = Math.abs(x_pos - front_edge);
  const dist = Math.min(dist_to_rear, dist_to_front);

  // Enforce minimum distance to prevent far-field formula exploding near boundary
  const safe_dist = Math.max(dist, 0.5);

  // Far-field decay formula
  const q_current = L * Ft * W * QII;
  if (q_current <= 0) return T_ROOM;

  const Tg = T_ROOM + (5.38 / H) * Math.pow(q_current / safe_dist, 2/3);
  return Math.min(T_NF_calc, Tg);
}

// ── Derive all iTFM parameters from user inputs ──────────────────────────────
function deriveParams(inputs) {
  const { WIDTH: W, HEIGHT: H, L, FSIZE, QII, QF, T_ROOM, T_NF, FANGLE } = inputs;

  const TB        = QF / QII;                        // Burn time (s)
  const TTOTAL    = TB * (1/FSIZE + 1);              // Total fire duration (s)
  const LF        = L * FSIZE;                       // Fire length (m)
  const S         = LF / TB;                        // Fire spread speed (m/s)
  const theta_rad = FANGLE * Math.PI / 180;
  const F         = LF + 2*H*Math.tan(theta_rad);   // Flapping length (m)
  const Q         = W * LF * QII;                   // Peak HRR (kW)
  const R0        = Q * Math.pow(5.38 / (H * (T_NF - T_ROOM)), 1.5);
  const RX1       = Math.max(0, R0 - LF/2);
  const RX2       = Math.max(LF/2, R0);
  const R2        = F / 2;
  const Q23       = Math.pow(Q, 2/3);
  const T2        = T_ROOM*(R2-RX2) + (5.38/H)*Q23*3*(Math.pow(R2,1/3) - Math.pow(RX2,1/3));
  const Ttotal_flap = 2*T2 + 2*T_NF*RX1 + T_NF*LF;
  const T_NF_calc = (R0 > F/2) ? T_NF : Ttotal_flap / F;

  return { W, H, L, FSIZE, QII, QF, T_ROOM, T_NF, T_NF_calc, TB, TTOTAL, LF, S, F, Q, R0 };
}

// ── Main calculation function ─────────────────────────────────────────────────
function calculateITFM(inputs) {
  const {
    // Fire / compartment
    WIDTH, HEIGHT, L, FSIZE, QII, QF, T_ROOM, T_NF, FANGLE,
    // Beam position (user slider)
    x_position,
    // Steel section (mm)
    h, b, tw, tf, r1, exposure,
    // Fire protection
    Cp, dp, lambdaP, rhoP,
    T0 = 20,
  } = inputs;

  // Input validation
  if (!WIDTH || !HEIGHT || !L || !FSIZE || !QII || !QF)
    throw new Error('All compartment parameters are required');
  if (x_position < 0 || x_position > L)
    throw new Error(`Position x must be between 0 and L (${L} m)`);

  const dt   = CONSTANTS.TIME_STEP;
  const rhoA = CONSTANTS.DENSITY_STEEL;

  // Derive fire parameters
  const fireParams = deriveParams({
    WIDTH, HEIGHT, L, FSIZE, QII, QF, T_ROOM: T_ROOM || 20,
    T_NF: T_NF || 1000, FANGLE: FANGLE || 6.5,
  });

  // Section properties
  const { HpA, ksh, A_mm2, Hp_m } = calcSectionProps(h, b, tw, tf, r1, exposure);

  // Simulation — run until TTOTAL + buffer for steel to respond
  const TOTAL_SIM = Math.ceil(fireParams.TTOTAL) + 3600; // fire duration + 1hr buffer
  const results   = [];
  let Ts_u = T0, Ts_p = T0, Tg_prev = T0;

  results.push({
    timeSec: 0, timeMin: 0,
    Tg: gasTempAtPosition(0, x_position, fireParams),
    Ts_unprot: Ts_u, Ts_prot: Ts_p,
  });

  for (let t = dt; t <= TOTAL_SIM; t += dt) {
    const t_min = t / 60;
    const Tg    = gasTempAtPosition(t, x_position, fireParams);

    // Unprotected steel
    const Ca_u = specificHeatSteel(Ts_u);
    const Qc   = CONSTANTS.CONV_COEFF * (Tg - Ts_u);
    const Qr   = CONSTANTS.STEFAN_BOLTZMANN * CONSTANTS.EMISSIVITY *
                 ((Tg+273)**4 - (Ts_u+273)**4);
    Ts_u = Math.max(T0, Ts_u + (ksh * HpA / (rhoA * Ca_u)) * (Qc + Qr) * dt);

    // Protected steel (Eurocode formula, both terms × coeff — matching Excel AK)
    const Ca_p  = specificHeatSteel(Ts_p);
    const phi   = (Cp * rhoP * dp * HpA) / (Ca_p * rhoA);
    const coeff = (lambdaP / dp) / (Ca_p * rhoA) * HpA * (1 / (1 + phi / 3));
    const dTs_p = coeff * ((Tg - Ts_p) * dt - (Math.exp(phi/10) - 1) * (Tg - Tg_prev));
    Ts_p = Math.max(T0, Ts_p + dTs_p);

    results.push({
      timeSec:   t,
      timeMin:   Math.round(t_min * 100) / 100,
      Tg:        Math.round(Tg * 100) / 100,
      Ts_unprot: Math.round(Ts_u * 100) / 100,
      Ts_prot:   Math.round(Ts_p * 100) / 100,
    });

    // Stop when fire is done and steel has cooled back to near ambient
    if (t > fireParams.TTOTAL && Ts_u < T0 + 5 && Ts_p < T0 + 5) break;

    Tg_prev = Tg;
  }

  return {
    results,
    fireProps: {
      TB_min:    Math.round(fireParams.TB / 60 * 10) / 10,
      TTOTAL_min:Math.round(fireParams.TTOTAL / 60 * 10) / 10,
      LF:        Math.round(fireParams.LF * 10) / 10,
      S_mm_s:    Math.round(fireParams.S * 1000 * 100) / 100,
      T_NF:      Math.round(fireParams.T_NF_calc * 10) / 10,
      Q_kW:      Math.round(fireParams.Q),
      x_position,
    },
    sectionProps: {
      A_mm2: Math.round(A_mm2),
      Hp_m:  Math.round(Hp_m * 1000) / 1000,
      HpA:   Math.round(HpA * 10) / 10,
      ksh:   Math.round(ksh * 1000) / 1000,
    },
  };
}

module.exports = { calculateITFM, deriveParams };