# TypeFlow 🎹

> **Ambient Keyboard Sound Experience** — Transform ordinary typing into an immersive soundscape.

TypeFlow plays beautiful, low-latency audio on every keystroke using the Web Audio API with fully procedural sound synthesis — no external audio files needed.

---

## ✨ Features

- **10 Sound Themes** — Rain, Ocean, Forest, Piano, Mechanical, Bubbles, Magical, Typewriter, Café, Space
- **Ambient Backgrounds** — Continuous ambient drones for Nature, Café, and Space themes
- **Audio Visualizer** — Real-time canvas-based waveform reacting to typing
- **Full Controls** — Master, typing, and ambient volume sliders
- **Sound Variation** — Randomized pitch/volume for natural feel
- **Intensity Modes** — Soft, Balanced, Satisfying
- **Dark/Light Mode** — Persisted preference
- **All settings persisted** in localStorage
- **Privacy-first** — No keystrokes are ever recorded or transmitted

---

## 💾 Download & Install (Windows)

Ordinary users can download and install TypeFlow without needing to use a terminal:

👉 **[Download TypeFlow for Windows (TypeFlow-Setup.exe)](https://github.com/varun5812/keyboard_sound/releases/latest/download/TypeFlow-Setup.exe)**

1. Download **`TypeFlow-Setup.exe`** from the direct link above.
2. Run the installer (sets up Start Menu and Desktop shortcuts).
3. TypeFlow launches and runs in the Windows system tray, reacting to typing system-wide.

---

## 🚀 Development & Building from Source

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── audio/
│   └── AudioEngine.ts        # Web Audio API engine (synthesis, ambient)
├── components/
│   ├── AudioVisualizer.tsx   # Canvas-based waveform visualizer
│   ├── ControlsPanel.tsx     # Volume sliders, toggles, intensity
│   ├── Header.tsx            # Branding + activity indicator
│   ├── HeroPanel.tsx         # Current theme display with particles
│   ├── ThemeCard.tsx         # Individual sound theme card
│   ├── ThemeGrid.tsx         # Filterable theme grid
│   ├── ToggleSwitch.tsx      # Reusable toggle component
│   └── VolumeSlider.tsx      # Reusable slider component
├── context/
│   └── AppContext.ts         # React context definition
├── data/
│   └── themes.ts             # Theme definitions & defaults
├── providers/
│   └── AppProvider.tsx       # State management + keyboard events
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   └── settings.ts           # localStorage persistence + helpers
├── App.tsx                   # Root component + layout
├── App.css                   # Complete design system
└── main.tsx                  # React entry point
```

---

## 🎵 Sound Architecture

All sounds are **procedurally synthesized** using the Web Audio API:

| Theme | Synthesis Method |
|-------|-----------------|
| Rain | Bandpass-filtered noise bursts |
| Ocean | Lowpass-filtered noise with LFO |
| Forest | Sine wave chirps with pitch decay |
| Piano | Multi-harmonic sine oscillators (pentatonic scale) |
| Mechanical | Noise click + square wave thump |
| Bubbles | Rising-pitch sine pop |
| Magical | Multi-tone sparkle with staggered delays |
| Typewriter | Highpass-filtered noise clack |
| Café | Ceramic tap (sine + noise) |
| Space | Bandpass-filtered sawtooth blip |

### Ambient Layers

Themes with ambient support (Rain, Ocean, Forest, Café, Space) generate continuous looped audio using oscillators and filtered noise — no audio files required.

---

## 🔒 Privacy

TypeFlow processes keyboard `keydown` events **only to trigger sounds**. It:
- ✅ Checks if the key code is a typing key (letters, digits, punctuation)
- ✅ Does NOT read, log, store, or transmit the actual characters typed
- ✅ All processing stays local in the browser

---

## ⚠️ Browser Limitations

TypeFlow runs in the browser tab. This means:
- ✅ Sounds play while the TypeFlow tab is **active and focused**
- ❌ Cannot capture keypresses in other applications (browser security limitation)

**For system-wide typing sounds** (works in all applications): A desktop wrapper using Electron or Tauri would be needed. The project architecture is ready for this extension — the `AudioEngine` and all state logic are decoupled from the browser keyboard event source.

---

## 🖥️ Desktop Version (Future)

To add global keyboard detection:
1. Wrap with Electron (`electron` + `uiohook-napi` for global hooks)
2. Point the `keydown` IPC event to `audioEngine.playTypingSound()`
3. Add system tray via `electron-tray`

The React/Audio codebase requires zero changes.

---

## 🛠️ Customization

### Adding a New Theme

1. Add entry to `src/data/themes.ts` (`SOUND_THEMES` array)
2. Add synth function to `SYNTHS` in `src/audio/AudioEngine.ts`
3. Optionally add ambient synth to `AMBIENT_SYNTHS`

### Replacing with Real Audio Files

While TypeFlow uses procedural synthesis, you can swap to file-based audio:
```ts
// In AudioEngine.ts, replace SYNTHS[themeId] with:
const buffer = await ctx.decodeAudioData(await fetch('/sounds/rain.wav').then(r => r.arrayBuffer()));
const source = ctx.createBufferSource();
source.buffer = buffer;
```

Place audio files in `public/sounds/` for direct URL access.

---

## 📄 License

MIT — free for personal and commercial use.
