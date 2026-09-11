/* MIKU NOTE · VRM 3D 初音
   three.js + @pixiv/three-vrm（CDN ESM，零构建）
   渐进增强：无 WebGL / 无网络 / 模型加载失败时自动隐藏，
   回退到原有的 SVG 插画兜底。默认 canvas 透明不可见，仅在
   VRM 就绪后 .ready 淡入。 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const MODEL_URL = "assets/model/miku.vrm";

(function () {
  "use strict";

  const canvas = document.getElementById("vrm-canvas");
  const visual = document.getElementById("hero-visual");
  const root = document.documentElement;

  if (!canvas || !visual) return;
  if (!window.WebGLRenderingContext) { disable(); return; }

  // ---- 基础对象 ----
  let renderer = null;
  let scene = null;
  let camera = null;
  let vrm = null;
  let ready = false;
  let clock = new THREE.Clock();
  let rafId = null;
  let elapse = 0;

  // 光标视线目标（归一化 -1..1）
  let lookX = 0;
  let lookY = 0;
  let lookTargetX = 0;
  let lookTargetY = 0;
  // 是否触碰设备（触碰时不跟随光标）
  let isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  const HEAD_LOOK_RANGE = { x: 0.42, y: 0.28 };

  // ---- 相机/画布尺寸 ----
  function containerSize() {
    const w = visual.clientWidth;
    const h = visual.clientHeight;
    return { w, h };
  }
  function resize() {
    if (!renderer) return;
    const { w, h } = containerSize();
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    if (camera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // ---- 灯光 ----
  let hemi, key, fill, rim;
  function buildLights() {
    hemi = new THREE.HemisphereLight(0xffffff, 0x3a4a6a, 0.9);
    key = new THREE.DirectionalLight(0x7dfcf2, 1.5);
    key.position.set(2.5, 3.5, 4);
    fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-3, 1, 2);
    rim = new THREE.DirectionalLight(0xff5f7a, 0.55);
    rim.position.set(-3, 2, -3);
    scene.add(hemi, key, fill, rim);
  }
  function applyTheme() {
    if (!key || !rim) return;
    const isSnow = root.getAttribute("data-theme") === "snow";
    key.color.set(isSnow ? 0xbfeaff : 0x7dfcf2);
    key.intensity = isSnow ? 1.7 : 1.5;
    fill.color.set(isSnow ? 0xffffff : 0xffffff);
    hemi.color.set(isSnow ? 0xeaf6ff : 0xffffff);
    hemi.groundColor.set(isSnow ? 0x5a7a9a : 0x3a4a6a);
    rim.color.set(isSnow ? 0x9ecbff : 0xff5f7a);
  }
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  // ---- 视线跟随 ----
  function onPointerMove(e) {
    if (isTouch) return;
    lookTargetX = (e.clientX / window.innerWidth) * 2 - 1;
    lookTargetY = (e.clientY / window.innerHeight) * 2 - 1;
  }
  function onResize() { resize(); }

  // ---- 渲染主循环 ----
  function tick() {
    if (!ready) { rafId = requestAnimationFrame(tick); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    elapse += dt;

    // 平滑视线
    lookX += (lookTargetX - lookX) * Math.min(1, dt * 5);
    lookY += (lookTargetY - lookY) * Math.min(1, dt * 5);

    updateIdle(dt);
    updateHeadLook();
    if (vrm) vrm.update(dt);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }

  function updateIdle(dt) {
    if (!vrm || !vrm.humanoid) return;
    const t = elapse;
    const breathe = Math.sin(t * 1.6) * 0.02;
    const chest = vrm.humanoid.getNormalizedBoneNode("chest");
    if (chest) {
      chest.rotation.z = breathe;
      chest.rotation.x = Math.sin(t * 1.6 + 1.2) * 0.008;
    }
    // 全身轻微悬浮
    vrm.scene.position.y = Math.sin(t * 1.15) * 0.015;

    // 待机姿势：让双臂从默认的"平举"自然下垂（A 型放松姿态），并轻微摆动
    const armL = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
    const armR = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
    const foreL = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
    const foreR = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
    if (armL) armL.rotation.z = 1.5 + Math.sin(t * 1.2) * 0.02;
    if (armR) armR.rotation.z = -1.5 - Math.sin(t * 1.2) * 0.02;
    if (foreL) foreL.rotation.z = -0.3;
    if (foreR) foreR.rotation.z = 0.3;
    void dt;
  }

  function updateHeadLook() {
    if (!vrm || !vrm.humanoid) return;
    const head = vrm.humanoid.getNormalizedBoneNode("head");
    if (!head) return;
    head.rotation.y = -lookX * HEAD_LOOK_RANGE.x;
    head.rotation.x = -lookY * HEAD_LOOK_RANGE.y;
  }

  // ---- 加载模型 ----
  function init() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: false
      });
    } catch (e) { disable(); return; }
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    buildLights();
    applyTheme();

    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    resize();

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      MODEL_URL,
      (gltf) => {
        try {
          vrm = gltf.userData.vrm;
          if (!vrm) throw new Error("no vrm");
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);
          try { VRMUtils.rotateVRM0(vrm); } catch (e) { /* VRM1 无需旋转 */ }
          scene.add(vrm.scene);
          frameModel();
          ready = true;
          visual.classList.add("vrm-ready");
          canvas.classList.add("ready");
          resize();
          start();
        } catch (e) {
          console.warn("VRM 模型处理失败，回退 SVG：", e);
          teardown();
        }
      },
      undefined,
      (err) => {
        console.warn("VRM 模型加载失败，回退 SVG：", err);
        teardown();
      }
    );
  }

  function frameModel() {
    if (!vrm) return;
    const box = new THREE.Box3().setFromObject(vrm.scene);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    // 把模型居中对齐，脚底落在 y=0
    vrm.scene.position.sub(center);
    vrm.scene.position.y -= box.min.y - center.y;
    const fitDist = (size.y / 2) / Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, size.y * 0.42, fitDist * 1.28);
    camera.lookAt(0, size.y * 0.46, 0);
  }

  // ---- 生命周期 ----
  function start() {
    if (running) return;
    running = true;
    clock.getDelta();
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      updateRunState();
    }, { threshold: 0.01 });
    io.observe(canvas);
    document.addEventListener("visibilitychange", () => {
      visible = document.visibilityState === "visible";
      updateRunState();
    });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    updateRunState();
  }
  let running = false;
  let visible = true;

  function updateRunState() {
    if (ready && visible && !document.hidden) {
      if (rafId == null) rafId = requestAnimationFrame(tick);
    } else if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      clock.getDelta();
    }
  }

  function teardown() {
    cancelAnimationFrame(rafId);
    rafId = null;
    if (themeObserver) themeObserver.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    disable();
  }

  function disable() {
    ready = false;
    if (canvas) canvas.style.display = "none";
    // SVG 兜底保持可见
  }

  // ---- 启动 ----
  init();
})();
