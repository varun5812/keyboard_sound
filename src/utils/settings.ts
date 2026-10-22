import type { AudioSettings, IntensityMode } from '../types';
import { DEFAULT_SETTINGS } from '../data/themes';

const STORAGE_KEY = 'typeflow-settings';

export function loadSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load TypeFlow settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save TypeFlow settings:', e);
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getIntensityMultiplier(mode: IntensityMode): number {
  switch (mode) {
    case 'soft': return 0.5;
    case 'balanced': return 1.0;
    case 'satisfying': return 1.4;
  }
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function isTypingKey(code: string): boolean {
  if (code.startsWith('Key')) return true;
  if (code.startsWith('Digit')) return true;
  if (code === 'Space') return true;
  if (code === 'Enter') return true;
  if (code === 'Backspace') return true;
  if (code === 'Tab') return true;
  const punctuationCodes = [
    'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Backslash',
    'Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'Backquote',
    'NumpadAdd', 'NumpadSubtract', 'NumpadMultiply', 'NumpadDivide',
    'NumpadDecimal', 'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3',
    'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9',
  ];
  return punctuationCodes.includes(code);
}

export function formatVolume(value: number): string {
  return `${Math.round(value * 100)}%`;
}
