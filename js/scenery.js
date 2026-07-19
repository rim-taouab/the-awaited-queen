/* ============================================================================
 *  Scenery — the lush, painterly depth of each place.
 *  Builds layered decorative art above the flat backdrop and around the
 *  particle canvas: an optional photo, drifting fog, volumetric god-rays,
 *  a foliage canopy overhead, and a foreground of ferns, wildflowers and
 *  glowing mushrooms. Aims for an "enchanted forest" storybook atmosphere.
 * ==========================================================================*/

const Scenery = (() => {
  let back, front;
  const svgURI = (w, h, inner) =>
    `url("data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='xMidYMax slice'>${inner}</svg>`
    )}")`;

  const rnd = (a, b) => a + Math.random() * (b - a);

  // blend two #hex colours -> #hex (t=0 → a, t=1 → b)
  function mix(a, b, t) {
    const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
    const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  // Per-place colour moods -------------------------------------------------
  const PAL = {
    night:   { d:"#3a4e86", m:"#5a6eae", l:"#93a8dc", rim:"#f0f5ff", ray:"rgba(240,246,255,.60)", fog:"rgba(215,228,255,.34)", foliage:true,  mushroom:"#cfe0ff" },
    forest:  { d:"#2f6a3c", m:"#57a862", l:"#9fdc92", rim:"#f2ffd8", ray:"rgba(255,252,222,.78)", fog:"rgba(236,250,224,.40)", foliage:true,  mushroom:"#c9ffcf" },
    river:   { d:"#2f7690", m:"#57a6be", l:"#9fd8e6", rim:"#eafdff", ray:"rgba(240,252,255,.70)", fog:"rgba(228,246,252,.40)", foliage:true,  mushroom:"#cfeeff" },
    library: { d:"#4a3a72", m:"#6f5aa0", l:"#a892cc", rim:"#f4ecff", ray:"rgba(255,240,210,.62)", fog:"rgba(232,220,248,.34)", foliage:false, mushroom:"#ecd9ff" },
    meadow:  { d:"#8a5f8e", m:"#c088ac", l:"#f0b0cc", rim:"#fff2f8", ray:"rgba(255,240,248,.66)", fog:"rgba(252,236,246,.40)", foliage:true,  mushroom:"#ffd6ea" },
    grove:   { d:"#4a3a86", m:"#7460b0", l:"#b09ee0", rim:"#f2ecff", ray:"rgba(242,234,255,.62)", fog:"rgba(236,228,252,.36)", foliage:true,  mushroom:"#ddceff" },
    tree:    { d:"#7a7a42", m:"#a8b062", l:"#dbe08a", rim:"#fffada", ray:"rgba(255,248,214,.70)", fog:"rgba(248,242,214,.36)", foliage:true,  mushroom:"#ffe6ae" },
    palace:  { d:"#4a6aae", m:"#7a9ad4", l:"#c0e2ff", rim:"#f4fbff", ray:"rgba(244,252,255,.80)", fog:"rgba(228,242,255,.42)", foliage:false, mushroom:"#e2f2ff" },
  };

  // -- a single pointed leaf, optionally veined & shaded ----------------
  function leaf(cx, cy, s, rot, fill, op, vein) {
    const body = `<path d='M0 ${-s} Q${s * 0.55} 0 0 ${s} Q${-s * 0.55} 0 0 ${-s} Z' fill='${fill}' opacity='${op}'/>`;
    let extra = "";
    if (vein) {
      // darker central vein + a soft shaded half for a painted look
      extra =
        `<path d='M${-s * 0.5} 0 Q0 ${-s} ${s * 0.5} 0 Q0 ${s} ${-s * 0.5} 0 Z' fill='${vein}' opacity='0.22'/>` +
        `<path d='M0 ${-s * 0.82} L0 ${s * 0.82}' stroke='${vein}' stroke-width='${(s * 0.08).toFixed(1)}' opacity='0.55' stroke-linecap='round'/>`;
    }
    return `<g transform='translate(${cx.toFixed(0)} ${cy.toFixed(0)}) rotate(${rot.toFixed(0)})'>${body}${extra}</g>`;
  }

  // -- a lush clump of real leaves (not bubbles) ------------------------
  function leafMass(cx, cy, r, tones, rim, density) {
    let s = "<g>";
    const n = density || 22 + Math.floor(Math.random() * 12);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.pow(Math.random(), 0.6) * r;
      const lx = cx + Math.cos(a) * rr, ly = cy + Math.sin(a) * rr * 0.8;
      const sz = rnd(9, 20), tone = tones[Math.floor(Math.random() * tones.length)];
      // larger leaves get a vein + shading (keeps the SVG light on tiny ones)
      const vein = sz > 13.5 ? mix(tone, "#000000", 0.4) : null;
      s += leaf(lx, ly, sz, rnd(0, 360), tone, rnd(0.72, 1).toFixed(2), vein);
    }
    if (rim) {
      for (let i = 0; i < 6; i++) {
        const a = rnd(-1.4, 1.4);
        s += leaf(cx + Math.cos(a) * r * 0.7, cy - Math.abs(Math.sin(a)) * r * 0.7 - r * 0.1,
          rnd(7, 12), rnd(0, 360), rim, rnd(0.25, 0.55).toFixed(2));
      }
    }
    return s + "</g>";
  }

  // -- a tapering, gently curving branch/bough --------------------------
  function bough(x1, y1, cx, cy, x2, y2, w, color) {
    return `<path d='M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}' stroke='${color}'
      stroke-width='${w}' fill='none' stroke-linecap='round' opacity='.9'/>`;
  }

  // -- foliage as an arch that frames the scene from above --------------
  function canopy(p) {
    const tones = [p.m, mix(p.m, p.l, 0.45), p.l, mix(p.d, p.m, 0.6)];
    const branch = mix(p.d, "#2c2013", 0.5);
    let s = "";
    // big arching boughs sweeping in from the top corners
    s += bough(-40, -10, 250, 170, 610, 300, 44, branch);
    s += bough(1640, -10, 1350, 170, 990, 300, 44, branch);
    s += bough(-30, 30, 180, 140, 430, 250, 26, branch);
    s += bough(1630, 30, 1420, 140, 1170, 250, 26, branch);
    // dense foliage across the top, heaviest at the corners (framing the light)
    for (let x = -60; x < 1660; x += rnd(64, 108)) {
      const corner = Math.min(x, 1600 - x);
      const y = 55 + rnd(-15, 45) + (corner < 300 ? -20 : 30); // dip open in the middle
      s += leafMass(x, y, rnd(64, 116), tones, p.rim);
    }
    // leaf clumps riding the boughs
    [[250, 175], [430, 250], [600, 300], [1350, 175], [1170, 250], [1000, 300]]
      .forEach(([bx, by]) => (s += leafMass(bx, by, rnd(74, 120), tones, p.rim)));
    // extra weight in the corners
    s += leafMass(70, 110, 160, tones, p.rim, 46);
    s += leafMass(1530, 110, 160, tones, p.rim, 46);
    // hanging vines catching the light
    for (let i = 0; i < 8; i++) {
      s += vine(rnd(80, 1520), 130 + rnd(0, 90), rnd(150, 330), p.m, p.l);
    }
    return svgURI(1600, 600, s);
  }

  // -- foreground: ferns, wildflowers, mushrooms rising from the bottom ---
  function foreground(p) {
    let s = "";
    // dark ground silhouette with wavy top
    s += `<path d='M0 600 H1600 V300 ${wavy(1600, 300, 70, 6, true)} Z' fill='${p.d}'/>`;
    // ferns
    for (let x = 20; x < 1600; x += rnd(120, 240)) {
      s += fern(x, 600, rnd(150, 320), rnd(-18, 18), p.m, p.rim);
    }
    // big leaves
    for (let i = 0; i < 10; i++) {
      const x = rnd(0, 1600);
      s += bigLeaf(x, 600, rnd(90, 190), rnd(-40, 40), i % 2 ? p.m : p.d, p.l);
    }
    // glowing mushrooms
    for (let i = 0; i < 6; i++) {
      s += mushroom(rnd(60, 1540), 600 - rnd(0, 30), rnd(26, 54), p.mushroom, p.d);
    }
    // wildflowers dotting the base
    for (let i = 0; i < 22; i++) {
      s += wildflower(rnd(20, 1580), 600 - rnd(0, 120), rnd(6, 12), p.rim);
    }
    return svgURI(1600, 600, s);
  }

  // wavy edge helper -> path segment string
  function wavy(w, y, amp, n, up) {
    let d = `L${w} ${y} `;
    const step = w / n;
    for (let i = n; i >= 0; i--) {
      const x = i * step;
      const yy = y + Math.sin(i * 1.7) * amp * (up ? -1 : 1) - (up ? amp : 0);
      d += `L${x.toFixed(0)} ${yy.toFixed(0)} `;
    }
    return d;
  }

  function leafCluster(x, y, r, color, rim, tones) {
    let s = `<g>`;
    // soft body of the cluster — many small overlapping leaves in varied tones
    const blobs = 12 + Math.floor(Math.random() * 8);
    const pool = tones || [color];
    for (let i = 0; i < blobs; i++) {
      const bx = x + rnd(-r, r), by = y + rnd(-r * 0.55, r * 0.55);
      const rr = r * rnd(0.18, 0.5);
      const tone = pool[Math.floor(Math.random() * pool.length)];
      s += `<ellipse cx='${bx.toFixed(0)}' cy='${by.toFixed(0)}' rx='${rr.toFixed(0)}' ry='${(rr*rnd(0.7,0.95)).toFixed(0)}' fill='${tone}' opacity='${rnd(0.75,1).toFixed(2)}' transform='rotate(${rnd(-30,30).toFixed(0)} ${bx.toFixed(0)} ${by.toFixed(0)})'/>`;
    }
    if (rim) {
      // dappled light catching the upper leaves
      for (let i = 0; i < 5; i++) {
        const lx = x + rnd(-r, r), ly = y + rnd(-r * 0.5, r * 0.2);
        s += `<ellipse cx='${lx.toFixed(0)}' cy='${ly.toFixed(0)}' rx='${(r*rnd(0.08,0.18)).toFixed(0)}' ry='${(r*0.07).toFixed(0)}' fill='${rim}' opacity='${rnd(0.2,0.5).toFixed(2)}' transform='rotate(${rnd(-45,45).toFixed(0)} ${lx.toFixed(0)} ${ly.toFixed(0)})'/>`;
      }
    }
    return s + `</g>`;
  }

  function vine(x, y, len, color, leaf) {
    const sway = rnd(-40, 40);
    let s = `<path d='M${x} ${y} q${sway} ${len*0.5} ${sway*0.3} ${len}' stroke='${color}' stroke-width='3' fill='none'/>`;
    const n = Math.floor(len / 34);
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const px = x + sway * t + sway * 0.3 * t;
      const py = y + len * t;
      s += `<ellipse cx='${px.toFixed(0)}' cy='${py.toFixed(0)}' rx='9' ry='5' fill='${leaf}' opacity='.85' transform='rotate(${(i%2?40:-40)} ${px.toFixed(0)} ${py.toFixed(0)})'/>`;
    }
    return s;
  }

  function fern(x, base, h, tilt, color, rim) {
    let s = `<g transform='rotate(${tilt} ${x} ${base})'>`;
    s += `<path d='M${x} ${base} C${x-10} ${base-h*0.5} ${x+14} ${base-h*0.8} ${x} ${base-h}' stroke='${color}' stroke-width='4' fill='none'/>`;
    const n = Math.floor(h / 22);
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const py = base - h * t;
      const px = x + Math.sin(t * 3) * 6;
      const ll = (1 - t) * h * 0.16 + 8;
      s += `<path d='M${px} ${py} q${ll} ${-ll*0.4} ${ll*1.3} ${2}' stroke='${color}' stroke-width='2.4' fill='none'/>`;
      s += `<path d='M${px} ${py} q${-ll} ${-ll*0.4} ${-ll*1.3} ${2}' stroke='${color}' stroke-width='2.4' fill='none'/>`;
    }
    // rim highlight on top frond
    s += `<circle cx='${x}' cy='${base-h}' r='3' fill='${rim}' opacity='.5'/>`;
    return s + `</g>`;
  }

  function bigLeaf(x, base, size, tilt, color, vein) {
    const dark = mix(color, "#000000", 0.35);
    let veins = `<path d='M0 0 L0 ${-size * 1.62}' stroke='${dark}' stroke-width='2.2' opacity='.45' stroke-linecap='round'/>`;
    for (let i = 1; i <= 3; i++) {
      const y = -size * 0.4 * i;
      const w = (1 - i * 0.22) * size * 0.42;
      veins += `<path d='M0 ${y.toFixed(0)} Q${(w * 0.6).toFixed(0)} ${(y - w * 0.5).toFixed(0)} ${w.toFixed(0)} ${(y - w * 0.7).toFixed(0)}' stroke='${dark}' stroke-width='1.4' opacity='.35' fill='none'/>`;
      veins += `<path d='M0 ${y.toFixed(0)} Q${(-w * 0.6).toFixed(0)} ${(y - w * 0.5).toFixed(0)} ${(-w).toFixed(0)} ${(y - w * 0.7).toFixed(0)}' stroke='${dark}' stroke-width='1.4' opacity='.35' fill='none'/>`;
    }
    return `<g transform='translate(${x} ${base}) rotate(${tilt})'>
      <path d='M0 0 C${-size*0.5} ${-size*0.7} ${-size*0.3} ${-size*1.4} 0 ${-size*1.7}
        C${size*0.3} ${-size*1.4} ${size*0.5} ${-size*0.7} 0 0 Z' fill='${color}'/>
      <path d='M0 0 C${-size*0.5} ${-size*0.7} ${-size*0.3} ${-size*1.4} 0 ${-size*1.7} C${-size*0.14} ${-size*1.2} ${-size*0.24} ${-size*0.6} 0 0 Z' fill='${dark}' opacity='.28'/>
      ${veins}
    </g>`;
  }

  function mushroom(x, base, size, glow, stem) {
    return `<g transform='translate(${x} ${base})'>
      <ellipse cx='0' cy='${-size*3.2}' rx='${size*1.5}' ry='${size*1.5}' fill='${glow}' opacity='.14'/>
      <rect x='${-size*0.28}' y='${-size*1.6}' width='${size*0.56}' height='${size*1.6}' rx='${size*0.28}' fill='#e8dcc8' opacity='.9'/>
      <path d='M${-size} ${-size*1.4} Q0 ${-size*2.6} ${size} ${-size*1.4} Q${size*0.7} ${-size*1.1} 0 ${-size*1.15} Q${-size*0.7} ${-size*1.1} ${-size} ${-size*1.4} Z' fill='${glow}'/>
      <circle cx='${-size*0.35}' cy='${-size*1.75}' r='${size*0.13}' fill='#fff' opacity='.85'/>
      <circle cx='${size*0.35}' cy='${-size*1.7}' r='${size*0.1}' fill='#fff' opacity='.7'/>
      <circle cx='0' cy='${-size*2.0}' r='${size*0.12}' fill='#fff' opacity='.8'/>
    </g>`;
  }

  function wildflower(x, base, size, color) {
    let s = `<g transform='translate(${x} ${base})'>
      <path d='M0 0 L0 ${-size*2.2}' stroke='#3f6b4a' stroke-width='1.6'/>`;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      s += `<circle cx='${(Math.cos(a)*size*0.7).toFixed(1)}' cy='${(-size*2.2 + Math.sin(a)*size*0.7).toFixed(1)}' r='${(size*0.45).toFixed(1)}' fill='${color}' opacity='.8'/>`;
    }
    s += `<circle cx='0' cy='${-size*2.2}' r='${size*0.35}' fill='#ffe9a8'/>`;
    return s + `</g>`;
  }

  // -- build god-ray shafts as DOM children -------------------------------
  function buildRays(container, color) {
    const wrap = document.createElement("div");
    wrap.className = "god-rays scenery-layer";
    wrap.dataset.depth = "4";
    const n = 8;
    for (let i = 0; i < n; i++) {
      const ray = document.createElement("div");
      ray.className = "ray";
      const left = rnd(6, 78);
      const w = rnd(40, 130);
      ray.style.left = left + "%";
      ray.style.width = w + "px";
      ray.style.background = `linear-gradient(to bottom, ${color}, transparent 78%)`;
      ray.style.animationDuration = rnd(7, 13) + "s";
      ray.style.animationDelay = (-rnd(0, 8)) + "s";
      ray.style.opacity = rnd(0.4, 1);
      wrap.appendChild(ray);
    }
    // dust motes suspended in the light
    for (let i = 0; i < 16; i++) {
      const d = document.createElement("div");
      d.className = "dust";
      d.style.left = rnd(4, 82) + "%";
      d.style.top = rnd(0, 58) + "%";
      d.style.animationDuration = rnd(9, 18) + "s";
      d.style.animationDelay = (-rnd(0, 12)) + "s";
      wrap.appendChild(d);
    }
    container.appendChild(wrap);
    return wrap;
  }

  // -- a soft glow where the light pours in --------------------------------
  function lightSource(container, color) {
    const g = document.createElement("div");
    g.className = "light-source scenery-layer";
    g.dataset.depth = "2";
    g.style.background = `radial-gradient(ellipse 46% 60% at 46% 0%, ${color}, transparent 70%)`;
    container.appendChild(g);
    return g;
  }

  // -- a tapered, gently curving tree trunk with a few branches -----------
  function organicTrunk(x, base, h, wb, tone, op, lean) {
    const top = base - h, wt = Math.max(4, wb * 0.34), cx = x + lean;
    let s = `<path d='M${(x - wb / 2).toFixed(0)} ${base}
      C${(x - wb * 0.42).toFixed(0)} ${(base - h * 0.45).toFixed(0)} ${(cx - wt * 0.8).toFixed(0)} ${(top + h * 0.35).toFixed(0)} ${(cx - wt / 2).toFixed(0)} ${top.toFixed(0)}
      L${(cx + wt / 2).toFixed(0)} ${top.toFixed(0)}
      C${(cx + wt * 0.8).toFixed(0)} ${(top + h * 0.35).toFixed(0)} ${(x + wb * 0.42).toFixed(0)} ${(base - h * 0.45).toFixed(0)} ${(x + wb / 2).toFixed(0)} ${base} Z'
      fill='${tone}' opacity='${op}'/>`;
    // a couple of reaching branches near the crown
    s += `<path d='M${cx} ${(top + h * 0.12).toFixed(0)} q${rnd(24, 52).toFixed(0)} ${-rnd(10, 28).toFixed(0)} ${rnd(44, 86).toFixed(0)} ${-rnd(4, 20).toFixed(0)}' stroke='${tone}' stroke-width='${(wt * 0.6).toFixed(1)}' fill='none' opacity='${op}' stroke-linecap='round'/>`;
    s += `<path d='M${cx} ${(top + h * 0.24).toFixed(0)} q${-rnd(24, 52).toFixed(0)} ${-rnd(8, 24).toFixed(0)} ${-rnd(44, 86).toFixed(0)} ${-rnd(2, 16).toFixed(0)}' stroke='${tone}' stroke-width='${(wt * 0.5).toFixed(1)}' fill='none' opacity='${op}' stroke-linecap='round'/>`;
    return s;
  }

  // -- misty mid-ground of receding organic trees (aerial perspective) ----
  function midground(p) {
    let s = "";
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * 1600 + rnd(-50, 50);
      const far = rnd(0.25, 0.9);
      const h = rnd(380, 660) * (1 - far * 0.25);
      const wb = rnd(28, 56) * (1 - far * 0.3);
      const tone = mix(p.m, p.d, far * 0.7);
      s += organicTrunk(x, 640, h, wb, tone, (0.92 - far * 0.5).toFixed(2), rnd(-26, 26));
    }
    return svgURI(1600, 640, `<g>${s}</g>`);
  }

  // -- two great trees arching in from the sides: the enchanted tunnel ----
  function frameTrees(p) {
    const trunk = mix(p.d, "#241a10", 0.55);
    const tones = [p.d, mix(p.d, p.m, 0.5), mix(p.m, p.l, 0.3)];
    let s = "";
    // left
    s += organicTrunk(60, 700, 660, 96, trunk, 0.96, 56);
    s += bough(116, 150, 330, 70, 640, 150, 30, trunk);
    s += leafMass(116, 150, 170, tones, p.rim, 48);
    s += leafMass(360, 96, 130, tones, p.rim);
    s += leafMass(610, 150, 110, tones, p.rim);
    // right (mirror)
    s += organicTrunk(1540, 700, 660, 96, trunk, 0.96, -56);
    s += bough(1484, 150, 1270, 70, 960, 150, 30, trunk);
    s += leafMass(1484, 150, 170, tones, p.rim, 48);
    s += leafMass(1240, 96, 130, tones, p.rim);
    s += leafMass(990, 150, 110, tones, p.rim);
    return svgURI(1600, 760, s);
  }

  function fogLayer(container, color, depth, dur, top) {
    const f = document.createElement("div");
    f.className = "fog scenery-layer";
    f.dataset.depth = depth;
    f.style.top = top + "%";
    f.style.background = `radial-gradient(ellipse 60% 100% at 30% 50%, ${color}, transparent 70%),
                          radial-gradient(ellipse 50% 100% at 75% 50%, ${color}, transparent 70%)`;
    f.style.animationDuration = dur + "s";
    container.appendChild(f);
    return f;
  }

  function imageLayer(container, src) {
    const d = document.createElement("div");
    d.className = "photo-layer scenery-layer";
    d.dataset.depth = "5";
    d.style.backgroundImage = `url("${src}")`;
    container.appendChild(d);
    // a colour-grade wash to blend the photo into the realm
    const grade = document.createElement("div");
    grade.className = "photo-grade";
    container.appendChild(grade);
    return d;
  }

  const layers = [];
  function clearLayer(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function set(mode) {
    const p = PAL[mode] || PAL.forest;
    clearLayer(back);
    clearLayer(front);
    layers.length = 0;

    const img = (window.QUEEN && QUEEN.images && QUEEN.images[mode]) || "";
    if (img) imageLayer(back, img);

    // the light pouring in
    layers.push(lightSource(back, p.ray));
    // far fog band
    layers.push(fogLayer(back, p.fog, 3, 44, 24));

    // misty receding trunks for depth (nature scenes)
    if (p.foliage) {
      const mid = document.createElement("div");
      mid.className = "midground scenery-layer";
      mid.dataset.depth = "14";
      mid.style.backgroundImage = midground(p);
      back.appendChild(mid);
      layers.push(mid);
    }

    // near fog band (over the trunks, softening them)
    layers.push(fogLayer(back, p.fog, 6, 62, 50));
    // god rays
    layers.push(buildRays(back, p.ray));

    // foliage canopy (behind particles), then the framing trees & foreground
    if (p.foliage) {
      const top = document.createElement("div");
      top.className = "foliage-top scenery-layer";
      top.dataset.depth = "8";
      top.style.backgroundImage = canopy(p);
      back.appendChild(top);
      layers.push(top);

      // the two great arching trees that frame the view like a tunnel
      const frame = document.createElement("div");
      frame.className = "frame-trees scenery-layer";
      frame.dataset.depth = "18";
      frame.style.backgroundImage = frameTrees(p);
      front.appendChild(frame);
      layers.push(frame);

      const fg = document.createElement("div");
      fg.className = "foliage-front scenery-layer";
      fg.dataset.depth = "24";
      fg.style.backgroundImage = foreground(p);
      front.appendChild(fg);
      layers.push(fg);
    }

    // reveal
    requestAnimationFrame(() => layers.forEach((l) => l.classList.add("visible")));
    window.__sceneryLayers = layers;
  }

  function init() {
    back = document.getElementById("scenery-back");
    front = document.getElementById("scenery-front");
  }

  return { init, set };
})();

window.Scenery = Scenery;
