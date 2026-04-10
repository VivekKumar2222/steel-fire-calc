import { useState, useCallback, createContext, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('sg_token');
    const saved = localStorage.getItem('sg_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setAuthLoading(false);
  }, []);

  // SIGNUP step 1 — send OTP, get back pendingData
  const signupRequest = useCallback(async (name, email, password) => {
    const res = await fetch('https://backend.structguru.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.pendingData; // { name, email, hashedPassword }
  }, []);

  // SIGNUP step 2 — verify OTP
  const signupVerify = useCallback(async (pendingData, otp) => {
    const res = await fetch('https://backend.structguru.com/api/auth/signup/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pendingData, otp }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    localStorage.setItem('sg_token', data.token);
    localStorage.setItem('sg_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // LOGIN step 1 — send OTP
  const loginRequest = useCallback(async (email, password) => {
    const res = await fetch('https://backend.structguru.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  }, []);

  // LOGIN step 2 — verify OTP
  const loginVerify = useCallback(async (email, otp) => {
    const res = await fetch('https://backend.structguru.com/api/auth/login/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    localStorage.setItem('sg_token', data.token);
    localStorage.setItem('sg_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, signupRequest, signupVerify, loginRequest, loginVerify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
