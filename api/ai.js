// Hercab AI: Gemini 2.5 Flash through Vercel AI Gateway.
// Authenticates with the project's own Vercel OIDC token, so no API key is stored anywhere.
const LV = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LVD = {
  A1: "very basic, 6-8 words, present simple",
  A2: "very simple, short, everyday words",
  B1: "simple and clear, common vocabulary",
  B2: "natural, moderately complex",
  C1: "advanced, with a subordinate clause and academic vocabulary",
  C2: "sophisticated and nuanced, like a quality newspaper essay",
};
const clean = (s, n = 80) => String(s ?? "").replace(/[\r\n"]/g, " ").trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || req.headers["x-vercel-oidc-token"];
  if (!token) return res.status(503).json({ error: "no_gateway_auth" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const word = clean(body.word, 60);
  if (!word) return res.status(400).json({ error: "word required" });
  const mode = body.mode === "example" ? "example" : "fill";
  const level = LV.includes(String(body.level)) ? String(body.level) : "B2";
  const def = clean(body.def, 160), avoid = clean(body.avoid, 300);

  const prompt = mode === "fill"
    ? `You help a Turkish speaker learn English vocabulary (themes: history, politics, economics, philosophy). For the English word "${word}" return only a JSON object with keys: "tr" (Turkish translation, 1-3 words, most common sense; two senses comma-separated), "def" (plain easy-English meaning, max 12 words), "ex" (one natural example sentence using the word, B2-C1, on one of the themes if natural), "lvl" (CEFR level of that example sentence: one of A1,A2,B1,B2,C1,C2), "wl" (CEFR level of the word itself as in the Oxford/Cambridge lists: one of A1,A2,B1,B2,C1,C2), "col" (1-2 common collocations joined with " · ").`
    : `Write ONE natural English example sentence that uses the word "${word}"${def ? ` (meaning: ${def})` : ""} and is exactly CEFR ${level} level: ${LVD[level]}. Theme: history, politics, economics or philosophy when it fits. Keep "${word}" or a form of it in the sentence.${avoid ? ` It must be different from: "${avoid}".` : ""} Return only JSON {"ex":"..."}.`;

  try {
    const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: mode === "example" ? 0.9 : 0.4,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "gateway_" + r.status, detail: (await r.text()).slice(0, 300) });
    const g = await r.json();
    const text = String(g?.choices?.[0]?.message?.content ?? "").replace(/^```(json)?|```$/g, "").trim();
    const out = JSON.parse(text);
    if (mode === "example") return res.status(200).json({ ex: clean(out.ex, 400), lvl: level });
    return res.status(200).json({
      tr: clean(out.tr), def: clean(out.def, 160), ex: clean(out.ex, 400),
      lvl: LV.includes(String(out.lvl)) ? out.lvl : "B2",
      wl: LV.includes(String(out.wl)) ? out.wl : "B2",
      col: clean(out.col, 120),
    });
  } catch (e) {
    return res.status(502).json({ error: "ai_failed" });
  }
};
