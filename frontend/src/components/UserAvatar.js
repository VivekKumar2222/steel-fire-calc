import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function UserAvatar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Get initials from name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  // Format join date
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="user-avatar-wrap" ref={ref}>
      {/* Avatar circle */}
      <button
        className="user-avatar-btn"
        onClick={() => setOpen(o => !o)}
        title={user?.name}
      >
        {initials}
      </button>

      {/* Hover / click card */}
      {open && (
        <div className="user-card">
          <div className="user-card-header">
            <div className="user-card-avatar">{initials}</div>
            <div className="user-card-info">
              <div className="user-card-name">{user?.name}</div>
              <div className="user-card-email">{user?.email}</div>
            </div>
          </div>

          <div className="user-card-divider" />

          {joined && (
            <div className="user-card-meta">
              <span>Member since</span>
              <span>{joined}</span>
            </div>
          )}

          <div className="user-card-divider" />

          <button className="user-card-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
