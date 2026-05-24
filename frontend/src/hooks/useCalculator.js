import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_INPUTS = {
  // Fire protection
  Cp: 1200,
  dp: 0.01,
  lambdaP: 0.174,
  rhoP: 430,
  // Section geometry (mm)
  h: 190,
  b: 200,
  tw: 6.5,
  tf: 10,
  r1: 18,
  // Exposure
  exposure: 'All Sides',
};

export function useCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateInput = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const calculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...inputs };
      const numericKeys = ['Cp', 'dp', 'lambdaP', 'rhoP', 'h', 'b', 'tw', 'tf', 'r1'];
      numericKeys.forEach(k => { payload[k] = parseFloat(payload[k]); });

      const res = await fetch('https://backend.structguru.com/api/calculate', {  //https://backend.structguru.com/api/calculate
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

  // Auto-calculate whenever inputs change, debounced 300ms
  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      calculate();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [inputs, calculate]);

  return { inputs, updateInput, results, loading, error, calculate };
}
