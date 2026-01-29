import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Cache (1 uur)
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  try {
    // We filteren op UK (of land-agnostisch) en halen specifieke velden op
    // Let op: pas 'filter' aan als je UK specifiek moet filteren in Directus (bv country code)
    const url = `${process.env.DIRECTUS_URL}/items/cosponsors`
      + `?filter[status][_eq]=published`
      + `&fields=name,description,address,url_privacy,url_terms,logo.id`;

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    const data = (json.data || []).map((s) => ({
      name: s.name || "",
      description: s.description || "",
      address: s.address || "",
      url_privacy: s.url_privacy || "#",
      url_terms: s.url_terms || "#",
      // Bouw de volledige image URL als er een logo is
      logo: s.logo?.id 
        ? `https://cms.core.909play.com/assets/${s.logo.id}` 
        : null
    }));

    res.status(200).json({ data });
  } catch (err) {
    console.error("❌ Error fetching UK cosponsors:", err);
    res.status(500).json({ error: err.message });
  }
}
