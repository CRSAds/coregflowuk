import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // 1. CORS & Cache Setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // 2. Veiligheidscheck
    if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_TOKEN) {
      throw new Error("❌ Environment Variables DIRECTUS_URL of DIRECTUS_TOKEN ontbreken in Vercel.");
    }

    // 3. Data ophalen
    // ⚠️ FIX: Collectie naam aangepast naar 'co_sponsors' (met underscore)
    // Pas eventueel de &filter[country_code][_eq]=UK aan als dat veld anders heet in jouw DB
    const url = `${process.env.DIRECTUS_URL}/items/co_sponsors`
      + `?filter[status][_eq]=published`
      + `&fields=name,description,address,url_privacy,url_terms,logo.id,cid,sid`; // cid en sid toegevoegd voor lead submit

    console.log("Fetching URL:", url);

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    // 4. Data Transformatie
    const data = (json.data || []).map((s) => {
      let logoUrl = null;
      if (s.logo && s.logo.id) {
        // Zorg dat je base URL hier klopt met je CMS
        const baseUrl = "https://cms.core.909play.com"; 
        logoUrl = `${baseUrl}/assets/${s.logo.id}`;
      }

      return {
        name: s.name || "",
        description: s.description || "",
        address: s.address || "",
        url_privacy: s.url_privacy || "#",
        url_terms: s.url_terms || "#",
        logo: logoUrl,
        cid: s.cid || "", // Nodig voor submit
        sid: s.sid || ""  // Nodig voor submit
      };
    });

    // 5. Succes
    res.status(200).json({ data });

  } catch (err) {
    console.error("❌ API ERROR:", err.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message 
    });
  }
}
