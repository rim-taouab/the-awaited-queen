/* ============================================================================
 *  THE FORGOTTEN QUEEN — Personalization
 * ----------------------------------------------------------------------------
 *  This is the ONLY file you need to edit to make the experience personal.
 *  Everything below is written to be replaced with your own words, memories,
 *  and truths about her. Keep the poetry, or make it entirely yours.
 *
 *  Tips:
 *   - Her name appears softly throughout. Set it in QUEEN.name.
 *   - To use real music, drop an .mp3 into assets/music/ and set QUEEN.music.
 *   - To end with your video, put it in assets/video/ and set QUEEN.finaleVideo.
 *     (If left empty, a gentle animated closing message is shown instead.)
 * ==========================================================================*/

const QUEEN = {
  // ---- Her ----------------------------------------------------------------
  name: "Rihab",                // Her name (or the name only you two use)
  title: "the Fairy Queen",     // How the realm remembers her

  // ---- Optional real media (leave "" to use the built-in ambient magic) ---
  music: "assets/music/once-upon-a-dream.mp3",  // sung version — drop the file here (falls back to the built-in waltz if missing)
  finaleVideo: "",              // e.g. "assets/video/message.mp4"

  // ---- Optional painterly background photos (THE "enchanted forest" vibe) --
  //  Drop images into assets/images/ and name them here. Each scene will use
  //  its photo as a living backdrop, with fog, god-rays, foliage and fireflies
  //  layered on top for depth and motion. Leave "" to use the drawn scenery.
  //  Recommended: lush landscape images ~1920px wide (jpg/png/webp).
  images: {
    forest:  "",   // e.g. "assets/images/forest.jpg"
    river:   "",
    library: "",
    meadow:  "",
    grove:   "",
    tree:    "",
    palace:  "",
    night:   "",   // the opening / title scene
  },

  // ---- The opening whisper, as the world wakes ----------------------------
  opening: [
    "There is a realm that has been sleeping.",
    "For a hundred quiet years it has waited,",
    "keeping its light dim, its flowers folded,",
    "its rivers slow —",
    "because the one it was made for had not yet returned.",
    "Tonight, the wind changed.",
  ],

  // ---- 1. The Whispering Forest — affirmations hidden in the trees --------
  //  Each tree, when found, whispers a truth about her.
  forest: {
    intro: "The old trees lean close. They have been holding these words for you.",
    whispers: [
      "You make rooms warmer simply by entering them.",
      "Your kindness is not softness — it is strength that chose gentleness.",
      "You listen in a way that makes people feel finally heard.",
      "There is a light in you that even you forget to notice.",
      "You carry other people's storms so patiently, and still you bloom.",
      "The way you love is quiet, steady, and completely unforgettable.",
    ],
  },

  // ---- 2. The River of Memories — shared moments as fairy tales -----------
  //  Retell YOUR real memories here, dressed as gentle fairy tales.
  river: {
    intro: "The river remembers everything. Trail your hand in it, and it will retell your days as the stories they truly were.",
    memories: [
      {
        title: "The Day the Lanterns Met",
        tale: "Once, two small lights drifted through the same crowded dark and, against every chance, found each other. Neither has drifted alone since.",
      },
      {
        title: "The Winter We Kept Warm",
        tale: "There was a cold season the world turned grey — and still, in one small room, there was laughter enough to keep two hearts in summer.",
      },
      {
        title: "The Long Road Home",
        tale: "They walked further than they meant to, got lost more than once, and would tell you now that every wrong turn was worth the company.",
      },
      {
        title: "The Ordinary Tuesday",
        tale: "Nothing was supposed to happen that day. And yet she smiled at something small, and the whole world quietly rearranged itself to be better.",
      },
    ],
  },

  // ---- 3. The Library of Unwritten Things — letters & hopes ---------------
  library: {
    intro: "Here the realm keeps the things not yet said aloud — the hopes it holds for you. Open a book. Read slowly.",
    letters: [
      {
        cover: "For the Year Ahead",
        text: "May 23 feel less like a number and more like a doorway. May this year be softer to you than the last, and may it give back even a fraction of what you give the world.",
      },
      {
        cover: "For the Hard Days",
        text: "On the days you feel small or unsure — remember that whole forests have grown from someone as quiet and stubborn and luminous as you. You are not behind. You are becoming.",
      },
      {
        cover: "A Wish, Unsigned",
        text: "I hope you are, one day, loved exactly as attentively as you love others. I hope you catch yourself in a mirror and, for once, see what everyone else already sees.",
      },
      {
        cover: "The One True Thing",
        text: "The world is more beautiful because you are in it. That is not a birthday nicety. It is the plainest fact this whole realm was built to tell you.",
      },
    ],
  },

  // ---- 4. The Blooming Meadow — flowers open because she approaches -------
  meadow: {
    intro: "Walk slowly. The flowers here have been closed for a long time. They only ever needed you to come near.",
    line: "See how they open — not because you asked, but simply because you are here.",
  },

  // ---- 5. The Grove of Spirits — the virtues she carries ------------------
  grove: {
    intro: "The spirits gather. Each one is a thing you carry so naturally you have forgotten it is rare.",
    virtues: [
      { name: "Tenderness", word: "You treat fragile things — people, moments, yourself — as though they matter. Because they do." },
      { name: "Courage",    word: "You are gentle, and you are brave. You have kept going through things you never speak of." },
      { name: "Wonder",     word: "You still stop for small beauties. A sky, a song, a stranger's kindness. You never grew that out." },
      { name: "Devotion",   word: "When you love, you love wholly. The people lucky enough to be yours are never in doubt of it." },
      { name: "Grace",      word: "You forgive quickly and hold grudges poorly. The world is lighter for how easily you let it be." },
    ],
  },

  // ---- 6. The Ancient Tree — gentle wisdom --------------------------------
  ancientTree: {
    intro: "The oldest living thing in the realm has been waiting to tell you one thing.",
    wisdom: [
      "You have spent so long making yourself small enough to fit into other people's comfort.",
      "But this realm did not wake for someone small.",
      "It woke for a queen.",
      "Not the kind who rules — the kind who tends. Who mends. Who makes the world gentler by being in it.",
      "That crown was always yours. You simply set it down somewhere and forgot.",
    ],
  },

  // ---- 7. The Crystal Palace — the finale ---------------------------------
  palace: {
    intro: "Everything the realm remembers about you is gathering now.",
    crownLines: [
      "Every whisper from the forest —",
      "every memory in the river —",
      "every hope in the library —",
      "every flower, every spirit, every light —",
      "is coming to weave a single crown.",
      "Not of gold. Not of power.",
      "A crown of light — because the truest royalty was never taken.",
      "It was earned, quietly, through kindness.",
    ],
    coronation: "Welcome home, Queen.",
  },

  // ---- The closing message (used if no finaleVideo is set) ----------------
  closing: [
    "Happy Birthday, my Fairy Queen.",
    "The realm will keep its light on now.",
    "It knows you will come back.",
    "It always knew.",
  ],
};

window.QUEEN = QUEEN;
