/* MIKU NOTE · 弹幕引擎
   覆盖在 hero 区域，自动飘过 + 用户发送，localStorage 持久化。
   全局对象：window.MIKU_DANMAKU */
(function () {
  "use strict";

  const canvas = document.getElementById("danmaku-canvas");
  const ctx = canvas.getContext("2d");
  const hero = document.getElementById("hero");
  const SEEDS = window.MIKU_DATA.DANMAKU_SEEDS;
  const LS_KEY = "miku_danmaku_sent";
  const COLORS = ["#7dfcf2", "#ffffff", "#ffd76e", "#ff7ae0", "#8fd0ff", "#39c5bb"];
  let W = 0, H = 0, DPR = 1;
  let items = [];
  let lanes = [];
  let lastSpawn = 0;
  let interval = 3200;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const laneH = 34;
    lanes = [];
    for (let y = 60; y < H - 90; y += laneH) lanes.push({ y, busy: 0 });
    if (lanes.length === 0) lanes.push({ y: H / 2, busy: 0 });
  }

  function pickLane() {
    lanes.sort((a, b) => a.busy - b.busy);
    const top = lanes.slice(0, Math.max(2, lanes.length >> 2));
    const lane = top[(Math.random() * top.length) | 0];
    lane.busy = performance.now() + 3200;
    return lane.y + (Math.random() * 8 - 4);
  }

  function spawn(text, opts) {
    const o = opts || {};
    const speed = o.speed || (2.2 + Math.random() * 2.4);
    const size = o.size || (15 + Math.random() * 8);
    ctx.font = "bold " + size + "px 'Noto Sans SC', sans-serif";
    const w = ctx.measureText(text).width;
    items.push({
      text,
      x: W + w + 10,
      y: o.y || pickLane(),
      speed,
      size,
      w,
      color: o.color || COLORS[(Math.random() * COLORS.length) | 0],
      bold: Math.random() < 0.22,
      user: !!o.user
    });
  }

  function storm() {
    const n = Math.min(SEEDS.length, 14);
    for (let i = 0; i < n; i++) {
      const delay = i * 260 + Math.random() * 200;
      setTimeout(() => {
        spawn(SEEDS[(Math.random() * SEEDS.length) | 0]);
      }, delay);
    }
  }

  function loop(t) {
    if (t - lastSpawn > interval) {
      lastSpawn = t;
      if (items.length < 14) spawn(SEEDS[(Math.random() * SEEDS.length) | 0]);
    }
    ctx.clearRect(0, 0, W, H);
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.x -= it.speed;
      if (it.x + it.w < -20) { items.splice(i, 1); continue; }
      ctx.font = (it.bold ? "bold " : "") + it.size + "px 'Noto Sans SC', sans-serif";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 5;
      ctx.fillStyle = it.color;
      ctx.fillText(it.text, it.x, it.y);
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(loop);
  }

  function send(text) {
    const clean = text.trim().slice(0, 30);
    if (!clean) return false;
    spawn(clean, { user: true, color: "#ffd76e", size: 19 });
    try {
      const list = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      list.push(clean);
      localStorage.setItem(LS_KEY, JSON.stringify(list.slice(-20)));
    } catch (e) { /* 隐私模式下忽略 */ }
    return true;
  }

  function loadSaved() {
    try {
      const list = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      list.forEach((t, i) => {
        setTimeout(() => spawn(t, { user: true, color: "#ffd76e" }), 600 + i * 500);
      });
    } catch (e) { /* 忽略 */ }
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
  setTimeout(storm, 1200);
  loadSaved();

  window.MIKU_DANMAKU = { send, storm };
})();
