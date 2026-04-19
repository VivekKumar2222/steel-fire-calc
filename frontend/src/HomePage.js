import React from 'react';
import './HomePage.css';

function HomePage({ onNavigate }) {
  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-hero-inner">
          <div className="home-eyebrow">
            <span className="home-dot" />
            Structural Engineering Tools
          </div>

          <h1 className="home-heading">
            Engineering<br />
            <span className="home-heading-accent">Simplified.</span>
          </h1>

          <p className="home-subheading">
            Precision calculation tools for structural engineers —
            built on established codes and standards.
          </p>

          <div className="home-actions">
            <button className="home-btn-primary" onClick={() => onNavigate('calculator')}>
              Services
            </button>
            <a href="mailto:contact@structguru.com" className="home-btn-secondary">
              Contact
            </a>
          </div>
        </div>

        {/* <div className="home-grid-bg" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="home-grid-cell" />
          ))}
        </div> */}
      </div>

      <div className="home-cards">
        <div className="home-card" onClick={() => onNavigate('calculator')} role="button" tabIndex={0}>
          <div className="home-card-icon">🔥</div>
          <div>
            <div className="home-card-title">ISO Fire Calculator</div>
            <div className="home-card-desc">Steel temperature under ISO 834 standard fire — unprotected &amp; protected sections per EN 1993-1-2</div>
          </div>
          <span className="home-card-arrow">→</span>
        </div>
        <div className="home-card" onClick={() => onNavigate('parametric')} role="button" tabIndex={0}>
          <div className="home-card-icon">🏗️</div>
          <div>
            <div className="home-card-title">Parametric Fire Calculator</div>
            <div className="home-card-desc">Real compartment fire model with heating &amp; cooling phases per EN 1991-1-2 Annex A</div>
          </div>
          <span className="home-card-arrow">→</span>
        </div>
        <div className="home-card home-card-coming">
          <div className="home-card-icon">⚙️</div>
          <div>
            <div className="home-card-title">More Coming Soon</div>
            <div className="home-card-desc">Additional structural calculation tools are in development</div>
          </div>
          <span className="home-card-badge">Soon</span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;