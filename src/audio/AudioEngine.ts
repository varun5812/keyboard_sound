/**
 * AudioEngine v2 — Premium Sound Synthesis for TypeFlow
 *
 * Complete rewrite with layered, physically-modelled synthesis:
 * - Mechanical: Real click transient + body resonance + spring release
 * - Rain: Multi-layer splat with sparkle harmonics
 * - Ocean: Whoosh + foam crackle
 * - Piano: Hammer strike model with string resonance and damping
 * - Forest: Multi-layer bird chirps with humidity noise
 * - Bubbles: Perfect physical bubble pop
 * - Magical: Shimmering bell cascade with reverb tail
 * - Typewriter: Carriage, spring, and paper thump layers
 * - Café: Ceramic cup with liquid resonance
 * - Space: Synthesized alien blip with doppler effect
 */

import type { IntensityMode } from '../types';
import { clamp, randomBetween, getIntensityMultiplier } from '../utils/settings';

type SoundSynthFn = (
  ctx: AudioContext,
  dest: AudioNode,
  vol: number,
  variation: boolean,
  intensity: number
) => void;

type AmbientStartFn = (
  ctx: AudioContext,
  dest: AudioNode
) => () => void;

// ─── Shared helpers ───────────────────────────────────────────────────────────

// Create a convolution reverb from noise
function makeReverb(ctx: AudioContext, decay: number, _mix = 0.4): ConvolverNode {
  const len = Math.floor(ctx.sampleRate * decay);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

// ─── PREMIUM SOUND SYNTHS ─────────────────────────────────────────────────────

const SYNTHS: Record<string, SoundSynthFn> = {

  // ── MECHANICAL KEYBOARD ── The flagship sound ─────────────────────────────
  mechanical: (ctx, dest, vol, variation, intensity) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.8, 1.0) : 0.9);

    // Layer 1: Sharp click transient (impact noise burst)
    const clickLen = Math.floor(ctx.sampleRate * 0.003);
    const clickBuf = ctx.createBuffer(1, clickLen, ctx.sampleRate);
    const cd = clickBuf.getChannelData(0);
    for (let i = 0; i < clickLen; i++) {
      cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / clickLen, 1.5) * 2;
    }
    const clickSrc = ctx.createBufferSource();
    clickSrc.buffer = clickBuf;
    const clickFlt = ctx.createBiquadFilter();
    clickFlt.type = 'highpass';
    clickFlt.frequency.value = variation ? randomBetween(2000, 4000) : 3000;
    const clickGain = ctx.createGain();
    clickGain.gain.value = v * intensity * 1.2;
    clickSrc.connect(clickFlt);
    clickFlt.connect(clickGain);
    clickGain.connect(dest);
    clickSrc.start(t);

    // Layer 2: Key body resonance (the "thock" / "clack" character)
    const bodyFreq = variation ? randomBetween(150, 280) : 200;
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = 'square';
    bodyOsc.frequency.setValueAtTime(bodyFreq, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.4, t + 0.04);
    const bodyFlt = ctx.createBiquadFilter();
    bodyFlt.type = 'lowpass';
    bodyFlt.frequency.value = 600;
    bodyFlt.Q.value = 2;
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(v * 0.5 * intensity, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    bodyOsc.connect(bodyFlt);
    bodyFlt.connect(bodyGain);
    bodyGain.connect(dest);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.05);

    // Layer 3: Spring ping (high overtone, brief)
    const springFreq = variation ? randomBetween(1800, 2600) : 2200;
    const springOsc = ctx.createOscillator();
    springOsc.type = 'sine';
    springOsc.frequency.setValueAtTime(springFreq, t);
    springOsc.frequency.exponentialRampToValueAtTime(springFreq * 0.7, t + 0.06);
    const springGain = ctx.createGain();
    springGain.gain.setValueAtTime(v * 0.08 * intensity, t);
    springGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    springOsc.connect(springGain);
    springGain.connect(dest);
    springOsc.start(t);
    springOsc.stop(t + 0.08);

    // Layer 4: Key release bump (very subtle, delayed ~80ms)
    if (intensity > 0.6) {
      const relLen = Math.floor(ctx.sampleRate * 0.002);
      const relBuf = ctx.createBuffer(1, relLen, ctx.sampleRate);
      const rd = relBuf.getChannelData(0);
      for (let i = 0; i < relLen; i++) rd[i] = (Math.random() * 2 - 1) * (1 - i / relLen);
      const relSrc = ctx.createBufferSource();
      relSrc.buffer = relBuf;
      const relFlt = ctx.createBiquadFilter();
      relFlt.type = 'bandpass';
      relFlt.frequency.value = 1200;
      relFlt.Q.value = 3;
      const relGain = ctx.createGain();
      relGain.gain.value = v * 0.12;
      relSrc.connect(relFlt);
      relFlt.connect(relGain);
      relGain.connect(dest);
      relSrc.start(t + 0.08);
      relSrc.stop(t + 0.09);
    }
  },

  // ── RAIN DROPS ── Layered water physics ───────────────────────────────────
  rain: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.5, 1.0) : 0.7);

    // Layer 1: Impact splash (broadband with bandpass)
    const splashLen = Math.floor(ctx.sampleRate * 0.06);
    const splashBuf = ctx.createBuffer(1, splashLen, ctx.sampleRate);
    const sd = splashBuf.getChannelData(0);
    for (let i = 0; i < splashLen; i++) {
      sd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / splashLen, 2.5);
    }
    const splashSrc = ctx.createBufferSource();
    splashSrc.buffer = splashBuf;
    const splashFlt = ctx.createBiquadFilter();
    splashFlt.type = 'bandpass';
    splashFlt.frequency.value = variation ? randomBetween(1200, 3500) : 2000;
    splashFlt.Q.value = variation ? randomBetween(0.5, 2.5) : 1.2;
    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(v * 0.6, t);
    splashGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    splashSrc.connect(splashFlt);
    splashFlt.connect(splashGain);
    splashGain.connect(dest);
    splashSrc.start(t);

    // Layer 2: Sparkle high-freq ring (ripple harmonics)
    const ringFreq = variation ? randomBetween(3000, 6000) : 4500;
    const ringOsc = ctx.createOscillator();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(ringFreq, t);
    ringOsc.frequency.exponentialRampToValueAtTime(ringFreq * 0.6, t + 0.04);
    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(v * 0.06, t);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    ringOsc.connect(ringGain);
    ringGain.connect(dest);
    ringOsc.start(t);
    ringOsc.stop(t + 0.06);

    // Layer 3: Low thud (impact on surface)
    const thudOsc = ctx.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(variation ? randomBetween(60, 120) : 80, t);
    thudOsc.frequency.exponentialRampToValueAtTime(30, t + 0.03);
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(v * 0.15, t);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    thudOsc.connect(thudGain);
    thudGain.connect(dest);
    thudOsc.start(t);
    thudOsc.stop(t + 0.04);
  },

  // ── SOFT PIANO ── Hammer-string physical model ────────────────────────────
  piano: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;

    // Full pentatonic + blues scale — feels musical
    const notes = [
      261.63, 293.66, 311.13, 329.63, 349.23,
      392.00, 415.30, 440.00, 466.16, 493.88,
      523.25, 587.33, 622.25, 659.25
    ];
    const baseFreq = variation ? notes[Math.floor(Math.random() * notes.length)] : 392.00;
    const v = vol * (variation ? randomBetween(0.55, 0.85) : 0.7);

    // Hammer strike model — sharp noise burst then fade
    const hammerLen = Math.floor(ctx.sampleRate * 0.008);
    const hamBuf = ctx.createBuffer(1, hammerLen, ctx.sampleRate);
    const hd = hamBuf.getChannelData(0);
    for (let i = 0; i < hammerLen; i++) hd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hammerLen, 3);
    const hamSrc = ctx.createBufferSource();
    hamSrc.buffer = hamBuf;
    const hamFlt = ctx.createBiquadFilter();
    hamFlt.type = 'bandpass';
    hamFlt.frequency.value = baseFreq * 4;
    hamFlt.Q.value = 1;
    const hamGain = ctx.createGain();
    hamGain.gain.value = v * 0.2;
    hamSrc.connect(hamFlt);
    hamFlt.connect(hamGain);
    hamGain.connect(dest);
    hamSrc.start(t);

    // String fundamental + harmonics (sine blend = warm piano tone)
    const harmonics = [1, 2, 3, 4, 6];
    const levels =  [1.0, 0.5, 0.25, 0.12, 0.05];
    const decays =  [1.2, 0.9, 0.6,  0.4,  0.25];

    harmonics.forEach((h, i) => {
      const osc = ctx.createOscillator();
      // Blend sine + triangle for warmth
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.value = baseFreq * h;
      // Slight detuning for chorus richness
      if (variation && i < 2) {
        osc.detune.value = randomBetween(-4, 4);
      }
      const g = ctx.createGain();
      const peak = v * levels[i] * 0.35;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.005);
      g.gain.setTargetAtTime(peak * 0.6, t + 0.01, 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decays[i]);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + decays[i] + 0.02);
    });
  },

  // ── OCEAN ── Whoosh + foam crackle ────────────────────────────────────────
  ocean: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.5, 0.9) : 0.7);

    // Whoosh: shaped noise through lowpass
    const whooshLen = Math.floor(ctx.sampleRate * 0.18);
    const wBuf = ctx.createBuffer(1, whooshLen, ctx.sampleRate);
    const wd = wBuf.getChannelData(0);
    for (let i = 0; i < whooshLen; i++) wd[i] = Math.random() * 2 - 1;
    const wSrc = ctx.createBufferSource();
    wSrc.buffer = wBuf;

    const wFlt = ctx.createBiquadFilter();
    wFlt.type = 'lowpass';
    wFlt.frequency.setValueAtTime(variation ? randomBetween(200, 500) : 350, t);
    wFlt.frequency.exponentialRampToValueAtTime(150, t + 0.18);
    wFlt.Q.value = 0.7;

    const wGain = ctx.createGain();
    wGain.gain.setValueAtTime(0, t);
    wGain.gain.linearRampToValueAtTime(v * 0.5, t + 0.04);
    wGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    wSrc.connect(wFlt);
    wFlt.connect(wGain);
    wGain.connect(dest);
    wSrc.start(t);

    // Foam crackle: high-passed short burst
    const foamLen = Math.floor(ctx.sampleRate * 0.06);
    const fBuf = ctx.createBuffer(1, foamLen, ctx.sampleRate);
    const fd = fBuf.getChannelData(0);
    for (let i = 0; i < foamLen; i++) fd[i] = (Math.random() * 2 - 1) * (1 - i / foamLen);
    const fSrc = ctx.createBufferSource();
    fSrc.buffer = fBuf;
    const fFlt = ctx.createBiquadFilter();
    fFlt.type = 'highpass';
    fFlt.frequency.value = 3000;
    const fGain = ctx.createGain();
    fGain.gain.setValueAtTime(v * 0.15, t + 0.02);
    fGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    fSrc.connect(fFlt);
    fFlt.connect(fGain);
    fGain.connect(dest);
    fSrc.start(t + 0.02);
  },

  // ── FOREST ── Multi-layer nature sounds ───────────────────────────────────
  forest: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.5, 0.9) : 0.7);

    // Choose randomly between bird chirp, leaf rustle, twig snap
    const type = variation ? Math.floor(Math.random() * 3) : 0;

    if (type === 0) {
      // Bird chirp: gliding sine with vibrato
      const freq = variation ? randomBetween(1500, 4000) : 2800;
      const vibOsc = ctx.createOscillator();
      vibOsc.frequency.value = variation ? randomBetween(8, 16) : 12;
      const vibGain = ctx.createGain();
      vibGain.gain.value = freq * 0.03;

      const birdOsc = ctx.createOscillator();
      birdOsc.type = 'sine';
      birdOsc.frequency.setValueAtTime(freq * 0.8, t);
      birdOsc.frequency.linearRampToValueAtTime(freq * 1.2, t + 0.04);
      birdOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.09);

      vibOsc.connect(vibGain);
      vibGain.connect(birdOsc.frequency);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(0, t);
      bGain.gain.linearRampToValueAtTime(v * 0.15, t + 0.01);
      bGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      birdOsc.connect(bGain);
      bGain.connect(dest);
      vibOsc.start(t); vibOsc.stop(t + 0.1);
      birdOsc.start(t); birdOsc.stop(t + 0.1);

    } else if (type === 1) {
      // Leaf rustle: highpass noise burst
      const lLen = Math.floor(ctx.sampleRate * 0.07);
      const lBuf = ctx.createBuffer(1, lLen, ctx.sampleRate);
      const ld = lBuf.getChannelData(0);
      for (let i = 0; i < lLen; i++) ld[i] = (Math.random() * 2 - 1) * Math.sin((i / lLen) * Math.PI);
      const lSrc = ctx.createBufferSource();
      lSrc.buffer = lBuf;
      const lFlt = ctx.createBiquadFilter();
      lFlt.type = 'highpass';
      lFlt.frequency.value = 4000;
      const lGain = ctx.createGain();
      lGain.gain.value = v * 0.25;
      lSrc.connect(lFlt); lFlt.connect(lGain); lGain.connect(dest);
      lSrc.start(t);

    } else {
      // Twig snap: very short noise + low thud
      const snLen = Math.floor(ctx.sampleRate * 0.004);
      const snBuf = ctx.createBuffer(1, snLen, ctx.sampleRate);
      const snd = snBuf.getChannelData(0);
      for (let i = 0; i < snLen; i++) snd[i] = (Math.random() * 2 - 1) * 3;
      const snSrc = ctx.createBufferSource();
      snSrc.buffer = snBuf;
      const snGain = ctx.createGain();
      snGain.gain.value = v * 0.6;
      snSrc.connect(snGain); snGain.connect(dest); snSrc.start(t);

      const thudOsc = ctx.createOscillator();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(120, t);
      thudOsc.frequency.exponentialRampToValueAtTime(40, t + 0.03);
      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(v * 0.2, t);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      thudOsc.connect(thudGain); thudGain.connect(dest);
      thudOsc.start(t); thudOsc.stop(t + 0.04);
    }
  },

  // ── BUBBLES ── Physical bubble pop model ──────────────────────────────────
  bubbles: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const radius = variation ? randomBetween(0.002, 0.012) : 0.006;
    // Bubble resonance freq = 3/(2π * radius) * sqrt(3γP₀/ρ)
    // Simplified: freq ≈ 3 / radius (empirically tuned)
    const freq = clamp(3 / radius * 0.7, 300, 2500);
    const v = vol * (variation ? randomBetween(0.4, 0.85) : 0.6);

    // Pop: sine that rises then cuts sharply
    const popOsc = ctx.createOscillator();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(freq * 0.5, t);
    popOsc.frequency.exponentialRampToValueAtTime(freq * 1.8, t + 0.025);

    const popGain = ctx.createGain();
    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.linearRampToValueAtTime(v * 0.5, t + 0.005);
    popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    // Add slight air rush at the pop point
    const airLen = Math.floor(ctx.sampleRate * 0.015);
    const airBuf = ctx.createBuffer(1, airLen, ctx.sampleRate);
    const ad = airBuf.getChannelData(0);
    for (let i = 0; i < airLen; i++) ad[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / airLen, 4);
    const airSrc = ctx.createBufferSource();
    airSrc.buffer = airBuf;
    const airFlt = ctx.createBiquadFilter();
    airFlt.type = 'bandpass';
    airFlt.frequency.value = freq * 2;
    airFlt.Q.value = 1;
    const airGain = ctx.createGain();
    airGain.gain.value = v * 0.2;
    airSrc.connect(airFlt); airFlt.connect(airGain); airGain.connect(dest);
    airSrc.start(t + 0.02);

    popOsc.connect(popGain);
    popGain.connect(dest);
    popOsc.start(t);
    popOsc.stop(t + 0.06);
  },

  // ── MAGICAL ── Fairy-bell cascade with shimmer reverb ────────────────────
  magical: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;

    // Use a reverb send for the magical tail
    const dry = ctx.createGain();
    dry.gain.value = 0.6;
    dry.connect(dest);

    const reverb = makeReverb(ctx, 1.2, 0.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.4;
    reverb.connect(wet);
    wet.connect(dest);

    // Bell series: each one is a slightly detuned triangle/sine pair
    const baseNote = variation ? randomBetween(800, 2000) : 1400;
    const bellNotes = [1, 1.5, 2, 2.8, 3.5, 4.5];
    bellNotes.forEach((mult, i) => {
      const delay = i * 0.035;
      const freq = baseNote * mult;
      // Primary bell tone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = freq;
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 1.005; // slight beating

      const g = ctx.createGain();
      const peak = vol * 0.18 * (1 - i * 0.14);
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(peak, t + delay + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.3 - i * 0.03);

      osc1.connect(g); osc2.connect(g);
      g.connect(dry); g.connect(reverb);
      osc1.start(t + delay); osc1.stop(t + delay + 0.35);
      osc2.start(t + delay); osc2.stop(t + delay + 0.35);
    });
  },

  // ── TYPEWRITER ── Three-layer mechanical model ─────────────────────────────
  typewriter: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.7, 1.0) : 0.85);

    // Layer 1: Key hammer hit (sharp transient, slightly metallic)
    const hitLen = Math.floor(ctx.sampleRate * 0.005);
    const hitBuf = ctx.createBuffer(1, hitLen, ctx.sampleRate);
    const hd = hitBuf.getChannelData(0);
    for (let i = 0; i < hitLen; i++) {
      hd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hitLen, 2) * 2.5;
    }
    const hitSrc = ctx.createBufferSource();
    hitSrc.buffer = hitBuf;
    const hitFlt = ctx.createBiquadFilter();
    hitFlt.type = 'peaking';
    hitFlt.frequency.value = variation ? randomBetween(800, 1400) : 1100;
    hitFlt.gain.value = 8;
    hitFlt.Q.value = 2;
    const hitGain = ctx.createGain();
    hitGain.gain.value = v * 1.0;
    hitSrc.connect(hitFlt); hitFlt.connect(hitGain); hitGain.connect(dest);
    hitSrc.start(t);

    // Layer 2: Paper + platen resonance (mid thud)
    const paperOsc = ctx.createOscillator();
    paperOsc.type = 'square';
    paperOsc.frequency.setValueAtTime(variation ? randomBetween(120, 200) : 160, t);
    paperOsc.frequency.exponentialRampToValueAtTime(60, t + 0.05);
    const paperFlt = ctx.createBiquadFilter();
    paperFlt.type = 'lowpass';
    paperFlt.frequency.value = 500;
    const paperGain = ctx.createGain();
    paperGain.gain.setValueAtTime(v * 0.35, t);
    paperGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    paperOsc.connect(paperFlt); paperFlt.connect(paperGain); paperGain.connect(dest);
    paperOsc.start(t); paperOsc.stop(t + 0.06);

    // Layer 3: Ink ribbon snap (very brief high-pitched tick at slight delay)
    const snapLen = Math.floor(ctx.sampleRate * 0.0015);
    const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
    const snapD = snapBuf.getChannelData(0);
    for (let i = 0; i < snapLen; i++) snapD[i] = Math.random() * 2 - 1;
    const snapSrc = ctx.createBufferSource();
    snapSrc.buffer = snapBuf;
    const snapFlt = ctx.createBiquadFilter();
    snapFlt.type = 'highpass';
    snapFlt.frequency.value = 5000;
    const snapGain = ctx.createGain();
    snapGain.gain.value = v * 0.3;
    snapSrc.connect(snapFlt); snapFlt.connect(snapGain); snapGain.connect(dest);
    snapSrc.start(t + 0.002);
  },

  // ── COZY CAFÉ ── Muffled ceramic cup with woody resonance ─────────────────
  cafe: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.55, 0.9) : 0.7);

    // Ceramic tap: sine at 350-550 Hz with quick decay
    const cupFreq = variation ? randomBetween(320, 500) : 400;
    const cupOsc = ctx.createOscillator();
    cupOsc.type = 'sine';
    cupOsc.frequency.setValueAtTime(cupFreq, t);
    cupOsc.frequency.exponentialRampToValueAtTime(cupFreq * 0.55, t + 0.12);
    const cupGain = ctx.createGain();
    cupGain.gain.setValueAtTime(v * 0.35, t);
    cupGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    cupOsc.connect(cupGain); cupGain.connect(dest);
    cupOsc.start(t); cupOsc.stop(t + 0.15);

    // Wood/table thud underneath
    const woodFreq = variation ? randomBetween(80, 140) : 110;
    const woodOsc = ctx.createOscillator();
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(woodFreq, t);
    woodOsc.frequency.exponentialRampToValueAtTime(woodFreq * 0.4, t + 0.07);
    const woodGain = ctx.createGain();
    woodGain.gain.setValueAtTime(v * 0.25, t);
    woodGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    woodOsc.connect(woodGain); woodGain.connect(dest);
    woodOsc.start(t); woodOsc.stop(t + 0.09);

    // Noise texture (ceramic roughness)
    const texLen = Math.floor(ctx.sampleRate * 0.018);
    const texBuf = ctx.createBuffer(1, texLen, ctx.sampleRate);
    const td = texBuf.getChannelData(0);
    for (let i = 0; i < texLen; i++) td[i] = (Math.random() * 2 - 1) * (1 - i / texLen);
    const texSrc = ctx.createBufferSource();
    texSrc.buffer = texBuf;
    const texFlt = ctx.createBiquadFilter();
    texFlt.type = 'bandpass';
    texFlt.frequency.value = 2500;
    texFlt.Q.value = 1.5;
    const texGain = ctx.createGain();
    texGain.gain.value = v * 0.12;
    texSrc.connect(texFlt); texFlt.connect(texGain); texGain.connect(dest);
    texSrc.start(t);
  },

  // ── SPACE ── Doppler blip with alien reverb ────────────────────────────────
  space: (ctx, dest, vol, variation) => {
    const t = ctx.currentTime;
    const v = vol * (variation ? randomBetween(0.5, 0.9) : 0.7);

    const reverb = makeReverb(ctx, 0.8, 0.3);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    reverb.connect(wet);
    wet.connect(dest);
    const dry = ctx.createGain();
    dry.gain.value = 0.65;
    dry.connect(dest);

    const baseFreq = variation ? randomBetween(300, 1200) : 700;

    // Primary blip: sawtooth -> lowpass -> sharp attack/decay
    const blipOsc = ctx.createOscillator();
    blipOsc.type = 'sawtooth';
    blipOsc.frequency.setValueAtTime(baseFreq * 1.5, t);
    blipOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, t + 0.12);
    const blipFlt = ctx.createBiquadFilter();
    blipFlt.type = 'bandpass';
    blipFlt.frequency.value = baseFreq;
    blipFlt.Q.value = 4;
    const blipGain = ctx.createGain();
    blipGain.gain.setValueAtTime(0, t);
    blipGain.gain.linearRampToValueAtTime(v * 0.3, t + 0.008);
    blipGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    blipOsc.connect(blipFlt);
    blipFlt.connect(blipGain);
    blipGain.connect(dry);
    blipGain.connect(reverb);
    blipOsc.start(t); blipOsc.stop(t + 0.16);

    // Harmonic overtone
    const harmOsc = ctx.createOscillator();
    harmOsc.type = 'sine';
    harmOsc.frequency.value = baseFreq * 2.5;
    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0, t);
    harmGain.gain.linearRampToValueAtTime(v * 0.07, t + 0.01);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    harmOsc.connect(harmGain);
    harmGain.connect(reverb);
    harmOsc.start(t); harmOsc.stop(t + 0.12);
  },
};

// ─── AMBIENT SYNTHS ───────────────────────────────────────────────────────────

const AMBIENT_SYNTHS: Record<string, AmbientStartFn> = {
  rain: (ctx, dest) => {
    const sr = ctx.sampleRate;
    // Large noise buffer for continuous rain
    const buf = ctx.createBuffer(2, sr * 8, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    // Two bandpass filters in parallel for rain spectrum
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 1400; f1.Q.value = 0.5;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 3500; f2.Q.value = 0.8;
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    src.connect(f1); src.connect(f2);
    f1.connect(mix); f2.connect(mix);
    mix.connect(dest);
    src.start();

    return () => { try { src.stop(); } catch (_) {} };
  },

  ocean: (ctx, dest) => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * 8, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    // LFO-modulated lowpass for wave rhythm
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.18;
    const lfoG = ctx.createGain(); lfoG.gain.value = 400;
    const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 500; flt.Q.value = 1.2;
    lfo.connect(lfoG); lfoG.connect(flt.frequency);
    src.connect(flt); flt.connect(dest);
    src.start(); lfo.start();

    return () => { try { src.stop(); } catch (_) {} try { lfo.stop(); } catch (_) {} };
  },

  forest: (ctx, dest) => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * 6, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    // Wind sound: slow LFO + highpass
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = 800;
    const flt = ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = 2000; flt.Q.value = 0.5;
    lfo.connect(lfoG); lfoG.connect(flt.frequency);
    src.connect(flt); flt.connect(dest);
    src.start(); lfo.start();
    return () => { try { src.stop(); } catch (_) {} try { lfo.stop(); } catch (_) {} };
  },

  cafe: (ctx, dest) => {
    const oscs: OscillatorNode[] = [];
    // Low-frequency murmur tones
    [70, 110, 160, 220, 290].forEach(f => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f + Math.random() * 15;
      const g = ctx.createGain(); g.gain.value = 0.025;
      o.connect(g); g.connect(dest); o.start(); oscs.push(o);
    });
    // Noise layer (very subtle)
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * 5, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const nsrc = ctx.createBufferSource();
    nsrc.buffer = buf; nsrc.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 400;
    const ng = ctx.createGain(); ng.gain.value = 0.06;
    nsrc.connect(nf); nf.connect(ng); ng.connect(dest); nsrc.start();
    return () => {
      oscs.forEach(o => { try { o.stop(); } catch (_) {} });
      try { nsrc.stop(); } catch (_) {}
    };
  },

  space: (ctx, dest) => {
    const oscs: OscillatorNode[] = [];
    // Deep drone layers
    [30, 45, 60, 90].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.02 + i * 0.008;
      const lfoG = ctx.createGain(); lfoG.gain.value = 1.5;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      const g = ctx.createGain(); g.gain.value = 0.04;
      osc.connect(g); g.connect(dest);
      osc.start(); lfo.start();
      oscs.push(osc, lfo);
    });
    return () => oscs.forEach(o => { try { o.stop(); } catch (_) {} });
  },
};

// ─── AudioEngine class ────────────────────────────────────────────────────────

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private typingGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientCleanup: (() => void) | null = null;
  private currentThemeId: string = 'mechanical';
  private currentAmbientThemeId: string | null = null;
  private isMuted: boolean = false;
  private lastKeyTime: number = 0;
  private readonly MIN_KEY_INTERVAL_MS = 16; // 60fps minimum gap

  async initialize(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') return;
    this.ctx = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;
    this.masterGain.connect(this.ctx.destination);

    this.typingGain = this.ctx.createGain();
    this.typingGain.gain.value = 0.8;
    this.typingGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.35;
    this.ambientGain.connect(this.masterGain);
  }

  async ensureResumed(): Promise<void> {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  setMasterVolume(vol: number): void {
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(clamp(vol, 0, 1), this.ctx?.currentTime ?? 0, 0.02);
    }
  }

  setTypingVolume(vol: number): void {
    if (this.typingGain) {
      this.typingGain.gain.setTargetAtTime(clamp(vol, 0, 1), this.ctx?.currentTime ?? 0, 0.02);
    }
  }

  setAmbientVolume(vol: number): void {
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(clamp(vol, 0, 1), this.ctx?.currentTime ?? 0, 0.05);
    }
  }

  setMuted(muted: boolean, masterVol: number): void {
    this.isMuted = muted;
    if (this.masterGain) {
      const target = muted ? 0 : clamp(masterVol, 0, 1);
      this.masterGain.gain.setTargetAtTime(target, this.ctx?.currentTime ?? 0, 0.05);
    }
  }

  setTheme(themeId: string): void {
    this.currentThemeId = themeId;
  }

  playTypingSound(variation: boolean, intensityMode: IntensityMode, vol: number): void {
    if (!this.ctx || !this.typingGain) return;
    const now = performance.now();
    if (now - this.lastKeyTime < this.MIN_KEY_INTERVAL_MS) return;
    this.lastKeyTime = now;

    const synth = SYNTHS[this.currentThemeId];
    if (!synth) return;

    const intensityMult = getIntensityMultiplier(intensityMode);
    try {
      synth(this.ctx, this.typingGain, vol * intensityMult, variation, intensityMult);
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  }

  async previewTheme(themeId: string, vol: number): Promise<void> {
    await this.ensureResumed();
    if (!this.ctx || !this.typingGain) return;
    const synth = SYNTHS[themeId];
    if (!synth) return;
    // Play 3 notes in succession for preview
    synth(this.ctx, this.typingGain, vol, true, 1.0);
    setTimeout(() => { if (this.ctx && this.typingGain) synth(this.ctx!, this.typingGain!, vol, true, 1.0); }, 120);
    setTimeout(() => { if (this.ctx && this.typingGain) synth(this.ctx!, this.typingGain!, vol, true, 1.0); }, 220);
  }

  startAmbient(themeId: string): void {
    if (!this.ctx || !this.ambientGain) return;
    if (this.currentAmbientThemeId === themeId) return;
    this.stopAmbient();
    const ambFn = AMBIENT_SYNTHS[themeId];
    if (!ambFn) return;
    try {
      this.ambientCleanup = ambFn(this.ctx, this.ambientGain);
      this.currentAmbientThemeId = themeId;
    } catch (e) {
      console.warn('Ambient start error:', e);
    }
  }

  stopAmbient(): void {
    if (this.ambientCleanup) { this.ambientCleanup(); this.ambientCleanup = null; }
    this.currentAmbientThemeId = null;
  }

  destroy(): void {
    this.stopAmbient();
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
  }

  get isReady(): boolean { return this.ctx !== null && this.ctx.state !== 'closed'; }
  get contextState(): string { return this.ctx?.state ?? 'none'; }
}

export const audioEngine = new AudioEngine();
