/* MIKU NOTE · Web Audio 合成音乐引擎
   三首原创小曲全部由振荡器实时合成，无需任何音频文件。
   全局对象：window.MIKU_AUDIO */
(function () {
  "use strict";

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const TRACKS = [
    {
      name: "Teal Pulse",
      sub: "治愈系 · 合成器生成",
      bpm: 84,
      step: 0.5, // 8 分音符
      steps: 32,
      volume: 0.9,
      // 主旋律（钟琴）
      melody: [76, -1, 79, -1, 81, -1, 79, -1, 76, -1, 72, -1, 74, -1, 76, -1,
               79, -1, 81, -1, 84, -1, 81, -1, 79, -1, 76, -1, 74, 72, 71, -1],
      // 贝斯
      bass: [48, -1, -1, -1, 48, -1, 52, -1, 45, -1, -1, -1, 43, -1, 47, -1,
             48, -1, -1, -1, 48, -1, 52, -1, 53, -1, -1, -1, 52, -1, 50, -1],
      // 和弦垫（每 8 步）
      chords: [
        { s: 0, notes: [60, 64, 67, 72] },
        { s: 8, notes: [57, 60, 64, 69] },
        { s: 16, notes: [53, 57, 60, 65] },
        { s: 24, notes: [55, 59, 62, 67] }
      ]
    },
    {
      name: "Twin-Tail Dash",
      sub: "电子舞曲 · 双马尾冲刺",
      bpm: 128,
      step: 0.25, // 16 分音符
      steps: 32,
      volume: 0.85,
      melody: [-1, -1, -1, 69, -1, 72, -1, 69, -1, -1, -1, 71, -1, 74, -1, 71,
               -1, -1, -1, 69, -1, 72, -1, 76, -1, -1, -1, 74, -1, 71, -1, 69],
      bass: [33, -1, 33, 40, 33, -1, 33, 45, 33, -1, 33, 40, 33, -1, 36, 43,
             33, -1, 33, 40, 33, -1, 33, 45, 31, -1, 31, 38, 31, -1, 31, 43],
      kickEvery: 4,
      hatEvery: 2,
      clapAt: [8, 24]
    },
    {
      name: "Hachi-Bit Star",
      sub: "八位机 · 星星机关枪",
      bpm: 150,
      step: 0.25,
      steps: 64,
      volume: 0.8,
      melody: [81, 79, 81, 84, 79, -1, 76, -1, 77, 79, 81, 84, 86, 84, 81, 79,
               81, 84, 88, -1, 86, -1, 84, -1, 81, 79, 77, 79, 76, -1, 74, -1,
               76, 77, 79, 81, 84, 81, 79, 77, 76, -1, 72, -1, 74, 76, 77, -1,
               76, 74, 72, 71, 72, 74, 76, 79, 74, -1, 72, -1, 71, -1, 69, -1],
      bass: [45, -1, 45, -1, 45, -1, 48, -1, 41, -1, 41, -1, 43, -1, 45, -1,
             45, -1, 45, -1, 45, -1, 48, -1, 41, -1, 41, -1, 43, -1, 43, -1,
             45, -1, 45, -1, 45, -1, 48, -1, 41, -1, 41, -1, 43, -1, 45, -1,
             40, -1, 40, -1, 43, -1, 45, -1, 47, -1, 45, -1, 43, -1, 41, -1],
      kickEvery: 4,
      hatEvery: 2,
      clapAt: [16, 48]
    }
  ];

  let ctx = null;
  let master = null;
  let analyser = null;
  let comp = null;
  let noiseBuf = null;
  let playing = false;
  let trackIdx = 0;
  let volume = 0.7;
  let currentStep = 0;
  let nextNoteTime = 0;
  let timer = null;
  let freqData = null;
  let visCanvas = null;

  function ensureCtx() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    master = ctx.createGain();
    master.gain.value = volume;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    comp.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
    // 共享噪声缓冲
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function env(dest, t0, peak, a, r, dur) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.setValueAtTime(peak, t0 + Math.max(a, dur - r));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    g.connect(dest);
    return g;
  }

  function tone(freq, t0, dur, type, peak, dest, detune) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    const g = env(dest, t0, peak, Math.min(0.02, dur * 0.3), Math.min(0.12, dur * 0.6), dur);
    o.connect(g);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function kick(t0) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t0);
    o.frequency.exponentialRampToValueAtTime(42, t0 + 0.1);
    const g = env(comp, t0, 0.9, 0.004, 0.14, 0.22);
    o.connect(g);
    o.start(t0);
    o.stop(t0 + 0.3);
  }

  function hat(t0, open) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7000;
    const g = env(comp, t0, open ? 0.22 : 0.16, 0.002, open ? 0.1 : 0.04, open ? 0.12 : 0.05);
    src.connect(f); f.connect(g);
    src.start(t0);
    src.stop(t0 + 0.2);
  }

  function clap(t0) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1800;
    f.Q.value = 1.2;
    const g = env(comp, t0, 0.4, 0.003, 0.12, 0.14);
    src.connect(f); f.connect(g);
    src.start(t0);
    src.stop(t0 + 0.2);
  }

  function bell(freq, t0) {
    tone(freq, t0, 0.5, "sine", 0.32, comp);
    tone(freq * 2, t0, 0.3, "sine", 0.1, comp);
  }

  function pad(notes, t0, dur) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 900;
    f.Q.value = 0.6;
    const g = env(comp, t0, 0.14, dur * 0.3, dur * 0.5, dur);
    f.connect(g);
    notes.forEach((n) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midi(n);
      o.detune.value = (Math.random() - 0.5) * 8;
      o.connect(f);
      o.start(t0);
      o.stop(t0 + dur + 0.1);
    });
  }

  function leadSaw(freq, t0) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2600;
    const g = env(comp, t0, 0.2, 0.01, 0.1, 0.22);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.connect(f); f.connect(g);
    o.start(t0);
    o.stop(t0 + 0.3);
  }

  function chiptune(freq, t0) {
    tone(freq, t0, 0.18, "square", 0.16, comp);
    tone(freq * 1.005, t0, 0.18, "square", 0.08, comp);
  }

  function bassTri(freq, t0) {
    tone(freq, t0, 0.2, "triangle", 0.34, comp);
  }

  function scheduleStep(track, step, t0, spb) {
    const m = track.melody[step % track.steps];
    if (m > 0) {
      const f = midi(m);
      if (trackIdx === 0) bell(f, t0);
      else if (trackIdx === 1) leadSaw(f, t0);
      else chiptune(f, t0);
    }
    const b = track.bass[step % track.steps];
    if (b > 0) bassTri(midi(b), t0);
    if (track.chords) {
      track.chords.forEach((c) => {
        if (step % track.steps === c.s) pad(c.notes, t0, spb * 7.2);
      });
    }
    if (track.kickEvery && step % track.kickEvery === 0) kick(t0);
    if (track.hatEvery && step % track.hatEvery === (track.hatEvery / 2 | 0)) hat(t0, false);
    if (track.clapAt && track.clapAt.includes(step % track.steps)) clap(t0);
  }

  function scheduler() {
    if (!playing) return;
    const track = TRACKS[trackIdx];
    const spb = 60 / track.bpm * track.step;
    while (nextNoteTime < ctx.currentTime + 0.14) {
      scheduleStep(track, currentStep, nextNoteTime, spb);
      nextNoteTime += spb;
      currentStep++;
    }
  }

  function startScheduler() {
    if (timer) clearInterval(timer);
    timer = setInterval(scheduler, 25);
  }

  function play() {
    ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    if (playing) return;
    playing = true;
    currentStep = 0;
    nextNoteTime = ctx.currentTime + 0.08;
    startScheduler();
  }

  function pause() {
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
  }

  function toggle() {
    if (playing) { pause(); return false; }
    play(); return true;
  }

  function loadTrack(i, autoplay) {
    trackIdx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    currentStep = 0;
    nextNoteTime = ctx ? ctx.currentTime + 0.08 : 0;
    if (autoplay && !playing) play();
    if (typeof window.MIKU_AUDIO !== "undefined" && window.MIKU_AUDIO._onTrackChange) {
      window.MIKU_AUDIO._onTrackChange(TRACKS[trackIdx]);
    }
  }

  function setVolume(v) {
    volume = v;
    if (master) master.gain.value = v;
  }

  // UI 音效：短促的电子 blip
  function blip(freq, type) {
    if (!ctx || !playing) return;
    tone(freq || 880, ctx.currentTime, 0.09, type || "triangle", 0.08, master);
  }

  // 可视化
  function attachVisualizer(canvas) {
    visCanvas = canvas;
    if (!visCanvas) return;
    const vctx = visCanvas.getContext("2d");
    const draw = () => {
      requestAnimationFrame(draw);
      if (!vctx) return;
      const w = visCanvas.width, h = visCanvas.height;
      vctx.clearRect(0, 0, w, h);
      const bars = 34;
      const gap = 2;
      const bw = (w - gap * (bars - 1)) / bars;
      if (!analyser) return;
      analyser.getByteFrequencyData(freqData);
      const step = Math.floor(freqData.length / bars);
      for (let i = 0; i < bars; i++) {
        let v = 0;
        for (let j = 0; j < step; j++) v = Math.max(v, freqData[i * step + j]);
        const bh = Math.max(2, (v / 255) * h);
        const grad = vctx.createLinearGradient(0, h, 0, h - bh);
        grad.addColorStop(0, "#1d8f9b");
        grad.addColorStop(1, "#7dfcf2");
        vctx.fillStyle = grad;
        if (vctx.roundRect) {
          vctx.beginPath();
          vctx.roundRect(i * (bw + gap), h - bh, bw, bh, 2);
          vctx.fill();
        } else {
          vctx.fillRect(i * (bw + gap), h - bh, bw, bh);
        }
      }
    };
    draw();
  }

  window.MIKU_AUDIO = {
    tracks: TRACKS,
    init: ensureCtx,
    toggle, play, pause,
    next: () => loadTrack(trackIdx + 1, true),
    prev: () => loadTrack(trackIdx - 1, true),
    select: (i) => loadTrack(i, true),
    current: () => trackIdx,
    trackInfo: () => TRACKS[trackIdx],
    isPlaying: () => playing,
    setVolume,
    blip,
    attachVisualizer,
    _onTrackChange: null
  };
})();
