import { fetchWithRetry } from "./utils/fetchDirectus.js";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // 1. CORS & Cache Setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Cache iets korter zetten (10 min) zodat je wijzigingen sneller ziet
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // 2. Veiligheidscheck
    if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_TOKEN) {
      throw new Error("❌ Environment Variables DIRECTUS_URL of DIRECTUS_TOKEN ontbreken in Vercel.");
    }

    // 3. Data ophalen (STRICT UK)
    // We filteren nu EXPLICIT op country = 'UK'.
    // Sponsors zonder landcode (null) of met 'NL' worden hiermee genegeerd.
    const url = `${process.env.DIRECTUS_URL}/items/co_sponsors`
      + `?filter[is_live][_eq]=true`
      + `&filter[country][_eq]=UK`
      + `&fields=title,description,logo,address,privacy_url,terms_url,cid,sid`
      + `&sort=title`;

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    // 4. Data Transformatie
    const data = (json.data || []).map((s) => {
      // Logo URL bouwen
      let logoUrl = null;
      if (s.logo) {
        // Directus geeft soms een object, soms een ID string
        const logoId = typeof s.logo === 'object' ? s.logo.id : s.logo;
        const baseUrl = "https://cms.core.909play.com"; 
        logoUrl = `${baseUrl}/assets/${logoId}`;
      }

      return {
        name: s.title || "",
        description: s.description || "",
        address: s.address || "",
        url_privacy: s.privacy_url || "#",
        url_terms: s.terms_url || "#",
        logo: logoUrl,
        cid: s.cid || "",
        sid: s.sid || ""
      };
    });

    console.log(`✅ ${data.length} UK-only co-sponsors geladen`);
    res.status(200).json({ data });

  } catch (err) {
    console.error("❌ Fout bij ophalen UK co-sponsors:", err.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message 
    });
  }
}
