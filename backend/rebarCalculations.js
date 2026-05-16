/**
 * Rebar Temperature Calculator
 * 1D Explicit Finite Difference — Heat conduction through concrete slab
 * Based on: rebar_temperature_1D_explicit.xlsx
 * Verified to 4 decimal places against Excel
 *
 * Physics:
 *  - One-sided heating: fire heats the bottom slab face (z=0)
 *  - Heat conducts upward through N concrete layers of thickness dz
 *  - Rebar sits at depth zr (interpolated between two nodes)
 *  - Back face (top of slab) is insulated (adiabatic)
 *
 * Stability: Fourier number Fo = k*dt/(rho*c*dz²) must be ≤ 0.5
 */

// ── ISO 834 gas temperature ────────────────────────────────────────────────
function iso834(t_sec, T_amb) {
  if (t_sec <= 0) return T_amb;
  return T_amb + 345 * Math.log10(8 * (t_sec / 60) + 1);
}

// ── Main calculation ──────────────────────────────────────────────────────
function calculateRebar(inputs) {
  const {
    // Discretisation
    dt = 5,           // time step (s)
    dz = 0.01,        // space step (m)
    Z  = 0.13,        // slab depth (m)
    zr = 0.025,       // rebar cover depth (m)
    totalDuration,    // total simulation time (s) — optional override
    // Concrete thermal properties
    rho = 2300,       // density (kg/m³)
    c_p = 900,        // specific heat (J/kg·K)
    k   = 1.4,        // conductivity (W/m·K)
    h_c = 25,         // convection coefficient (W/m²·K)
    eps = 0.7,        // emissivity
    T_amb = 20,       // ambient / initial temperature (°C)
    // ISO mode
    isoMode = 'auto', // 'auto' | 'custom'
    customTg = [],    // [{timeSec, Tg}] if isoMode === 'custom'
  } = inputs;

  const sig = 5.670374e-8; // Stefan–Boltzmann

  // ── Derived / validation ─────────────────────────────────────────────
  const N     = Math.round(Z / dz);           // number of layers
  const Fo    = k * dt / (rho * c_p * dz * dz); // Fourier number
  const i_low = Math.floor(zr / dz);          // lower rebar node index
  const f     = (zr - i_low * dz) / dz;       // interpolation fraction

  if (Fo > 0.5) {
    throw new Error(
      `Unstable: Fourier number Fo=${Fo.toFixed(4)} > 0.5. ` +
      `Reduce time step dt or increase space step dz.`
    );
  }
  if (i_low + 1 > N) {
    throw new Error(`Rebar cover depth zr=${zr}m exceeds slab depth Z=${Z}m`);
  }

  // ── Gas temperature source ────────────────────────────────────────────
  // Build a lookup: timeSec → Tg (°C)
  const duration = totalDuration || Math.ceil(7200 / dt) * dt; // default 2hrs
  const nSteps   = Math.ceil(duration / dt);

  function getTg(t_sec) {
    if (isoMode === 'custom' && customTg.length > 0) {
      // Linear interpolation from user-provided table
      const arr = customTg;
      if (t_sec <= arr[0].timeSec) return arr[0].Tg;
      if (t_sec >= arr[arr.length - 1].timeSec) return arr[arr.length - 1].Tg;
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].timeSec <= t_sec && t_sec <= arr[i + 1].timeSec) {
          const frac = (t_sec - arr[i].timeSec) / (arr[i + 1].timeSec - arr[i].timeSec);
          return arr[i].Tg + frac * (arr[i + 1].Tg - arr[i].Tg);
        }
      }
    }
    return iso834(t_sec, T_amb);
  }

  // ── Finite difference simulation ─────────────────────────────────────
  // T[0]   = surface node (z=0, heated face)
  // T[1..N-1] = interior nodes
  // T[N]   = back face node (z=Z, insulated)
  const T      = new Array(N + 1).fill(T_amb);
  const coeff  = 2 * dt / (rho * c_p * dz); // surface node coefficient

  const results = [];
  results.push({
    timeSec: 0, timeMin: 0,
    Tg:     T_amb,
    Tsurf:  T_amb,
    Trebar: T_amb,
  });

  let Tg_prev = T_amb; // Explicit: use Tg from PREVIOUS timestep for surface BC

  for (let step = 1; step <= nSteps; step++) {
    const t_sec  = step * dt;
    const Tg_cur = getTg(t_sec);
    const TgK    = Tg_prev + 273.15; // previous-step gas temp in K

    const T_new = T.slice();

    // Surface node (z=0) — mixed BC: convection + radiation + conduction to E[1]
    T_new[0] = T[0] + coeff * (
      h_c  * (TgK - (T[0] + 273.15)) +
      eps  * sig * (Math.pow(TgK, 4) - Math.pow(T[0] + 273.15, 4)) +
      (k / dz) * (T[1] - T[0])
    );

    // Interior nodes — explicit central difference
    for (let i = 1; i < N; i++) {
      T_new[i] = T[i] + Fo * (T[i + 1] - 2 * T[i] + T[i - 1]);
    }

    // Back face (insulated) — adiabatic: T_new[N] = T[N] + 2*Fo*(T[N-1]-T[N])
    T_new[N] = T[N] + 2 * Fo * (T[N - 1] - T[N]);

    // Apply
    for (let i = 0; i <= N; i++) T[i] = T_new[i];

    // Rebar temperature — linear interpolation between i_low and i_low+1
    const T_rebar = T[i_low] + f * (T[i_low + 1] - T[i_low]);

    results.push({
      timeSec: t_sec,
      timeMin: Math.round((t_sec / 60) * 100) / 100,
      Tg:      Math.round(Tg_cur   * 100) / 100,
      Tsurf:   Math.round(T[0]     * 100) / 100,
      Trebar:  Math.round(T_rebar  * 100) / 100,
    });

    Tg_prev = Tg_cur;
  }

  // Build temperature profile at final timestep (for cross-section diagram)
  const finalProfile = T.map((temp, i) => ({
    z_mm: Math.round(i * dz * 1000),
    T:    Math.round(temp * 10) / 10,
  }));

  return {
    results,
    finalProfile,
    derivedProps: {
      N,
      Fo:     Math.round(Fo * 10000) / 10000,
      i_low,
      f:      Math.round(f  * 10000) / 10000,
      stable: Fo <= 0.5,
      isoMode,
    },
  };
}

module.exports = { calculateRebar, iso834 };
