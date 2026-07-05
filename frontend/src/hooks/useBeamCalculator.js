import { useState, useCallback, useEffect, useRef } from 'react';

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_INPUTS = {
  unitsKey:    'SI',
  lengthInput: 8,
  EInput:      200,
  IInput:      8e-5,
  supports: [
    { id: uid(), type: 'pin',    x: 0 },
    { id: uid(), type: 'roller', x: 8 },
  ],
  loads: [
    { id: uid(), type: 'udl', x: 0, x2: 8, w1: 10, w2: 10, P: 10, M: 0 },
  ],
};

export function useBeamCalculator() {
  const [inputs,  setInputs]  = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const updateInput = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  // Support helpers
  const addSupport = useCallback((type) => {
    const L = parseFloat(inputs.lengthInput) || 8;
    setInputs(prev => ({
      ...prev,
      supports: [...prev.supports, { id: uid(), type, x: L / 2 }],
    }));
  }, [inputs.lengthInput]);

  const updateSupport = useCallback((id, key, val) => {
    setInputs(prev => ({
      ...prev,
      supports: prev.supports.map(s => s.id === id ? { ...s, [key]: val } : s),
    }));
  }, []);

  const removeSupport = useCallback((id) => {
    setInputs(prev => ({ ...prev, supports: prev.supports.filter(s => s.id !== id) }));
  }, []);

  // Load helpers
  const addLoad = useCallback((type) => {
    const L = parseFloat(inputs.lengthInput) || 8;
    setInputs(prev => ({
      ...prev,
      loads: [...prev.loads, { id: uid(), type, x: L / 2, x2: L, P: 10, w1: 5, w2: 5, M: 10 }],
    }));
  }, [inputs.lengthInput]);

  const updateLoad = useCallback((id, key, val) => {
    setInputs(prev => ({
      ...prev,
      loads: prev.loads.map(l => l.id === id ? { ...l, [key]: val } : l),
    }));
  }, []);

  const removeLoad = useCallback((id) => {
    setInputs(prev => ({ ...prev, loads: prev.loads.filter(l => l.id !== id) }));
  }, []);

  const calculate = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const payload = {
        lengthInput: parseFloat(inputs.lengthInput) || 8,
        EInput:      parseFloat(inputs.EInput)      || 200,
        IInput:      parseFloat(inputs.IInput)      || 8e-5,
        unitsKey:    inputs.unitsKey,
        supports:    inputs.supports.map(s => ({ ...s, x: parseFloat(s.x) || 0 })),
        loads:       inputs.loads.map(l => ({
          ...l,
          x:  parseFloat(l.x)  || 0,
          x2: parseFloat(l.x2) || 0,
          P:  parseFloat(l.P)  || 0,
          w1: parseFloat(l.w1) || 0,
          w2: parseFloat(l.w2) || 0,
          M:  parseFloat(l.M)  || 0,
        })),
      };

      const res  = await fetch('/api/calculate-beam', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
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

  return {
    inputs, updateInput,
    supports: inputs.supports, addSupport, updateSupport, removeSupport,
    loads:    inputs.loads,    addLoad,    updateLoad,    removeLoad,
    results, loading, error,
  };
}
