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
    // 2. Veiligheidscheck: Zijn de vars er wel?
    if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_TOKEN) {
      throw new Error("❌ Environment Variables DIRECTUS_URL of DIRECTUS_TOKEN ontbreken in Vercel.");
    }

    // 3. Data ophalen
    // We filteren op 'published' status. Voeg eventueel &filter[country_code][_eq]=UK toe als je dat hebt.
    const url = `${process.env.DIRECTUS_URL}/items/cosponsors`
      + `?filter[status][_eq]=published`
      + `&filter[country_code][_eq]=UK`
      + `&fields=name,description,address,url_privacy,url_terms,logo.id`;

    console.log("Fetching URL:", url); // Log voor debugging in Vercel logs

    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    // 4. Data Transformatie (Veilig)
    const data = (json.data || []).map((s) => {
      // Veilige check voor logo URL
      let logoUrl = null;
      if (s.logo && s.logo.id) {
        // Zorg dat er geen dubbele slashes ontstaan
        const baseUrl = "https://cms.core.909play.com"; 
        logoUrl = `${baseUrl}/assets/${s.logo.id}`;
      }

      return {
        name: s.name || "",
        description: s.description || "",
        address: s.address || "",
        url_privacy: s.url_privacy || "#",
        url_terms: s.url_terms || "#",
        logo: logoUrl
      };
    });

    // 5. Succes
    res.status(200).json({ data });

  } catch (err) {
    console.error("❌ CRITICAL API ERROR:", err.message);
    
    // Stuur de echte foutmelding terug zodat je hem in de browser (Network tab) kunt zien
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message 
    });
  }
}
