// public/formSubmit.js — UK Version
// Bevat: Split DOB logic, UK Phone validatie, UK Postcode validatie

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();

  // -----------------------------------------------------------
  // 1. Init: Opslaan tracking params uit URL
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });
  });

  // Helper: IP ophalen (1x per sessie)
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
  // 2. Payload Opbouwen (Mappen naar API)
  // -----------------------------------------------------------
  async function buildPayload(campaign = {}) {
    const ip = await getIpOnce();
    const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();
    
    // DOB Samenstellen: DD/MM/YYYY -> YYYY-MM-DD
    let dob = "";
    const dd = sessionStorage.getItem("dob_day");
    const mm = sessionStorage.getItem("dob_month");
    const yyyy = sessionStorage.getItem("dob_year");

    if (dd && mm && yyyy) {
      dob = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    const payload = {
      cid: campaign.cid,
      sid: campaign.sid,
      
      // Persoonsgegevens
      gender:     sessionStorage.getItem("gender")    || "",
      firstname:  sessionStorage.getItem("firstname") || "",
      lastname:   sessionStorage.getItem("lastname")  || "",
      email:      sessionStorage.getItem("email")     || "",
      dob:        dob, // ISO formaat voor API
      
      // UK Adres & Phone
      postcode:   sessionStorage.getItem("postcode")  || "",
      address1:   sessionStorage.getItem("address1")  || "", 
      address2:   sessionStorage.getItem("address2")  || "",
      city:       sessionStorage.getItem("city")      || "",
      phone1:     sessionStorage.getItem("phone1")    || "",
      
      // Tracking
      t_id,
      aff_id:   sessionStorage.getItem("aff_id")   || "unknown",
      offer_id: sessionStorage.getItem("offer_id") || "unknown",
      sub_id:   sessionStorage.getItem("sub_id")   || "unknown",
      
      f_1453_campagne_url: window.location.href,
      f_17_ipaddress: ip,
      f_55_optindate: new Date().toISOString().split(".")[0] + "+0000",
      is_shortform: campaign.is_shortform || false,
    };

    // Coreg antwoorden toevoegen
    if (campaign.f_2014_coreg_answer) 
      payload.f_2014_coreg_answer = campaign.f_2014_coreg_answer;
      
    if (campaign.f_2575_coreg_answer_dropdown)
      payload.f_2575_coreg_answer_dropdown = campaign.f_2575_coreg_answer_dropdown;

    return payload;
  }
  // Expose aan window voor coregRenderer
  window.buildPayload = buildPayload;

  // -----------------------------------------------------------
  // 3. API Call: Lead Verzenden
  // -----------------------------------------------------------
  async function fetchLead(payload) {
    const key = `${payload.cid}_${payload.sid}`;
    if (window.submittedCampaigns.has(key)) return { skipped: true };

    try {
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
  // 4. UX Logic: Validatie & Auto-advance
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // A. Split DOB Auto-focus (Dag -> Maand -> Jaar)
    const day = document.getElementById("dob-day");
    const month = document.getElementById("dob-month");
    const year = document.getElementById("dob-year");

    if (day && month) {
      day.addEventListener("input", () => {
        if (day.value.length === 2) month.focus();
      });
    }
    if (month && year) {
      month.addEventListener("input", () => {
        if (month.value.length === 2) year.focus();
      });
    }

    // B. UK Telefoon (Alleen cijfers, max 11)
    const phoneInput = document.getElementById("phone1");
    if (phoneInput) {
      phoneInput.inputMode = "numeric";
      phoneInput.addEventListener("input", () => {
        // Verwijder niet-cijfers en knip af op 11
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      });
    }

    // C. UK Postcode Validatie (bij verlaten veld)
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
            pcInput.value = data.formatted;
            pcInput.classList.remove("error");
          } else {
            // Let op: Geen harde blokkade, maar visuele feedback
            pcInput.classList.add("error"); 
            // Optioneel: alert("Please enter a valid UK postcode");
          }
        } catch(e) {}
      });
    }
  });

  // -----------------------------------------------------------
  // 5. Short Form Submit Handler
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;
    
    // Zoek de knop (kan button type=submit zijn of .flow-next)
    const btn = form.querySelector(".flow-next, button[type='submit']");
    if (!btn) return;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      // Validatie: Check of alle required velden gevuld zijn
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Opslaan Gender
      const genderEl = form.querySelector("input[name='gender']:checked");
      if (genderEl) sessionStorage.setItem("gender", genderEl.value);

      // Opslaan Naam & Email
      ["firstname", "lastname", "email"].forEach(id => {
         const el = document.getElementById(id);
         if (el) sessionStorage.setItem(id, el.value.trim());
      });

      // Opslaan DOB
      const d = document.getElementById("dob-day")?.value;
      const m = document.getElementById("dob-month")?.value;
      const y = document.getElementById("dob-year")?.value;
      
      // Extra check: Jaartal moet 4 cijfers zijn
      if (!d || !m || !y || y.length < 4) {
        alert("Please enter your full Date of Birth.");
        return;
      }

      sessionStorage.setItem("dob_day", d);
      sessionStorage.setItem("dob_month", m);
      sessionStorage.setItem("dob_year", y);

      // Event vuren voor flow controller (initFlow.js)
      sessionStorage.setItem("shortFormCompleted", "true");
      document.dispatchEvent(new Event("shortFormSubmitted"));
    });
  });

  // -----------------------------------------------------------
  // 6. Long Form Submit Handler
  // -----------------------------------------------------------
  document.addEventListener("click", async e => {
    // Check of er op de submit knop geklikt is
    const isSubmit = e.target.matches("#submit-long-form");
    if (!isSubmit) return;
    e.preventDefault();

    // Verplichte velden check
    const reqFields = ["postcode", "address1", "city", "phone1"];
    const invalid = reqFields.filter(id => !document.getElementById(id)?.value.trim());

    if (invalid.length) {
      return alert("Please fill in all required fields.");
    }
    
    // Extra Phone Check: moet met 07 beginnen en 11 cijfers zijn
    const phoneVal = document.getElementById("phone1").value.replace(/\D/g,"");
    if (!/^07\d{9}$/.test(phoneVal)) {
      return alert("Please enter a valid UK mobile number (starts with 07).");
    }

    // Opslaan in sessie
    reqFields.forEach(id => sessionStorage.setItem(id, document.getElementById(id).value.trim()));
    
    const ad2 = document.getElementById("address2");
    if (ad2) sessionStorage.setItem("address2", ad2.value.trim());

    // Verstuur 'Pending' Leads (Coreg campagnes waarvoor Long Form nodig was)
    const pending = JSON.parse(sessionStorage.getItem("longFormCampaigns") || "[]");
    
    if (typeof getIpOnce === "function") getIpOnce();

    (async () => {
      await Promise.allSettled(pending.map(async camp => {
         // Ophalen eerder gegeven antwoorden
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
      }));
      // Schoonmaken
      sessionStorage.removeItem("longFormCampaigns");
    })();

    // Event vuren: Flow is klaar
    document.dispatchEvent(new Event("longFormSubmitted"));
  });
}
