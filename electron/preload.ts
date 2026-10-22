/**
 * TypeFlow Electron Preload Script
 * Exposes safe IPC bridge via contextBridge.
 * Renderer can only call these specific, limited APIs.
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('typeflow', {
  // Hook status and control
  getHookStatus: () => ipcRenderer.invoke('get-hook-status'),
  setTypingEnabled: (enabled: boolean) => ipcRenderer.invoke('set-typing-enabled', enabled),

  // Global keydown from main process (system-wide)
  onGlobalKeydown: (cb: (data: { keycode: number; shiftKey: boolean }) => void) => {
    const listener = (_: Electron.IpcRendererEvent, data: { keycode: number; shiftKey: boolean }) => cb(data);
    ipcRenderer.on('global-keydown', listener);
    return () => ipcRenderer.removeListener('global-keydown', listener);
  },

  // Settings (main-process backed)
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (data: Record<string, unknown>) => ipcRenderer.invoke('save-settings', data),

  // Typing sounds toggle notification from tray
  onTypingSoundsToggled: (cb: (enabled: boolean) => void) => {
    const listener = (_: Electron.IpcRendererEvent, enabled: boolean) => cb(enabled);
    ipcRenderer.on('typing-sounds-toggled', listener);
    return () => ipcRenderer.removeListener('typing-sounds-toggled', listener);
  },

  // Dark mode
  getSystemDarkMode: () => ipcRenderer.invoke('get-system-dark-mode'),

  // Theme info (for tray updates)
  notifyThemeChanged: (themeId: string) => ipcRenderer.send('theme-changed', themeId),

  // Safe external links
  openExternal: (url: string) => ipcRenderer.send('open-external', url),

  // Platform info
  platform: process.platform,
  isElectron: true,
});
