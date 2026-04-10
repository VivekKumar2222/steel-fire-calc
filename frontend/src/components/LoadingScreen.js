import React from 'react';

export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="loading-logo-text">SG</span>
          <div className="loading-ring" />
        </div>
        <p className="loading-message">{message}</p>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
