# 🐝 Spelling Bee Adventure

A playful spelling game for children around 6 years old.
Built with React + Vite. No backend. Progress is saved in the browser.

## Games

| Game | What the child does | Why it works |
|---|---|---|
| 👀 Look & Listen | Sees the word, hears it, claps the beats, hears each letter and the meaning | Dual coding: picture + sound + text |
| 👏 Clap It | Taps once for each beat (syllable) | Phonological awareness |
| 🔍 Missing Letter | Hears the word, picks the missing letter | Phonics + easy retrieval |
| 🧩 Meaning Match | Hears a meaning, reads and picks the word | Vocabulary + reading |
| ✍️ Spell It | Look, Say, Cover, Write, Check with letter tiles | Full spelling recall |
| 🐝 Today's Practice | Mixed game of due words + a few new ones | Spaced repetition (Leitner boxes) + interleaving |

Grown-ups corner: child's name, voice speed, sound on/off, progress per quest, tricky words, reset.

## Words

All 274 words from the Junior Spelling Bee book are in `src/data/packs/`:

- Flashcard Words: Quest 1–4 (139 words)
- Phonics Workbook Words: Phonics A–E (135 words)

**To add new words**, add a JSON file to `src/data/packs/`. See [src/data/packs/README.md](src/data/packs/README.md).

## Run on your computer

```bash
npm install
npm run dev
```

Open the link it prints (usually http://localhost:5173).

## Deploy to Vercel

**Option A: GitHub (recommended, auto-deploys on every push)**

1. Push this folder to a new GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo.
3. Vercel detects Vite. Keep the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**.

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel        # first time: preview deploy
vercel --prod # production
```

## Notes

- Voice uses the browser's built-in speech. Best in Chrome, Edge or Safari.
  On Edge, the "Ana" voice is a child voice and is picked automatically.
- Progress lives in the browser of each device (localStorage).
