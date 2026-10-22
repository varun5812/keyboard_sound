import React, { useState } from 'react';
import { SOUND_THEMES, CATEGORY_LABELS } from '../data/themes';
import { ThemeCard } from './ThemeCard';
import { useApp } from '../context/AppContext';
import type { SoundCategory } from '../types';

export const ThemeGrid: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [activeCategory, setActiveCategory] = useState<SoundCategory | 'all'>('all');

  const categories = ['all', ...Array.from(new Set(SOUND_THEMES.map(t => t.category)))] as (SoundCategory | 'all')[];

  const filtered = activeCategory === 'all'
    ? SOUND_THEMES
    : SOUND_THEMES.filter(t => t.category === activeCategory);

  const handleSelect = (themeId: string) => {
    updateSettings({ selectedThemeId: themeId });
  };

  return (
    <section className="theme-grid-section" aria-label="Sound theme selection">
      <div className="theme-grid-section__header">
        <h2 className="section-title">Sound Themes</h2>
        <div className="category-filter" role="tablist" aria-label="Filter by category">
          {categories.map(cat => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`category-pill ${activeCategory === cat ? 'category-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              id={`category-tab-${cat}`}
            >
              {cat === 'all' ? '✦ All' : CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>
      <div className="theme-grid">
        {filtered.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={settings.selectedThemeId === theme.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
};
