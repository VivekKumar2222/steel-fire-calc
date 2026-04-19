import React from 'react';
import { useParametricCalculator } from '../../hooks/useParametricCalculator';
import ParametricInputPanel  from './ParametricInputPanel';
import ParametricResultsArea from './ParametricResultsArea';

export default function ParametricCalculator() {
  const { inputs, updateInput, results, loading, error } = useParametricCalculator();

  return (
    <div className="main-layout">
      <ParametricInputPanel
        inputs={inputs}
        updateInput={updateInput}
        results={results}
        loading={loading}
        error={error}
      />
      <main className="content-area">
        <ParametricResultsArea results={results} inputs={inputs} />
      </main>
    </div>
  );
}
