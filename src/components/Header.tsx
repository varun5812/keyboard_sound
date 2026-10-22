import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC<{ onToggleTheme: () => void }> = ({ onToggleTheme }) => {
  const { settings, isElectron, electronHookActive } = useApp();

  const isLive = settings.isEnabled && !settings.isMuted;
  const isSystemWide = isElectron && electronHookActive;

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="brand-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-grad)"/>
            <rect x="5" y="8" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="11" y="8" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="17" y="8" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="23" y="8" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="5" y="14" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="11" y="14" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="17" y="14" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="23" y="14" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="5" y="20" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="11" y="20" width="16" height="4" rx="1" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6C5CE7"/>
                <stop offset="1" stopColor="#A29BFE"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text">
          <h1 className="brand-name">TypeFlow</h1>
          <span className="brand-tagline">Ambient Keyboard Experience</span>
        </div>
      </div>

      <div className="app-header__controls">
        {/* System-wide badge (Electron only) */}
        {isElectron && (
          <div
            className={`system-badge ${isSystemWide ? 'system-badge--active' : 'system-badge--inactive'}`}
            title={isSystemWide ? 'System-wide keyboard detection active' : 'Keyboard detection paused'}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 3h2v2h-2V7zm0 4h2v2h-2v-2zM8 7h2v2H8V7zm0 4h2v2H8v-2zm-1 5H5v-2h2v2zm10 0H7v-2h10v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm2 8h-2v-2h2v2z"/>
            </svg>
            {isSystemWide ? '🌐 System-Wide' : 'Tab Only'}
          </div>
        )}

        {/* Activity indicator */}
        <div
          className={`activity-indicator ${isLive ? 'activity-indicator--active' : ''}`}
          title={isLive ? 'Typing sounds active' : 'Typing sounds paused'}
          aria-label={isLive ? 'Typing sounds active' : 'Typing sounds paused'}
        >
          <div className="activity-indicator__dot" />
          <span className="activity-indicator__label">
            {isLive ? 'Live' : 'Paused'}
          </span>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          id="theme-mode-toggle"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={settings.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={settings.isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {settings.isDarkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0zM7.05 18.36l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
