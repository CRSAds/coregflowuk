import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ✅ Edge caching (1 uur)
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  try {
    // 1. Controleer Environment Variables
    if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_TOKEN) {
      throw new Error("❌ Environment Variables ontbreken in Vercel.");
    }

    // 2. Directus URL Opbouwen (volgens NL schema)
    // - Collectie: co_sponsors
    // - Filter: is_live = true
    // - Filter: Country = UK of NULL
    const url = `${process.env.DIRECTUS_URL}/items/co_sponsors`
      + `?filter[is_live][_eq]=true`
      + `&filter[_or][0][country][_null]=true`
      + `&filter[_or][1][country][_eq]=UK`
      + `&fields=title,description,logo,address,privacy_url,terms_url,cid,sid`
      + `&sort=title`;

    // 3. Fetch Data
    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    // 4. Data Mappen (Database Veldnamen -> Frontend Veldnamen)
    const data = (json.data || []).map((s) => {
      // Logo URL bouwen
      let logoUrl = null;
      if (s.logo) {
        // We gaan ervan uit dat s.logo direct de UUID is (net als in NL code)
        // Als het een object is, pakken we s.logo.id
        const logoId = typeof s.logo === 'object' ? s.logo.id : s.logo;
        const baseUrl = "https://cms.core.909play.com"; 
        logoUrl = `${baseUrl}/assets/${logoId}`;
      }

      return {
        name: s.title || "",           // DB 'title' -> Frontend 'name'
        description: s.description || "",
        address: s.address || "",
        url_privacy: s.privacy_url || "#", // DB 'privacy_url' -> Frontend 'url_privacy'
        url_terms: s.terms_url || "#",     // DB 'terms_url' -> Frontend 'url_terms'
        logo: logoUrl,
        cid: s.cid || "",
        sid: s.sid || ""
      };
    });

    console.log(`✅ ${data.length} UK co-sponsors geladen`);
    res.status(200).json({ data });

  } catch (err) {
    console.error("❌ Fout bij ophalen UK co-sponsors:", err.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message 
    });
  }
}
