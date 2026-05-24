import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_INPUTS = {
  // Compartment
  B_room: 9, H_room: 15, H_comp: 2.9,
  // Doors
  n_doors: 2, W_door: 15, H_door: 1.9,
  // Windows
  n_windows: 1, W_win: 9, H_win: 2.9,
  // Fire load
  fire_mode: 'Medium',
  qfk: 511,
  dq2: 1, dn: 1, m: 1,
  // Wall materials
  wall_material: 'Normal Bricks',
  roof_material: 'NW Concrete',
  // Section geometry (mm)
  h: 150, b: 160, tw: 6, tf: 9, r1: 18,
  exposure: 'All Sides',
  // Fire protection
  Cp: 1200, dp: 0.01, lambdaP: 0.174, rhoP: 430,
  T0: 20,
};

export function useParametricCalculator() {
  const [inputs, setInputs]   = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const updateInput = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const calculate = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const payload = { ...inputs };
      const numericKeys = ['B_room','H_room','H_comp','n_doors','W_door','H_door',
        'n_windows','W_win','H_win','qfk','dq2','dn','m','h','b','tw','tf','r1',
        'Cp','dp','lambdaP','rhoP','T0'];
      numericKeys.forEach(k => { payload[k] = parseFloat(payload[k]); });

      const res  = await fetch('https://backend.structguru.com/api/calculate-parametric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Calculation failed');
      setResults(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [inputs]);

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(calculate, 400);
    return () => clearTimeout(debounceRef.current);
  }, [inputs, calculate]);

  return { inputs, updateInput, results, loading, error, calculate };
}
