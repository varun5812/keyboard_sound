import { createContext, useContext } from 'react';
import type { AudioSettings } from '../types';
import { DEFAULT_SETTINGS } from '../data/themes';
import { audioEngine } from '../audio/AudioEngine';

export interface AppContextValue {
  settings: AudioSettings;
  updateSettings: (partial: Partial<AudioSettings>) => void;
  onKeyPress: () => void;
  isInitialized: boolean;
  lastKeyTime: number;
  activityLevel: number;
  isElectron: boolean;
  electronHookActive: boolean;
}

export const AppContext = createContext<AppContextValue>({
  settings: { ...DEFAULT_SETTINGS },
  updateSettings: () => {},
  onKeyPress: () => {},
  isInitialized: false,
  lastKeyTime: 0,
  activityLevel: 0,
  isElectron: false,
  electronHookActive: false,
});

export const useApp = () => useContext(AppContext);
export { audioEngine };
