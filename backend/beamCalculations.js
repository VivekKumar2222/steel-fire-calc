/**
 * Euler-Bernoulli Beam FEM Solver
 * Ported from the reference implementation.
 * DOF per node: [v (vertical displacement), θ (rotation)]
 * Sign convention: downward user load = positive input → negative internal
 */

const UNIT_SETS = {
  SI:  { toBase: { L: 1,     F: 1000,  M: 1000,  E: 1e9,  I: 1      }, fromBase: { F: 1/1000, M: 1/1000, def: 1000 } },
  NMM: { toBase: { L: 0.001, F: 1,     M: 0.001, E: 1e6,  I: 1e-12  }, fromBase: { F: 1,      M: 1000,   def: 1000 } },
};

function uniqueSorted(values, tol = 1e-8) {
  const arr = values.filter(Number.isFinite).sort((a, b) => a - b);
  const out = [];
  for (const v of arr) {
    if (!out.length || Math.abs(v - out[out.length - 1]) > tol) out.push(v);
  }
  return out;
}

function shapeFunctions(Le, xLocal) {
  const xi = xLocal / Le, xi2 = xi * xi, xi3 = xi2 * xi;
  return [
    1 - 3*xi2 + 2*xi3,
    Le * (xi - 2*xi2 + xi3),
    3*xi2 - 2*xi3,
    Le * (-xi2 + xi3),
  ];
}

function interpolateDeflection(d1, th1, d2, th2, Le, xLocal) {
  const N = shapeFunctions(Le, xLocal);
  return N[0]*d1 + N[1]*th1 + N[2]*d2 + N[3]*th2;
}

function equivalentNodalLoad(qA, qB, a, b, x1, x2) {
  const fe = [0, 0, 0, 0];
  const Le = x2 - x1;
  const left = Math.max(a, x1), right = Math.min(b, x2);
  if (right <= left) return fe;
  const gps = [-0.8611363116, -0.3399810436, 0.3399810436, 0.8611363116];
  const gws = [ 0.3478548451,  0.6521451549, 0.6521451549, 0.3478548451];
  const mid = (left + right) / 2, half = (right - left) / 2;
  for (let i = 0; i < 4; i++) {
    const x = mid + half * gps[i];
    const t = (b - a) === 0 ? 0 : (x - a) / (b - a);
    const q = qA + (qB - qA) * t;
    const N = shapeFunctions(Le, x - x1);
    for (let j = 0; j < 4; j++) fe[j] += N[j] * q * half * gws[i];
  }
  return fe;
}

function solveLinear(Ain, bin) {
  const n = bin.length;
  const A = Ain.map(r => r.slice());
  const b = bin.slice();
  const eps = 1e-12;
  for (let k = 0; k < n; k++) {
    let maxRow = k, maxVal = Math.abs(A[k][k]);
    for (let r = k + 1; r < n; r++) {
      if (Math.abs(A[r][k]) > maxVal) { maxVal = Math.abs(A[r][k]); maxRow = r; }
    }
    if (maxVal < eps) throw new Error('Stiffness matrix is singular — beam is unstable or under-supported.');
    if (maxRow !== k) {
      [A[k], A[maxRow]] = [A[maxRow], A[k]];
      [b[k], b[maxRow]] = [b[maxRow], b[k]];
    }
    const pivot = A[k][k];
    for (let j = k; j < n; j++) A[k][j] /= pivot;
    b[k] /= pivot;
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const f = A[i][k];
      for (let j = k; j < n; j++) A[i][j] -= f * A[k][j];
      b[i] -= f * b[k];
    }
  }
  return b;
}

function calculateBeam({ lengthInput, EInput, IInput, unitsKey = 'SI', supports = [], loads = [] }) {
  const units = UNIT_SETS[unitsKey];
  if (!units) throw new Error(`Unknown unit system: ${unitsKey}`);

  const L = Number(lengthInput) * units.toBase.L;
  const E = Number(EInput)      * units.toBase.E;
  const I = Number(IInput)      * units.toBase.I;

  const warnings = [];
  if (!(L > 0)) warnings.push('Beam length must be greater than zero.');
  if (!(E > 0)) warnings.push("Young's modulus E must be greater than zero.");
  if (!(I > 0)) warnings.push('Moment of inertia I must be greater than zero.');
  if (!supports.length) warnings.push('At least one support is required.');
  if (!loads.length) warnings.push('No loads defined — add at least one load.');
  if (warnings.length) return { ok: false, warnings };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
  const cleanSupports = supports.map(s => ({ ...s, x: clamp(Number(s.x) * units.toBase.L, 0, L) }));
  const cleanLoads    = loads.map(ld => ({
    ...ld,
    x:  clamp(Number(ld.x)  * units.toBase.L, 0, L),
    x2: clamp(Number(ld.x2 ?? ld.x) * units.toBase.L, 0, L),
  }));

  // Build adaptive mesh
  const bp = [0, L, ...cleanSupports.map(s => s.x)];
  for (const ld of cleanLoads) {
    bp.push(ld.x);
    if (['udl', 'uvl'].includes(ld.type)) bp.push(ld.x2);
  }
  for (let i = 1; i < 80; i++) bp.push(L * i / 80);
  const xs    = uniqueSorted(bp, Math.max(L * 1e-9, 1e-9));
  const nNode = xs.length;
  const nDof  = nNode * 2;

  // Assemble global K and F
  const K = Array.from({ length: nDof }, () => new Array(nDof).fill(0));
  const F = new Array(nDof).fill(0);

  for (let e = 0; e < nNode - 1; e++) {
    const x1 = xs[e], x2 = xs[e + 1], Le = x2 - x1;
    if (Le <= 0) continue;
    const Le2 = Le * Le, Le3 = Le2 * Le, c = (E * I) / Le3;
    const ke = [
      [ 12*c,    6*Le*c,  -12*c,    6*Le*c  ],
      [  6*Le*c, 4*Le2*c, -6*Le*c,  2*Le2*c ],
      [-12*c,   -6*Le*c,  12*c,   -6*Le*c   ],
      [  6*Le*c, 2*Le2*c, -6*Le*c,  4*Le2*c ],
    ];
    let fe = [0, 0, 0, 0];
    for (const ld of cleanLoads) {
      if (ld.type === 'udl' || ld.type === 'uvl') {
        const a = Math.min(ld.x, ld.x2), b = Math.max(ld.x, ld.x2);
        if (b > a) {
          const q1 = -(Number(ld.w1 || 0) * units.toBase.F) / units.toBase.L;
          const q2 = -(Number(ld.w2 ?? ld.w1 ?? 0) * units.toBase.F) / units.toBase.L;
          const sub = equivalentNodalLoad(q1, q2, a, b, x1, x2);
          fe = fe.map((v, i) => v + sub[i]);
        }
      }
    }
    const dofs = [2*e, 2*e+1, 2*(e+1), 2*(e+1)+1];
    for (let i = 0; i < 4; i++) {
      F[dofs[i]] += fe[i];
      for (let j = 0; j < 4; j++) K[dofs[i]][dofs[j]] += ke[i][j];
    }
  }

  // Point loads and moments
  for (const ld of cleanLoads) {
    const node = xs.reduce((best, x, i) => Math.abs(x - ld.x) < Math.abs(xs[best] - ld.x) ? i : best, 0);
    if (ld.type === 'point')  F[2 * node]     += -(Number(ld.P || 0) * units.toBase.F);
    if (ld.type === 'moment') F[2 * node + 1] +=   Number(ld.M || 0) * units.toBase.M;
  }

  // Boundary conditions
  const restrained = new Set();
  const suppNodeMap = cleanSupports.map(s => {
    const node = xs.reduce((best, x, i) => Math.abs(x - s.x) < Math.abs(xs[best] - s.x) ? i : best, 0);
    if (s.type === 'pin' || s.type === 'roller') restrained.add(2 * node);
    if (s.type === 'fixed') { restrained.add(2 * node); restrained.add(2 * node + 1); }
    return { ...s, node };
  });

  const free = [], fixed = [];
  for (let i = 0; i < nDof; i++) (restrained.has(i) ? fixed : free).push(i);
  if (!fixed.length) return { ok: false, warnings: ['No DOF restrained — add supports.'] };

  // Solve
  const Kff = free.map(r => free.map(c => K[r][c]));
  const Ff  = free.map(r => F[r]);
  let uf;
  try { uf = solveLinear(Kff, Ff); }
  catch (err) { return { ok: false, warnings: [err.message] }; }

  const U = new Array(nDof).fill(0);
  free.forEach((d, i) => { U[d] = uf[i]; });

  // Reactions
  const KU = new Array(nDof).fill(0);
  for (let i = 0; i < nDof; i++)
    for (let j = 0; j < nDof; j++) KU[i] += K[i][j] * U[j];
  const R = KU.map((v, i) => v - F[i]);

  const reactions = suppNodeMap.map(s => ({
    id: s.id, type: s.type, x: s.x,
    Ry: R[2 * s.node],
    M:  s.type === 'fixed' ? R[2 * s.node + 1] : 0,
  }));

  // Prepare load data for diagram computation
  const pointLoads   = cleanLoads.filter(l => l.type === 'point').map(l => ({ x: l.x, P: -(Number(l.P || 0) * units.toBase.F) }));
  const pointMoments = cleanLoads.filter(l => l.type === 'moment').map(l => ({ x: l.x, M: Number(l.M || 0) * units.toBase.M }));
  const distLoads    = cleanLoads
    .filter(l => l.type === 'udl' || l.type === 'uvl')
    .map(l => ({
      a:  Math.min(l.x, l.x2), b: Math.max(l.x, l.x2),
      q1: -(Number(l.w1 || 0) * units.toBase.F) / units.toBase.L,
      q2: -(Number(l.w2 ?? l.w1 ?? 0) * units.toBase.F) / units.toBase.L,
    })).filter(l => l.b > l.a);

  function distResultantUpTo(ld, x) {
    const z = Math.min(Math.max(x, ld.a), ld.b) - ld.a;
    if (z <= 0) return { F: 0, MaboutX: 0 };
    const len = ld.b - ld.a, k = (ld.q2 - ld.q1) / len;
    const z2 = z * z, z3 = z2 * z;
    return {
      F:       ld.q1 * z + 0.5 * k * z2,
      MaboutX: ld.q1 * ((x - ld.a) * z - z2 / 2) + k * ((x - ld.a) * z2 / 2 - z3 / 3),
    };
  }

  // Sample 401 points for diagram
  const nSample = 401;
  const diagram = [];
  for (let i = 0; i < nSample; i++) {
    const x = L * i / (nSample - 1);
    let V = 0, M = 0;
    for (const r of reactions)     { if (r.x <= x + 1e-10) { V += r.Ry; M += r.Ry * (x - r.x) - r.M; } }
    for (const p of pointLoads)    { if (p.x <= x + 1e-10) { V += p.P;  M += p.P  * (x - p.x); } }
    for (const m of pointMoments)  { if (m.x <= x + 1e-10)   M -= m.M; }
    for (const dl of distLoads)    { const res = distResultantUpTo(dl, x); V += res.F; M += res.MaboutX; }

    const fi = xs.findIndex(xx => xx >= x);
    const ei = Math.max(0, Math.min(fi <= 0 ? 0 : fi - 1, xs.length - 2));
    const Le = xs[ei + 1] - xs[ei];
    const d  = interpolateDeflection(U[2*ei], U[2*ei+1], U[2*(ei+1)], U[2*(ei+1)+1], Le, x - xs[ei]);
    diagram.push({ x, V, M, d });
  }

  const maxAbs = (arr, key) => arr.reduce((a, b) => Math.abs(b[key]) > Math.abs(a[key]) ? b : a, arr[0]);

  return {
    ok: true,
    warnings: [],
    diagram,
    reactions,
    L,
    results: {
      maxV: maxAbs(diagram, 'V'),
      maxM: maxAbs(diagram, 'M'),
      maxD: maxAbs(diagram, 'd'),
    },
  };
}

module.exports = { calculateBeam };
