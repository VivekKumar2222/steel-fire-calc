import React, { useState, useEffect } from 'react';
import './HomePage.css';

export default function HomePage({ onNavigate }) {
  const [pricingTab, setPricingTab] = useState('monthly');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hp">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          <div className="hp-hero-left">
            <span className="hp-pill">Home</span>
            <h1 className="hp-hero-title">
              Structural Engineering<br />
              tools for <span className="hp-orange">Accurate</span> &amp;<br />
              <span className="hp-orange">Instant</span> Calculations
            </h1>
            <h3>Fire . Steel . RCC. Timber</h3>
            <p className="hp-hero-sub">
              Accurate structural calculators built for engineers who need answers fast — not theory.
            </p>
            <div className="hp-hero-btns">
              <button className="hp-btn-primary" onClick={() => onNavigate('calculator')}>
                Get a Quote
              </button>
              <button className="hp-btn-ghost" onClick={() => onNavigate('calculator')}>
                Learn More &rsaquo;
              </button>
            </div>
          </div>
          <div className="hp-hero-right">
  <img
    src={require('./assets/image02.png')}
    alt="StructGuru on devices"
    className="hp-hero-img"
  />
</div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <span className="hp-pill reveal">Service</span>
          <h2 className="hp-section-title reveal reveal-delay-1">The ultimate Service we serve</h2>
          <p className="hp-section-sub reveal reveal-delay-2">
            To empower businesses of all sizes to expand their reach in international markets with confidence.
          </p>

          <div className="hp-services-grid">
            {/* ISO */}
            <div className="hp-svc-card reveal reveal-delay-1">
              <div className="hp-svc-icon">🔥</div>
              <div className="hp-svc-top">
                <span className="hp-svc-name">ISO Steel Fire Calculator</span>
                <span className="hp-svc-badge">StructGuru Fire</span>
              </div>
              <p className="hp-svc-desc">
                Steel temperature under ISO 834 standard fire — unprotected &amp; protected sections per EN 1993-1-2.
              </p>
              <button className="hp-svc-btn" onClick={() => onNavigate('calculator')}>
                Start &rsaquo;
              </button>
            </div>

            {/* Parametric */}
            <div className="hp-svc-card reveal reveal-delay-2">
              <div className="hp-svc-icon">🏗️</div>
              <div className="hp-svc-top">
                <span className="hp-svc-name">Parametric Fire Calculator</span>
                <span className="hp-svc-badge">StructGuru Fire</span>
              </div>
              <p className="hp-svc-desc">
                Real compartment fire model with heating &amp; cooling phases per EN 1991-1-2 Annex A.
              </p>
              <button className="hp-svc-btn" onClick={() => onNavigate('parametric')}>
                Start &rsaquo;
              </button>
            </div>

            {/* iTFM */}
            <div className="hp-svc-card reveal reveal-delay-3">
              <div className="hp-svc-icon">🚀</div>
              <div className="hp-svc-top">
                <span className="hp-svc-name">iTFM Calculator</span>
                <span className="hp-svc-badge">StructGuru Fire</span>
              </div>
              <p className="hp-svc-desc">
                Travelling fire model — gas temperature varies by position along compartment length.
              </p>
              <button className="hp-svc-btn" onClick={() => onNavigate('itfm')}>
                Start &rsaquo;
              </button>
            </div>

            {/* Rebar */}
            <div className="hp-svc-card reveal reveal-delay-4">
              <div className="hp-svc-icon">🔩</div>
              <div className="hp-svc-top">
                <span className="hp-svc-name">Rebar Calculator</span>
                <span className="hp-svc-badge">StructGuru RCC</span>
              </div>
              <p className="hp-svc-desc">
                Reinforcement bar area, spacing &amp; count — instant results for beams, slabs &amp; columns per Eurocode.
              </p>
              <button className="hp-svc-btn" onClick={() => onNavigate('rebar')}>
                Start &rsaquo;
              </button>
            </div>
          </div>
          <p style={{ textAlign: 'center', textDecoration: 'underline', marginTop: '4%' }}>View more</p>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="hp-section hp-section">
        <div className="hp-section-inner">
          <h2 className="hp-section-title hp-center reveal">See what set us apart</h2>
          <p className="hp-section-sub hp-center reveal reveal-delay-1">
            See what set our calculators apart from rest. With features like 292 Steel sections,
            EN 3 Eurocode standard, instant calculations etc.
          </p>

          <div className="hp-features-grid">
            <div className="hp-feature-card reveal reveal-delay-1">
              <div className="hp-feature-preview">
  <img src={require('./assets/image03.png')} alt="292 Steel sections" className="hp-feature-img" />
</div>
              <div className="hp-feature-title">292 Steel sections</div>
              <div className="hp-feature-desc">
                Covering IPE, HEA, HEB, HEM, UB, UC and UBP profiles and load sections from the built-in picker.
              </div>
            </div>

            <div className="hp-feature-card reveal reveal-delay-2">
              <div className="hp-feature-preview">
  <img src={require('./assets/image04.png')} alt="EN 3 Eurocode standard" className="hp-feature-img" />
</div>
              <div className="hp-feature-title">EN 3 Eurocode standard</div>
              <div className="hp-feature-desc">
                Implemented from EN 1991-1-2 and EN 1993-1-2. The Eurocode standards for structural fire design.
              </div>
            </div>

            <div className="hp-feature-card reveal reveal-delay-3">
              <div className="hp-feature-preview">
  <img src={require('./assets/image05.png')} alt="Instant Calculations" className="hp-feature-img" />
</div>
              <div className="hp-feature-title">Instant Calculations &amp; Graphs</div>
              <div className="hp-feature-desc">
                Covering IPE, HEA, HEB, HEM, UB, UC and UBP profiles and load sections from the built-in picker.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG CTA BANNER ──────────────────────────────────────── */}
      <section className="hp-blog-banner">
        <div className="hp-blog-inner">
          <h2 className="hp-blog-title">Read our latest Blogs on<br />Structural Designs</h2>
          <p className="hp-blog-sub">
            Join hundreds of all sizes and across all industries have made a big improvements with us.
          </p>
          <button className="hp-btn-white">Explore &rsaquo;</button>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <span className="hp-pill reveal">Pricing</span>
          <h2 className="hp-section-title reveal reveal-delay-1">Our Pricing</h2>
          <p className="hp-section-sub reveal reveal-delay-2">
            Transparent pricing based on services, features, and visibility. Choose monthly or yearly
            plan and pay only for what your projects demand.
          </p>

          <div className="hp-pricing-toggle">
            <button className={`hp-toggle-btn ${pricingTab==='monthly'?'active':''}`}
              onClick={() => setPricingTab('monthly')}>Monthly</button>
            <button className={`hp-toggle-btn ${pricingTab==='yearly'?'active':''}`}
              onClick={() => setPricingTab('yearly')}>
              Yearly <span className="hp-badge-discount">15% OFF</span>
            </button>
            <a href="#learn" className="hp-learn-more">Learn more &rsaquo;</a>
          </div>

          <div className="hp-pricing-list">
            {/* Free */}
            <div className="hp-plan-row reveal reveal-delay-1">
              <div className="hp-plan-info">
                <div className="hp-plan-name">Free Plan</div>
                <div className="hp-plan-desc">Start free, no commitment. Includes access to basic calculators and limited platform features, with ads shown across your experience.</div>
              </div>
              <div className="hp-plan-price">
                <div className="hp-price-val">Free</div>
                <button className="hp-plan-btn">Try Now &rsaquo;</button>
              </div>
            </div>
            <div className="hp-plan-divider" />

            {/* Standard */}
            <div className="hp-plan-row reveal reveal-delay-2">
              <div className="hp-plan-info">
                <div className="hp-plan-name">
                  Standard Plan <span className="hp-recommend">Recommend</span>
                </div>
                <div className="hp-plan-desc">Full calculator access, most features, and an ad-free experience. Supports up to 10 projects with new calculators rolling out shortly after release.</div>
              </div>
              <div className="hp-plan-price">
                <div className="hp-price-val">
  {pricingTab === 'yearly' ? '$6.30' : '$7'}
  <span className="hp-price-period">/ per month</span>
  {pricingTab === 'yearly' && (
    <div style={{ fontSize: '11px', color: 'var(--hp-orange)', fontWeight: 500, marginTop: '2px' }}>
      billed as $75.60/year
    </div>
  )}
</div>
                <button className="hp-plan-btn">Try Now &rsaquo;</button>
              </div>
            </div>
          </div>

          {/* Professional */}
<div className="hp-plan-pro reveal reveal-delay-3">
  <div className="hp-plan-pro-top">
    <div className="hp-plan-pro-top-left">
      <div className="hp-plan-name" style={{color:'white', marginBottom:'8px'}}>Professional Plan</div>
      <div className="hp-plan-desc" style={{color:'rgba(255,255,255,0.85)'}}>
        All calculators, all features, ad-free. Up to 20 projects, day-one calculator access, and collaboration for up to 5 members.
      </div>
      <div className="hp-price-val" style={{color:'white', marginTop:'16px'}}>
        {pricingTab === 'yearly' ? '$9' : '$10'}
        <span className="hp-price-period" style={{color:'rgba(255,255,255,0.75)'}}>/ per month</span>
      </div>
    </div>
    <button className="hp-btn-white-outline">Talk to Sales &rsaquo;</button>
  </div>
  <div className="hp-plan-pro-bottom">
    {[
      'Full access to all of the Calculator services',
      'Up to 20 projects limit',
      'Ad-Free experience',
      'Add Collaborators to your projects',
    ].map(feat => (
      <div className="hp-pro-feat-item" key={feat}>
        <span className="hp-pro-feat-check">✓</span>
        {feat}
      </div>
    ))}
  </div>
</div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-col">
            <div className="hp-footer-heading">Home</div>
            <a className="hp-footer-link" onClick={() => onNavigate('about')} href="#">About</a>
            <a className="hp-footer-link" href="#service">Service</a>
            <a className="hp-footer-link" href="#testimonials">Testimonials</a>
          </div>
          <div className="hp-footer-col">
            <div className="hp-footer-heading">Services</div>
            <a className="hp-footer-link" onClick={() => onNavigate('calculator')} href="#">ISO Calculator</a>
            <a className="hp-footer-link" onClick={() => onNavigate('parametric')} href="#">Parametric</a>
            <a className="hp-footer-link" onClick={() => onNavigate('itfm')} href="#">iTFM</a>
          </div>
          <div className="hp-footer-col">
            <div className="hp-footer-heading">Resources</div>
            <a className="hp-footer-link" href="#docs">Documentation</a>
            <a className="hp-footer-link" href="#export">Export Resources</a>
          </div>
          <div className="hp-footer-col">
            <div className="hp-footer-heading">Other</div>
            <a className="hp-footer-link" href="#company">Company</a>
            <a className="hp-footer-link" href="#blogs">Blogs</a>
          </div>
          <div className="hp-footer-brand">
            <div className="hp-footer-logo">
  <img src={require('./assets/oluefhuhfu 1.png')} alt="StructGuru" style={{ height: '32px' }} />
</div>
            {/* <div className="hp-footer-address">
              Matraman St., 24122, LA<br />(+21) 231641
            </div> */}
            <div className="hp-footer-social">
              <span className="hp-social-icon">f</span>
              <span className="hp-social-icon">in</span>
              <span className="hp-social-icon">t</span>
            </div>
          </div>
        </div>
        <div className="hp-footer-bottom">
          <span>©2024 StructGuru Technologies, Inc.</span>
          <div className="hp-footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of use</a>
            <a href="#disclosure">Disclosure</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
