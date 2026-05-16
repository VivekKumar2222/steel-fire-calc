import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_INPUTS = {
  dt: 5, dz: 0.01, Z: 0.13, zr: 0.025,
  totalDuration: 7590,
  rho: 2300, c_p: 900, k: 1.4, h_c: 25, eps: 0.7, T_amb: 20,
  isoMode: 'auto',
  customTg: [],
};

export function useRebarCalculator() {
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
      ['dt','dz','Z','zr','totalDuration','rho','c_p','k','h_c','eps','T_amb']
        .forEach(k => { payload[k] = parseFloat(payload[k]); });

      const res  = await fetch('https://backend.structguru.com/api/calculate-rebar', {
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
