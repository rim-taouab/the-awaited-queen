/* ============================================================================
 *  main.js — boot the experience: begin screen, custom cursor, parallax.
 * ==========================================================================*/

(function () {
  // custom cursor halo
  const cursor = document.getElementById("cursor");
  window.addEventListener("pointermove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
  // warm the cursor over interactive things
  document.addEventListener("pointerover", (e) => {
    const t = e.target;
    if (t.closest(".node, .flower, .continue, .enter-btn, #audio-toggle, #skip")) {
      cursor.classList.add("warm");
    } else {
      cursor.classList.remove("warm");
    }
  });

  // parallax: shift backdrop layers with the cursor for depth
  let px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5);
    ty = (e.clientY / window.innerHeight - 0.5);
  });
  function parallaxLoop() {
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    // slow ambient "camera breathing" so the world drifts even at rest
    const now = performance.now();
    const bx = Math.sin(now * 0.00019) * 7;
    const by = Math.cos(now * 0.00013) * 5;
    const bs = 1 + (Math.sin(now * 0.00009) + 1) * 0.012; // gentle 1.00–1.024 pulse
    const layers = window.__parallaxLayers || [];
    layers.forEach((l) => {
      const d = parseFloat(l.dataset.depth) || 10;
      l.style.transform = `translate(${-px * d + bx}px, ${-py * d * 0.6 + by}px) scale(${1.06 * bs})`;
    });
    // scenery layers drift more strongly for painterly depth
    const scenery = window.__sceneryLayers || [];
    scenery.forEach((l) => {
      const d = parseFloat(l.dataset.depth) || 10;
      l.style.transform = `translate(${-px * d + bx * 1.4}px, ${-py * d * 0.5 + by * 1.3}px) scale(${bs})`;
    });
    requestAnimationFrame(parallaxLoop);
  }
  parallaxLoop();

  // begin screen -> start everything on first gesture (needed for audio)
  const begin = document.getElementById("begin");
  const enterBtn = document.getElementById("enter-btn");
  const beginName = document.getElementById("begin-name");
  if (beginName) beginName.textContent = QUEEN.name;
  const crest = document.getElementById("crest");
  if (crest && window.Icons) crest.innerHTML = Icons.get("crown");
  // the experience title comes from the config
  if (QUEEN.experienceTitle) {
    document.title = QUEEN.experienceTitle;
    const bt = document.getElementById("begin-title");
    if (bt) bt.textContent = QUEEN.experienceTitle;
  }

  // A living, bright enchanted forest behind the title screen (no sound yet —
  // audio still waits for the first click, but the visuals can breathe early).
  Atmosphere.init();
  if (window.Scenery) Scenery.init();
  const backdropEl = document.getElementById("backdrop");
  backdropEl.style.background = Backdrops.SCENES.forest.sky;
  if (window.Scenery) Scenery.set("forest");
  Atmosphere.setMode("forest", 90);
  Atmosphere.showGuide(false);

  let launched = false;
  function launch() {
    if (launched) return;
    launched = true;
    Sound.start();
    Atmosphere.init();
    begin.classList.add("gone");
    setTimeout(() => (begin.style.display = "none"), 2600);
    // reveal ambient controls
    document.getElementById("audio-toggle").classList.add("in");
    document.getElementById("skip").classList.add("in");
    enableGyro(); // tilt-parallax on phones (needs the gesture we just had)
    Journey.init();
  }
  enterBtn.addEventListener("click", launch);

  // On phones, drive the parallax by tilting the device (gyroscope).
  function enableGyro() {
    if (!window.DeviceOrientationEvent) return;
    const listen = () =>
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma == null || e.beta == null) return;
        // gamma: left/right tilt, beta: front/back tilt
        tx = Math.max(-0.6, Math.min(0.6, e.gamma / 40));
        ty = Math.max(-0.6, Math.min(0.6, (e.beta - 40) / 45));
      });
    // iOS 13+ requires explicit permission, granted from a user gesture
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then((s) => { if (s === "granted") listen(); }).catch(() => {});
    } else {
      listen();
    }
  }

  // audio toggle
  let muted = false;
  const toggle = document.getElementById("audio-toggle");
  toggle.addEventListener("click", () => {
    muted = !muted;
    if (muted) { Sound.fadeOut(1.2); toggle.textContent = "♪ silence"; }
    else { Sound.fadeIn(1.2); toggle.textContent = "♪ music"; }
  });

  // skip
  document.getElementById("skip").addEventListener("click", () => Journey.skip());

  // keyboard: space/enter to advance the continue prompt
  window.addEventListener("keydown", (e) => {
    if (!launched) { if (e.key === "Enter" || e.key === " ") launch(); return; }
    if (e.key === "Enter" || e.key === " ") {
      const c = document.querySelector(".scene.active .continue.in");
      if (c) c.click();
    }
  });
})();
