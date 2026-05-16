import React, { useMemo, useState } from 'react';
import { exportXLSX, exportPDF } from '../../utils/exportData';

function filterByMinute(results) {
  return results.filter((_, i) => i % 12 === 0);
}

export default function RebarTable({ results, inputs = {} }) {
  const [showAll, setShowAll]     = useState(false);
  const [exporting, setExporting] = useState(null);

  const rows = useMemo(() => {
    if (!results) return [];
    return showAll ? results : filterByMinute(results);
  }, [results, showAll]);

  async function handleExport(type) {
    setExporting(type);
    try {
      const exportResults = results.map(r => ({
        timeMin: r.timeMin, Tg: r.Tg, Ts_unprot: r.Tsurf, Ts_prot: r.Trebar
      }));
      if (type === 'xlsx') await exportXLSX(exportResults, true, inputs);
      if (type === 'pdf')  await exportPDF(exportResults, true, inputs);
    } catch(e) { console.error(e); }
    finally { setExporting(null); }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>
          Showing {rows.length} of {results.length} rows
        </span>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
          <button className="export-btn" onClick={() => setShowAll(p => !p)}>
            {showAll ? '1-min view' : 'All rows (5s)'}
          </button>
          <button className="export-btn xlsx" onClick={() => handleExport('xlsx')} disabled={!!exporting}>
            {exporting==='xlsx'?'⏳':'📊'} XLSX
          </button>
          <button className="export-btn pdf" onClick={() => handleExport('pdf')} disabled={!!exporting}>
            {exporting==='pdf'?'⏳':'📄'} PDF
          </button>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time (min)</th>
              <th className="col-gas">Gas Temp Tg (°C)</th>
              <th style={{color:'var(--color-premium)'}}>Surface Temp (°C)</th>
              <th className="col-prot">Rebar Temp (°C)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="mono">{row.timeMin.toFixed(2)}</td>
                <td className="col-gas mono">{row.Tg.toFixed(1)}</td>
                <td className="mono" style={{color:'var(--color-premium)'}}>{row.Tsurf.toFixed(1)}</td>
                <td className="col-prot mono">{row.Trebar.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
