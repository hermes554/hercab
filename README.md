# Hercab · Hermes Society

Vocabulary app: flip cards with Türkçe, level-tagged example sentences (A2–C2), quiz, match and fill-the-gap games.

- `web/` — the app (one static `index.html`, icons, manifest). Vercel serves this folder.
- Sync and AI run on Supabase project `hercab`: RPCs `hercab_get` / `hercab_put`, Edge Function `hercab-ai` (Gemini, key in the `GEMINI_API_KEY` secret). The old Val Town endpoint is the fallback for AI fill.
- `legacy-expo/` — the previous Expo version, kept for reference.

On first load the app imports any words the old Hercab left in this browser's storage.

## Word levels

`web/levels.json` is built from the [Open Language Profiles](https://github.com/openlanguageprofiles/olp-en-cefrj) data:
- CEFR-J Vocabulary Profile ver. 1.5 — © Tono Laboratory, Tokyo University of Foreign Studies (free for research and commercial use with citation).
- Octanove Vocabulary Profile C1/C2 ver. 1.0 — Octanove Labs, licensed CC BY-SA 4.0. The derived `levels.json` is shared under the same license.

Words not found in either list are treated as C2.
