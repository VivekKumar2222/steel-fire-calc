import React, { useState, useEffect } from 'react';
import './index.css';
import { useCalculator } from './hooks/useCalculator';
import { useAuth } from './hooks/useAuth';
import InputPanel from './components/InputPanel';
import ResultsArea from './components/ResultsArea';
import HomePage from './HomePage';
import AuthModal from './components/AuthModal';
import ParametricCalculator from './components/parametric/ParametricCalculator';
import ITFMCalculator  from './components/itfm/ITFMCalculator';
import RebarCalculator from './components/rebar/RebarCalculator';
import UserAvatar from './components/UserAvatar';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { inputs, updateInput, results, loading, error, calculate } = useCalculator();
  const { user, authLoading } = useAuth();

  const [theme, setTheme]           = useState(() => localStorage.getItem('theme') || 'dark');
  const [page, setPage]             = useState('home');
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [authModal, setAuthModal]   = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [loadMsg, setLoadMsg]       = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handler = () => setServicesOpen(false);
    if (servicesOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [servicesOpen]);

  // Navigate with loading screen
  function navigateTo(dest, message = 'Loading…') {
    setPageLoading(true);
    setLoadMsg(message);
    setTimeout(() => {
      setPage(dest);
      setPageLoading(false);
      setMenuOpen(false);
    }, 800);
  }

  // After login/signup success
  function handleAuthSuccess() {
    setPageLoading(true);
    setLoadMsg('Signing you in…');
    setTimeout(() => setPageLoading(false), 1200);
  }

  // Initial auth loading
  if (authLoading) return <LoadingScreen message="Starting up…" />;

  // Page loading
  if (pageLoading) return <LoadingScreen message={loadMsg} />;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">

          {/* Brand */}
          <div className="header-brand" style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="header-title">StructGuru</span>
                {page === 'calculator'  && <><span style={{color:'var(--border)'}}>/ </span><span style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>ISO Fire</span></>}
                {page === 'parametric'  && <><span style={{color:'var(--border)'}}>/ </span><span style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>Parametric Fire</span></>}
                {page === 'itfm'         && <><span style={{color:'var(--border)'}}>/ </span><span style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>iTFM Calculator</span></>}
                {page === 'rebar'        && <><span style={{color:'var(--border)'}}>/ </span><span style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>Rebar Temperature</span></>}
              </div>
              <div className="header-subtitle">Structural Engineering Tools</div>
            </div>
          </div>

          <nav className="header-nav">
            {/* Desktop links */}
            <a href="#home" className="nav-desktop"
              onClick={e => { e.preventDefault(); navigateTo('home'); }}>Home</a>

            <div className="nav-desktop" style={{ position: 'relative' }}>
              <button className="nav-dropdown-btn"
                onClick={e => { e.stopPropagation(); setServicesOpen(o => !o); }}>
                Services <span style={{ fontSize: '0.65rem', marginLeft: '2px' }}>▾</span>
              </button>
              {servicesOpen && (
                <div className="nav-dropdown">
                  <button className="nav-dropdown-item"
                    onClick={() => { navigateTo('calculator', 'Loading calculator…'); setServicesOpen(false); }}>
                    <span className="nav-dropdown-icon">🔥</span>
                    <span>
                      <span className="nav-dropdown-label">ISO Fire Calculator</span>
                      <span className="nav-dropdown-sub">EN 1993-1-2 steel temperature</span>
                    </span>
                  </button>
                  <button className="nav-dropdown-item"
                    onClick={() => { navigateTo('parametric', 'Loading calculator…'); setServicesOpen(false); }}>
                    <span className="nav-dropdown-icon">🏗️</span>
                    <span>
                      <span className="nav-dropdown-label">Parametric Fire Calculator</span>
                      <span className="nav-dropdown-sub">EN 1991-1-2 Annex A</span>
                    </span>
                  </button>
                  <button className="nav-dropdown-item"
                    onClick={() => { navigateTo('itfm', 'Loading calculator…'); setServicesOpen(false); }}>
                    <span className="nav-dropdown-icon">🚀</span>
                    <span>
                      <span className="nav-dropdown-label">iTFM Calculator</span>
                      <span className="nav-dropdown-sub">Travelling Fire Model</span>
                    </span>
                  </button>
                  <button className="nav-dropdown-item"
                    onClick={() => { navigateTo('rebar', 'Loading calculator…'); setServicesOpen(false); }}>
                    <span className="nav-dropdown-icon">🔩</span>
                    <span>
                      <span className="nav-dropdown-label">Rebar Temperature</span>
                      <span className="nav-dropdown-sub">1D FD heat through concrete</span>
                    </span>
                  </button>
                  <div className="nav-dropdown-item nav-dropdown-item--coming">
                    <span className="nav-dropdown-icon">⚙️</span>
                    <span>
                      <span className="nav-dropdown-label">More coming soon</span>
                      <span className="nav-dropdown-sub">In development</span>
                    </span>
                    <span className="nav-coming-badge">Soon</span>
                  </div>
                </div>
              )}
            </div>

            <a href="#about" className="nav-desktop">About</a>

            {/* Auth — desktop only */}
            {user ? (
              <UserAvatar />
            ) : (
              <div className="nav-auth-btns nav-desktop-auth">
                <button className="nav-login-btn" onClick={() => setAuthModal('login')}>Log In</button>
                <button className="nav-signup-btn" onClick={() => setAuthModal('signup')}>Sign Up</button>
              </div>
            )}

            <button className="theme-toggle" onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </nav>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="nav-mobile-menu">
              <a href="#home" className="nav-mobile-item"
                onClick={e => { e.preventDefault(); navigateTo('home'); }}>Home</a>
              <div className="nav-mobile-divider">Services</div>
              <button className="nav-mobile-item nav-mobile-subitem"
                onClick={() => navigateTo('calculator', 'Loading calculator…')}>
                🔥 ISO Fire Calculator
              </button>
              <button className="nav-mobile-item nav-mobile-subitem"
                onClick={() => navigateTo('parametric', 'Loading calculator…')}>
                🏗️ Parametric Fire Calculator
              </button>
              <button className="nav-mobile-item nav-mobile-subitem"
                onClick={() => navigateTo('itfm', 'Loading calculator…')}>
                🚀 iTFM Calculator
              </button>
              <button className="nav-mobile-item nav-mobile-subitem"
                onClick={() => navigateTo('rebar', 'Loading calculator…')}>
                🔩 Rebar Temperature
              </button>
              <div className="nav-mobile-item nav-mobile-subitem nav-mobile-coming">
                ⚙️ More coming soon <span className="nav-coming-badge">Soon</span>
              </div>
              <a href="#about" className="nav-mobile-item" onClick={() => setMenuOpen(false)}>About</a>

              {/* Auth in mobile menu */}
              {!user && (
                <>
                  <div className="nav-mobile-divider" />
                  <button className="nav-mobile-item nav-mobile-auth-login"
                    onClick={() => { setAuthModal('login'); setMenuOpen(false); }}>
                    Log In
                  </button>
                  <button className="nav-mobile-item nav-mobile-auth-signup"
                    onClick={() => { setAuthModal('signup'); setMenuOpen(false); }}>
                    Sign Up
                  </button>
                </>
              )}
              {user && (
                <>
                  <div className="nav-mobile-divider" />
                  <div className="nav-mobile-user">
                    <div className="nav-mobile-user-name">{user.name}</div>
                    <div className="nav-mobile-user-email">{user.email}</div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </header>

      {page === 'home' && <HomePage onNavigate={dest => navigateTo(dest, 'Loading…')} />}
      {page === 'calculator' && (
        <div className="main-layout">
          <InputPanel inputs={inputs} updateInput={updateInput}
            results={results} loading={loading} error={error} onCalculate={calculate} />
          <main className="content-area">
            <ResultsArea results={results} inputs={inputs} />
          </main>
        </div>
      )}
      {page === 'parametric' && <ParametricCalculator />}
      {page === 'itfm'  && <ITFMCalculator />}
      {page === 'rebar' && <RebarCalculator />}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;
