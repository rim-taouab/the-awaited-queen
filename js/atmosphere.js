/* ============================================================================
 *  Atmosphere — the living canvas
 *  A single full-screen canvas that renders drifting particles themed to the
 *  current location: fireflies, leaves, petals, dust motes, spirit wisps,
 *  and crystal light. Also hosts the mouse-following "guide firefly" and the
 *  finale's crown-of-light weave.
 * ==========================================================================*/

const Atmosphere = (() => {
  let canvas, ctx, W, H, dpr;
  let particles = [];
  let mode = "night";
  const mouse = { x: -999, y: -999, active: false };
  let raf = null;
  let t = 0;

  // Guide firefly — a warm companion light that eases toward the cursor
  const guide = { x: 0, y: 0, tx: 0, ty: 0, glow: 0, visible: false };

  // ---- Living things: a companion spirit, butterflies, a cursor trail ----
  const companion = { x: 0, y: 0, tx: 0, ty: 0, phase: 0, blink: 0, nextTarget: 0, hue: "#fff2c0", visible: false };
  let butterflies = [];
  let trail = [];
  let bokeh = []; // big out-of-focus glowing orbs for depth-of-field

  // Palette per mode
  const PALETTES = {
    night:   ["#8fb3ff", "#c9d9ff", "#ffe9a8"],
    forest:  ["#a8ffcf", "#ffe9a8", "#bff0ff"],
    river:   ["#9ad7ff", "#cfeeff", "#e6c9ff"],
    library: ["#ffd9a8", "#ffe9c9", "#e6d0ff"],
    meadow:  ["#ffc7e6", "#fff0a8", "#c9ffd9"],
    grove:   ["#c9b3ff", "#a8ffe6", "#ffe0f0"],
    tree:    ["#ffe0a8", "#c9ffb3", "#fff4cf"],
    palace:  ["#cfe9ff", "#ffffff", "#e6d9ff"],
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function makeParticle() {
    const pal = PALETTES[mode] || PALETTES.night;
    const kinds = {
      night:   "mote",
      forest:  Math.random() < 0.55 ? "firefly" : "leaf",
      river:   Math.random() < 0.6 ? "mote" : "firefly",
      library: Math.random() < 0.5 ? "mote" : "ember",
      meadow:  Math.random() < 0.6 ? "petal" : "firefly",
      grove:   Math.random() < 0.7 ? "wisp" : "firefly",
      tree:    Math.random() < 0.5 ? "leaf" : "firefly",
      palace:  "crystal",
    };
    const kind = kinds[mode] || "mote";
    return {
      kind,
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.15, 0.15),
      vy: kind === "leaf" || kind === "petal" ? rand(0.15, 0.5) : rand(-0.12, 0.12),
      size: kind === "leaf" || kind === "petal" ? rand(6, 13) : rand(1, 3.4),
      color: pick(pal),
      phase: rand(0, Math.PI * 2),
      spin: rand(-0.02, 0.02),
      rot: rand(0, Math.PI * 2),
      blink: rand(0.006, 0.02),
      alpha: rand(0.2, 0.9),
      depth: rand(0.3, 1), // parallax depth
    };
  }

  function seed(n) {
    particles = [];
    for (let i = 0; i < n; i++) particles.push(makeParticle());
  }

  function setMode(newMode, count = 90) {
    mode = newMode;
    // graceful reseed
    seed(count);
    seedBokeh(6);
  }

  function drawFirefly(p, a) {
    const r = p.size * (2.2 + Math.sin(t * p.blink * 10 + p.phase) * 0.8);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
    g.addColorStop(0, hex(p.color, a));
    g.addColorStop(0.4, hex(p.color, a * 0.35));
    g.addColorStop(1, hex(p.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hex("#ffffff", a);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMote(p, a) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    g.addColorStop(0, hex(p.color, a * 0.9));
    g.addColorStop(1, hex(p.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLeaf(p, a) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = hex(p.color, a * 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hex("#6b8f5a", a * 0.5);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawPetal(p, a) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = hex(p.color, a * 0.85);
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.5);
    ctx.quadraticCurveTo(p.size * 0.6, 0, 0, p.size * 0.5);
    ctx.quadraticCurveTo(-p.size * 0.6, 0, 0, -p.size * 0.5);
    ctx.fill();
    ctx.restore();
  }

  function drawWisp(p, a) {
    const pulse = 0.6 + Math.sin(t * 0.03 + p.phase) * 0.4;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6 * pulse);
    g.addColorStop(0, hex(p.color, a * 0.7));
    g.addColorStop(0.5, hex(p.color, a * 0.2));
    g.addColorStop(1, hex(p.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 6 * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCrystal(p, a) {
    const tw = 0.5 + Math.abs(Math.sin(t * p.blink * 8 + p.phase));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = hex(p.color, a * tw);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.size * 0.4, -p.size * 0.4);
      ctx.lineTo(0, -p.size * 2.2 * tw);
      ctx.lineTo(-p.size * 0.4, -p.size * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  const drawers = {
    firefly: drawFirefly, mote: drawMote, ember: drawFirefly,
    leaf: drawLeaf, petal: drawPetal, wisp: drawWisp, crystal: drawCrystal,
  };

  function step() {
    t++;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      // drift
      p.x += p.vx + Math.sin(t * 0.01 + p.phase) * 0.15 * p.depth;
      p.y += p.vy;
      p.rot += p.spin;

      // gentle attraction to cursor for glowing kinds
      if (mouse.active && (p.kind === "firefly" || p.kind === "wisp")) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          const f = 0.0008;
          p.vx += dx * f; p.vy += dy * f;
          p.vx *= 0.96; p.vy *= 0.96;
        }
      }

      // wrap
      if (p.x < -30) p.x = W + 30;
      if (p.x > W + 30) p.x = -30;
      if (p.y > H + 30) { p.y = -30; p.x = rand(0, W); }
      if (p.y < -30) p.y = H + 30;

      const a = p.alpha * (0.6 + Math.sin(t * p.blink * 6 + p.phase) * 0.4);
      (drawers[p.kind] || drawMote)(p, Math.max(0, a));
    }

    // guide firefly — sits exactly on the cursor (no lag, no offset)
    if (guide.visible) {
      guide.x = guide.tx;
      guide.y = guide.ty;
      guide.glow = 0.7 + Math.sin(t * 0.08) * 0.3;
      const r = 6 * guide.glow;
      const g = ctx.createRadialGradient(guide.x, guide.y, 0, guide.x, guide.y, r * 5);
      g.addColorStop(0, hex("#fff6c9", 0.95));
      g.addColorStop(0.3, hex("#ffe08a", 0.5));
      g.addColorStop(1, hex("#ffe08a", 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(guide.x, guide.y, r * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hex("#ffffff", 0.95);
      ctx.beginPath();
      ctx.arc(guide.x, guide.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    updateBokeh();
    updateTrail();
    updateButterflies();
    updateCompanion();

    ctx.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(step);
  }

  // -- big, soft, out-of-focus orbs drifting near the "lens" --------------
  function seedBokeh(n) {
    const pal = PALETTES[mode] || PALETTES.night;
    bokeh = [];
    for (let i = 0; i < n; i++) {
      bokeh.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.12, 0.12), vy: rand(-0.08, 0.05),
        r: rand(50, 150), color: pick(pal),
        alpha: rand(0.05, 0.13), phase: rand(0, 6.28),
      });
    }
  }
  function updateBokeh() {
    for (const b of bokeh) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -160) b.x = W + 160; if (b.x > W + 160) b.x = -160;
      if (b.y < -160) b.y = H + 160; if (b.y > H + 160) b.y = -160;
      const a = b.alpha * (0.7 + Math.sin(t * 0.01 + b.phase) * 0.3);
      const g = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r);
      g.addColorStop(0, hex(b.color, a));
      g.addColorStop(0.7, hex(b.color, a * 0.35));
      g.addColorStop(1, hex(b.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // -- soft light-trail emitted at the cursor (decorative, never a "cursor") --
  function addTrail(x, y) {
    trail.push({ x: x + rand(-3, 3), y: y + rand(-3, 3), life: 1, size: rand(1.5, 3.5), color: pick((PALETTES[mode] || PALETTES.night)) });
    if (trail.length > 60) trail.shift();
  }
  function updateTrail() {
    for (const s of trail) {
      s.life -= 0.03;
      s.y -= 0.3;
      if (s.life <= 0) continue;
      const r = s.size * (0.6 + s.life);
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
      g.addColorStop(0, hex(s.color, 0.7 * s.life));
      g.addColorStop(1, hex(s.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    trail = trail.filter((s) => s.life > 0);
  }

  // -- butterflies drifting with flapping wings ---------------------------
  function seedButterflies(n) {
    butterflies = [];
    const cols = ["#ffd0e6", "#cbb8ff", "#bfe6ff", "#fff2c0", "#c9ffd9"];
    for (let i = 0; i < n; i++) {
      butterflies.push({
        x: rand(0, W), y: rand(H * 0.2, H * 0.8),
        vx: rand(0.3, 0.9) * (Math.random() < 0.5 ? -1 : 1),
        phase: rand(0, 6.28), wing: rand(0, 6.28), wingSpd: rand(0.25, 0.4),
        size: rand(7, 12), color: cols[i % cols.length], bob: rand(0.6, 1.4),
      });
    }
  }
  function updateButterflies() {
    for (const b of butterflies) {
      b.x += b.vx;
      b.y += Math.sin(t * 0.02 + b.phase) * b.bob;
      b.wing += b.wingSpd;
      if (b.x < -30) b.x = W + 30;
      if (b.x > W + 30) b.x = -30;
      drawButterfly(b);
    }
  }
  function drawButterfly(b) {
    const flap = Math.abs(Math.sin(b.wing)); // 0..1 wing openness
    const wx = b.size * (0.35 + flap * 0.75);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.sin(t * 0.02 + b.phase) * 0.15 + (b.vx < 0 ? Math.PI : 0));
    // soft glow
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 2.2);
    g.addColorStop(0, hex(b.color, 0.35));
    g.addColorStop(1, hex(b.color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, b.size * 2.2, 0, Math.PI * 2); ctx.fill();
    // wings
    ctx.fillStyle = hex(b.color, 0.9);
    ctx.beginPath(); ctx.ellipse(-wx * 0.5, -b.size * 0.2, wx, b.size * 0.9, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(wx * 0.5, -b.size * 0.2, wx, b.size * 0.9, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-wx * 0.4, b.size * 0.5, wx * 0.7, b.size * 0.6, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(wx * 0.4, b.size * 0.5, wx * 0.7, b.size * 0.6, 0.3, 0, Math.PI * 2); ctx.fill();
    // body
    ctx.fillStyle = hex("#3a2f45", 0.9);
    ctx.beginPath(); ctx.ellipse(0, 0, b.size * 0.14, b.size * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // -- the companion spirit: drifts on its own, bobs, blinks --------------
  function updateCompanion() {
    if (!companion.visible) return;
    if (t > companion.nextTarget) {
      companion.tx = rand(W * 0.15, W * 0.85);
      companion.ty = rand(H * 0.2, H * 0.6);
      companion.nextTarget = t + rand(180, 420);
    }
    companion.x += (companion.tx - companion.x) * 0.012;
    companion.y += (companion.ty - companion.y) * 0.012 + Math.sin(t * 0.03) * 0.25;
    companion.phase += 0.03;
    if (Math.random() < 0.004) companion.blink = 8; // occasional blink
    if (companion.blink > 0) companion.blink--;

    const x = companion.x, y = companion.y + Math.sin(companion.phase) * 4;
    const pulse = 0.85 + Math.sin(companion.phase * 1.3) * 0.15;
    // glow
    const g = ctx.createRadialGradient(x, y, 0, x, y, 34 * pulse);
    g.addColorStop(0, hex(companion.hue, 0.55));
    g.addColorStop(0.4, hex(companion.hue, 0.2));
    g.addColorStop(1, hex(companion.hue, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 34 * pulse, 0, Math.PI * 2); ctx.fill();
    // body (soft teardrop)
    ctx.fillStyle = hex("#fbf6e6", 0.95);
    ctx.beginPath(); ctx.ellipse(x, y, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    // eyes (blink)
    ctx.fillStyle = hex("#3a3350", 0.9);
    const eyeH = companion.blink > 0 ? 0.5 : 2;
    ctx.beginPath(); ctx.ellipse(x - 2.6, y - 1, 1.2, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 2.6, y - 1, 1.2, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    // little trailing spark
    const tsx = x - Math.cos(companion.phase) * 14, tsy = y + 12 + Math.sin(companion.phase) * 4;
    ctx.fillStyle = hex(companion.hue, 0.5);
    ctx.beginPath(); ctx.arc(tsx, tsy, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  function showCompanion(v, hue) {
    companion.visible = v;
    if (hue) companion.hue = hue;
    if (v && companion.x === 0) { companion.x = W * 0.7; companion.y = H * 0.35; companion.tx = companion.x; companion.ty = companion.y; }
  }

  // ---- Crown of light finale ----------------------------------------------
  // Converge a burst of particles into a rotating ring "crown" at a point.
  let crown = null;
  function weaveCrown(cx, cy, radius = 120, onComplete) {
    crown = { cx, cy, radius, progress: 0, points: [], done: false };
    const N = 64;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2;
      crown.points.push({
        ang,
        x: cx + Math.cos(ang) * rand(W, W * 1.4) * (Math.random() < 0.5 ? -1 : 1),
        y: cy + Math.sin(ang) * rand(H, H * 1.4) * (Math.random() < 0.5 ? -1 : 1),
        color: pick(["#fff6c9", "#cfe9ff", "#ffe0f0", "#ffffff", "#e6d9ff"]),
        peak: i % 4 === 0,
      });
    }
    crownAnim(onComplete);
  }

  function crownAnim(onComplete) {
    if (!crown) return;
    crown.progress = Math.min(1, crown.progress + 0.006);
    const p = ease(crown.progress);
    crown.shimmer = (crown.shimmer || 0) + 0.03;

    ctx.globalCompositeOperation = "lighter";
    // ring glow
    crown.points.forEach((pt, i) => {
      const tipR = pt.peak ? crown.radius * 1.28 : crown.radius;
      const tx = crown.cx + Math.cos(pt.ang) * tipR;
      const ty = crown.cy + Math.sin(pt.ang) * tipR * 0.62 - crown.radius * 0.2;
      pt.x += (tx - pt.x) * 0.04;
      pt.y += (ty - pt.y) * 0.04;
      const tw = 0.75 + Math.sin(crown.shimmer + i * 0.5) * 0.25;
      const r = (3 + (pt.peak ? 3 : 0)) * tw;
      const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 6);
      g.addColorStop(0, hex(pt.color, 0.9 * p * tw));
      g.addColorStop(0.4, hex(pt.color, 0.4 * p));
      g.addColorStop(1, hex(pt.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 6, 0, Math.PI * 2);
      ctx.fill();
    });
    // connecting arc
    if (p > 0.4) {
      ctx.strokeStyle = hex("#fff6c9", (p - 0.4) * 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      crown.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";

    if (crown.progress >= 1) {
      if (!crown.done) { crown.done = true; crown.holding = true; if (onComplete) onComplete(); }
    }
    if (crown.progress < 1 || crown.holding) {
      requestAnimationFrame(() => crownAnim(onComplete));
    }
  }

  // let the woven crown fade away gracefully after the coronation
  function releaseCrown() {
    if (crown) crown.holding = false;
    crown = null;
  }

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  // hex + alpha -> rgba
  function hex(h, a) {
    const c = h.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function burst(x, y, color = "#fff6c9", n = 18) {
    const pal = PALETTES[mode] || PALETTES.night;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + rand(-0.2, 0.2);
      const spd = rand(0.5, 2.5);
      particles.push({
        kind: "firefly",
        x, y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        size: rand(1, 2.6), color: Math.random() < 0.5 ? color : pick(pal),
        phase: rand(0, 6), spin: 0, rot: 0, blink: 0.02,
        alpha: 1, depth: 1,
      });
    }
    // cap population
    if (particles.length > 260) particles.splice(0, particles.length - 260);
  }

  let inited = false;
  function init() {
    if (inited) return;
    inited = true;
    canvas = document.getElementById("atmosphere");
    ctx = canvas.getContext("2d");
    resize();
    seed(80);
    seedButterflies(5);
    seedBokeh(6);
    showCompanion(true);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
      guide.tx = e.clientX; guide.ty = e.clientY;
      if (t % 2 === 0) addTrail(e.clientX, e.clientY); // gentle light-trail
    });
    window.addEventListener("pointerdown", (e) => burst(e.clientX, e.clientY, "#fff6c9", 10));
    step();
  }

  function showGuide(v) { guide.visible = v; if (v && guide.x === 0) { guide.x = W / 2; guide.y = H / 2; } }

  return { init, setMode, burst, weaveCrown, releaseCrown, showGuide, showCompanion, seedButterflies };
})();

window.Atmosphere = Atmosphere;
