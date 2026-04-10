/**
 * exportData.js
 * Exports the data table as XLSX or PDF.
 * Uses SheetJS (xlsx) for spreadsheet and jsPDF for PDF — both loaded from CDN via dynamic import.
 */

const HEADERS = ['Time (min)', 'Gas Temp Tg (°C)', 'Ts Unprotected (°C)', 'Ts Protected (°C)'];

function buildRows(results, isPremium) {
  return results.map(r => [
    r.timeMin.toFixed(2),
    r.Tg.toFixed(1),
    r.Ts_unprot.toFixed(1),
    isPremium ? r.Ts_prot.toFixed(1) : 'Premium only',
  ]);
}

// ── XLSX ────────────────────────────────────────────────────────────────────
export async function exportXLSX(results, isPremium, inputs) {
  // Load SheetJS from CDN
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  const XLSX = window.XLSX;

  const rows = buildRows(results, isPremium);

  // Build worksheet data: metadata block + blank row + table
  const meta = [
    ['ISO Steel Fire Temperature Calculator — EN 1993-1-2'],
    [],
    ['Fire Protection Inputs'],
    ['Specific Heat Cp',        inputs.Cp,      'J/kgK'],
    ['Thickness dp',            inputs.dp,      'm'],
    ['Thermal Conductivity λp', inputs.lambdaP, 'W/mK'],
    ['Density ρp',              inputs.rhoP,    'kg/m³'],
    [],
    ['Section Geometry'],
    ['h', inputs.h, 'mm'],
    ['b', inputs.b, 'mm'],
    ['tw', inputs.tw, 'mm'],
    ['tf', inputs.tf, 'mm'],
    ['r1', inputs.r1, 'mm'],
    ['Exposure', inputs.exposure],
    [],
    HEADERS,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(meta);

  // Column widths
  ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 22 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Temperature Data');
  XLSX.writeFile(wb, 'steel_fire_temperatures.xlsx');
}

// ── PDF ─────────────────────────────────────────────────────────────────────
export async function exportPDF(results, isPremium, inputs) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO Steel Fire Temperature Calculator', pageW / 2, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Eurocode EN 1993-1-2 · ISO 834 Standard Fire Curve', pageW / 2, 24, { align: 'center' });

  // Input summary block
  doc.setTextColor(40);
  doc.setFontSize(8);
  const col1 = 14, col2 = 80;
  let y = 32;
  doc.setFont('helvetica', 'bold');
  doc.text('Fire Protection', col1, y);
  doc.text('Section Geometry', col2, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const prot = [
    [`Cp = ${inputs.Cp} J/kgK`,         `h = ${inputs.h} mm`],
    [`dp = ${inputs.dp} m`,              `b = ${inputs.b} mm`],
    [`λp = ${inputs.lambdaP} W/mK`,      `tw = ${inputs.tw} mm`],
    [`ρp = ${inputs.rhoP} kg/m³`,        `tf = ${inputs.tf} mm`],
    [`Exposure: ${inputs.exposure}`,     `r1 = ${inputs.r1} mm`],
  ];
  prot.forEach(([left, right]) => {
    doc.text(left, col1, y);
    doc.text(right, col2, y);
    y += 4.5;
  });

  y += 4;

  // Table
  const rows = buildRows(results, isPremium);
  doc.autoTable({
    startY: y,
    head: [HEADERS],
    body: rows,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: {
      fillColor: [22, 27, 34],
      textColor: [230, 237, 243],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { halign: 'right' },
      1: { halign: 'right', textColor: [209, 36, 47] },
      2: { halign: 'right', textColor: [26, 127, 55] },
      3: { halign: 'right', textColor: [9, 105, 218] },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} · Generated ${new Date().toLocaleDateString()}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save('steel_fire_temperatures.pdf');
}

// ── Helper: load external script once ───────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
