/**
 * TypeScript declaration for the TypeFlow Electron bridge.
 * Exposed via preload.ts contextBridge as window.typeflow
 */
declare global {
  interface Window {
    typeflow?: {
      getHookStatus: () => Promise<{
        hookAvailable: boolean;
        hookRunning: boolean;
        typingSoundsEnabled: boolean;
      }>;
      setTypingEnabled: (enabled: boolean) => Promise<{ success: boolean; hookRunning: boolean }>;
      onGlobalKeydown: (
        cb: (data: { keycode: number; shiftKey: boolean }) => void
      ) => () => void;
      loadSettings: () => Promise<Record<string, unknown>>;
      saveSettings: (data: Record<string, unknown>) => Promise<{ success: boolean }>;
      onTypingSoundsToggled: (cb: (enabled: boolean) => void) => () => void;
      getSystemDarkMode: () => Promise<boolean>;
      notifyThemeChanged: (themeId: string) => void;
      openExternal: (url: string) => void;
      platform: string;
      isElectron: boolean;
    };
  }
}

export {};
