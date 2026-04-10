import React from 'react';

export default function SectionProps({ props }) {
  const items = [
    { label: 'Cross-section Area', value: props.A_mm2.toLocaleString(), unit: 'mm²' },
    { label: 'Heated Perimeter Hp', value: props.Hp_mm, unit: 'mm' },
    { label: 'Box Perimeter Hpb', value: props.Hpb_m, unit: 'm' },
    { label: 'Section Factor Hp/A', value: props.HpPerA, unit: 'm⁻¹' },
    { label: 'Box Factor Hpb/A', value: props.HpbPerA, unit: 'm⁻¹' },
    { label: 'Shadow Factor Ksh', value: props.ksh, unit: '' },
  ];

  return (
    <div className="input-section">
      <div className="section-label" style={{ color: 'var(--success)' }}>Computed Section Props</div>
      <div className="props-grid">
        {items.map(item => (
          <div className="prop-item" key={item.label}>
            <div className="prop-label">{item.label}</div>
            <div className="prop-value">
              {item.value}
              {item.unit && <span className="prop-unit"> {item.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
