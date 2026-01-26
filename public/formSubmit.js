// public/formSubmit.js — UK Version (Improved DOB Masking)

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();

  // -----------------------------------------------------------
  // 1. Init & Input Logic
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Tracking params opslaan
    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });

    // 🇬🇧 DOB Masking: Automatisch invullen van slashes
    const dobInput = document.getElementById("dob");
    if (dobInput) {
      dobInput.addEventListener("input", function(e) {
        // Huidige waarde zonder niet-cijfers
        let v = this.value.replace(/\D/g, "");
        
        // Backspace check: als de gebruiker wist, niet forceren
        if (e.inputType === "deleteContentBackward") return;

        // Maximaal 8 cijfers (ddmmyyyy)
        if (v.length > 8) v = v.slice(0, 8);

        // Opbouwen met slashes
        if (v.length > 4) {
          this.value = `${v.slice(0, 2)} / ${v.slice(2, 4)} / ${v.slice(4)}`;
        } else if (v.length > 2) {
          this.value = `${v.slice(0, 2)} / ${v.slice(2)}`;
        } else {
          this.value = v;
        }
      });

      // Zorg dat backspace goed werkt bij slashes
      dobInput.addEventListener("keydown", function(e) {
        if (e.key === "Backspace" && (this.value.endsWith(" / ") || this.value.endsWith("/ "))) {
             this.value = this.value.slice(0, -3); // Verwijder de " / " set
             e.preventDefault();
        }
      });
    }

    // 🇬🇧 Phone Validation (alleen cijfers, max 11)
    const phoneInput = document.getElementById("phone1");
    if (phoneInput) {
      phoneInput.inputMode = "numeric";
      phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      });
    }

    // 🇬🇧 Postcode Lookup Trigger
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
            pcInput.classList.add("error");
          }
        } catch(e) {}
      });
    }
  });

  // Helper: IP ophalen
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
  // 2. Payload Builder (Data klaarmaken voor verzenden)
  // -----------------------------------------------------------
  async function buildPayload(campaign = {}) {
    const ip = await getIpOnce();
    const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();
    
    // DOB Converteren: dd / mm / yyyy -> yyyy-mm-dd
    let dob = "";
    const rawDob = sessionStorage.getItem("dob_full") || ""; 
    const cleanDob = rawDob.replace(/\D/g, ""); // "01011990"
    
    if (cleanDob.length === 8) {
       // yyyy-mm-dd
       dob = `${cleanDob.slice(4,8)}-${cleanDob.slice(2,4)}-${cleanDob.slice(0,2)}`;
    }

    const payload = {
      cid: campaign.cid,
      sid: campaign.sid,
      gender:     sessionStorage.getItem("gender")    || "",
      firstname:  sessionStorage.getItem("firstname") || "",
      lastname:   sessionStorage.getItem("lastname")  || "",
      email:      sessionStorage.getItem("email")     || "",
      dob:        dob, // ISO formaat
      
      postcode:   sessionStorage.getItem("postcode")  || "",
      address1:   sessionStorage.getItem("address1")  || "",
      address2:   sessionStorage.getItem("address2")  || "",
      city:       sessionStorage.getItem("city")      || "",
      phone1:     sessionStorage.getItem("phone1")    || "",
      
      t_id,
      aff_id:   sessionStorage.getItem("aff_id")   || "unknown",
      offer_id: sessionStorage.getItem("offer_id") || "unknown",
      sub_id:   sessionStorage.getItem("sub_id")   || "unknown",
      
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

  // API Call
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
    } catch (err) { return { success: false }; }
  }
  window.fetchLead = fetchLead;

  // -----------------------------------------------------------
  // 3. Submit Handlers
  // -----------------------------------------------------------
  
  // SHORT FORM
  document.addEventListener("click", (e) => {
    // Check op knop binnen formulier
    if (e.target.matches(".flow-next") && e.target.closest("#lead-form")) {
      const form = document.getElementById("lead-form");
      
      // Browser validatie
      if (!form.checkValidity()) {
        form.reportValidity();
        e.preventDefault();
        return;
      }

      e.preventDefault(); 

      // Data opslaan
      const genderEl = form.querySelector("input[name='gender']:checked");
      if (genderEl) sessionStorage.setItem("gender", genderEl.value);

      ["firstname", "lastname", "email"].forEach(id => {
         const el = document.getElementById(id);
         if (el) sessionStorage.setItem(id, el.value.trim());
      });

      // DOB opslaan
      const dobVal = document.getElementById("dob")?.value || "";
      if (dobVal.replace(/\D/g,"").length !== 8) {
         alert("Please enter a valid Date of Birth (DD / MM / YYYY)");
         return;
      }
      sessionStorage.setItem("dob_full", dobVal);

      sessionStorage.setItem("shortFormCompleted", "true");
      document.dispatchEvent(new Event("shortFormSubmitted"));
    }
  });

  // LONG FORM
  document.addEventListener("click", async e => {
    if (!e.target.matches("#submit-long-form")) return;
    e.preventDefault();

    const reqFields = ["postcode", "address1", "city", "phone1"];
    const invalid = reqFields.filter(id => !document.getElementById(id)?.value.trim());

    if (invalid.length) return alert("Please fill in all required fields.");
    
    const phoneVal = document.getElementById("phone1").value.replace(/\D/g,"");
    if (!/^07\d{9}$/.test(phoneVal)) return alert("Please enter a valid UK mobile number.");

    reqFields.forEach(id => sessionStorage.setItem(id, document.getElementById(id).value.trim()));
    const ad2 = document.getElementById("address2");
    if (ad2) sessionStorage.setItem("address2", ad2.value.trim());

    // Verzenden
    const pending = JSON.parse(sessionStorage.getItem("longFormCampaigns") || "[]");
    if (typeof getIpOnce === "function") getIpOnce();

    (async () => {
      await Promise.allSettled(pending.map(async camp => {
         const ans = sessionStorage.getItem(`f_2014_coreg_answer_${camp.cid}`);
         const drop = sessionStorage.getItem(`f_2575_coreg_answer_dropdown_${camp.cid}`);
         
         const payload = await window.buildPayload({
           cid: camp.cid, sid: camp.sid, is_shortform: false,
           f_2014_coreg_answer: ans || undefined,
           f_2575_coreg_answer_dropdown: drop || undefined
         });
         return window.fetchLead(payload);
      }));
      sessionStorage.removeItem("longFormCampaigns");
    })();

    document.dispatchEvent(new Event("longFormSubmitted"));
  });
}
