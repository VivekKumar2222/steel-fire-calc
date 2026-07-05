import React from 'react';
import { useBeamCalculator } from '../../hooks/useBeamCalculator';
import BeamInputPanel  from './BeamInputPanel';
import BeamResultsArea from './BeamResultsArea';

export default function BeamCalculator() {
  const {
    inputs, updateInput,
    supports, addSupport, updateSupport, removeSupport,
    loads,   addLoad,    updateLoad,    removeLoad,
    results, loading, error,
  } = useBeamCalculator();

  return (
    <div className="main-layout">
      <BeamInputPanel
        inputs={inputs}           updateInput={updateInput}
        supports={supports}       addSupport={addSupport}
        updateSupport={updateSupport} removeSupport={removeSupport}
        loads={loads}             addLoad={addLoad}
        updateLoad={updateLoad}   removeLoad={removeLoad}
        results={results}         loading={loading}
        error={error}
      />
      <main className="content-area">
        <BeamResultsArea
          results={results}
          inputs={inputs}
          supports={supports}
          loads={loads}
        />
      </main>
    </div>
  );
}
