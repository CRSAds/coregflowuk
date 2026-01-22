// api/validateAddressUK.js — Regex validatie voor UK postcodes

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { postcode } = req.body || {};

    if (!postcode) {
      return res.status(400).json({ valid: false, error: "Missing postcode" });
    }

    // 🇬🇧 Officiële UK Postcode Regex (iets vereenvoudigd voor robuustheid)
    // Accepteert: SW1A 1AA, M1 1AA, CR2 6XH, etc. (case insensitive)
    const ukPostcodeRegex = /^([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})$/i;

    const isValid = ukPostcodeRegex.test(postcode.trim());

    if (isValid) {
      // Formatteer netjes naar hoofdletters
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
