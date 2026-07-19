/* ============================================================================
 *  Journey — the guided flow through the realm.
 *  Each location is a scene builder. A gentle "continue" firefly advances the
 *  story. Interactions (whispers, memories, letters, flowers, spirits) reward
 *  curiosity with light, sound, and words.
 * ==========================================================================*/

const Journey = (() => {
  let stage, backdrop, flash;
  let layers = [];
  let index = 0;
  let sceneEl = null;
  let scenes = [];

  // ---- small DOM helpers --------------------------------------------------
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const T = (s) =>
    (s || "")
      .replaceAll("{name}", QUEEN.name)
      .replaceAll("{title}", QUEEN.title);

  // ---- backdrop / mood ----------------------------------------------------
  function setBackdrop(mode) {
    const conf = Backdrops.SCENES[mode] || Backdrops.SCENES.night;
    backdrop.style.background = conf.sky;
    if (window.Scenery) Scenery.set(mode);
    // rebuild parallax layers
    layers.forEach((l) => l.remove());
    layers = [];
    conf.layers.forEach((layer) => {
      const d = el("div", "parallax-layer");
      d.style.backgroundImage = `url("${layer.img}")`;
      d.style.backgroundSize = "cover";
      d.style.backgroundPosition = "center bottom";
      d.dataset.depth = layer.depth;
      document.body.appendChild(d);
      requestAnimationFrame(() => d.classList.add("visible"));
      layers.push(d);
    });
    window.__parallaxLayers = layers;
  }

  // ---- narration: reveal lines one at a time ------------------------------
  async function narrate(container, lines, opts = {}) {
    const gap = opts.gap ?? 2100;
    const box = el("div", "narration");
    container.appendChild(box);
    for (const line of lines) {
      const p = el(opts.tag || "p", "reveal", T(line));
      box.appendChild(p);
      requestAnimationFrame(() => p.classList.add("in"));
      if (opts.chime) Sound.chime();
      await wait(gap);
    }
    return box;
  }

  // ---- the continue prompt ------------------------------------------------
  function continuePrompt(container, label = "follow the light") {
    return new Promise((resolve) => {
      const c = el("div", "continue", T(label));
      container.appendChild(c);
      requestAnimationFrame(() => setTimeout(() => c.classList.add("in"), 400));
      c.addEventListener("click", () => resolve(), { once: true });
    });
  }

  // how loud the song sits per place — soft while reading, swelling at the climax
  const MUSIC_LEVEL = {
    night: 1, forest: 1, river: 0.72, library: 0.72,
    meadow: 0.95, grove: 0.8, tree: 0.72, palace: 1.35,
  };

  // ---- scene lifecycle ----------------------------------------------------
  function newScene(mode, audioMood) {
    setBackdrop(mode);
    Atmosphere.setMode(mode, mode === "palace" ? 120 : 90);
    Sound.setMood(audioMood || mode);
    if (Sound.setMusicLevel) Sound.setMusicLevel(MUSIC_LEVEL[mode] ?? 1, 4);
    const s = el("div", "scene");
    stage.appendChild(s);
    requestAnimationFrame(() => s.classList.add("active"));
    sceneEl = s;
    return s;
  }

  async function transitionTo(builder, opts = {}) {
    // fade the old scene up into light
    if (sceneEl) {
      sceneEl.classList.add("leaving");
    }
    if (opts.flash !== false) {
      flash.classList.add("on");
      Sound.swell(3);
      await wait(1500);
    }
    // remove old scene + stray cards
    if (sceneEl) sceneEl.remove();
    document.querySelectorAll(".card, .found-count").forEach((n) => n.remove());
    await wait(200);
    // Start the scene, but DON'T await its full lifetime — a scene builder only
    // resolves once the visitor has finished exploring it (found the whispers,
    // clicked "continue", etc.). We just need its first content mounted, then we
    // lift the flash so the new place is revealed while its story unfolds.
    builder();
    await wait(500);
    if (opts.flash !== false) {
      flash.classList.remove("on");
    }
  }

  function next() {
    index++;
    if (index < scenes.length) {
      transitionTo(scenes[index]);
    }
  }

  // ---- interaction: a floating field of clickable nodes -------------------
  //  Reveals items[i] in a card when node i is clicked. Resolves when all
  //  (or `required`) have been found.
  function discoveryField(container, items, opts = {}) {
    return new Promise((resolve) => {
      const field = el("div", "field");
      container.appendChild(field);

      const counter = el("div", "found-count");
      document.body.appendChild(counter);
      requestAnimationFrame(() => counter.classList.add("in"));

      const card = el("div", "card");
      card.innerHTML = `<h3></h3><p></p>`;
      document.body.appendChild(card);

      const required = opts.required ?? items.length;
      let found = 0;
      const tint = opts.tint || "#fff6c9";

      // scatter nodes in a loose grid to avoid overlap
      const cols = Math.ceil(Math.sqrt(items.length));
      items.forEach((item, i) => {
        const node = el("div", "node light-node", Icons.light(tint, i % 3));
        const col = i % cols, row = Math.floor(i / cols);
        const cx = ((col + 0.5) / cols) * 100 + (Math.sin(i * 2.3) * 6);
        const cy = ((row + 0.5) / Math.ceil(items.length / cols)) * 100 + (Math.cos(i * 1.7) * 6);
        node.style.left = Math.max(8, Math.min(92, cx)) + "%";
        node.style.top = Math.max(12, Math.min(88, cy)) + "%";
        node.style.animationDelay = (i * 0.4) + "s";

        node.addEventListener("click", (e) => {
          if (node.classList.contains("found")) {
            showCard(item);
            return;
          }
          node.classList.add("found");
          found++;
          Sound.chime(i);
          const rect = node.getBoundingClientRect();
          Atmosphere.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, "#fff6c9", 16);
          showCard(item);
          updateCounter();
          if (found >= required) {
            setTimeout(() => {
              cleanup();
              resolve();
            }, opts.holdAfter ?? 2600);
          }
        });
        field.appendChild(node);
      });

      function showCard(item) {
        card.querySelector("h3").textContent = T(item.title || "");
        card.querySelector("h3").style.display = item.title ? "block" : "none";
        card.querySelector("p").textContent = T(item.text || item.body || "");
        card.classList.add("show");
        clearTimeout(card.__timer);
        card.__timer = setTimeout(() => card.classList.remove("show"), 6500);
      }
      function updateCounter() {
        counter.textContent =
          found >= required
            ? T(opts.doneLabel || "the realm remembers you")
            : `${found} / ${required} ${opts.unit || "found"}`;
      }
      function cleanup() {
        counter.classList.remove("in");
        setTimeout(() => counter.remove(), 1200);
      }
      updateCounter();
    });
  }

  /* =========================================================================
   *  THE SCENES
   * =======================================================================*/

  // 0 — Awakening / title
  async function sceneAwaken() {
    const s = newScene("night", "default");
    s.appendChild(el("h1", null, "The Forgotten Queen"));
    await wait(1400);
    await narrate(s, QUEEN.opening, { gap: 2600 });
    await wait(800);
    await continuePrompt(s, "a light stirs — follow it");
    next();
  }

  // 1 — The Whispering Forest
  async function sceneForest() {
    const s = newScene("forest");
    s.appendChild(el("h2", null, "The Whispering Forest"));
    await narrate(s, [QUEEN.forest.intro], { gap: 2600 });
    await wait(400);
    const items = QUEEN.forest.whispers.map((w) => ({ text: w }));
    await discoveryField(s, items, {
      tint: "#eaffc0",
      unit: "whispers heard",
      doneLabel: "the trees have told you everything they kept",
      required: Math.min(4, items.length),
      holdAfter: 3200,
    });
    await continuePrompt(s, "walk on toward the water");
    next();
  }

  // 2 — The River of Memories
  async function sceneRiver() {
    const s = newScene("river");
    s.appendChild(el("h2", null, "The River of Memories"));
    await narrate(s, [QUEEN.river.intro], { gap: 2800 });
    await wait(400);
    await discoveryField(s, QUEEN.river.memories, {
      tint: "#c4ecff",
      unit: "memories retold",
      doneLabel: "the river has given back all it held",
      holdAfter: 3400,
    });
    await continuePrompt(s, "the current carries you onward");
    next();
  }

  // 3 — The Library of Unwritten Things
  async function sceneLibrary() {
    const s = newScene("library");
    s.appendChild(el("h2", null, "The Library of Unwritten Things"));
    await narrate(s, [QUEEN.library.intro], { gap: 2800 });
    await wait(400);
    const items = QUEEN.library.letters.map((l) => ({ title: l.cover, text: l.text }));
    await discoveryField(s, items, {
      tint: "#ffe6b0",
      unit: "pages opened",
      doneLabel: "every unwritten thing has been read",
      holdAfter: 3800,
    });
    await continuePrompt(s, "step into the open air");
    next();
  }

  // 4 — The Blooming Meadow (proximity blooms)
  async function sceneMeadow() {
    const s = newScene("meadow");
    s.appendChild(el("h2", null, "The Blooming Meadow"));
    await narrate(s, [QUEEN.meadow.intro], { gap: 2800 });

    const field = el("div", "field");
    field.style.height = "min(50vh, 460px)";
    field.style.width = "min(1000px, 92vw)";
    s.appendChild(field);

    const flowers = [];
    const kinds = ["blossom", "tulip", "daisy", "rose", "lotus"];
    const total = 26;
    for (let i = 0; i < total; i++) {
      const f = el("div", "flower", Icons.get(kinds[i % kinds.length]));
      f.style.left = (5 + Math.random() * 90) + "%";
      f.style.top = (10 + Math.random() * 80) + "%";
      const sz = 30 + Math.random() * 30;
      f.style.width = sz + "px";
      f.style.height = sz + "px";
      field.appendChild(f);
      flowers.push(f);
    }

    let bloomed = 0;
    const onMove = (e) => {
      flowers.forEach((f) => {
        if (f.classList.contains("bloom")) return;
        const r = f.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (dx * dx + dy * dy < 12000) {
          f.classList.add("bloom");
          bloomed++;
          Sound.chime();
          Atmosphere.burst(r.left + r.width / 2, r.top + r.height / 2, "#ffc7e6", 8);
          if (bloomed === Math.floor(total * 0.6)) {
            narrate(s, [QUEEN.meadow.line], { gap: 2000 });
          }
        }
      });
    };
    window.addEventListener("pointermove", onMove);

    await wait(1200);
    const cont = await continuePrompt(s, "wander among the flowers, then follow the light");
    window.removeEventListener("pointermove", onMove);
    next();
  }

  // 5 — The Grove of Spirits (virtues)
  async function sceneGrove() {
    const s = newScene("grove");
    s.appendChild(el("h2", null, "The Grove of Spirits"));
    await narrate(s, [QUEEN.grove.intro], { gap: 2800 });
    await wait(400);
    const items = QUEEN.grove.virtues.map((v) => ({ title: v.name, text: v.word }));
    await discoveryField(s, items, {
      tint: "#e0d0ff",
      unit: "spirits greeted",
      doneLabel: "the spirits bow — they know you now",
      holdAfter: 3600,
    });
    await continuePrompt(s, "one last soul waits ahead");
    next();
  }

  // 6 — The Ancient Tree (wisdom)
  async function sceneTree() {
    const s = newScene("tree");
    s.appendChild(el("h2", null, "The Ancient Tree"));
    await narrate(s, [QUEEN.ancientTree.intro], { gap: 2600 });
    await wait(600);
    await narrate(s, QUEEN.ancientTree.wisdom, { gap: 3400, chime: true });
    await wait(800);
    await continuePrompt(s, "there is one place left — the palace of light");
    next();
  }

  // 7 — The Crystal Palace + coronation + finale
  async function scenePalace() {
    const s = newScene("palace");
    Atmosphere.showGuide(false);
    s.appendChild(el("h2", null, "The Crystal Palace"));
    await narrate(s, [QUEEN.palace.intro], { gap: 2600 });
    await wait(500);
    await narrate(s, QUEEN.palace.crownLines, { gap: 2600, chime: true });
    await wait(1000);

    // gather all light into a crown — the cinematic climax
    document.getElementById("letterbox").classList.add("on");
    Sound.swell(6);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.34;
    await new Promise((resolve) => {
      Atmosphere.weaveCrown(cx, cy, Math.min(150, window.innerWidth * 0.13), resolve);
      // keep motes gathering while it weaves
      const gatherer = setInterval(() => {
        Atmosphere.burst(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          "#fff6c9", 4
        );
      }, 220);
      setTimeout(() => clearInterval(gatherer), 6000);
    });

    // coronation word
    const cor = el("div", "coronation-text reveal", T(QUEEN.palace.coronation));
    cor.style.marginTop = "18vh";
    s.appendChild(cor);
    requestAnimationFrame(() => cor.classList.add("in"));
    Sound.swell(5);
    for (let i = 0; i < 40; i++) {
      setTimeout(() => Atmosphere.burst(
        window.innerWidth / 2 + (Math.random() - 0.5) * 300,
        window.innerHeight * 0.34,
        "#fff6c9", 6), i * 80);
    }
    await wait(4200);

    await continuePrompt(s, "there is one more thing she wishes to tell you");
    // to finale
    finale();
  }

  // ---- Finale: video message OR animated closing --------------------------
  async function finale() {
    if (sceneEl) sceneEl.classList.add("leaving");
    flash.classList.add("on");
    Sound.swell(4);
    await wait(1600);
    if (sceneEl) sceneEl.remove();
    Atmosphere.releaseCrown();

    if (QUEEN.finaleVideo) {
      const wrap = document.getElementById("finale-video");
      const vid = el("video");
      vid.src = QUEEN.finaleVideo;
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      wrap.appendChild(vid);
      wrap.classList.add("show");
      Sound.fadeOut(4); // let the message be heard
      await wait(400);
      flash.classList.remove("on");
    } else {
      const wrap = document.getElementById("closing");
      wrap.classList.add("show");
      flash.classList.remove("on");
      for (const line of QUEEN.closing) {
        const p = el("p", "reveal", T(line));
        wrap.appendChild(p);
        requestAnimationFrame(() => p.classList.add("in"));
        Sound.chime();
        await wait(3000);
      }
      // soft endless firefly rain
      setInterval(() => {
        Atmosphere.burst(
          Math.random() * window.innerWidth,
          -10, "#fff6c9", 3
        );
      }, 900);
    }
  }

  // ---- boot ---------------------------------------------------------------
  function init() {
    stage = document.getElementById("stage");
    backdrop = document.getElementById("backdrop");
    flash = document.getElementById("flash");
    if (window.Scenery) Scenery.init();
    scenes = [
      sceneAwaken, sceneForest, sceneRiver, sceneLibrary,
      sceneMeadow, sceneGrove, sceneTree, scenePalace,
    ];
    index = 0;
    scenes[0]();
  }

  // allow skipping the current scene's narration to the continue prompt
  function skip() {
    const c = document.querySelector(".scene.active .continue");
    if (c) { c.click(); return; }
    // if no continue yet, force-advance
    next();
  }

  return { init, skip, next };
})();

window.Journey = Journey;
