import React from 'react';
import { SOUND_THEMES } from '../data/themes';
import { useApp } from '../context/AppContext';

export const HeroPanel: React.FC = () => {
  const { settings, activityLevel } = useApp();
  const theme = SOUND_THEMES.find(t => t.id === settings.selectedThemeId) ?? SOUND_THEMES[0];

  return (
    <div
      className="hero-panel"
      style={{ background: theme.gradient }}
    >
      {/* Animated background particles */}
      <div className="hero-panel__particles">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              '--delay': `${i * 0.4}s`,
              '--x': `${(i * 37 + 10) % 100}%`,
              '--size': `${4 + (i % 4) * 3}px`,
              '--color': i % 2 === 0 ? theme.color : theme.accentColor,
              animationDuration: `${3 + (i % 3)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Central emoji + pulse ring */}
      <div className="hero-panel__center">
        <div
          className={`hero-emoji-wrapper ${activityLevel > 0.1 ? 'hero-emoji-wrapper--active' : ''}`}
          style={{ '--theme-color': theme.color } as React.CSSProperties}
        >
          <div className="hero-pulse-ring" style={{ '--theme-color': theme.color } as React.CSSProperties} />
          <div className="hero-emoji">{theme.emoji}</div>
        </div>

        <div className="hero-panel__text">
          <h2 className="hero-title">{theme.name}</h2>
          <p className="hero-description">{theme.description}</p>
        </div>

        {/* Activity indicator dots */}
        <div className="hero-activity">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="activity-dot"
              style={{
                opacity: activityLevel > i * 0.2 && settings.isEnabled ? 1 : 0.15,
                background: theme.accentColor,
                transitionDelay: `${i * 30}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
