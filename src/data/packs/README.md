# Word packs (add new words here)

Every `.json` file in this folder becomes a **quest** in the game automatically.
No code changes needed.

## Add new words

1. Copy any file here, for example `11-phonics-a.json`.
2. Rename it, for example `20-my-new-words.json`.
   The number at the start only helps you keep files in order.
3. Change the details and words.
4. Save, then push to GitHub. Vercel rebuilds the site by itself.

## Format

```json
{
  "id": "my-new-words",
  "group": "My New Words",
  "title": "Quest 5",
  "subtitle": "Words from school this week",
  "emoji": "🎒",
  "color": "#FF8A3D",
  "order": 20,
  "words": [
    { "word": "Butterfly", "syllables": "But-ter-fly", "meaning": "A pretty insect with big colourful wings", "emoji": "🦋" },
    { "word": "Moon", "syllables": "Moon", "meaning": "The bright round light in the night sky", "emoji": "🌙" }
  ]
}
```

| Field | Needed? | What it does |
|---|---|---|
| `id` | yes | Unique name for the pack (no spaces). |
| `group` | no | Heading on the home screen. Packs with the same group sit together. Default: `My New Words`. |
| `title` | yes | Name of the quest card. |
| `subtitle` | no | Small line under the title. |
| `emoji` | no | Picture for the quest card. |
| `color` | no | Card colour (hex). |
| `order` | no | Lower numbers show first. |
| `words[].word` | yes | The word to spell. |
| `words[].syllables` | no | Beats split with `-`, like `Hel-i-cop-ter`. Default: the word itself (1 beat). |
| `words[].meaning` | no | Kid-friendly meaning. Used in Meaning Match. |
| `words[].emoji` | no | Picture for the word. Empty = first letter is shown. |

## Tips

- Keep the JSON valid: commas between items, no comma after the last item.
  Paste into https://jsonlint.com if unsure.
- The same word in two packs shares one progress record.
- Progress is saved by the spelling, so fixing a meaning or emoji never loses progress.
