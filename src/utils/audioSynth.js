/**
 * ============================================================================
 * UTILITY: 8-Bit Web Audio API Sound Synthesizer
 * ============================================================================
 * Menyediakan modul sintesis suara instan bergaya chimes 8-bit retro tanpa
 * memerlukan aset file audio eksternal (.mp3/.wav), terbebas dari masalah 
 * pemblokiran CORS dan buffering jaringan.
 * 
 * Sesuai dengan prinsip rekayasa audio berbasis browser, AudioContext akan
 * diinisialisasi secara malas (lazy loading) setelah interaksi pertama pengguna.
 * ============================================================================
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 1. Efek Suara Klik Tombol Retro
 * Bunyi 'tick' pendek berfrekuensi tinggi dengan peluruhan cepat.
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    // Pitch bending khas retro
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (err) {
    console.warn('[AudioSynth] Gagal memutar suara klik:', err);
  }
}

/**
 * 2. Efek Suara Pembukaan Jendela Baru (Open Window Sweep)
 * Dua nada cepat berfrekuensi tinggi dengan sapuan dinamis ke atas.
 */
export function playOpenWindowSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Nada pertama (singkat)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Nada kedua (sapuan ke atas)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
    osc2.frequency.exponentialRampToValueAtTime(880.00, now + 0.18); // A5
    gain2.gain.setValueAtTime(0.06, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.18);
  } catch (err) {
    console.warn('[AudioSynth] Gagal memutar suara jendela:', err);
  }
}

/**
 * 3. Efek Suara Peringatan / Error Alert Retro
 * Bunyi beep ganda berturut-turut berfrekuensi rendah bergaya osilator persegi.
 */
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playBeep = (time, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // Bentuk gelombang kotak khas konsol 8-bit
      osc.frequency.setValueAtTime(150, time);
      
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.setValueAtTime(0.05, time + duration - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    };

    // Bunyi beep ganda berturut-turut
    playBeep(now, 0.12);
    playBeep(now + 0.16, 0.15);
  } catch (err) {
    console.warn('[AudioSynth] Gagal memutar suara error:', err);
  }
}

/**
 * 4. Lagu Chimes Windows 95 Startup Retro (Ascending Melody)
 * Arpeggio mayor 8-bit naik yang menenangkan dan nostalgia.
 */
export function playStartupSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Kumpulan nada arpeggio: C4, G4, C5, E5, G5, B5, C6
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 987.77, 1046.50];
    const delays = [0.0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.85];
    const durations = [0.8, 0.8, 0.8, 0.9, 1.0, 1.2, 1.6];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Gunakan gelombang segitiga dan sine agar chimes terdengar lembut
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + delays[index]);

      gain.gain.setValueAtTime(0.04, now + delays[index]);
      gain.gain.setValueAtTime(0.04, now + delays[index] + durations[index] * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delays[index] + durations[index]);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delays[index]);
      osc.stop(now + delays[index] + durations[index]);
    });
  } catch (err) {
    console.warn('[AudioSynth] Gagal memutar suara startup:', err);
  }
}

/**
 * 5. Lagu Chimes Windows 95 Shutdown Retro (Descending Melody)
 * Arpeggio mayor 8-bit menurun yang dramatis dan nostalgia.
 */
export function playShutdownSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Kumpulan nada arpeggio turun: C6, G5, E5, C5, G4, C4
    const notes = [1046.50, 783.99, 659.25, 523.25, 392.00, 261.63];
    const delays = [0.0, 0.12, 0.24, 0.36, 0.48, 0.65];
    const durations = [0.6, 0.6, 0.6, 0.7, 0.8, 1.2];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = index % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + delays[index]);

      gain.gain.setValueAtTime(0.04, now + delays[index]);
      gain.gain.setValueAtTime(0.04, now + delays[index] + durations[index] * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delays[index] + durations[index]);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delays[index]);
      osc.stop(now + delays[index] + durations[index]);
    });
  } catch (err) {
    console.warn('[AudioSynth] Gagal memutar suara shutdown:', err);
  }
}

/**
 * 6. Bunyi Beep BIOS Retro (BIOS Startup Beep)
 * Bunyi 'beep' berfrekuensi sedang bergelombang kotak murni khas PC Speaker jadul.
 */
export function playBiosBeep() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square'; // Speaker internal PC jadul selalu menggunakan gelombang kotak
    osc.frequency.setValueAtTime(800, ctx.currentTime); // Nada Beep BIOS standar

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    console.warn('[AudioSynth] Gagal memutar Beep BIOS:', err);
  }
}
