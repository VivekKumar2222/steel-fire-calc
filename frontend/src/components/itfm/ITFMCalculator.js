import React from 'react';
import { useITFMCalculator } from '../../hooks/useITFMCalculator';
import ITFMInputPanel   from './ITFMInputPanel';
import ITFMResultsArea  from './ITFMResultsArea';

export default function ITFMCalculator() {
  const { inputs, updateInput, results, loading, error } = useITFMCalculator();

  return (
    <div className="main-layout">
      <ITFMInputPanel inputs={inputs} updateInput={updateInput}
        results={results} loading={loading} error={error} />
      <main className="content-area">
        <ITFMResultsArea results={results} inputs={inputs} updateInput={updateInput} />
      </main>
    </div>
  );
}
