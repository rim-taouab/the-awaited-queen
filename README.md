# 👑 The Forgotten Queen

An immersive, hand-crafted fantasy web experience — a birthday gift for someone
who deserves to be reminded that *the world is more beautiful because she is in it.*

It is not a game. There are no scores, no combat, no menus. Only a quiet,
enchanted realm that has been waiting a long time for her to come home — and
that slowly, tenderly, reveals she was its queen all along.

---

## ✨ How to open it

Just **double-click `index.html`** — it runs in any modern browser with no
build step, no server, and no internet required (except the web font, which
falls back gracefully offline).

For the full effect: **fullscreen (F11) with headphones or good speakers.**
The music and soundscape are generated live in the browser, so there are no
audio files to manage.

---

## 💌 Making it hers — edit ONE file

Open [`js/config.js`](js/config.js). Everything personal lives there, clearly
labelled:

| What | Where in `config.js` |
|------|----------------------|
| Her name | `name` |
| The affirmations whispered by the trees | `forest.whispers` |
| Your real shared memories, retold as fairy tales | `river.memories` |
| Letters & hopes for her | `library.letters` |
| The virtues she carries | `grove.virtues` |
| The ancient tree's wisdom | `ancientTree.wisdom` |
| Every other line of narration | throughout the file |

Replace the poetic placeholders with **your** truths about her. The more
specific and real, the more it will land.

### Add your own music (optional)
Drop an `.mp3` into `assets/music/` and set:
```js
music: "assets/music/your-song.mp3",
```
Leave it as `""` to keep the built-in generated score.

### End with a video message (optional — this is the emotional peak)
Record a short heartfelt message, put it in `assets/video/`, and set:
```js
finaleVideo: "assets/video/message.mp4",
```
If left empty, a gentle animated closing message is shown instead.

---

## 🗺️ The journey

1. **Awakening** — the realm stirs from a hundred-year sleep
2. **The Whispering Forest** — affirmations hidden in the trees
3. **The River of Memories** — your shared moments, retold as fairy tales
4. **The Library of Unwritten Things** — letters and hopes
5. **The Blooming Meadow** — flowers open simply because she comes near
6. **The Grove of Spirits** — the virtues she carries
7. **The Ancient Tree** — gentle wisdom, and the first naming of the crown
8. **The Crystal Palace** — every light converges into a crown of light,
   then her personal message

Move forward by **following the light** (the glowing prompt), clicking, or
pressing **Space / Enter**. There is a discreet *"let the story move ahead ›"*
in the corner if she'd like to skip ahead, and a music toggle opposite it.

---

## 🛠️ Under the hood (for the curious)

- **No frameworks, no dependencies.** Plain HTML, CSS, and vanilla JS.
- `js/atmosphere.js` — the living particle canvas (fireflies, leaves, petals,
  spirit wisps, crystal light, the guide firefly, and the crown-weave finale).
- `js/audio.js` — a procedural ambient score (evolving pad, sparse piano
  motifs, wind, chimes) built with the Web Audio API. No sound files needed.
- `js/backdrops.js` — layered gradient skies and parallax silhouettes.
- `js/journey.js` — the scene flow and all interactions.
- `js/config.js` — **the only file you need to touch.**

Made with great care. Happy birthday to your Fairy Queen. 🧚‍♀️
