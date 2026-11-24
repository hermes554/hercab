# Hercab · Hermes Society

Vocabulary app: flip cards with Türkçe, level-tagged example sentences (A2–C2), quiz, match and fill-the-gap games.

- `web/` — the app (one static `index.html`, icons, manifest). Vercel serves this folder.
- Sync and AI run on Supabase project `hercab`: RPCs `hercab_get` / `hercab_put`, Edge Function `hercab-ai` (Gemini, key in the `GEMINI_API_KEY` secret). The old Val Town endpoint is the fallback for AI fill.
- `legacy-expo/` — the previous Expo version, kept for reference.

On first load the app imports any words the old Hercab left in this browser's storage.
