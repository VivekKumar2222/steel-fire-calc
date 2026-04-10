import React, { useState, useMemo } from 'react';
import { STEEL_SECTIONS } from '../data/steelSections';

const SERIES = Object.keys(STEEL_SECTIONS);

// Short display names for the tab buttons
const SERIES_SHORT = {
  'IPE Sections': 'IPE',
  'HEA Sections': 'HEA',
  'HEB Sections': 'HEB',
  'HEM Sections': 'HEM',
  'UB Sections':  'UB',
  'UC Sections':  'UC',
  'UBP Sections': 'UBP',
};

export default function SectionPicker({ onSelect }) {
  const [activeSeries, setActiveSeries] = useState(SERIES[0]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = STEEL_SECTIONS[activeSeries] || [];
    if (!search.trim()) return list;
    return list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [activeSeries, search]);

  function handleSelect(section) {
    setSelected(section);
    setOpen(false);
    setSearch('');
    onSelect(section);
  }

  function handleSeriesChange(series) {
    setActiveSeries(series);
    setSearch('');
    setSelected(null);
  }

  return (
    <div className="section-picker">
      {/* Series selector tabs */}
      <div className="picker-series-bar">
        {SERIES.map(s => (
          <button
            key={s}
            className={`picker-series-btn ${activeSeries === s ? 'active' : ''}`}
            onClick={() => handleSeriesChange(s)}
            title={s}
          >
            {SERIES_SHORT[s]}
          </button>
        ))}
      </div>

      {/* Search + dropdown */}
      <div className="picker-dropdown-wrap">
        <div
          className={`picker-trigger ${open ? 'open' : ''}`}
          onClick={() => setOpen(o => !o)}
        >
          <span className="picker-trigger-text">
            {selected ? selected.name : `Select ${SERIES_SHORT[activeSeries]} section…`}
          </span>
          <span className="picker-chevron">{open ? '▲' : '▼'}</span>
        </div>

        {open && (
          <div className="picker-panel">
            <div className="picker-search-wrap">
              <input
                className="picker-search"
                placeholder={`Search ${SERIES_SHORT[activeSeries]}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <span className="picker-count">{filtered.length}</span>
            </div>

            <div className="picker-list">
              {filtered.length === 0 && (
                <div className="picker-empty">No sections match</div>
              )}
              {filtered.map(sec => (
                <button
                  key={sec.name}
                  className={`picker-item ${selected?.name === sec.name ? 'selected' : ''}`}
                  onClick={() => handleSelect(sec)}
                >
                  <span className="picker-item-name">{sec.name}</span>
                  <span className="picker-item-dims">
                    {sec.h}×{sec.b} · tw {sec.tw} · tf {sec.tf}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected section preview */}
      {selected && (
        <div className="picker-preview">
          <div className="picker-preview-row">
            <span className="picker-preview-label">h</span>
            <span className="picker-preview-val">{selected.h} <em>mm</em></span>
            <span className="picker-preview-label">b</span>
            <span className="picker-preview-val">{selected.b} <em>mm</em></span>
          </div>
          <div className="picker-preview-row">
            <span className="picker-preview-label">tw</span>
            <span className="picker-preview-val">{selected.tw} <em>mm</em></span>
            <span className="picker-preview-label">tf</span>
            <span className="picker-preview-val">{selected.tf} <em>mm</em></span>
            <span className="picker-preview-label">r1</span>
            <span className="picker-preview-val">{selected.r1} <em>mm</em></span>
          </div>
        </div>
      )}
    </div>
  );
}
