import React from 'react';
import { VolumeSlider } from './VolumeSlider';
import { ToggleSwitch } from './ToggleSwitch';
import { useApp } from '../context/AppContext';
import { audioEngine } from '../audio/AudioEngine';
import { SOUND_THEMES } from '../data/themes';
import type { IntensityMode } from '../types';

export const ControlsPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const selectedTheme = SOUND_THEMES.find(t => t.id === settings.selectedThemeId);

  const handleMasterVolume = (v: number) => {
    updateSettings({ masterVolume: v });
    audioEngine.setMasterVolume(v);
  };

  const handleTypingVolume = (v: number) => {
    updateSettings({ typingVolume: v });
    audioEngine.setTypingVolume(v);
  };

  const handleAmbientVolume = (v: number) => {
    updateSettings({ ambientVolume: v });
    audioEngine.setAmbientVolume(v);
  };

  const handleMute = (muted: boolean) => {
    updateSettings({ isMuted: muted });
    audioEngine.setMuted(muted, settings.masterVolume);
  };

  const handleAmbientToggle = async (enabled: boolean) => {
    updateSettings({ isAmbientEnabled: enabled });
    if (enabled) {
      await audioEngine.initialize();
      audioEngine.startAmbient(settings.selectedThemeId);
    } else {
      audioEngine.stopAmbient();
    }
  };

  const handleTestSound = async () => {
    await audioEngine.initialize();
    await audioEngine.previewTheme(settings.selectedThemeId, settings.typingVolume);
  };

  const intensityModes: { id: IntensityMode; label: string; icon: string }[] = [
    { id: 'soft', label: 'Soft', icon: '🌸' },
    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
    { id: 'satisfying', label: 'Satisfying', icon: '💥' },
  ];

  return (
    <section className="controls-panel" aria-label="Audio controls">
      <h2 className="section-title">Audio Controls</h2>

      {/* Main enable toggle */}
      <div className="controls-panel__main-toggle">
        <ToggleSwitch
          id="enable-typing-sounds"
          label="Typing Sounds"
          checked={settings.isEnabled}
          onChange={(v) => updateSettings({ isEnabled: v })}
          color="#6C5CE7"
          size="lg"
          description="Play a sound for every keystroke"
        />
      </div>

      {/* Volume sliders */}
      <div className="controls-panel__sliders">
        <VolumeSlider
          id="master-volume"
          label="Master Volume"
          icon={<span>🔊</span>}
          value={settings.masterVolume}
          onChange={handleMasterVolume}
          color="#6C5CE7"
          disabled={settings.isMuted}
        />
        <VolumeSlider
          id="typing-volume"
          label="Typing Volume"
          icon={<span>⌨️</span>}
          value={settings.typingVolume}
          onChange={handleTypingVolume}
          color="#1D9BF0"
          disabled={!settings.isEnabled || settings.isMuted}
        />
        <VolumeSlider
          id="ambient-volume"
          label="Ambient Volume"
          icon={<span>🌊</span>}
          value={settings.ambientVolume}
          onChange={handleAmbientVolume}
          color="#27AE60"
          disabled={!settings.isAmbientEnabled || settings.isMuted}
        />
      </div>

      {/* Toggles row */}
      <div className="controls-panel__toggles">
        <ToggleSwitch
          id="mute-toggle"
          label="Mute All"
          checked={settings.isMuted}
          onChange={handleMute}
          color="#E74C3C"
          size="sm"
        />
        <ToggleSwitch
          id="random-variation-toggle"
          label="Random Variation"
          checked={settings.randomVariation}
          onChange={(v) => updateSettings({ randomVariation: v })}
          color="#F39C12"
          size="sm"
          description="Slight pitch/volume variation"
        />
        <ToggleSwitch
          id="ambient-toggle"
          label="Ambient Background"
          checked={settings.isAmbientEnabled}
          onChange={handleAmbientToggle}
          color="#27AE60"
          size="sm"
          description={selectedTheme?.hasAmbient
            ? selectedTheme.ambientDescription
            : 'Not available for this theme'}
        />
      </div>

      {/* Intensity mode */}
      <div className="controls-panel__intensity">
        <label className="intensity-label">Typing Intensity</label>
        <div className="intensity-buttons" role="group" aria-label="Typing intensity mode">
          {intensityModes.map(mode => (
            <button
              key={mode.id}
              id={`intensity-${mode.id}`}
              className={`intensity-btn ${settings.intensityMode === mode.id ? 'intensity-btn--active' : ''}`}
              onClick={() => updateSettings({ intensityMode: mode.id })}
              aria-pressed={settings.intensityMode === mode.id}
            >
              <span>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="controls-panel__actions">
        <button
          id="test-sound-btn"
          className="action-btn action-btn--primary"
          onClick={handleTestSound}
          aria-label="Test current sound theme"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Test Sound
        </button>
        <button
          id="mute-btn"
          className={`action-btn ${settings.isMuted ? 'action-btn--danger' : 'action-btn--secondary'}`}
          onClick={() => handleMute(!settings.isMuted)}
          aria-label={settings.isMuted ? 'Unmute' : 'Mute'}
        >
          {settings.isMuted ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
              Unmute
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              Mute
            </>
          )}
        </button>
      </div>
    </section>
  );
};
