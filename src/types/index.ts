export type SoundCategory = 'nature' | 'mechanical' | 'music' | 'cozy' | 'fantasy' | 'retro' | 'futuristic';

export type IntensityMode = 'soft' | 'balanced' | 'satisfying';

export interface SoundTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: SoundCategory;
  color: string;
  accentColor: string;
  gradient: string;
  hasAmbient: boolean;
  ambientDescription?: string;
}

export interface AudioSettings {
  masterVolume: number;
  typingVolume: number;
  ambientVolume: number;
  selectedThemeId: string;
  isEnabled: boolean;
  isAmbientEnabled: boolean;
  isMuted: boolean;
  randomVariation: boolean;
  intensityMode: IntensityMode;
  isDarkMode: boolean;
}

export interface KeyEvent {
  key: string;
  code: string;
  timestamp: number;
}

export interface VisualizerBar {
  height: number;
  targetHeight: number;
  color: string;
}
