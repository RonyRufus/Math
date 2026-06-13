let audioCtx: AudioContext | null = null;
let soundVolume = 0.4; // 40% volume default

/**
 * Initializes the AudioContext lazily on user interaction
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume context if suspended (browser auto-play policies)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setVolume(volume: number) {
  soundVolume = Math.max(0, Math.min(1, volume));
}

export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx || soundVolume === 0) return;

  try {
    const now = ctx.currentTime;
    
    // Create master gain
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(soundVolume * 0.35, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    gainNode.connect(ctx.destination);

    // Osc 1 (Main note)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
    osc1.connect(gainNode);

    // Osc 2 (Harmony note started slightly later)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6
    
    const gainNode2 = ctx.createGain();
    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.setValueAtTime(soundVolume * 0.25, now + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    gainNode2.connect(ctx.destination);
    osc2.connect(gainNode2);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.warn('Success chime failed to play', e);
  }
}

export function playErrorBuzz() {
  const ctx = getAudioContext();
  if (!ctx || soundVolume === 0) return;

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(soundVolume * 0.4, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now); // Low G
    osc.frequency.linearRampToValueAtTime(100, now + 0.2); // Slide down
    osc.connect(gainNode);

    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = 'sawtooth';
    oscHarmonic.frequency.setValueAtTime(210, now); // Harmonic fifth
    
    const hGain = ctx.createGain();
    hGain.gain.setValueAtTime(0, now);
    hGain.gain.linearRampToValueAtTime(soundVolume * 0.1, now + 0.02);
    hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    hGain.connect(ctx.destination);
    oscHarmonic.connect(hGain);

    osc.start(now);
    oscHarmonic.start(now);

    osc.stop(now + 0.3);
    oscHarmonic.stop(now + 0.3);
  } catch (e) {
    console.warn('Error buzz failed to play', e);
  }
}

export function playTick() {
  const ctx = getAudioContext();
  if (!ctx || soundVolume === 0) return;

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(soundVolume * 0.15, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.connect(gainNode);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    // Fail silently since ticks are rapid
  }
}

export function playWarningBeep() {
  const ctx = getAudioContext();
  if (!ctx || soundVolume === 0) return;

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(soundVolume * 0.25, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4 warning beep
    osc.connect(gainNode);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Fail silently
  }
}

export function playLevelUpTrumpet() {
  const ctx = getAudioContext();
  if (!ctx || soundVolume === 0) return;

  try {
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50]; // C4, E4, G4, C5, E5, C6
    
    notes.forEach((freq, idx) => {
      const noteDelay = idx * 0.07;
      const osc = ctx.createOscillator();
      // alternating waveforms for an engaging synth feel
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + noteDelay);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now + noteDelay);
      gainNode.gain.linearRampToValueAtTime(soundVolume * 0.18, now + noteDelay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 0.3);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + noteDelay);
      osc.stop(now + noteDelay + 0.35);
    });
  } catch (e) {
    console.warn('Level up sound failed to play', e);
  }
}
