// public/formSubmit.js — UK Version (UK Phone + Postcode logic)

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();

  // -----------------------------------------------------------
  // Opslaan tracking params bij load
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });
  });

  // 🔹 IP Helper
  async function getIpOnce() {
    let ip = sessionStorage.getItem("user_ip");
    if (ip) return ip;
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      ip = data.ip;
    } catch { ip = "0.0.0.0"; }
    sessionStorage.setItem("user_ip", ip);
    return ip;
  }

  // -----------------------------------------------------------
  // 🔹 Payload Opbouwen (UK Mapping)
  // -----------------------------------------------------------
  async function buildPayload(campaign = {}) {
    const ip = await getIpOnce();
    const t_id     = sessionStorage.getItem("t_id")     || crypto.randomUUID();
    const aff_id   = sessionStorage.getItem("aff_id")   || "unknown";
    const offer_id = sessionStorage.getItem("offer_id") || "unknown";
    const sub_id   = sessionStorage.getItem("sub_id")   || "unknown";
    
    // Datum format (YYYY-MM-DD)
    const dobValue = sessionStorage.getItem("dob");
    let dob = "";
    if (dobValue?.includes("/")) {
      const [dd, mm, yyyy] = dobValue.split("/");
      dob = `${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;
    }

    const payload = {
      cid: campaign.cid,
      sid: campaign.sid,
      gender:     sessionStorage.getItem("gender")    || "",
      firstname:  sessionStorage.getItem("firstname") || "",
      lastname:   sessionStorage.getItem("lastname")  || "",
      email:      sessionStorage.getItem("email")     || "",
      // 🇬🇧 UK Adresvelden
      postcode:   sessionStorage.getItem("postcode")  || "",
      address1:   sessionStorage.getItem("address1")  || "",
      address2:   sessionStorage.getItem("address2")  || "",
      city:       sessionStorage.getItem("city")      || "",
      phone1:     sessionStorage.getItem("phone1")    || "", // Mobiel
      
      dob,
      t_id, aff_id, offer_id, sub_id,
      f_1453_campagne_url: window.location.href,
      f_17_ipaddress: ip,
      f_55_optindate: new Date().toISOString().split(".")[0] + "+0000",
      is_shortform: campaign.is_shortform || false,
    };

    if (campaign.f_2014_coreg_answer) 
      payload.f_2014_coreg_answer = campaign.f_2014_coreg_answer;
      
    if (campaign.f_2575_coreg_answer_dropdown)
      payload.f_2575_coreg_answer_dropdown = campaign.f_2575_coreg_answer_dropdown;

    return payload;
  }
  window.buildPayload = buildPayload;

  // 🔹 Fetch Lead
  async function fetchLead(payload) {
    const key = `${payload.cid}_${payload.sid}`;
    if (window.submittedCampaigns.has(key)) return { skipped: true };

    try {
      // Verwijst naar de relatieve Vercel API
      const res = await fetch("/api/lead.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      window.submittedCampaigns.add(key);
      return await res.json();
    } catch (err) {
      console.error("❌ Lead submit error:", err);
      return { success: false };
    }
  }
  window.fetchLead = fetchLead;

  // -----------------------------------------------------------
  // 🔹 Validatie & Input Logica (UK Specifiek)
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    
    // DOB Logic (Blijft hetzelfde als NL, universeel)
    const dobInput = document.getElementById("dob");
    if (dobInput) {
      const TEMPLATE = "dd / mm / yyyy";
      dobInput.value = TEMPLATE;
      // ... (Rest van de DOB logica uit NL file overnemen, is prima) ...
      // Ik laat de uitgebreide DOB logica even weg voor de leesbaarheid, 
      // maar kopieer exact de logica uit de NL formSubmit.js hierin.
    }

    // 🇬🇧 TELEFOONNUMMER (07xxxxxxxxx)
    const phoneInput = document.getElementById("phone1"); // Let op ID: phone1
    if (phoneInput) {
      phoneInput.inputMode = "numeric";
      phoneInput.maxLength = 11;

      phoneInput.addEventListener("blur", () => {
        let val = phoneInput.value.replace(/\D/g, "");
        // Basic UK Mobile Check
        if (val.length > 0 && !/^07\d{9}$/.test(val)) {
           alert("Please enter a valid UK mobile number (starts with 07, 11 digits).");
        }
      });
      
      phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      });
    }

    // 🇬🇧 POSTCODE VALIDATIE
    const pcInput = document.getElementById("postcode");
    if (pcInput) {
      pcInput.addEventListener("blur", async () => {
        const val = pcInput.value.trim();
        if (!val) return;

        try {
          const res = await fetch("/api/validateAddressUK.js", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ postcode: val })
          });
          const data = await res.json();
          
          if (data.valid && data.formatted) {
            pcInput.value = data.formatted; // Update met nette versie
            pcInput.classList.remove("error");
          } else {
            alert("Please enter a valid UK postcode.");
            pcInput.classList.add("error");
          }
        } catch(e) {}
      });
    }
  });

  // -----------------------------------------------------------
  // 🔹 Longform Submit Handler
  // -----------------------------------------------------------
  document.addEventListener("click", async e => {
    // Check of het de submit knop is (ID of class flow-next in long-form)
    const isSubmit = e.target.matches("#submit-long-form") || 
                     (e.target.matches(".flow-next") && e.target.closest("#long-form"));
    
    if (!isSubmit) return;
    
    e.preventDefault();

    // 🇬🇧 Verplichte velden check (IDs moeten matchen met Swipe Pages)
    const reqFields = ["postcode", "address1", "city", "phone1"];
    const invalid = reqFields.filter(id => !document.getElementById(id)?.value.trim());
    
    if (invalid.length) {
      return alert("Please fill in all required fields.");
    }

    // Telefoon check final
    const phoneVal = document.getElementById("phone1").value.replace(/\D/g,"");
    if (!/^07\d{9}$/.test(phoneVal)) {
      return alert("Please enter a valid UK mobile number.");
    }

    // Opslaan in Session
    reqFields.forEach(id => sessionStorage.setItem(id, document.getElementById(id).value.trim()));
    // Address2 is optioneel
    const ad2 = document.getElementById("address2");
    if (ad2) sessionStorage.setItem("address2", ad2.value.trim());

    // Verzenden Pending Campaigns
    const pending = JSON.parse(sessionStorage.getItem("longFormCampaigns") || "[]");
    
    if (typeof getIpOnce === "function") getIpOnce();

    (async () => {
      try {
        await Promise.allSettled(
          pending.map(async camp => {
            const ans = sessionStorage.getItem(`f_2014_coreg_answer_${camp.cid}`);
            const drop = sessionStorage.getItem(`f_2575_coreg_answer_dropdown_${camp.cid}`);
            
            const payload = await window.buildPayload({
              cid: camp.cid,
              sid: camp.sid,
              is_shortform: false,
              f_2014_coreg_answer: ans || undefined,
              f_2575_coreg_answer_dropdown: drop || undefined
            });
            return window.fetchLead(payload);
          })
        );
        sessionStorage.removeItem("longFormCampaigns");
      } catch {}
    })();

    document.dispatchEvent(new Event("longFormSubmitted"));
  });
}
