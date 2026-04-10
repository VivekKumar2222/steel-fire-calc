import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

// OTP input — 6 boxes
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  function handleKey(i, e) {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      inputs.current[i - 1].focus();
    }
  }

  function handleChange(i, e) {
    const val = e.target.value.replace(/\D/, '').slice(-1);
    const arr = value.split('');
    arr[i] = val;
    const next = arr.join('');
    onChange(next);
    if (val && i < 5) inputs.current[i + 1].focus();
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, ' ').slice(0, 6).trimEnd());
    if (pasted.length === 6) inputs.current[5].focus();
    e.preventDefault();
  }

  return (
    <div className="otp-boxes">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="otp-box"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

export default function AuthModal({ mode = 'login', onClose, onSuccess }) {
  const { signupRequest, signupVerify, loginRequest, loginVerify } = useAuth();

  const [tab, setTab]           = useState(mode);
  const [step, setStep]         = useState(1); // 1 = form, 2 = otp
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [pendingData, setPendingData] = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  function switchTab(t) { setTab(t); setStep(1); setError(''); setOtp(''); }

  // Countdown for resend
  function startResendTimer() {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  }

  // Step 1 submit
  async function handleStep1(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'signup') {
        const pending = await signupRequest(name, email, password);
        setPendingData(pending);
      } else {
        await loginRequest(email, password);
      }
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2 submit — verify OTP
  async function handleStep2(e) {
    e.preventDefault();
    if (otp.replace(/\s/g, '').length < 6) { setError('Enter the 6-digit code'); return; }
    setError(''); setLoading(true);
    try {
      if (tab === 'signup') {
        await signupVerify(pendingData, otp);
      } else {
        await loginVerify(email, otp);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    if (resendTimer > 0) return;
    setError(''); setOtp(''); setLoading(true);
    try {
      if (tab === 'signup') {
        const pending = await signupRequest(pendingData.name, pendingData.email, password);
        setPendingData(pending);
      } else {
        await loginRequest(email, password);
      }
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Tabs */}
        <div className="modal-tabs">
          <button className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}>Log In</button>
          <button className={`modal-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}>Sign Up</button>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Step 1 — credentials */}
        {step === 1 && (
          <form className="modal-form" onSubmit={handleStep1}>
            <p className="modal-tagline">
              {tab === 'login' ? 'Welcome back to StructGuru' : 'Create your StructGuru account'}
            </p>

            {tab === 'signup' && (
              <div className="modal-field">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={name}
                  onChange={e => setName(e.target.value)} required autoFocus />
              </div>
            )}

            <div className="modal-field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoFocus={tab === 'login'} />
            </div>

            <div className="modal-field">
              <label>Password</label>
              <input type="password"
                placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <div className="modal-error">⚠ {error}</div>}

            <button className="modal-submit" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Sending code…</>
                : tab === 'login' ? 'Continue' : 'Continue'
              }
            </button>

            <p className="modal-switch">
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}>
                {tab === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form className="modal-form" onSubmit={handleStep2}>
            <div className="otp-header">
              <div className="otp-icon">✉️</div>
              <p className="modal-tagline" style={{ textAlign: 'center' }}>
                We sent a 6-digit code to
              </p>
              <p className="otp-email">{tab === 'signup' ? pendingData?.email : email}</p>
            </div>

            <OTPInput value={otp} onChange={setOtp} />

            {error && <div className="modal-error">⚠ {error}</div>}

            <button className="modal-submit" type="submit" disabled={loading || otp.replace(/\s/g,'').length < 6}>
              {loading
                ? <><span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Verifying…</>
                : tab === 'login' ? 'Log In' : 'Create Account'
              }
            </button>

            <div className="otp-footer">
              <button type="button" className="otp-resend" onClick={handleResend}
                disabled={resendTimer > 0 || loading}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
              <span className="otp-sep">·</span>
              <button type="button" className="otp-back" onClick={() => { setStep(1); setError(''); setOtp(''); }}>
                Change email
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
