/* ============================================================================
 *  Icons — hand-drawn SVG artwork (no emoji).
 *  A cohesive illuminated-storybook set: soft gold linework, gentle washes of
 *  colour, rounded joins. Every glyph in the realm is drawn here.
 *  CSS sizes them (.node svg / .flower svg / .crest svg); viewBox is 0 0 64 64.
 * ==========================================================================*/

const Icons = (() => {
  const S = (inner) =>
    `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  const ART = {
    // ---- Crown (crest + favicon) ----------------------------------------
    crown: S(`
      <defs><linearGradient id="crG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff6d5"/><stop offset=".5" stop-color="#f0cd77"/>
        <stop offset="1" stop-color="#cf9c3f"/></linearGradient></defs>
      <path d="M8 46 L6 20 Q6 17 8.5 19 L20 30 Q22.5 32 23.5 28.5 L30 12 Q32 7.5 34 12 L40.5 28.5 Q41.5 32 44 30 L55.5 19 Q58 17 58 20 L56 46 Z"
        fill="url(#crG)" stroke="#a5762b" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M9 45 H55 L54 54 Q54 56 52 56 H12 Q10 56 10 54 Z"
        fill="url(#crG)" stroke="#a5762b" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="32" cy="12" r="3.2" fill="#ffd9ec" stroke="#a5762b" stroke-width="1"/>
      <circle cx="6.8" cy="20" r="2.5" fill="#bfeaff" stroke="#a5762b" stroke-width=".8"/>
      <circle cx="57.2" cy="20" r="2.5" fill="#bfeaff" stroke="#a5762b" stroke-width=".8"/>
      <circle cx="20" cy="50.5" r="2.2" fill="#c9ffd9"/>
      <circle cx="32" cy="50.5" r="2.5" fill="#ffd9ec"/>
      <circle cx="44" cy="50.5" r="2.2" fill="#c9ffd9"/>`),

    // ---- Forest ----------------------------------------------------------
    tree_oak: S(`
      <path d="M28.5 58 L28.5 40 Q32 38 35.5 40 L35.5 58 Z" fill="#8a5a34"/>
      <path d="M32 8 C40 8 46 12 47 20 C54 20 56 30 49 34 C50 42 40 44.5 34 41
               C33 45 27 45 26 41 C18 44.5 10 40 15 33 C8 30 10 20 17 20 C18 12 24 8 32 8 Z"
        fill="#9fdca8" stroke="#4f8a5c" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22 26 Q30 22 32 30 M38 22 Q42 30 36 33" stroke="#e9c877" stroke-width="1.4"
        fill="none" stroke-linecap="round" opacity=".85"/>`),

    tree_pine: S(`
      <path d="M29.5 58 L34.5 58 L33.5 44 L30.5 44 Z" fill="#8a5a34"/>
      <path d="M32 8 L44 44 L20 44 Z" fill="#7ac6a0" stroke="#3f7a5c" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M24 34 Q32 30 40 34 M22 40 Q32 35 42 40" stroke="#e9c877" stroke-width="1.3"
        fill="none" stroke-linecap="round" opacity=".85"/>
      <circle cx="32" cy="9" r="2.4" fill="#fff3c4"/>`),

    sprig: S(`
      <path d="M32 56 C32 40 32 26 32 12" stroke="#6f9e5a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g fill="#a8e6b0" stroke="#4f8a5c" stroke-width="1.2" stroke-linejoin="round">
        <path d="M32 22 Q21 17 19 26 Q28 30 32 22 Z"/>
        <path d="M32 32 Q43 27 45 36 Q36 40 32 32 Z"/>
        <path d="M32 42 Q23 39 21 46 Q30 50 32 42 Z"/>
      </g>
      <circle cx="32" cy="12" r="3" fill="#ffd9ec" stroke="#d98cb0" stroke-width="1"/>`),

    leaf: S(`
      <path d="M32 7 C48 20 48 44 32 57 C16 44 16 20 32 7 Z"
        fill="#a8e6b0" stroke="#4f8a5c" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M32 12 L32 52" stroke="#4f8a5c" stroke-width="1.4"/>
      <path d="M32 24 L23 19 M32 33 L41 28 M32 42 L23 37" stroke="#4f8a5c" stroke-width="1" stroke-linecap="round"/>`),

    // ---- River -----------------------------------------------------------
    droplet: S(`
      <path d="M32 7 C44 26 48 36 48 42 A16 16 0 1 1 16 42 C16 36 20 26 32 7 Z"
        fill="#bfe6ff" stroke="#5a9bc4" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M25 42 Q23 33 30 29" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".85"/>`),

    wave: S(`
      <g stroke="#5a9bc4" stroke-width="2.6" fill="none" stroke-linecap="round">
        <path d="M8 26 Q16 17 24 26 T40 26 T56 26"/>
        <path d="M8 40 Q16 31 24 40 T40 40 T56 40"/>
      </g>
      <path d="M42 20 q9 -5 9 5 q0 8 -10 5" stroke="#e9c877" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`),

    ripple: S(`
      <ellipse cx="32" cy="44" rx="23" ry="8" fill="#7fc6a0" stroke="#3f7a5c" stroke-width="1.4"/>
      <path d="M32 44 L47 42 L44 32 Z" fill="#3f7a5c" opacity=".18"/>
      <g fill="#ffd9ec" stroke="#d98cb0" stroke-width="1.2" stroke-linejoin="round">
        <path d="M32 42 C26 32 30 21 32 18 C34 21 38 32 32 42 Z"/>
        <path d="M32 42 C22 36 19 27 19 23 C26 25 34 34 32 42 Z"/>
        <path d="M32 42 C42 36 45 27 45 23 C38 25 30 34 32 42 Z"/>
      </g>
      <circle cx="32" cy="26" r="2.4" fill="#ffe9a8"/>`),

    // ---- Library ---------------------------------------------------------
    book_open: S(`
      <path d="M32 18 C24 12 14 12 8 16 L8 46 C14 42 24 42 32 48 C40 42 50 42 56 46 L56 16 C50 12 40 12 32 18 Z"
        fill="#f4ecd8" stroke="#b8863b" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M32 18 L32 48" stroke="#b8863b" stroke-width="1.4"/>
      <g stroke="#c9a24e" stroke-width="1.1" stroke-linecap="round" opacity=".8">
        <path d="M14 23 H26 M14 29 H26 M14 35 H24"/>
        <path d="M38 23 H50 M38 29 H50 M40 35 H50"/>
      </g>`),

    scroll: S(`
      <rect x="18" y="12" width="28" height="40" rx="3" fill="#f4ecd8" stroke="#b8863b" stroke-width="1.6"/>
      <rect x="13" y="7" width="38" height="9" rx="4.5" fill="#e8dcc0" stroke="#b8863b" stroke-width="1.4"/>
      <rect x="13" y="48" width="38" height="9" rx="4.5" fill="#e8dcc0" stroke="#b8863b" stroke-width="1.4"/>
      <g stroke="#c9a24e" stroke-width="1.1" stroke-linecap="round" opacity=".8">
        <path d="M24 24 H40 M24 30 H40 M24 36 H36"/>
      </g>`),

    letter: S(`
      <rect x="10" y="18" width="44" height="30" rx="3" fill="#f4ecd8" stroke="#b8863b" stroke-width="1.6"/>
      <path d="M11 20 L32 36 L53 20" fill="none" stroke="#b8863b" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M32 39 C31 36 27 36 27 39.5 C27 42 32 45 32 45 C32 45 37 42 37 39.5 C37 36 33 36 32 39 Z"
        fill="#e79ac0" stroke="#b05a7a" stroke-width="1"/>`),

    book_closed: S(`
      <rect x="17" y="10" width="30" height="44" rx="3" fill="#c9b8f0" stroke="#7a5fae" stroke-width="1.6"/>
      <path d="M23 10 V54" stroke="#7a5fae" stroke-width="1.4"/>
      <path d="M37 24 L39 30 L45 30.5 L40.5 34.5 L42 40.5 L37 37 L32 40.5 L33.5 34.5 L29 30.5 L35 30 Z"
        fill="#fff3c4" stroke="#e0b24e" stroke-width="1" stroke-linejoin="round"/>`),

    // ---- Grove of Spirits ------------------------------------------------
    wisp: S(`
      <path d="M32 10 C42 10 46 20 46 30 C46 40 44.5 46 44 50 Q40 46 36 50 Q32 46 28 50 Q24 46 20 50
               C19.5 46 18 40 18 30 C18 20 22 10 32 10 Z"
        fill="#dfeaff" stroke="#8fb3e6" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="27" cy="28" r="1.9" fill="#3a4a6a"/>
      <circle cx="37" cy="28" r="1.9" fill="#3a4a6a"/>
      <circle cx="23.5" cy="33" r="2.2" fill="#f2b8d4" opacity=".55"/>
      <circle cx="40.5" cy="33" r="2.2" fill="#f2b8d4" opacity=".55"/>
      <path d="M29 34 Q32 37.5 35 34" stroke="#3a4a6a" stroke-width="1.3" fill="none" stroke-linecap="round"/>`),

    flame: S(`
      <path d="M32 8 C40 20 42 26 42 34 A10 10 0 1 1 22 34 C22 28 26 22 32 8 Z"
        fill="#ffd98a" stroke="#e0a84e" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M32 23 C36 29 36 35 32 41 C28 35 28 30 32 23 Z" fill="#fff3c4"/>`),

    star_spirit: S(`
      <path d="M32 6 L36 26 L56 32 L36 38 L32 58 L28 38 L8 32 L28 26 Z"
        fill="#fff3c4" stroke="#e9c877" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="3" fill="#ffffff"/>`),

    moth: S(`
      <ellipse cx="32" cy="34" rx="2.6" ry="10" fill="#7a5fae"/>
      <g fill="#cbb8f0" stroke="#7a5fae" stroke-width="1.3" stroke-linejoin="round">
        <path d="M32 27 C20 15 8 20 12 30 C8 38 18 42 32 34 Z"/>
        <path d="M32 27 C44 15 56 20 52 30 C56 38 46 42 32 34 Z"/>
        <path d="M32 37 C24 41 18 49 24 53 C30 52 32 44 32 37 Z"/>
        <path d="M32 37 C40 41 46 49 40 53 C34 52 32 44 32 37 Z"/>
      </g>
      <path d="M32 25 Q28 17 23 15 M32 25 Q36 17 41 15" stroke="#7a5fae" stroke-width="1" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="28" r="1.8" fill="#fff3c4"/><circle cx="45" cy="28" r="1.8" fill="#fff3c4"/>`),

    orb: S(`
      <circle cx="32" cy="34" r="14" fill="#bfe6ff" stroke="#6fa8d4" stroke-width="1.4" opacity=".92"/>
      <circle cx="27" cy="29" r="4" fill="#ffffff" opacity=".7"/>
      <path d="M47 15 L48.5 19 L52.5 20.5 L48.5 22 L47 26 L45.5 22 L41.5 20.5 L45.5 19 Z"
        fill="#fff3c4" stroke="#e9c877" stroke-width=".8" stroke-linejoin="round"/>`),

    // ---- Meadow flowers --------------------------------------------------
    blossom: S(`
      <g fill="#ffc7e6" stroke="#e08cb8" stroke-width="1.3" stroke-linejoin="round">
        <ellipse cx="32" cy="16" rx="7" ry="12"/>
        <ellipse cx="32" cy="16" rx="7" ry="12" transform="rotate(72 32 32)"/>
        <ellipse cx="32" cy="16" rx="7" ry="12" transform="rotate(144 32 32)"/>
        <ellipse cx="32" cy="16" rx="7" ry="12" transform="rotate(216 32 32)"/>
        <ellipse cx="32" cy="16" rx="7" ry="12" transform="rotate(288 32 32)"/>
      </g>
      <circle cx="32" cy="32" r="6" fill="#ffe9a8" stroke="#e0b24e" stroke-width="1.2"/>`),

    tulip: S(`
      <path d="M32 56 L32 34" stroke="#6f9e5a" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M32 46 Q20 42 22 52 Q30 52 32 46 Z" fill="#a8e6b0" stroke="#4f8a5c" stroke-width="1"/>
      <path d="M20 30 Q22 14 32 12 Q42 14 44 30 Q38 34 32 30 Q26 34 20 30 Z"
        fill="#f2a8c4" stroke="#d16f9a" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M32 12 V30 M27 14 Q26 24 30 30 M37 14 Q38 24 34 30" stroke="#d16f9a" stroke-width="1" fill="none"/>`),

    daisy: S(`
      <g fill="#fff6e0" stroke="#e0c98a" stroke-width="1">
        <ellipse cx="32" cy="14" rx="4" ry="11"/>
        <ellipse cx="32" cy="14" rx="4" ry="11" transform="rotate(30 32 32)"/>
        <ellipse cx="32" cy="14" rx="4" ry="11" transform="rotate(60 32 32)"/>
        <ellipse cx="32" cy="14" rx="4" ry="11" transform="rotate(90 32 32)"/>
        <ellipse cx="32" cy="14" rx="4" ry="11" transform="rotate(120 32 32)"/>
        <ellipse cx="32" cy="14" rx="4" ry="11" transform="rotate(150 32 32)"/>
      </g>
      <circle cx="32" cy="32" r="7" fill="#ffce5c" stroke="#e0a84e" stroke-width="1.2"/>`),

    rose: S(`
      <circle cx="32" cy="32" r="16" fill="#f2a8c4" stroke="#d16f9a" stroke-width="1.4"/>
      <path d="M32 32 m-9 0 a9 9 0 1 1 18 0 a6 6 0 1 1 -12 0 a3 3 0 1 1 6 0"
        fill="none" stroke="#d16f9a" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
      <path d="M18 30 Q16 22 24 20 M46 30 Q48 22 40 20" stroke="#d16f9a" stroke-width="1.2" fill="none" opacity=".6"/>`),

    lotus: S(`
      <g fill="#ffd9ec" stroke="#d98cb0" stroke-width="1.2" stroke-linejoin="round">
        <path d="M32 44 C26 32 30 21 32 17 C34 21 38 32 32 44 Z"/>
        <path d="M32 44 C22 38 18 28 18 23 C26 25 34 34 32 44 Z"/>
        <path d="M32 44 C42 38 46 28 46 23 C38 25 30 34 32 44 Z"/>
        <path d="M32 44 C18 44 10 37 8 31 C18 31 30 38 32 44 Z"/>
        <path d="M32 44 C46 44 54 37 56 31 C46 31 34 38 32 44 Z"/>
      </g>
      <path d="M20 46 Q32 52 44 46" stroke="#7fc6a0" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  };

  function get(name) { return ART[name] || ART.star_spirit; }

  // ---- Glowing light-forms for the clickable "secrets" -------------------
  //  Painterly orbs of light (not flat icons). Tinted per place, three gentle
  //  variants cycled for subtle variety. Each gets unique gradient ids.
  let _lid = 0;
  function light(tint, variant = 0) {
    const id = "L" + (_lid++);
    const halo = `<radialGradient id="${id}h" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
        <stop offset="28%" stop-color="${tint}" stop-opacity=".7"/>
        <stop offset="100%" stop-color="${tint}" stop-opacity="0"/></radialGradient>`;
    const coreG = `<radialGradient id="${id}c" cx="50%" cy="45%" r="55%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#ffffff" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${tint}" stop-opacity=".4"/></radialGradient>`;

    let rays = "";
    if (variant === 0) {
      // bloom of soft light petals
      rays = `<g class="lf-spin" fill="${tint}" opacity=".38">`;
      for (let i = 0; i < 6; i++)
        rays += `<ellipse cx="32" cy="15" rx="4.2" ry="13" transform="rotate(${i * 60} 32 32)"/>`;
      rays += `</g>`;
    } else if (variant === 1) {
      // four-point star flare
      rays = `<g class="lf-spin" fill="${tint}" opacity=".4">
        <path d="M32 4 L36 32 L32 60 L28 32 Z"/>
        <path d="M4 32 L32 28 L60 32 L32 36 Z"/></g>`;
    } else {
      // gentle orbiting sparks
      rays = `<g class="lf-spin">
        <circle cx="32" cy="10" r="2.2" fill="${tint}"/>
        <circle cx="52" cy="40" r="1.8" fill="${tint}"/>
        <circle cx="14" cy="42" r="1.8" fill="${tint}"/></g>`;
    }

    return S(`<defs>${halo}${coreG}</defs>
      <circle cx="32" cy="32" r="30" fill="url(#${id}h)"/>
      ${rays}
      <circle cx="32" cy="32" r="7" fill="url(#${id}c)"/>
      <circle cx="32" cy="32" r="3" fill="#ffffff"/>
      <circle cx="27" cy="27" r="1.4" fill="#ffffff" opacity=".9"/>`);
  }

  // ---- Little fairies that hold the hidden messages ---------------------
  //  Clearly a winged sprite carrying a glowing light — flutters & pulses so
  //  it's obvious where the whispers are. Tinted per place.
  let _fid = 0;
  function fairy(tint, variant = 0) {
    const id = "F" + (_fid++);
    const halo = `<radialGradient id="${id}h" cx="50%" cy="46%" r="55%">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".92"/>
        <stop offset="30%" stop-color="${tint}" stop-opacity=".5"/>
        <stop offset="100%" stop-color="${tint}" stop-opacity="0"/></radialGradient>`;
    const bodyG = `<radialGradient id="${id}b" cx="50%" cy="32%" r="75%">
        <stop offset="0" stop-color="#fffdf3"/>
        <stop offset="100%" stop-color="${tint}" stop-opacity=".9"/></radialGradient>`;
    const wingG = `<radialGradient id="${id}w" cx="50%" cy="50%" r="62%">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".72"/>
        <stop offset="100%" stop-color="${tint}" stop-opacity=".16"/></radialGradient>`;
    return S(`<defs>${halo}${bodyG}${wingG}</defs>
      <circle cx="32" cy="31" r="28" fill="url(#${id}h)"/>
      <g class="fairy-wings" stroke="${tint}" stroke-width="1" fill="url(#${id}w)">
        <ellipse cx="20" cy="22" rx="12" ry="17" transform="rotate(-24 20 22)"/>
        <ellipse cx="44" cy="22" rx="12" ry="17" transform="rotate(24 44 22)"/>
        <ellipse cx="22" cy="38" rx="8.5" ry="12" transform="rotate(-14 22 38)"/>
        <ellipse cx="42" cy="38" rx="8.5" ry="12" transform="rotate(14 42 38)"/>
      </g>
      <circle cx="32" cy="19" r="4.4" fill="url(#${id}b)"/>
      <path d="M32 22 C26.5 28 24.5 39 32 47 C39.5 39 37.5 28 32 22 Z" fill="url(#${id}b)"/>
      <circle cx="32" cy="45" r="6.5" fill="${tint}" opacity=".55"/>
      <circle cx="32" cy="45" r="3.6" fill="#ffffff"/>
      <circle cx="25" cy="15" r="1.3" fill="#fff" opacity=".9"/>
      <circle cx="41" cy="17" r="1.05" fill="#fff" opacity=".8"/>`);
  }

  return { get, light, fairy, ART };
})();

window.Icons = Icons;
