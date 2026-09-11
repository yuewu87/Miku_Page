/* MIKU NOTE · 视觉效果：粒子星空 / 雪花 / 光标 / 进度条
   全局对象：window.MIKU_FX */
(function () {
  "use strict";

  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0;
  let particles = [];
  let mode = document.documentElement.getAttribute("data-theme") || "miku";
  let burstPool = [];
  const mouse = { x: -9999, y: -9999 };

  const COLORS_MIKU = ["#39c5bb", "#7dfcf2", "#2eb8ae", "#ff5f7a", "#ff7ae0"];
  const COLORS_SNOW = ["#cfefff", "#a8ddff", "#ffffff", "#8fd0ff", "#e6f7ff"];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const target = mode === "leek" ? 46 : Math.min(130, Math.floor((W * H) / 14000));
    while (particles.length < target) particles.push(spawn());
    if (particles.length > target) particles.length = target;
  }

  function spawn(init) {
    if (mode === "snow") {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: 1.5 + Math.random() * 3.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.5 + Math.random() * 1.2,
        sway: Math.random() * Math.PI * 2,
        sws: 0.008 + Math.random() * 0.02,
        c: COLORS_SNOW[(Math.random() * COLORS_SNOW.length) | 0],
        kind: "snow"
      };
    }
    if (mode === "leek") {
      const a = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: 12 + Math.random() * 10,
        vx: Math.cos(a) * (0.6 + Math.random() * 1.4),
        vy: Math.sin(a) * (0.6 + Math.random() * 1.4),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.06,
        c: null, kind: "leek"
      };
    }
    const a = Math.random() * Math.PI * 2;
    const sp = 0.08 + Math.random() * 0.32;
    return {
      x: init ? init.x : Math.random() * W,
      y: init ? init.y : Math.random() * H,
      r: 0.8 + Math.random() * 2.2,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      c: COLORS_MIKU[(Math.random() * COLORS_MIKU.length) | 0],
      tw: Math.random() * Math.PI * 2,
      kind: "star"
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const conn = mode === "miku";

    // 连线（星座效果）
    if (conn) {
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            ctx.strokeStyle = "rgba(57,197,187," + (0.14 * (1 - d2 / 12100)) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    for (const p of particles) {
      if (p.kind === "leek") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = p.r * 1.4 + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🥬", 0, 0);
        ctx.restore();
      } else {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(p.tw + performance.now() * 0.002);
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    for (let i = burstPool.length - 1; i >= 0; i--) {
      const b = burstPool[i];
      b.x += b.vx; b.y += b.vy;
      b.vy += 0.02;
      b.life -= 0.016;
      if (b.life <= 0) { burstPool.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.fillStyle = b.c;
      ctx.shadowColor = b.c;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function update() {
    const M = 130; // 鼠标影响半径
    for (const p of particles) {
      if (p.kind === "snow") {
        p.sway += p.sws;
        p.x += p.vx + Math.sin(p.sway) * 0.5;
        p.y += p.vy;
        if (p.y > H + 8) { p.y = -8; p.x = Math.random() * W; }
        if (p.x > W + 8) p.x = -8;
        if (p.x < -8) p.x = W + 8;
        continue;
      }
      if (p.kind === "leek") {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;
        if (p.y < -30) p.y = H + 30;
        if (p.y > H + 30) p.y = -30;
        continue;
      }
      // 星星：漂移 + 鼠标斥力
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < M * M && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = (M - d) / M * 0.9;
        p.x += (dx / d) * f;
        p.y += (dy / d) * f;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.tw += 0.02;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function setMode(m) {
    if (mode === m) return;
    mode = m;
    particles = [];
    resize();
  }

  function blast(x, y) {
    const colors = mode === "snow" ? COLORS_SNOW : COLORS_MIKU;
    for (let i = 0; i < 26; i++) {
      const a = (Math.PI * 2 * i) / 26 + Math.random() * 0.3;
      const sp = 1.2 + Math.random() * 3.4;
      burstPool.push({
        x, y, r: 1.2 + Math.random() * 2.4,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        c: colors[(Math.random() * colors.length) | 0],
        life: 0.5 + Math.random() * 0.4
      });
    }
  }

  /* ---------- 自定义光标 ---------- */
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  const emoji = document.getElementById("cursor-emoji");
  let dx = -100, dy = -100, rx = -100, ry = -100;

  function cursorLoop() {
    dx += (mouse.x - dx) * 0.35;
    dy += (mouse.y - dy) * 0.35;
    rx += (mouse.x - rx) * 0.14;
    ry += (mouse.y - ry) * 0.14;
    dot.style.transform = "translate(" + dx + "px," + dy + "px)";
    ring.style.transform = "translate(" + rx + "px," + ry + "px)";
    emoji.style.left = mouse.x + "px";
    emoji.style.top = mouse.y + "px";
    requestAnimationFrame(cursorLoop);
  }

  const HOT = "a, button, input, textarea, .post-card, .g-item, .chip, .gb-color .dot, .p-btn, select, label";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest && e.target.closest(HOT)) {
      ring.classList.add("cursor-hot");
      emoji.classList.add("show");
      emoji.textContent = (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") ? "🎤" : "🥬";
    } else {
      ring.classList.remove("cursor-hot");
      emoji.classList.remove("show");
    }
  });

  /* ---------- 滚动进度 ---------- */
  const prog = document.getElementById("scroll-progress-fill");
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    prog.style.width = p + "%";
  }

  /* ---------- 事件绑定 ---------- */
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerdown", (e) => blast(e.clientX, e.clientY), { passive: true });

  resize();
  loop();
  cursorLoop();
  onScroll();

  window.MIKU_FX = {
    setMode,
    blast,
    snowMode: () => setMode("snow"),
    mikuMode: () => setMode("miku"),
    leekMode: () => setMode("leek")
  };
})();
