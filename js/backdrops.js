/* ============================================================================
 *  Backdrops — per-location sky gradients + parallax silhouette layers.
 *  Each layer is an inline SVG turned into a background image. Layers move
 *  subtly with the cursor to create depth (handled in main.js).
 * ==========================================================================*/

const Backdrops = (() => {
  const svg = (w, h, inner) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='xMidYMax slice'>${inner}</svg>`
    )}`;

  // reusable silhouette generators -----------------------------------------
  const trees = (color, n, base) => {
    let s = "";
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * 1600 + (Math.sin(i * 3.3) * 40);
      const h = 260 + Math.sin(i * 1.7) * 90;
      const w = 46 + Math.cos(i * 2.1) * 18;
      s += `<path d='M${x} ${base} L${x - w} ${base}
        Q${x - w * 0.5} ${base - h * 0.4} ${x - w * 0.35} ${base - h * 0.7}
        Q${x} ${base - h} ${x + w * 0.35} ${base - h * 0.7}
        Q${x + w * 0.5} ${base - h * 0.4} ${x + w} ${base} Z' fill='${color}'/>`;
    }
    return s;
  };
  const hills = (color, base, amp) =>
    `<path d='M0 ${base} Q400 ${base - amp} 800 ${base} T1600 ${base} V900 H0 Z' fill='${color}'/>`;

  const spires = (color, base) => {
    let s = "";
    for (let i = 0; i <= 9; i++) {
      const x = (i / 9) * 1600;
      const h = 380 + Math.sin(i * 2.2) * 160;
      const w = 60;
      s += `<path d='M${x} ${base} L${x - w} ${base} L${x} ${base - h} L${x + w} ${base} Z' fill='${color}'/>`;
    }
    return s;
  };

  // scene definitions -------------------------------------------------------
  const SCENES = {
    night: {
      sky: "radial-gradient(ellipse at 50% 15%, #b8c8f0 0%, #7d92cc 40%, #4a5e9e 75%, #33447e 100%)",
      layers: [
        { img: svg(1600, 900, hills("#3f4f86", 720, 120)), depth: 8, z: 1 },
        { img: svg(1600, 900, trees("#2e3d70", 12, 900)), depth: 20, z: 1 },
      ],
    },
    forest: {
      sky: "linear-gradient(180deg, #eaf6d8 0%, #b6e2a2 30%, #78bd78 60%, #3f8a5a 100%)",
      layers: [
        { img: svg(1600, 900, hills("#5aa060", 700, 90)), depth: 8, z: 1 },
        { img: svg(1600, 900, trees("#3f8250", 9, 900)), depth: 16, z: 1 },
        { img: svg(1600, 900, trees("#2c6a40", 14, 940)), depth: 34, z: 1 },
      ],
    },
    river: {
      sky: "linear-gradient(180deg, #e2f6f4 0%, #a8ddea 40%, #6fb6d0 75%, #4a90b0 100%)",
      layers: [
        { img: svg(1600, 900, hills("#5a9ab0", 640, 70)), depth: 10, z: 1 },
        { img: svg(1600, 900, `<path d='M0 760 Q400 720 800 760 T1600 760 V900 H0 Z' fill='%239fd0e2' opacity='0.55'/>`), depth: 26, z: 1 },
      ],
    },
    library: {
      sky: "radial-gradient(ellipse at 50% 32%, #6a5aa0 0%, #4a3c7a 55%, #33285e 100%)",
      layers: [
        { img: svg(1600, 900, `<g fill='%23473a72'>${spires("#473a72", 780)}</g>`), depth: 10, z: 1 },
        { img: svg(1600, 900, spires("#372a5e", 860)), depth: 22, z: 1 },
      ],
    },
    meadow: {
      sky: "linear-gradient(180deg, #ffe8dc 0%, #ffc4d2 35%, #e79ec0 68%, #b072a0 100%)",
      layers: [
        { img: svg(1600, 900, hills("#c98fb0", 660, 80)), depth: 8, z: 1 },
        { img: svg(1600, 900, hills("#a06f9a", 740, 120)), depth: 18, z: 1 },
      ],
    },
    grove: {
      sky: "radial-gradient(ellipse at 50% 45%, #7a68c0 0%, #574593 55%, #3c2e72 100%)",
      layers: [
        { img: svg(1600, 900, trees("#4a3a86", 8, 900)), depth: 14, z: 1 },
        { img: svg(1600, 900, trees("#3a2c6e", 12, 950)), depth: 30, z: 1 },
      ],
    },
    tree: {
      sky: "linear-gradient(180deg, #f6eec4 0%, #dcd694 38%, #a8b062 72%, #6a7a44 100%)",
      layers: [
        { img: svg(1600, 900, hills("#8a8a54", 720, 60)), depth: 8, z: 1 },
        // one enormous ancient tree in the center
        { img: svg(1600, 900, `<g fill='%234a5a38'>
          <path d='M800 900 L760 520 Q720 400 640 340 Q740 380 790 460 L800 300
          Q810 460 810 460 Q860 380 960 340 Q880 400 840 520 L800 900 Z'/>
          <ellipse cx='800' cy='300' rx='320' ry='230' opacity='0.85'/>
          <ellipse cx='600' cy='360' rx='180' ry='150' opacity='0.7'/>
          <ellipse cx='1000' cy='360' rx='180' ry='150' opacity='0.7'/>
        </g>`), depth: 20, z: 1 },
      ],
    },
    palace: {
      sky: "radial-gradient(ellipse at 50% 45%, #9fc0ee 0%, #6a8ecc 45%, #4a6aae 100%)",
      layers: [
        { img: svg(1600, 900, `<g fill='%23ffffff' opacity='0.22'>${spires("#ffffff", 800)}</g>`), depth: 12, z: 1 },
        { img: svg(1600, 900, `<g fill='%23eaf6ff' opacity='0.30'>${spires("#eaf6ff", 880)}</g>`), depth: 26, z: 1 },
      ],
    },
  };

  return { SCENES };
})();

window.Backdrops = Backdrops;
