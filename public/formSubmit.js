// =============================================================
// ✅ formSubmit.js — UK Version (Robust Timing Fix)
// =============================================================

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();

  // --- HTML Template (UK English) ---
  const SLIDEUP_TEMPLATE = `
    <div class="sponsor-slideup" id="sponsor-slideup">
      <h3 class="slideup-title">Almost done!</h3>
      <p class="slideup-text">
        Are you happy for our <button type="button" class="slideup-partner-link open-sponsor-popup">partners</button> 
        to contact you with their latest offers?
      </p>
      <div class="slideup-actions">
        <button type="button" id="slideup-confirm" class="cta-primary">
          <span>Yes, continue</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
          <div class="slideup-spinner"></div>
        </button>
        <button type="button" id="slideup-deny" class="slideup-deny">No, I'd rather not</button>
      </div>
    </div>
  `;

  // -----------------------------------------------------------
  // 1. Main Initialization Logic
  // -----------------------------------------------------------
  function initFormLogic() {
    const form = document.getElementById("lead-form");
    if (!form) return; // Geen formulier = niets doen

    // A. URL Parameters opslaan
    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });

    // B. Injecteer Slide-up (indien nodig & nog niet aanwezig)
    if (form.dataset.sponsorSlideup === "true" && !document.getElementById("sponsor-slideup")) {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }

    // C. Input Logica (DOB, Phone, Postcode)
    setupInputLogic();

    // D. Submit Handler Koppelen
    const btn = form.querySelector(".flow-next, button[type='submit']");
    if (btn) {
      // Gebruik {capture: true} om voorrang te krijgen op initFlow-lite
      btn.removeEventListener("click", handleShortForm, true); // Veiligheidshalve eerst verwijderen
      btn.addEventListener("click", handleShortForm, true);
    }
  }

  // -----------------------------------------------------------
  // 2. Input Helpers (DOB, Postcode, etc.)
  // -----------------------------------------------------------
  function setupInputLogic() {
    // DOB Logic
    const dobInput = document.getElementById("dob");
    if (dobInput && !dobInput.dataset.bound) {
      dobInput.dataset.bound = "true";
      const TEMPLATE = "DD / MM / YYYY";
      
      const updatePlaceholderStyle = () => {
        if (dobInput.value === TEMPLATE) dobInput.classList.add("is-placeholder");
        else dobInput.classList.remove("is-placeholder");
      };

      if (!dobInput.value) { dobInput.value = TEMPLATE; updatePlaceholderStyle(); }
      dobInput.inputMode = "numeric";

      const setCursor = (pos) => requestAnimationFrame(() => dobInput.setSelectionRange(pos, pos));
      const getDigits = () => dobInput.value.replace(/\D/g, "").split("");
      const render = (digits) => {
        const d = [...digits, "", "", "", "", "", "", "", ""];
        return `${d[0]||"D"}${d[1]||"D"} / ${d[2]||"M"}${d[3]||"M"} / ${d[4]||"Y"}${d[5]||"Y"}${d[6]||"Y"}${d[7]||"Y"}`;
      };

      dobInput.addEventListener("focus", () => {
        if (dobInput.value === "" || dobInput.value === TEMPLATE) {
          dobInput.value = TEMPLATE; updatePlaceholderStyle(); setCursor(0);
        }
      });
      dobInput.addEventListener("click", () => {
         const digits = getDigits();
         const cursorMap = [0, 1, 5, 6, 10, 11, 12, 13];
         setCursor(cursorMap[digits.length] ?? 0);
      });
      dobInput.addEventListener("keydown", (e) => {
        const key = e.key; 
        const digits = getDigits();
        if (["ArrowLeft", "ArrowRight", "Tab"].includes(key)) return;
        
        if (key === "Backspace") {
            e.preventDefault();
            digits.pop();
        } else if (/^\d$/.test(key) && digits.length < 8) {
            e.preventDefault();
            if (digits.length === 0 && key > "3") digits.push("0", key);
            else if (digits.length === 2 && key > "1") digits.push("0", key);
            else digits.push(key);
        } else if (!/^\d$/.test(key)) {
            // Blokkeer andere toetsen behalve navigatie (boven afgehandeld)
            // Maar laat events zoals Refresh (F5) wel door als dat geen modifier heeft
            if(key.length === 1) e.preventDefault(); 
        }

        dobInput.value = render(digits);
        updatePlaceholderStyle();
        const cursorMap = [0, 1, 5, 6, 10, 11, 12, 13];
        setCursor(cursorMap[digits.length] ?? 14);
        if (digits.length === 8) sessionStorage.setItem("dob_full", digits.join(""));
      });
    }

    // Phone Validation
    const phoneInput = document.getElementById("phone1");
    if (phoneInput && !phoneInput.dataset.bound) {
      phoneInput.dataset.bound = "true";
      phoneInput.inputMode = "numeric";
      phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      });
    }

    // Postcode Lookup
    const pcInput = document.getElementById("postcode");
    if (pcInput && !pcInput.dataset.bound) {
      pcInput.dataset.bound = "true";
      pcInput.addEventListener("blur", async () => {
        const val = pcInput.value.trim();
        if (!val) return;
        try {
          const res = await fetch("https://coregflowuk.vercel.app/api/validateAddressUK.js", {
             method: "POST", headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ postcode: val })
          });
          const data = await res.json();
          if (data.valid && data.formatted) {
            pcInput.value = data.formatted; pcInput.classList.remove("error");
          } else {
            pcInput.classList.add("error");
          }
        } catch(e) {}
      });
    }
  }

  // -----------------------------------------------------------
  // 3. Payload & API Helpers
  // -----------------------------------------------------------
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

  window.buildPayload = async function(campaign = {}) {
    const ip = await getIpOnce();
    const t_id = sessionStorage.getItem("t_id") || crypto.randomUUID();
    
    let dob = "";
    let rawDigits = sessionStorage.getItem("dob_full");
    if (!rawDigits) {
       const el = document.getElementById("dob");
       if (el) rawDigits = el.value.replace(/\D/g, "");
    }
    if (rawDigits && rawDigits.length === 8) {
       dob = `${rawDigits.slice(4,8)}-${rawDigits.slice(2,4)}-${rawDigits.slice(0,2)}`;
    }

    const payload = {
      cid: campaign.cid, sid: campaign.sid,
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

    if (campaign.f_2014_coreg_answer) payload.f_2014_coreg_answer = campaign.f_2014_coreg_answer;
    if (campaign.f_2575_coreg_answer_dropdown) payload.f_2575_coreg_answer_dropdown = campaign.f_2575_coreg_answer_dropdown;

    return payload;
  }

  window.fetchLead = async function(payload) {
    if (!payload?.cid || !payload?.sid) return { success: false };
    const key = `${payload.cid}_${payload.sid}`;
    if (window.submittedCampaigns.has(key)) return { skipped: true };

    try {
      const res = await fetch("https://coregflowuk.vercel.app/api/lead.js", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      window.submittedCampaigns.add(key);
      const txt = await res.text();
      return txt ? JSON.parse(txt) : {};
    } catch (err) { return { success: false, error: err.message }; }
  }

  // -----------------------------------------------------------
  // 4. Submit Handler Logic
  // -----------------------------------------------------------
  let submitting = false;

  async function handleShortForm(e) {
    const form = document.getElementById("lead-form");
    const btn = e.currentTarget;

    // A. Basis Validatie
    if (!form.checkValidity()) { 
        // Laat de browser validatie zien, stop custom event niet (zodat browser bubbles werken)
        return; 
    }
    
    // Custom Validatie (DOB)
    const dobEl = document.getElementById("dob");
    if (dobEl && dobEl.value.replace(/\D/g,"").length !== 8) {
       e.preventDefault(); e.stopPropagation();
       alert("Please enter a valid Date of Birth (DD / MM / YYYY)");
       return;
    }

    // Als we hier zijn, is alles geldig -> Stop default submit & initFlow navigatie
    e.preventDefault(); 
    e.stopPropagation();

    if (submitting) return;

    // B. Data Opslaan
    const genderEl = form.querySelector("input[name='gender']:checked");
    if (genderEl) sessionStorage.setItem("gender", genderEl.value);
    ["firstname", "lastname", "email"].forEach(id => {
       const el = document.getElementById(id);
       if (el) sessionStorage.setItem(id, el.value.trim());
    });
    if (typeof getIpOnce === "function") getIpOnce();

    // C. Slide-up Logic
    const useSlideUp = form.dataset.sponsorSlideup === "true";
    const slideup = document.getElementById("sponsor-slideup");

    if (useSlideUp && slideup) {
      slideup.classList.add("is-visible");
      
      // Bind slideup buttons (eenmalig)
      if (!slideup.dataset.bound) {
         slideup.dataset.bound = "true";
         
         // YES
         const confirmBtn = document.getElementById("slideup-confirm");
         confirmBtn.addEventListener("click", async () => {
           confirmBtn.classList.add("is-loading");
           const span = confirmBtn.querySelector("span");
           if(span) span.innerText = "Please wait...";
           submitting = true;
           
           sessionStorage.setItem("sponsorsAccepted", "true");
           await sendUkSponsorLeads();
           await finalizeUkShortForm();
         });

         // NO
         document.getElementById("slideup-deny").addEventListener("click", async () => {
           slideup.classList.remove("is-visible");
           btn.innerHTML = "Please wait...";
           submitting = true;
           
           sessionStorage.setItem("sponsorsAccepted", "false");
           await finalizeUkShortForm();
         });
      }
    } else {
      // Direct doorsturen (fallback)
      submitting = true;
      btn.disabled = true;
      btn.innerHTML = "Please wait...";
      await finalizeUkShortForm();
    }
  }

  async function sendUkSponsorLeads() {
    try {
      const res = await fetch("https://coregflowuk.vercel.app/api/cosponsors.js");
      const json = await res.json();
      if(Array.isArray(json.data)) {
        Promise.allSettled(json.data.map(async s => {
           // UK sponsors sturen we ook als leads door
           // Pas CID/SID aan indien nodig per sponsor
           const p = await window.buildPayload({ cid: s.cid, sid: s.sid, is_shortform: true });
           return window.fetchLead(p);
        }));
      }
    } catch {}
  }

  async function finalizeUkShortForm() {
    try {
      const ukBasePayload = await window.buildPayload({ cid: "5743", sid: "34", is_shortform: true });
      await window.fetchLead(ukBasePayload);
    } catch (err) { console.error(err); }

    sessionStorage.setItem("shortFormCompleted", "true");
    
    // Trigger de navigatie naar de volgende slide
    document.dispatchEvent(new Event("shortFormSubmitted"));
  }

  // -----------------------------------------------------------
  // 5. BOOTSTRAP (Cruciaal voor timing)
  // -----------------------------------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFormLogic);
  } else {
    // Als DOM al klaar is, direct uitvoeren
    initFormLogic();
  }

  // Long Form Listener (voor latere stap)
  document.addEventListener("click", async e => {
    if (!e.target.matches("#submit-long-form")) return;
    // ... bestaande long form logica ...
    e.preventDefault();
    document.dispatchEvent(new Event("longFormSubmitted"));
  });

  console.info("🎉 formSubmit loaded (UK Robust)");
}
