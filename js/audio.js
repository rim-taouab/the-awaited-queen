/* ============================================================================
 *  Audio — procedural ambient score + soundscape (Web Audio API)
 *  No sound files required. Generates a gentle, evolving pad, soft piano
 *  motifs, wind, and interaction chimes. If QUEEN.music is set, it plays that
 *  track layered under the ambience instead of the generated pad.
 * ==========================================================================*/

const Sound = (() => {
  let ctx = null;
  let master = null;
  let reverb = null;
  let started = false;
  let padGain = null;
  let windGain = null;
  let musicEl = null;
  let motifTimer = null;
  let musicGain = null;

  // A soft, warm pentatonic-ish set of frequencies (A minor pentatonic, low)
  const SCALE = [220.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33];
  const PAD_CHORD = [110.0, 164.81, 220.0, 329.63]; // A2 E3 A3 E4

  function makeReverb() {
    const len = ctx.sampleRate * 3.2;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        // exponentially decaying noise -> lush hall
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  function noiseBuffer(seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function start() {
    if (started) return;
    started = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    // fade the whole world in
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 4);

    reverb = makeReverb();
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.5;
    reverb.connect(reverbGain).connect(master);

    // a dedicated music bus so we can duck (soften) or swell the score/song
    musicGain = ctx.createGain();
    musicGain.gain.value = 1.0;
    musicGain.connect(master);

    // --- Wind / air bed -----------------------------------------------------
    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer(8);
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 480;
    windFilter.Q.value = 0.7;
    windGain = ctx.createGain();
    windGain.gain.value = 0.035;
    wind.connect(windFilter).connect(windGain).connect(master);
    // slow breathing of the wind
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(windGain.gain);
    wind.start();
    lfo.start();

    // --- Music: real track (e.g. the sung "Once Upon a Dream") OR the -------
    //     built-in music-box waltz if no file is provided or it fails to load.
    if (window.QUEEN && QUEEN.music) {
      let fellBack = false;
      const fallback = () => { if (!fellBack) { fellBack = true; startScore(); } };
      try {
        musicEl = new Audio(QUEEN.music);
        musicEl.loop = true;
        const src = ctx.createMediaElementSource(musicEl);
        const mg = ctx.createGain();
        const TARGET = 0.85;     // vocal volume (0–1)
        const FADE = 3.0;        // gentle fade-in, seconds
        // start silent, then swell the voice in softly
        mg.gain.setValueAtTime(0.0001, ctx.currentTime);
        mg.gain.linearRampToValueAtTime(TARGET, ctx.currentTime + FADE);
        src.connect(mg).connect(musicGain);
        // if the file is missing / unplayable, gently fall back to the waltz
        musicEl.addEventListener("error", fallback);
        musicEl.play().catch(fallback);
      } catch (e) {
        fallback();
      }
    } else {
      startScore();       // the "Once Upon a Dream" waltz, as a music box
    }
  }

  /* --------------------------------------------------------------------------
   *  "Once Upon a Dream" — Tchaikovsky's Garland Waltz (Sleeping Beauty, 1890,
   *  public domain). Rendered as a gentle music-box waltz in 3/4, with a soft
   *  oom-pah-pah accompaniment and pad. This is the melody Disney set to
   *  "I know you, I walked with you once upon a dream…"
   * ------------------------------------------------------------------------*/
  const NOTE = {
    D4: 293.66, E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.0,
    A4: 440.0, Bb4: 466.16, B4: 493.88, C5: 523.25, D5: 587.33,
  };
  // [note, duration-in-beats]
  const MELODY = [
    ["F4", 1], ["E4", 1], ["F4", 1],                                   // "I know you,"
    ["D4", 1], ["E4", 1], ["F4", 1], ["D4", 1], ["E4", 1], ["G4", 1],  // "I walked with you once up-"
    ["A4", 1], ["F#4", 1], ["G4", 4],                                  // "-on a dream"
    ["C5", 1], ["B4", 1], ["Bb4", 1],                                  // "I know you,"
    ["G4", 1], ["Bb4", 1], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 1], // "the gleam in your eyes is so"
    ["Bb4", 1], ["A4", 1], ["A4", 1], ["G4", 1], ["F#4", 1], ["G4", 4],// "fa-mil-iar a gleam"
  ];
  // One chord per 3-beat bar, in F major
  const CH = {
    F:  { b: 87.31,  n: [174.61, 220.0, 261.63] },
    C:  { b: 130.81, n: [196.0, 261.63, 164.81] },
    C7: { b: 130.81, n: [196.0, 233.08, 164.81] },
    D7: { b: 146.83, n: [185.0, 220.0, 261.63] },
    Gm: { b: 98.0,   n: [196.0, 233.08, 293.66] },
    Bb: { b: 116.54, n: [233.08, 293.66, 349.23] },
  };
  const BARS = ["F", "F", "C", "D7", "C7", "F", "Gm", "C", "Bb", "D7", "C7"];
  const BEAT = 0.58; // seconds per beat — a dreamy, unhurried waltz

  function playBell(freq, t, durBeats) {
    if (!ctx) return;
    const dd = Math.min(durBeats * BEAT + 0.4, 2.6);
    const o1 = ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.17, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dd);
    const g2 = ctx.createGain(); g2.gain.value = 0.28;
    o1.connect(g); o2.connect(g2).connect(g);
    g.connect(musicGain || master); if (reverb) g.connect(reverb);
    o1.start(t); o2.start(t); o1.stop(t + dd + 0.1); o2.stop(t + dd + 0.1);
  }

  function playTone(freq, t, dur, peak, type) {
    const o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(musicGain || master);
    if (reverb) g.connect(reverb);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function playBar(name, t) {
    const c = CH[name] || CH.F;
    playTone(c.b, t, BEAT * 1.4, 0.1, "triangle");                            // beat 1: bass
    c.n.forEach((f) => playTone(f, t + BEAT, BEAT * 0.8, 0.045, "sine"));      // beat 2
    c.n.forEach((f) => playTone(f, t + 2 * BEAT, BEAT * 0.8, 0.04, "sine"));   // beat 3
    c.n.forEach((f) => playTone(f, t, BEAT * 3, 0.028, "sine"));              // soft pad
  }

  function scheduleCycle(startT) {
    let t = startT;
    for (const [name, d] of MELODY) { playBell(NOTE[name], t, d); t += d * BEAT; }
    let bt = startT;
    for (const name of BARS) { playBar(name, bt); bt += 3 * BEAT; }
    return BARS.length * 3 * BEAT;
  }

  function startScore() {
    const len = scheduleCycle(ctx.currentTime + 0.4);
    const loop = () => {
      if (!ctx) return;
      const l = scheduleCycle(ctx.currentTime + 0.2);
      motifTimer = setTimeout(loop, (l - 0.3) * 1000);
    };
    motifTimer = setTimeout(loop, (len - 0.3) * 1000);
  }

  // A slow, evolving chord pad
  function startPad(reverbNode) {
    padGain = ctx.createGain();
    padGain.gain.value = 0.0;
    padGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 6);
    padGain.connect(master);
    const padVerb = ctx.createGain();
    padVerb.gain.value = 0.6;
    padGain.connect(padVerb).connect(reverbNode);

    PAD_CHORD.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      // gentle detune shimmer
      const det = ctx.createOscillator();
      det.frequency.value = 0.08 + i * 0.03;
      const detGain = ctx.createGain();
      detGain.gain.value = 2.2;
      det.connect(detGain).connect(osc.detune);
      const g = ctx.createGain();
      g.gain.value = 0.25 / PAD_CHORD.length;
      osc.connect(g).connect(padGain);
      osc.start();
      det.start();
    });
  }

  // Occasional soft "piano" notes — sparse, unhurried
  function startMotif(reverbNode) {
    const playNote = () => {
      if (!ctx) return;
      const freq = SCALE[Math.floor(Math.random() * SCALE.length)];
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2.0;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
      const g2 = ctx.createGain();
      g2.gain.value = 0.25;
      osc.connect(g);
      osc2.connect(g2).connect(g);
      g.connect(master);
      g.connect(reverbNode);
      osc.start(t); osc2.start(t);
      osc.stop(t + 3.6); osc2.stop(t + 3.6);
      motifTimer = setTimeout(playNote, 2600 + Math.random() * 4200);
    };
    motifTimer = setTimeout(playNote, 3000);
  }

  // Interaction chime — a bright, kind little sparkle
  function chime(baseIndex = null) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const idx = baseIndex == null ? Math.floor(Math.random() * SCALE.length) : baseIndex;
    const freq = SCALE[idx % SCALE.length] * 2;
    [1, 1.5, 2].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      const delay = i * 0.05;
      g.gain.setValueAtTime(0.0001, t + delay);
      g.gain.exponentialRampToValueAtTime(0.08 / (i + 1), t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.8);
      osc.connect(g).connect(master);
      if (reverb) g.connect(reverb);
      osc.start(t + delay);
      osc.stop(t + delay + 2);
    });
  }

  // A swelling shimmer for big moments (scene changes, the coronation)
  function swell(dur = 4) {
    if (!ctx) return;
    const t = ctx.currentTime;
    [261.63, 329.63, 392.0, 523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.8 + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(master);
      if (reverb) g.connect(reverb);
      osc.start(t);
      osc.stop(t + dur + 0.2);
    });
  }

  function setMood(mood) {
    if (!ctx || !windGain) return;
    // subtle tonal shifts per location
    const targets = {
      forest: 0.04, river: 0.055, library: 0.02,
      meadow: 0.03, grove: 0.035, tree: 0.045,
      palace: 0.025, default: 0.035,
    };
    const v = targets[mood] ?? targets.default;
    windGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 3);
  }

  function fadeOut(seconds = 3) {
    if (master && ctx) master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + seconds);
  }
  function fadeIn(seconds = 3) {
    if (master && ctx) master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + seconds);
  }

  // Duck (soften) or swell the music — for reading vs. the climax
  function setMusicLevel(v, seconds = 3) {
    if (musicGain && ctx) musicGain.gain.linearRampToValueAtTime(v, ctx.currentTime + seconds);
  }

  return { start, chime, swell, setMood, fadeOut, fadeIn, setMusicLevel, isStarted: () => started };
})();

window.Sound = Sound;
