// api/coreg.js — UK Version (Filtered)
import { fetchWithRetry } from "./utils/fetchDirectus.js";

let LAST_KNOWN_GOOD = null;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  // 🇬🇧 FILTER: Haal alleen campagnes op waar country = UK
  const url = `${process.env.DIRECTUS_URL}/items/coreg_campaigns`
    + `?filter[is_live][_eq]=true`
    + `&filter[country][_eq]=UK` 
    + `&fields=*,image.id,image.filename_download,coreg_answers.*,coreg_dropdown_options.*,more_info`
    + `&sort=order`;

  try {
    const json = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    });

    LAST_KNOWN_GOOD = json;
    const campaigns = normalizeCampaigns(json.data || []);

    console.log(`✅ ${campaigns.length} UK coreg campagnes geladen`);
    return res.status(200).json({ data: campaigns });

  } catch (err) {
    console.error("❌ Directus fout (UK Coreg):", err.message);
    if (LAST_KNOWN_GOOD) {
      return res.status(200).json({ data: normalizeCampaigns(LAST_KNOWN_GOOD.data || []) });
    }
    return res.status(500).json({ error: "Coreg kon niet geladen worden" });
  }
}

// Normalisatie functie blijft identiek aan NL (copy-paste of behouden)
function normalizeCampaigns(list) {
  return list.map((camp) => {
    const normalizedCid = camp.cid || camp.campaign_id || null;
    const normalizedSid = camp.sid || camp.source_id || null;

    const answers = (camp.coreg_answers || []).map((ans) => ({
      id: ans.id,
      label: ans.label || "",
      answer_value: ans.value || ans.answer_value || "",
      has_own_campaign: !!ans.has_own_campaign,
      cid: ans.has_own_campaign ? ans.cid || normalizedCid : normalizedCid,
      sid: ans.has_own_campaign ? ans.sid || normalizedSid : normalizedSid,
    }));

    const dropdowns = (camp.coreg_dropdown_options || []).map((opt) => ({
      id: opt.id,
      label: opt.label || "",
      value: opt.value || "",
      cid: opt.has_own_campaign ? opt.cid || normalizedCid : normalizedCid,
      sid: opt.has_own_campaign ? opt.sid || normalizedSid : normalizedSid,
    }));

    return {
      ...camp,
      cid: normalizedCid,
      sid: normalizedSid,
      coreg_answers: answers,
      coreg_dropdown_options: dropdowns,
    };
  });
}
