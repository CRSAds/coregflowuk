// api/validateAddressUK.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { postcode } = req.body || {};

    if (!postcode) return res.status(400).json({ valid: false });

    // UK Postcode Regex (vereenvoudigd maar robuust)
    // Accepteert formaten als: SW1A 1AA, M1 1AA, B33 8TH
    const ukRegex = /^([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})$/i;
    
    const isValid = ukRegex.test(postcode.trim());

    if (isValid) {
      return res.json({ 
        valid: true, 
        formatted: postcode.toUpperCase().trim() 
      });
    } else {
      return res.json({ valid: false });
    }
  } catch (e) {
    return res.status(500).json({ valid: false, error: e.message });
  }
}
