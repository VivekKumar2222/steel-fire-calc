/**
 * Steel Fire Temperature Calculations
 * Based on Eurocode 1-2 / EN 1993-1-2
 * Ported from Excel: ISO_Gas_to_Steel_Temperature
 */

const CONSTANTS = {
  TIME_STEP: 5,           // seconds (D5)
  CONV_COEFF: 25,         // W/mK (D6) - convective coefficient
  EMISSIVITY: 0.7,        // (D7)
  STEFAN_BOLTZMANN: 5.67e-8, // W/m²K⁴ (D8)
  DENSITY_STEEL: 7850,    // kg/m³ (D9)
  INITIAL_TEMP: 20,       // °C (D4)
  TOTAL_TIME: 8250,       // seconds (1662 rows - 4 header rows) * 5s = ~8250s (137.5 min)
};

/**
 * ISO 834 Gas Temperature curve
 * Tg = 20 + 345 * log10(8*t + 1)  where t in minutes
 */
function gasTemperatureISO(timeMin) {
  if (timeMin <= 0) return 20;
  return 20 + 345 * Math.log10(8 * timeMin + 1);  // full precision, no rounding
}

/**
 * Specific heat of steel (Eurocode 1993-1-2)
 * Ca = f(Ts) in J/kgK
 */
function specificHeatSteel(Ts) {
  if (Ts <= 600) return 425 + 7.73e-1 * Ts - 1.69e-3 * Ts ** 2 + 2.22e-6 * Ts ** 3;
  if (Ts <= 735) return 666 - 13002 / (Ts - 738);
  if (Ts <= 900) return 545 + 17820 / (Ts - 731);
  if (Ts <= 1200) return 650;
  return 650;
}

/**
 * Cross-sectional area of I-section (mm²)
 * Formula from Excel D24: 2*(b*tf) + (h - 2*tf)*tw + 4*(1-PI/4)*(r1²)
 */
function calcCrossSectionArea({ h, b, tw, tf, r1 }) {
  return 2 * (b * tf) + (h - 2 * tf) * tw + 4 * (1 - Math.PI / 4) * r1 ** 2;
}

/**
 * Heated perimeter of I-section (mm)
 * All Sides:   2*h + 4*b - 2*tw + (2*PI - 8)*r1
 * Three Sides: 2*h + 3*b - 2*tw + (2*PI - 8)*r1  (bottom flange not exposed)
 */
function calcHeatedPerimeter({ h, b, tw, r1 }, exposure) {
  const base = 2 * h + (2 * Math.PI - 8) * r1 - 2 * tw;
  if (exposure === 'Three Sides') return base + 3 * b;
  return base + 4 * b; // All Sides
}

/**
 * Box perimeter factor used in ksh numerator (Excel C47 / C48)
 * All Sides:   box = 2h + 2b  → C47 = (Hpb/A) * 1000  = D29*1000
 * Three Sides: box = 2h + b   → C48 = ((2h + b) / A) * 1000
 *
 * The "box" for three sides only wraps 3 faces of the bounding rectangle,
 * so the bottom flange width (b) is counted once, not twice.
 * Returns the value in the same units as Hp/A (m⁻¹) for the ksh ratio.
 */
function calcBoxFactor({ h, b }, A_mm2, exposure) {
  if (exposure === 'Three Sides') {
    // Excel C48 = ((2*h + b) / A_mm2) * 1000
    return ((2 * h + b) / A_mm2) * 1000;
  }
  // Excel C47 = D29 * 1000 = ((Hpb_m * 1000) / A_mm2) * 1000
  // Hpb_m = (2b + 2h) / 1000  →  C47 = (2b + 2h) / A_mm2 * 1000
  return ((2 * b + 2 * h) / A_mm2) * 1000;
}

/**
 * Correction factor Ksh (shadow effect, EN 1993-1-2 §4.2.5.1)
 * All Sides:   ksh = 0.9 * C47 / (Hp/A)
 * Three Sides: ksh = 0.9 * C48 / (Hp/A)
 */
function calcKsh(boxFactor, HpPerA_actual) {
  return Math.min(1.0, 0.9 * (boxFactor / HpPerA_actual));
}

/**
 * Unprotected steel temperature increment (Eurocode)
 * ΔTs = (ksh * Hp/A) / (ρa * Ca) * Qnet * Δt
 */
function calcDeltaTsUnprotected(ksh, HpPerA, rhoA, Ca, Qnet, dt) {
  return (ksh * HpPerA / (rhoA * Ca)) * Qnet * dt;
}

/**
 * Protected steel temperature increment (Eurocode)
 * phi = (Cp * rhoP) / (Ca * rhoA) * dp * Hp/A
 * ΔTs = [(lambdaP * Hp/A) / (dp * Ca * rhoA * (1 + phi/3))] * (Tg - Ts) * dt - (exp(phi/10) - 1) * ΔTg
 */
function calcDeltaTsProtected(params, Tg_prev, Tg_curr, Ts_prev, Ca, dt) {
  const { Cp, dp, lambdaP, rhoP } = params;
  const { DENSITY_STEEL: rhoA } = CONSTANTS;
  const HpA = params.HpPerA; // m⁻¹

  const phi = (Cp * rhoP * dp * HpA) / (Ca * rhoA);
  const DeltaTg = Tg_curr - Tg_prev;
  const coeff = (lambdaP * HpA) / (dp * Ca * rhoA * (1 + phi / 3));
  const deltaTs = coeff * (Tg_curr - Ts_prev) * dt - (Math.exp(phi / 10) - 1) * DeltaTg;
  return { deltaTs, phi };
}

/**
 * Main calculation engine
 */
function calculateTemperatures(inputs) {
  const {
    // Fire protection
    Cp,       // specific heat of protection J/kgK
    dp,       // thickness of fire protection m
    lambdaP,  // thermal conductivity W/mK
    rhoP,     // density of protection kg/m³
    // Section geometry (mm)
    h, b, tw, tf, r1,
    // Exposure
    exposure, // 'All Sides' | 'Three Sides'
  } = inputs;

  // Validate inputs
  if (!Cp || !dp || !lambdaP || !rhoP || !h || !b || !tw || !tf || !r1) {
    throw new Error('All inputs are required');
  }
  if (dp <= 0 || lambdaP <= 0 || rhoP <= 0) throw new Error('Protection parameters must be positive');
  if (h <= 0 || b <= 0 || tw <= 0 || tf <= 0 || r1 <= 0) throw new Error('Section dimensions must be positive');

  const dt = CONSTANTS.TIME_STEP;
  const rhoA = CONSTANTS.DENSITY_STEEL;

  // Section properties
  const A_mm2 = calcCrossSectionArea({ h, b, tw, tf, r1 });
  const A_m2 = A_mm2 / 1e6;

  const Hp_mm = calcHeatedPerimeter({ h, b, tw, r1 }, exposure);
  const Hp_m = Hp_mm / 1000;

  // Hp/A — actual section factor (m⁻¹)
  const HpPerA = Hp_m / A_m2;

  // Box perimeter factor (numerator of ksh ratio) — exposure-aware
  // All Sides:   Excel C47 = (2b + 2h) / A_mm2 * 1000
  // Three Sides: Excel C48 = (2h + b)  / A_mm2 * 1000  ← bottom flange not exposed
  const boxFactor = calcBoxFactor({ h, b }, A_mm2, exposure);

  // Hpb for display only (always 4-sided bounding box perimeter)
  const Hpb_m = (2 * b + 2 * h) / 1000;

  // Shadow factor ksh — exposure-aware, matches Excel D32
  const ksh = calcKsh(boxFactor, HpPerA);

  // Ap/V (same as Hp/A for open sections)
  const ApV = HpPerA;

  const results = [];
  let Ts_unprot = CONSTANTS.INITIAL_TEMP;
  let Ts_prot = CONSTANTS.INITIAL_TEMP;
  let Tg_prev = CONSTANTS.INITIAL_TEMP;

  // Row at t=0
  results.push({
    timeSec: 0,
    timeMin: 0,
    Tg: CONSTANTS.INITIAL_TEMP,
    Ts_unprot: Ts_unprot,
    Ts_prot: Ts_prot,
  });

  // Time loop: 5s steps up to 8250s (137.5 min)
  for (let t = dt; t <= CONSTANTS.TOTAL_TIME; t += dt) {
    const timeMin = t / 60;
    const Tg = gasTemperatureISO(timeMin);

    // --- UNPROTECTED STEEL ---
    const Ca_unprot = specificHeatSteel(Ts_unprot);
    // Heat flux: convection + radiation
    const Qc = CONSTANTS.CONV_COEFF * (Tg - Ts_unprot);
    const Qr = CONSTANTS.STEFAN_BOLTZMANN * CONSTANTS.EMISSIVITY *
      ((Tg + 273) ** 4 - (Ts_unprot + 273) ** 4);
    const Qnet = Qc + Qr;

    const deltaTs_u = calcDeltaTsUnprotected(ksh, HpPerA, rhoA, Ca_unprot, Qnet, dt);
    Ts_unprot = Math.max(20, Ts_unprot + deltaTs_u);  // full float — no rounding

    // --- PROTECTED STEEL ---
    const Ca_prot = specificHeatSteel(Ts_prot);
    const { deltaTs: deltaTs_p } = calcDeltaTsProtected(
      { Cp, dp, lambdaP, rhoP, HpPerA },
      Tg_prev, Tg, Ts_prot, Ca_prot, dt
    );
    Ts_prot = Math.max(20, Ts_prot + (deltaTs_p > 0 ? deltaTs_p : 0));  // full float — no rounding

    results.push({
      timeSec: t,
      timeMin: Math.round(timeMin * 100) / 100,
      Tg: Tg,
      Ts_unprot: Math.round(Ts_unprot * 100) / 100,  // round only for output, 2dp
      Ts_prot:   Math.round(Ts_prot   * 100) / 100,  // round only for output, 2dp
    });

    Tg_prev = Tg;
  }

  return {
    results,
    sectionProps: {
      A_mm2: Math.round(A_mm2),
      Hp_mm: Math.round(Hp_mm * 10) / 10,
      Hpb_m: Math.round(Hpb_m * 1000) / 1000,
      HpPerA: Math.round(HpPerA * 10) / 10,
      HpbPerA: Math.round(boxFactor * 10) / 10,
      ksh: Math.round(ksh * 1000) / 1000,
      ApV: Math.round(ApV * 10) / 10,
    },
  };
}

module.exports = { calculateTemperatures };
