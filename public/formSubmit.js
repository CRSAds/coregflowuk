// =============================================================
// ✅ formSubmit.js — UK Version (Advanced DOB Logic)
// =============================================================

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

    // 🇬🇧 DOB Logic (The "Smart" Dutch implementation adapted for UK)
    const dobInput = document.getElementById("dob");
    if (dobInput) {
      const TEMPLATE = "DD / MM / YYYY";

      // Init
      dobInput.value = TEMPLATE;
      dobInput.inputMode = "numeric";

      const setCursor = (pos) => requestAnimationFrame(() => dobInput.setSelectionRange(pos, pos));
      const getDigits = () => dobInput.value.replace(/\D/g, "").split("");

      // Render functie (vertaalt digits naar visual string met YYYY)
      const render = (digits) => {
        const d = [...digits, "", "", "", "", "", "", "", ""];
        return (
          `${d[0] || "D"}${d[1] || "D"} / ` +
          `${d[2] || "M"}${d[3] || "M"} / ` +
          `${d[4] || "Y"}${d[5] || "Y"}${d[6] || "Y"}${d[7] || "Y"}`
        );
      };

      dobInput.addEventListener("focus", () => {
        if (dobInput.value === "" || dobInput.value === TEMPLATE) {
          dobInput.value = TEMPLATE;
          setCursor(0);
        }
      });

      // Zorg dat clicken ook de cursor goed zet
      dobInput.addEventListener("click", () => {
         const digits = getDigits();
         // Cursor aan het eind van wat al is ingevuld
         const cursorMap = [0, 1, 5, 6, 10, 11, 12, 13];
         setCursor(cursorMap[digits.length] ?? 0);
      });

      dobInput.addEventListener("keydown", (e) => {
        const key = e.key;
        const digits = getDigits();

        // Navigatie toestaan
        if (["ArrowLeft", "ArrowRight", "Tab"].includes(key)) return;

        e.preventDefault();

        // BACKSPACE
        if (key === "Backspace") {
          digits.pop();
        }

        // DIGIT INPUT
        else if (/^\d$/.test(key) && digits.length < 8) {
          // Dag logica: als 1e cijfer > 3, dan bedoelt men waarschijnlijk 04, 05 etc.
          // (UK/NL datum formaat is DD eerst, dus >3 kan geen start van dag zijn behalve met 0)
          if (digits.length === 0 && key > "3") {
            digits.push("0", key);
          }
          // Maand logica: als 1e maandcijfer > 1, dan 02, 03... 09
          else if (digits.length === 2 && key > "1") {
            digits.push("0", key);
          }
          else {
            digits.push(key);
          }
        }

        const value = render(digits);
        dobInput.value = value;

        // Cursor positions map (houdt rekening met de " / " karakters)
        // 0,1 zijn dag | 5,6 zijn maand | 10,11,12,13 zijn jaar
        const cursorMap = [0, 1, 5, 6, 10, 11, 12, 13];
        setCursor(cursorMap[digits.length] ?? 14);

        // Opslaan als volledige digits zijn ingevuld
        if (digits.length === 8) {
           sessionStorage.setItem("dob_full", digits.join(""));
        }
      });
    }

    // 🇬🇧 Phone Validation
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
          const res = await fetch("https://coregflowuk.vercel.app/api/validateAddressUK.js", {
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

  // Helper: IP
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
  // 2. Payload Builder
  // -----------------------------------------------------------
  async function buildPayload(campaign = {}) {
    const ip = await getIpOnce();
    const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();
    
    // DOB Conversie: DDMMYYYY -> YYYY-MM-DD
    let dob = "";
    // We pakken de ruwe digits uit storage of uit het veld als fallback
    let rawDigits = sessionStorage.getItem("dob_full");
    if (!rawDigits) {
       // Fallback: probeer waarde uit input te scrapen
       const el = document.getElementById("dob");
       if (el) rawDigits = el.value.replace(/\D/g, "");
    }

    if (rawDigits && rawDigits.length === 8) {
       // yyyy-mm-dd
       dob = `${rawDigits.slice(4,8)}-${rawDigits.slice(2,4)}-${rawDigits.slice(0,2)}`;
    }

    const payload = {
      cid: campaign.cid,
      sid: campaign.sid,
      gender:     sessionStorage.getItem("gender")    || "",
      firstname:  sessionStorage.getItem("firstname") || "",
      lastname:   sessionStorage.getItem("lastname")  || "",
      email:      sessionStorage.getItem("email")     || "",
      dob:        dob,
      
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
      const res = await fetch("https://coregflowuk.vercel.app/api/lead.js", {
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
    // Ondersteunt zowel .flow-next als button[type=submit]
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

      // Validatie DOB digits
      const dobEl = document.getElementById("dob");
      const dobDigits = dobEl ? dobEl.value.replace(/\D/g,"") : "";
      
      if (dobDigits.length !== 8) {
         alert("Please enter a valid Date of Birth (DD / MM / YYYY)");
         return;
      }
      sessionStorage.setItem("dob_full", dobDigits);

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
