// api/lead.js — UK Version
// Mapt UK velden naar Databowl & handelt caps af

import querystring from "querystring";

export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    const body = req.body || {};
    
    // 🇬🇧 UK Veldnamen
    const {
      cid, sid, firstname, lastname, email, gender, dob,
      postcode, address1, address2, city, phone1,
      is_shortform, f_2014_coreg_answer, f_2575_coreg_answer_dropdown,
      f_1453_campagne_url, t_id, offer_id, aff_id, sub_id
    } = body;

    // Detecteer shortform (geen adres/telefoon)
    const isShort =
      is_shortform === true ||
      (!postcode && !phone1 && !city);

    const params = new URLSearchParams();

    // ===== Basisvelden =====
    if (cid) params.set("cid", cid);
    if (sid) params.set("sid", sid);
    if (firstname) params.set("f_3_firstname", firstname);
    if (lastname) params.set("f_4_lastname", lastname);
    if (email) params.set("f_1_email", email);
    if (gender) params.set("f_2_title", gender); // Verwacht: Mr, Mrs, Ms, Miss
    if (dob) params.set("f_5_dob", dob); // Verwacht: YYYY-MM-DD

    // ===== Tracking =====
    if (f_1453_campagne_url) params.set("f_1453_campagne_url", f_1453_campagne_url);
    if (t_id) params.set("f_1322_transaction_id", t_id);
    if (offer_id) params.set("f_1687_offer_id", offer_id);
    if (aff_id) params.set("f_1685_aff_id", aff_id);
    if (sub_id) params.set("f_1684_sub_id", sub_id);
    if (body.f_17_ipaddress) params.set("f_17_ipaddress", body.f_17_ipaddress);

    const optindate = body.f_55_optindate || new Date().toISOString().split(".")[0] + "+0000";
    params.set("f_55_optindate", optindate);

    // ===== UK Longform Velden =====
    if (!isShort) {
      if (postcode) params.set("f_11_postcode", postcode);
      if (address1) params.set("f_6_address1", address1);
      if (address2) params.set("f_7_address2", address2); // Optioneel
      if (city)     params.set("f_9_towncity", city);
      if (phone1)   params.set("f_12_phone1", phone1);
    }

    // ===== Coreg Antwoorden =====
    if (f_2014_coreg_answer?.trim()) params.set("f_2014_coreg_answer", f_2014_coreg_answer.trim());
    if (f_2575_coreg_answer_dropdown?.trim()) params.set("f_2575_coreg_answer_dropdown", f_2575_coreg_answer_dropdown.trim());

    // ===== Databowl Submit =====
    const databowlUrl = "https://crsadvertising.databowl.com/api/v1/lead";
    
    const resp = await fetch(databowlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const text = await resp.text();
    const json = JSON.parse(text || "{}");

    // ===== CAP Handling (Directus Pause) =====
    if (json?.error?.msg === "TOTAL_CAP_REACHED") {
      console.warn(`⚠️ CAP REACHED for UK campaign cid=${cid}, sid=${sid}`);
      
      const tomorrow = new Date();
      tomorrow.setUTCHours(0, 0, 0, 0);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      // Functie om Directus items te pauzeren
      const pauseCollection = async (collection) => {
        try {
          const findRes = await fetch(
            `${process.env.DIRECTUS_URL}/items/${collection}?filter[cid][_eq]=${cid}&filter[sid][_eq]=${sid}&fields=id`,
            { headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` } }
          );
          const findJson = await findRes.json();
          const item = findJson.data?.[0];

          if (item) {
            await fetch(`${process.env.DIRECTUS_URL}/items/${collection}/${item.id}`, {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${process.env.DIRECTUS_TOKEN}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ is_live: false, paused_until: tomorrow.toISOString() })
            });
            console.log(`🚫 ${collection} ${item.id} paused until tomorrow`);
          }
        } catch (e) { console.error("Pause error:", e); }
      };

      await pauseCollection("coreg_campaigns");
      await pauseCollection("co_sponsors");

      return res.status(200).json({ success: false, message: "Cap reached, campaign paused" });
    }

    if (!resp.ok) {
      console.error("❌ Databowl error:", text);
      return res.status(resp.status).json({ success: false, error: text });
    }

    res.status(200).json({ success: true, response: text });

  } catch (err) {
    console.error("💥 Lead API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
