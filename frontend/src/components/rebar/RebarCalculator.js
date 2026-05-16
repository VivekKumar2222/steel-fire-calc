import React from 'react';
import { useRebarCalculator } from '../../hooks/useRebarCalculator';
import RebarInputPanel  from './RebarInputPanel';
import RebarResultsArea from './RebarResultsArea';

export default function RebarCalculator() {
  const { inputs, updateInput, results, loading, error } = useRebarCalculator();
  return (
    <div className="main-layout">
      <RebarInputPanel inputs={inputs} updateInput={updateInput}
        results={results} loading={loading} error={error} />
      <main className="content-area">
        <RebarResultsArea results={results} inputs={inputs} />
      </main>
    </div>
  );
}
