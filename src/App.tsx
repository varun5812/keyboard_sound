import React from 'react';
import { AppProvider } from './providers/AppProvider';
import { Header } from './components/Header';
import { HeroPanel } from './components/HeroPanel';
import { AudioVisualizer } from './components/AudioVisualizer';
import { ThemeGrid } from './components/ThemeGrid';
import { ControlsPanel } from './components/ControlsPanel';
import { useApp } from './context/AppContext';
import './App.css';

const AppContent: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const toggleColorMode = () => {
    updateSettings({ isDarkMode: !settings.isDarkMode });
  };

  return (
    <div className={`app ${settings.isDarkMode ? 'app--dark' : 'app--light'}`}>
      {/* Background gradient blobs */}
      <div className="app-bg">
        <div className="bg-blob bg-blob--1" />
        <div className="bg-blob bg-blob--2" />
        <div className="bg-blob bg-blob--3" />
      </div>

      <div className="app-layout">
        <Header onToggleTheme={toggleColorMode} />

        <main className="app-main">
          {/* Left column */}
          <div className="app-main__left">
            <HeroPanel />
            <div className="visualizer-container">
              <AudioVisualizer />
            </div>
          </div>

          {/* Right column */}
          <div className="app-main__right">
            <ControlsPanel />
          </div>
        </main>

        {/* Theme selector */}
        <ThemeGrid />

        {/* Footer */}
        <footer className="app-footer">
          <p className="footer-note">
            🔒 TypeFlow never records, stores, or transmits your keystrokes.
            Only sound events are processed.
          </p>
          <p className="footer-note footer-note--secondary">
            Browser MVP — sounds play while this tab is active.
            For system-wide sound, a desktop build is planned.
          </p>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
