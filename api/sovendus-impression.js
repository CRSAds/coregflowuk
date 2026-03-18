// api/sovendus-impression.js (UK VERSION)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const { t_id, offer_id, sub_id, source = "flow", event = "impression" } = req.body || {};
    if (!t_id) return res.status(400).json({ ok: false, error: "missing_t_id" });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let normalizedSource = "flow";
    if (source === "exit") normalizedSource = "exit";
    else if (source === "sovendus_exit_direct") normalizedSource = "sovendus_exit_direct";

    // 👇 Let op de _uk toevoeging hier!
    const table = event === "click" ? "sovendus_clicks_uk" : "sovendus_impressions_uk";

    const payload = {
      t_id, offer_id: offer_id || "unknown", sub_id: sub_id || "unknown", source: normalizedSource,
    };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) return res.status(500).json({ ok: false });
    return res.json({ ok: true, event, table, source: normalizedSource });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
}
