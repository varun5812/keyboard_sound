import React from 'react';
import type { SoundTheme } from '../types';
import { useApp } from '../context/AppContext';
import { audioEngine } from '../audio/AudioEngine';

interface ThemeCardProps {
  theme: SoundTheme;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => {
  const { settings } = useApp();

  const handlePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await audioEngine.initialize();
      await audioEngine.previewTheme(theme.id, settings.typingVolume);
    } catch (err) {
      console.warn('Preview failed:', err);
    }
  };

  return (
    <div
      className={`theme-card ${isSelected ? 'theme-card--selected' : ''}`}
      style={{ '--theme-color': theme.color, '--theme-accent': theme.accentColor } as React.CSSProperties}
      onClick={() => onSelect(theme.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${theme.name} sound theme`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(theme.id)}
      id={`theme-card-${theme.id}`}
    >
      <div className="theme-card__glow" />
      <div className="theme-card__content">
        <div className="theme-card__emoji">{theme.emoji}</div>
        <div className="theme-card__info">
          <h3 className="theme-card__name">{theme.name}</h3>
          <span className="theme-card__category">{theme.category}</span>
        </div>
        {isSelected && (
          <div className="theme-card__badge">
            <span>●</span> Active
          </div>
        )}
      </div>
      <div className="theme-card__actions">
        <button
          className="theme-card__preview-btn"
          onClick={handlePreview}
          aria-label={`Preview ${theme.name}`}
          id={`preview-btn-${theme.id}`}
          title="Preview sound"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Preview
        </button>
      </div>
      {theme.hasAmbient && (
        <div className="theme-card__ambient-tag" title="Has ambient background">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          Ambient
        </div>
      )}
    </div>
  );
};
