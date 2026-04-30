import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_INPUTS = {
  // Compartment
  WIDTH: 10, HEIGHT: 3.5, L: 100,
  // Fire
  FSIZE: 0.1, QII: 450, QF: 511000,
  T_ROOM: 20, T_NF: 1000, FANGLE: 6.5,
  // Beam position
  x_position: 3.5,
  // Steel section (mm)
  h: 190, b: 200, tw: 6.5, tf: 10, r1: 18,
  exposure: 'All Sides',
  // Fire protection
  Cp: 1200, dp: 0.01, lambdaP: 0.174, rhoP: 430,
  T0: 20,
};

export function useITFMCalculator() {
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
      const numericKeys = ['WIDTH','HEIGHT','L','FSIZE','QII','QF','T_ROOM','T_NF','FANGLE',
        'x_position','h','b','tw','tf','r1','Cp','dp','lambdaP','rhoP','T0'];
      numericKeys.forEach(k => { payload[k] = parseFloat(payload[k]); });

      const res  = await fetch('/api/calculate-itfm', {
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

  return { inputs, updateInput, results, loading, error };
}
