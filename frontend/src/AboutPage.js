import React, { useEffect } from 'react';
import './AboutPage.css';
import './HomePage.css';

export default function AboutPage({ onNavigate }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.ap-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ap">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="ap-hero">
        <div className="ap-hero-inner">
          <span className="ap-pill ap-reveal">About Us</span>
          <h1 className="ap-hero-title ap-reveal ap-reveal-delay-1">
            Building the future of <span className="ap-orange">structural</span> fire
            <br />&amp; steel calculation.
          </h1>
          <p className="ap-hero-sub ap-reveal ap-reveal-delay-2">
            StructGuru is an engineering-first platform built by practising structural engineers.
            We turn the dense, code-heavy work of fire and steel design into a few clicks — so you
            spend less time on spreadsheets and more time on design.
          </p>
          <div className="ap-hero-btns ap-reveal ap-reveal-delay-3">
            <button className="ap-btn-primary" onClick={() => onNavigate('calculator')}>
              Try Our Calculators
            </button>
            <button className="ap-btn-ghost" onClick={() => onNavigate('home')}>
              Back to Home &rsaquo;
            </button>
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ───────────────────────────────────────────── */}
      <section className="ap-section">
        <div className="ap-section-inner ap-two-col">
          <div className="ap-two-col-left ap-reveal">
            <span className="ap-pill">Who We Are</span>
            <h2 className="ap-section-title">
              Engineers building tools <span className="ap-orange">for engineers</span>.
            </h2>
            <p className="ap-section-sub">
              We started StructGuru because every structural fire calculation we ran ended the
              same way — buried inside a spreadsheet, fighting unit conversions and outdated
              references. So we rebuilt the workflow from scratch, line by line, against the
              Eurocode.
            </p>
            <p className="ap-section-sub">
              Today, StructGuru powers fire and steel calculations for working engineers,
              consultancies and students across the industry. Every formula is traceable to its
              clause, every result is exportable, and every calculator is designed to feel as
              native as the pen-on-paper workflow it replaced.
            </p>

            <div className="ap-stats">
              <div className="ap-stat">
                <div className="ap-stat-val">292+</div>
                <div className="ap-stat-label">Steel Sections</div>
              </div>
              <div className="ap-stat">
                <div className="ap-stat-val">5</div>
                <div className="ap-stat-label">Eurocode Calculators</div>
              </div>
              <div className="ap-stat">
                <div className="ap-stat-val">EN 3</div>
                <div className="ap-stat-label">Compliant</div>
              </div>
              <div className="ap-stat">
                <div className="ap-stat-val">24/7</div>
                <div className="ap-stat-label">Availability</div>
              </div>
            </div>
          </div>

          <div className="ap-two-col-right ap-reveal ap-reveal-delay-2">
            <div className="ap-mission-card">
              <div className="ap-mission-icon">🎯</div>
              <h3 className="ap-mission-title">Our Mission</h3>
              <p className="ap-mission-text">
                Make Eurocode-grade structural fire engineering accessible to every engineer,
                regardless of geography or firm size — accurate, instant, and auditable.
              </p>
            </div>
            <div className="ap-mission-card">
              <div className="ap-mission-icon">👁️</div>
              <h3 className="ap-mission-title">Our Vision</h3>
              <p className="ap-mission-text">
                A world where no engineer has to rebuild the same fire-curve spreadsheet twice —
                where the standard is shared, open, and runs in the browser.
              </p>
            </div>
            <div className="ap-mission-card">
              <div className="ap-mission-icon">⚖️</div>
              <h3 className="ap-mission-title">Our Values</h3>
              <p className="ap-mission-text">
                Code-first accuracy. No black boxes. Engineer-friendly interfaces. Honest pricing.
                Long-term trust over short-term metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ────────────────────────────────────────── */}
      <section className="ap-section ap-section--grey">
        <div className="ap-section-inner">
          <span className="ap-pill ap-reveal">Services</span>
          <h2 className="ap-section-title ap-reveal ap-reveal-delay-1">
            What we <span className="ap-orange">offer</span>
          </h2>
          <p className="ap-section-sub ap-reveal ap-reveal-delay-2">
            Five production-grade structural calculators, every one of them built around an
            Eurocode clause and an engineer&rsquo;s real workflow. Pick the one you need and
            get an answer in seconds.
          </p>

          <div className="ap-services-grid">
            <div className="ap-svc-card ap-reveal ap-reveal-delay-1">
              <div className="ap-svc-icon">🔥</div>
              <div className="ap-svc-top">
                <span className="ap-svc-name">ISO Steel Fire Calculator</span>
                <span className="ap-svc-badge">StructGuru Fire</span>
              </div>
              <p className="ap-svc-desc">
                Steel temperature under the ISO 834 standard fire curve for unprotected and
                protected sections. Built on EN 1993-1-2 with section-factor aware heat transfer.
              </p>
              <button className="ap-svc-btn" onClick={() => onNavigate('calculator')}>
                Open Calculator &rsaquo;
              </button>
            </div>

            <div className="ap-svc-card ap-reveal ap-reveal-delay-2">
              <div className="ap-svc-icon">🏗️</div>
              <div className="ap-svc-top">
                <span className="ap-svc-name">Parametric Fire Calculator</span>
                <span className="ap-svc-badge">StructGuru Fire</span>
              </div>
              <p className="ap-svc-desc">
                Real compartment-fire temperature–time curves with heating and cooling phases,
                implemented from EN 1991-1-2 Annex A. Fire load, ventilation, and lining, all
                editable.
              </p>
              <button className="ap-svc-btn" onClick={() => onNavigate('parametric')}>
                Open Calculator &rsaquo;
              </button>
            </div>

            <div className="ap-svc-card ap-reveal ap-reveal-delay-3">
              <div className="ap-svc-icon">🚀</div>
              <div className="ap-svc-top">
                <span className="ap-svc-name">iTFM Calculator</span>
                <span className="ap-svc-badge">StructGuru Fire</span>
              </div>
              <p className="ap-svc-desc">
                Travelling-fire model where gas temperature varies by position along the
                compartment length — closer to reality for large open-plan spaces than a single
                zone curve.
              </p>
              <button className="ap-svc-btn" onClick={() => onNavigate('itfm')}>
                Open Calculator &rsaquo;
              </button>
            </div>

            <div className="ap-svc-card ap-reveal ap-reveal-delay-4">
              <div className="ap-svc-icon">🔩</div>
              <div className="ap-svc-top">
                <span className="ap-svc-name">Rebar Temperature</span>
                <span className="ap-svc-badge">StructGuru RCC</span>
              </div>
              <p className="ap-svc-desc">
                1-D finite-difference heat transfer through concrete to find rebar temperature
                under any gas-curve input. For beams, slabs, and columns in fire.
              </p>
              <button className="ap-svc-btn" onClick={() => onNavigate('rebar')}>
                Open Calculator &rsaquo;
              </button>
            </div>

            <div className="ap-svc-card ap-reveal ap-reveal-delay-4">
              <div className="ap-svc-icon">📐</div>
              <div className="ap-svc-top">
                <span className="ap-svc-name">Beam Analysis</span>
                <span className="ap-svc-badge">StructGuru Steel</span>
              </div>
              <p className="ap-svc-desc">
                SFD, BMD and deflection diagrams from a finite-element analysis of any
                simply-supported beam under user-defined loads. Output as engineer-ready
                diagrams.
              </p>
              <button className="ap-svc-btn" onClick={() => onNavigate('beam')}>
                Open Calculator &rsaquo;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY STRUCTGURU ───────────────────────────────────────── */}
      <section className="ap-section">
        <div className="ap-section-inner">
          <h2 className="ap-section-title hp-center ap-reveal">Why teams pick StructGuru</h2>
          <p className="ap-section-sub hp-center ap-reveal ap-reveal-delay-1">
            Built around the things that make a working engineer&rsquo;s day shorter, not longer.
          </p>

          <div className="ap-why-grid">
            <div className="ap-why-card ap-reveal ap-reveal-delay-1">
              <div className="ap-why-num">01</div>
              <div className="ap-why-title">Eurocode-true</div>
              <div className="ap-why-desc">
                Every formula traces back to a clause. We don&rsquo;t approximate where the code is
                specific, and we don&rsquo;t hide constants.
              </div>
            </div>
            <div className="ap-why-card ap-reveal ap-reveal-delay-2">
              <div className="ap-why-num">02</div>
              <div className="ap-why-title">Instant, not interactive</div>
              <div className="ap-why-desc">
                Calculations finish while you&rsquo;re still reading the output. No queueing, no
                submit-wait, no page reloads.
              </div>
            </div>
            <div className="ap-why-card ap-reveal ap-reveal-delay-3">
              <div className="ap-why-num">03</div>
              <div className="ap-why-title">Exportable</div>
              <div className="ap-why-desc">
                Charts and tables export to formats your report template already understands —
                your work, not ours, is the deliverable.
              </div>
            </div>
            <div className="ap-why-card ap-reveal ap-reveal-delay-4">
              <div className="ap-why-num">04</div>
              <div className="ap-why-title">Built by engineers</div>
              <div className="ap-why-desc">
                The team has run real fire designs on real projects. We build the calculator we
                wished we had on Monday morning.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ─────────────────────────────────────────────── */}
      <section className="ap-section ap-section--grey">
        <div className="ap-section-inner">
          <span className="ap-pill ap-reveal">Founders</span>
          <h2 className="ap-section-title ap-reveal ap-reveal-delay-1">
            The people <span className="ap-orange">behind</span> StructGuru
          </h2>
          <p className="ap-section-sub ap-reveal ap-reveal-delay-2">
            StructGuru is led by two structural engineers who lived the problem the platform
            solves.
          </p>

          <div className="ap-founders-grid">
            {/* Founder */}
            <div className="ap-founder-card ap-reveal ap-reveal-delay-1">
              <div className="ap-founder-avatar ap-founder-avatar--founder">RK</div>
              <div className="ap-founder-role-tag">Founder</div>
              <h3 className="ap-founder-name">Rabinder Kumar</h3>
              <div className="ap-founder-designation">Structural Fire Engineer &amp; Co.</div>
              <p className="ap-founder-bio">
                Rabinder leads StructGuru&rsquo;s technical direction. His work on
                performance-based fire design for steel and concrete structures across
                commercial, healthcare, and high-rise projects shapes every calculator on the
                platform. He is the reason a Eurocode clause reads the way it does in our UI.
              </p>
              <p className="ap-founder-bio">
                Before StructGuru, Rabinder spent years in consultancy reviewing hand-rolled
                fire spreadsheets — and watching the same arithmetic mistakes happen on every
                new project. StructGuru is the standard he wished had existed.
              </p>
              <div className="ap-founder-tags">
                <span className="ap-founder-tag">Fire Engineering</span>
                <span className="ap-founder-tag">Eurocode 3</span>
                <span className="ap-founder-tag">Eurocode 1-1-2</span>
                <span className="ap-founder-tag">Performance-Based Design</span>
              </div>
            </div>

            {/* Co-Founder */}
            <div className="ap-founder-card ap-reveal ap-reveal-delay-2">
              <div className="ap-founder-avatar ap-founder-avatar--cofounder">VK</div>
              <div className="ap-founder-role-tag ap-founder-role-tag--co">Co-Founder</div>
              <h3 className="ap-founder-name">Vivek Kumar</h3>
              <div className="ap-founder-designation">Structural Engineer &amp; Product Lead</div>
              <p className="ap-founder-bio">
                Vivek leads product and engineering at StructGuru. He turns the messy reality
                of a structural calculation — the unit conversions, the partial factors, the
                section picker that never has the profile you need — into a workflow that
                actually feels fast.
              </p>
              <p className="ap-founder-bio">
                With a background in RCC and steel design for residential and industrial
                projects, Vivek makes sure every screen answers the question the engineer is
                actually asking, not the one a textbook thought they should ask.
              </p>
              <div className="ap-founder-tags">
                <span className="ap-founder-tag">Steel Design</span>
                <span className="ap-founder-tag">RCC Design</span>
                <span className="ap-founder-tag">Product</span>
                <span className="ap-founder-tag">FEM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="ap-cta">
        <div className="ap-cta-inner">
          <h2 className="ap-cta-title ap-reveal">
            Have a project that needs a fire calculation?<br />
            <span className="ap-orange">Let&rsquo;s get you an answer.</span>
          </h2>
          <p className="ap-cta-sub ap-reveal ap-reveal-delay-1">
            Free to try. No card. The Standard and Professional plans unlock every calculator
            and remove ads.
          </p>
          <div className="ap-cta-btns ap-reveal ap-reveal-delay-2">
            <button className="ap-btn-white" onClick={() => onNavigate('calculator')}>
              Get a Quote &rsaquo;
            </button>
            <button className="ap-btn-ghost-light" onClick={() => onNavigate('home')}>
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER (shared with HomePage) ────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-col">
            <div className="hp-footer-heading">Home</div>
            <a className="hp-footer-link" onClick={() => onNavigate('about')} href="#">About</a>
            <a className="hp-footer-link" onClick={() => onNavigate('home')} href="#">Service</a>
            <a className="hp-footer-link" onClick={() => onNavigate('home')} href="#">Testimonials</a>
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
