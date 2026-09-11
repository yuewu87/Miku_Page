/* MIKU NOTE · 主逻辑：渲染 + 交互 + 彩蛋
   依赖：data.js / audio-engine.js / effects.js / danmaku.js */
(function () {
  "use strict";

  const D = window.MIKU_DATA;
  const AU = window.MIKU_AUDIO;
  const FX = window.MIKU_FX;
  const DM = window.MIKU_DANMAKU;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- 预加载 ---------- */
  (function preloader() {
    const bar = $("#pre-bar-fill");
    const tips = ["正在调音…", "整理弹幕…", "给葱浇水…", "梳双马尾…", "准备全息舞台…"];
    const tipEl = $("#pre-tip");
    let p = 0, ti = 0;
    const tipTimer = setInterval(() => { ti++; tipEl.textContent = tips[ti % tips.length]; }, 520);
    const iv = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        clearInterval(tipTimer);
        setTimeout(() => {
          $("#preloader").classList.add("done");
          setTimeout(() => { const el = $("#preloader"); if (el) el.remove(); }, 800);
          DM.storm();
        }, 350);
      }
      bar.style.width = p + "%";
    }, 130);
  })();

  /* ---------- 打字机 ---------- */
  (function typing() {
    const el = $("#typing");
    let li = 0, ci = 0, del = false;
    (function tick() {
      const line = D.TYPING_LINES[li];
      if (!del) {
        ci++;
        el.textContent = line.slice(0, ci);
        if (ci === line.length) { del = true; setTimeout(tick, 2100); return; }
        setTimeout(tick, 90 + Math.random() * 90);
      } else {
        ci--;
        el.textContent = line.slice(0, ci);
        if (ci === 0) { del = false; li = (li + 1) % D.TYPING_LINES.length; setTimeout(tick, 400); return; }
        setTimeout(tick, 34);
      }
    })();
  })();

  /* ---------- 数字滚动 ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1400, t0 = performance.now();
    function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.floor(target * eased).toLocaleString("en-US");
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 滚动显现 + 导航状态 ---------- */
  const nav = $("#navbar");
  const navLinks = $$(".nav-links a");
  const sectionIds = ["hero", "blog", "timeline", "gallery", "guestbook", "about"];

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.16 });

  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { animateCount(en.target); countObs.unobserve(en.target); }
    });
  }, { threshold: 0.6 });

  $$(".reveal").forEach((el) => revealObs.observe(el));
  sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) secObs.observe(el); });
  $$(".stat-num").forEach((el) => countObs.observe(el));

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });

  /* ---------- 博客卡片 ---------- */
  const grid = $("#posts-grid");
  function renderPosts(filter) {
    grid.innerHTML = "";
    D.POSTS.filter((p) => filter === "all" || p.cat === filter).forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "post-card reveal visible";
      card.style.animationDelay = (i * 0.07) + "s";
      card.innerHTML =
        '<div class="glare"></div>' +
        '<div class="post-thumb"><img src="' + p.img + '" alt="' + esc(p.title) + '" loading="lazy">' +
        '<span class="post-cat">' + esc(p.cat) + '</span><span class="post-date">' + esc(p.date) + '</span></div>' +
        '<div class="post-body"><h3 class="post-title">' + esc(p.title) + '</h3>' +
        '<p class="post-excerpt">' + esc(p.excerpt) + '</p>' +
        '<div class="post-tags">' + p.tags.map((t) => "<span>#" + esc(t) + "</span>").join("") + "</div></div>";
      card.addEventListener("click", () => openPost(p));
      card.addEventListener("mousemove", tiltMove);
      card.addEventListener("mouseleave", tiltLeave);
      grid.appendChild(card);
    });
  }

  function tiltMove(e) {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transform = "perspective(900px) rotateY(" + ((px - 0.5) * 12) + "deg) rotateX(" + ((0.5 - py) * 10) + "deg) translateY(-4px)";
    card.style.setProperty("--gx", px * 100 + "%");
    card.style.setProperty("--gy", py * 100 + "%");
  }
  function tiltLeave(e) {
    e.currentTarget.style.transform = "";
  }

  /* ---------- 筛选 ---------- */
  $("#filter-bar").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderPosts(chip.dataset.filter);
  });

  /* ---------- 文章弹窗 ---------- */
  const modal = $("#post-modal");
  function openPost(p) {
    $("#modal-img").src = p.img;
    $("#modal-img").alt = p.title;
    $("#modal-cat").textContent = p.cat;
    $("#modal-title").textContent = p.title;
    $("#modal-meta").textContent = p.date + " · MIKU NOTE · " + p.tags.map((t) => "#" + t).join(" ");
    $("#modal-content").innerHTML = p.body.join("");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closePost() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $(".modal-close").addEventListener("click", closePost);
  $("#modal-ok").addEventListener("click", closePost);
  modal.addEventListener("click", (e) => { if (e.target === modal) closePost(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closePost(); closeLightbox(); } });

  /* ---------- 时间线 ---------- */
  const tlWrap = $("#timeline-wrap");
  D.TIMELINE.forEach((t) => {
    const item = document.createElement("div");
    item.className = "tl-item reveal";
    item.innerHTML =
      '<div class="tl-year">' + esc(t.year) + '</div>' +
      '<div class="tl-title">' + esc(t.title) + '</div>' +
      '<div class="tl-text">' + esc(t.text) + '</div>' +
      '<span class="tl-tag">' + esc(t.tag) + "</span>";
    tlWrap.appendChild(item);
  });
  const tlObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); tlObs.unobserve(en.target); } });
  }, { threshold: 0.3 });
  $$(".tl-item").forEach((el) => tlObs.observe(el));

  /* ---------- 图库 + 灯箱 ---------- */
  const galGrid = $("#gallery-grid");
  D.GALLERY.forEach((g, i) => {
    const item = document.createElement("figure");
    item.className = "g-item reveal";
    item.style.animationDelay = (i * 0.05) + "s";
    item.innerHTML =
      '<img src="' + g.src + '" alt="' + esc(g.cap) + '" loading="lazy">' +
      '<figcaption class="g-cap">' + esc(g.cap) + " · " + esc(g.author) + '</figcaption>';
    item.addEventListener("click", () => openLightbox(g));
    galGrid.appendChild(item);
  });
  const lightbox = $("#lightbox");
  function openLightbox(g) {
    $("#lb-img").src = g.src;
    $("#lb-img").alt = g.cap;
    $("#lb-cap").innerHTML = "<b>" + esc(g.cap) + '</b> · 摄影：' + esc(g.author) +
      ' · <a href="' + esc(g.url) + '" target="_blank" rel="noopener">Flickr 原图</a> · ' + esc(g.lic);
    lightbox.classList.add("open");
  }
  function closeLightbox() { lightbox.classList.remove("open"); }
  $(".lb-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  /* ---------- 留言板 ---------- */
  const GB_KEY = "miku_guestbook";
  let gbColor = "#39c5bb";
  const gbForm = $("#guest-form");
  const gbList = $("#gb-list");
  const gbMsg = $("#gb-msg");
  const gbCount = $("#gb-count");

  function loadGB() {
    try { return JSON.parse(localStorage.getItem(GB_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveGB(list) {
    try { localStorage.setItem(GB_KEY, JSON.stringify(list)); } catch (e) { /* 忽略 */ }
  }

  function makeAvatar(name, color) {
    const c = document.createElement("canvas");
    c.width = c.height = 92;
    const x = c.getContext("2d");
    x.fillStyle = color;
    x.beginPath(); x.arc(46, 46, 44, 0, Math.PI * 2); x.fill();
    // 皮肤
    x.fillStyle = "#ffe9db";
    x.beginPath(); x.arc(46, 40, 24, 0, Math.PI * 2); x.fill();
    // 双马尾
    x.fillStyle = color;
    x.beginPath(); x.ellipse(16, 22, 11, 20, -0.5, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(76, 22, 11, 20, 0.5, 0, Math.PI * 2); x.fill();
    // 刘海
    x.beginPath(); x.arc(46, 30, 24, Math.PI * 0.95, Math.PI * 2.05); x.fill();
    x.fillRect(22, 26, 48, 8);
    // 眼睛
    x.fillStyle = "#12364a";
    x.beginPath(); x.ellipse(38, 44, 4.5, 6, 0, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(54, 44, 4.5, 6, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#fff";
    x.beginPath(); x.arc(40, 41, 1.8, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(56, 41, 1.8, 0, Math.PI * 2); x.fill();
    // 嘴
    x.strokeStyle = "#e8a3a3";
    x.lineWidth = 2.4;
    x.beginPath(); x.arc(46, 54, 6, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
    // 姓名首字
    if (name) {
      x.fillStyle = "#fff";
      x.font = "bold 20px 'Noto Sans SC', sans-serif";
      x.textAlign = "center";
      x.fillText(name[0], 46, 92 - 12);
    }
    return c.toDataURL();
  }

  function renderGB() {
    const list = loadGB();
    if (list.length === 0) {
      gbList.innerHTML = '<div class="gb-empty">还没有留言，来抢沙发吧！(๑•̀ㅂ•́)و✧</div>';
      return;
    }
    gbList.innerHTML = "";
    list.forEach((m, i) => {
      const item = document.createElement("div");
      item.className = "gb-item";
      item.innerHTML =
        '<img class="gb-avatar" src="' + makeAvatar(m.name || "ミク", m.color) + '" alt="头像">' +
        '<div><div class="gb-name">' + esc(m.name || "匿名葱粉") +
        '<span class="gb-time">' + esc(m.time) + '</span></div>' +
        '<div class="gb-text">' + esc(m.msg) + '</div></div>' +
        '<button class="gb-del" title="删除" data-i="' + i + '">✕</button>';
      gbList.appendChild(item);
    });
    $$(".gb-del", gbList).forEach((b) => {
      b.addEventListener("click", () => {
        const list2 = loadGB();
        list2.splice(parseInt(b.dataset.i, 10), 1);
        saveGB(list2);
        renderGB();
        toast("留言已删除");
      });
    });
  }

  gbForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = gbMsg.value.trim();
    if (!msg) { toast("先写点什么再发哦～"); return; }
    const list = loadGB();
    list.unshift({
      name: $("#gb-name").value.trim().slice(0, 12),
      msg: msg.slice(0, 140),
      color: gbColor,
      time: new Date().toLocaleString("zh-CN", { hour12: false })
    });
    saveGB(list.slice(0, 60));
    gbForm.reset();
    gbCount.textContent = "0 / 140";
    renderGB();
    AU.blip(1046);
    toast("留言成功！Miku 收到啦 ♪");
  });

  gbMsg.addEventListener("input", () => {
    gbCount.textContent = gbMsg.value.length + " / 140";
    gbCount.style.color = gbMsg.value.length > 130 ? "var(--accent)" : "";
  });
  $("#gb-color-picker").addEventListener("click", (e) => {
    const dot = e.target.closest(".dot");
    if (!dot) return;
    $$(".dot", $("#gb-color-picker")).forEach((d) => d.classList.remove("active"));
    dot.classList.add("active");
    gbColor = dot.dataset.c;
  });
  $$(".dot", $("#gb-color-picker"))[0].classList.add("active");

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = "miku_theme";
  const themeBtn = $("#btn-theme");
  const themeIcon = $("#theme-icon");
  function applyTheme(theme, silent) {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "snow") { FX.snowMode(); themeIcon.textContent = "☀"; }
    else { FX.mikuMode(); themeIcon.textContent = "❄"; }
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 忽略 */ }
    if (!silent) toast(theme === "snow" ? "❄ 切换到 Snow Miku 冰雪主题" : "♪ 切换回 Miku 经典主题");
  }
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "snow" ? "miku" : "snow");
  });

  /* ---------- 音乐控制 ---------- */
  const btnPlay = $("#btn-play");
  const btnMusicNav = $("#btn-music");
  const btnPrev = $("#btn-prev");
  const btnNext = $("#btn-next");
  const volSlider = $("#vol-slider");

  function updatePlayerUI() {
    const info = AU.trackInfo();
    $("#player-track").textContent = info.name;
    $("#player-sub").textContent = info.sub + " · " + info.bpm + " BPM";
    btnPlay.textContent = AU.isPlaying() ? "⏸" : "▶";
    btnMusicNav.classList.toggle("paused", !AU.isPlaying());
    nav.classList.toggle("paused", !AU.isPlaying());
  }
  AU._onTrackChange = updatePlayerUI;

  function startMusic() {
    AU.init();
    if (AU.isPlaying()) { AU.pause(); }
    else {
      AU.play();
      toast("♪ 正在播放：" + AU.trackInfo().name);
    }
    updatePlayerUI();
  }
  btnPlay.addEventListener("click", startMusic);
  btnMusicNav.addEventListener("click", startMusic);
  $("#btn-play-hero").addEventListener("click", startMusic);
  btnNext.addEventListener("click", () => { AU.init(); AU.next(); toast("♪ " + AU.trackInfo().name); updatePlayerUI(); });
  btnPrev.addEventListener("click", () => { AU.init(); AU.prev(); toast("♪ " + AU.trackInfo().name); updatePlayerUI(); });
  volSlider.addEventListener("input", () => AU.setVolume(volSlider.value / 100));
  AU.attachVisualizer($("#visualizer"));
  updatePlayerUI();

  /* ---------- 弹幕输入 ---------- */
  const dmInput = $("#danmaku-input");
  function sendDanmaku() {
    if (DM.send(dmInput.value)) {
      toast("弹幕发射！");
      dmInput.value = "";
    }
  }
  $("#danmaku-send").addEventListener("click", sendDanmaku);
  dmInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendDanmaku(); });
  $("#btn-danmaku").addEventListener("click", () => { DM.storm(); toast("弹幕护体！"); });

  /* ---------- 按钮音效 ---------- */
  document.addEventListener("click", (e) => {
    if (e.target.closest("button, .chip, .g-item, .post-card")) AU.blip(660 + Math.random() * 400);
  }, { capture: true });

  /* ---------- Konami 彩蛋 ---------- */
  const konamiSeq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiPos = 0;
  let leekTimer = null;
  document.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === konamiSeq[konamiPos]) {
      konamiPos++;
      if (konamiPos === konamiSeq.length) {
        konamiPos = 0;
        triggerKonami();
      }
    } else if (k === konamiSeq[0]) {
      konamiPos = 1;
    } else {
      konamiPos = 0;
    }
    // 快捷键 M / T（输入框内不触发）
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (k === "m") startMusic();
    if (k === "t") themeBtn.click();
  });

  function triggerKonami() {
    const overlay = $("#konami-overlay");
    overlay.classList.add("on");
    FX.leekMode();
    DM.storm();
    toast("↑↑↓↓←→←→BA ！世界第一的公主殿下登场 🥬");
    clearTimeout(leekTimer);
    setTimeout(() => overlay.classList.remove("on"), 7000);
    leekTimer = setTimeout(() => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "snow" ? "snow" : "miku", true);
    }, 8000);
    if (AU.isPlaying()) {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => AU.blip(f, "square"), i * 130));
    }
  }

  /* ---------- 移动端菜单 ---------- */
  $("#btn-menu").addEventListener("click", () => {
    $("#nav-links").classList.toggle("open");
  });
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => {
    $("#nav-links").classList.remove("open");
  }));

  /* ---------- 主题恢复 + credits ---------- */
  let savedTheme = "miku";
  try { savedTheme = localStorage.getItem(THEME_KEY) || "miku"; } catch (e) { /* 忽略 */ }
  applyTheme(savedTheme, true);

  const creditsList = $("#credits-list");
  D.GALLERY.forEach((g) => {
    const li = document.createElement("li");
    li.innerHTML = "《" + esc(g.cap) + "》 — " + esc(g.author) +
      ' · <a href="' + esc(g.url) + '" target="_blank" rel="noopener">来源</a>' +
      '<span class="lic">' + esc(g.lic) + "</span>";
    creditsList.appendChild(li);
  });

  /* ---------- 初始渲染 ---------- */
  renderPosts("all");
  renderGB();
  applyTheme(savedTheme, true);

  console.log("%c♪ MIKU NOTE %c世界第一的公主殿下 · 39", "color:#39c5bb;font-size:16px;font-weight:bold", "color:#9db8b5");
})();
