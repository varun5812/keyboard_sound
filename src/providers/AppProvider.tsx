import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { audioEngine } from '../audio/AudioEngine';
import { loadSettings, saveSettings, isTypingKey } from '../utils/settings';
import type { AudioSettings } from '../types';

interface AppProviderProps {
  children: React.ReactNode;
}

// Detect Electron environment
const IS_ELECTRON = typeof window !== 'undefined' && !!window.typeflow?.isElectron;

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [activityLevel, setActivityLevel] = useState(0);
  const [electronHookActive, setElectronHookActive] = useState(false);

  const activityDecayRef = useRef<number>(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const audioInitialized = useRef(false);

  // ── Settings persistence ──────────────────────────────────────────────────
  useEffect(() => {
    saveSettings(settings);
    // Also save to Electron main process if available
    if (IS_ELECTRON && window.typeflow) {
      window.typeflow.saveSettings(settings as unknown as Record<string, unknown>);
    }
  }, [settings]);

  // Load Electron-persisted settings on mount
  useEffect(() => {
    if (IS_ELECTRON && window.typeflow) {
      window.typeflow.loadSettings().then((stored) => {
        if (stored && Object.keys(stored).length > 0) {
          setSettings(prev => ({ ...prev, ...stored }));
        }
      }).catch(() => {});
    }
  }, []);

  // ── Audio engine sync ─────────────────────────────────────────────────────
  useEffect(() => {
    audioEngine.setTheme(settings.selectedThemeId);
    audioEngine.setMuted(settings.isMuted, settings.masterVolume);
  }, []);

  useEffect(() => {
    audioEngine.setTheme(settings.selectedThemeId);
    if (settings.isAmbientEnabled) {
      audioEngine.startAmbient(settings.selectedThemeId);
    }
    window.typeflow?.notifyThemeChanged(settings.selectedThemeId);
  }, [settings.selectedThemeId]);

  // ── Activity decay ────────────────────────────────────────────────────────
  useEffect(() => {
    const decay = () => {
      setActivityLevel(prev => Math.max(0, prev - 0.055));
      activityDecayRef.current = requestAnimationFrame(decay);
    };
    activityDecayRef.current = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(activityDecayRef.current);
  }, []);

  const updateSettings = useCallback((partial: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const onKeyPress = useCallback(() => {
    setLastKeyTime(performance.now());
    setActivityLevel(1);
  }, []);

  // ── Core audio trigger (shared by both browser + Electron paths) ──────────
  const triggerSound = useCallback(async () => {
    const s = settingsRef.current;
    if (!s.isEnabled || s.isMuted) return;

    if (!audioInitialized.current) {
      await audioEngine.initialize();
      audioEngine.setMasterVolume(s.masterVolume);
      audioEngine.setTypingVolume(s.typingVolume);
      audioEngine.setAmbientVolume(s.ambientVolume);
      audioEngine.setMuted(s.isMuted, s.masterVolume);
      audioInitialized.current = true;
      setIsInitialized(true);

      if (s.isAmbientEnabled) {
        audioEngine.startAmbient(s.selectedThemeId);
      }
    }

    onKeyPress();
    audioEngine.playTypingSound(s.randomVariation, s.intensityMode, s.typingVolume);
  }, [onKeyPress]);

  // ── ELECTRON: global hook listener ────────────────────────────────────────
  useEffect(() => {
    if (!IS_ELECTRON || !window.typeflow) return;

    // Check hook status
    window.typeflow.getHookStatus().then(status => {
      setElectronHookActive(status.hookRunning);
    }).catch(() => {});

    // Listen for system-wide keydown events from main process
    const cleanup = window.typeflow.onGlobalKeydown((_data) => {
      // _data.keycode is the raw key code — we don't log it
      // Just trigger the sound
      triggerSound();
    });

    // Listen for tray toggle
    const cleanupTray = window.typeflow.onTypingSoundsToggled((enabled) => {
      setSettings(prev => ({ ...prev, isEnabled: enabled }));
    });

    // Sync Electron hook state with our isEnabled setting
    window.typeflow.setTypingEnabled(settings.isEnabled).then(result => {
      setElectronHookActive(result.hookRunning);
    }).catch(() => {});

    return () => {
      cleanup?.();
      cleanupTray?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Electron hook when isEnabled changes
  useEffect(() => {
    if (!IS_ELECTRON || !window.typeflow) return;
    window.typeflow.setTypingEnabled(settings.isEnabled).then(result => {
      setElectronHookActive(result.hookRunning);
    }).catch(() => {});
  }, [settings.isEnabled]);

  // ── BROWSER FALLBACK: window keydown listener ─────────────────────────────
  useEffect(() => {
    if (IS_ELECTRON) return; // Electron uses global hook above

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!isTypingKey(e.code)) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      await triggerSound();
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSound]);

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      onKeyPress,
      isInitialized,
      lastKeyTime,
      activityLevel,
      isElectron: IS_ELECTRON,
      electronHookActive,
    }}>
      {children}
    </AppContext.Provider>
  );
};
