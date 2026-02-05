// =============================================================
// ✅ formSubmit.js — UK Version (Full Restoration)
// =============================================================

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();
  
  // 👇 API BASE URL
  const API_BASE = "https://coregflowuk.vercel.app";

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

  // 1. INIT
  function initFormLogic() {
    const form = document.getElementById("lead-form");
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });

    if (form.dataset.sponsorSlideup === "true" && !document.getElementById("sponsor-slideup")) {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);
    }

    setupInputLogic();

    const btn = form.querySelector(".flow-next, button[type='submit']");
    if (btn) {
      btn.removeEventListener("click", handleShortForm, true);
      btn.addEventListener("click", handleShortForm, true);
    }
  }

  // 2. INPUT HELPERS
  function setupInputLogic() {
    // DOB
    const dobInput = document.getElementById("dob");
    if (dobInput && !dobInput.dataset.bound) {
      dobInput.dataset.bound = "true";
      const TEMPLATE = "DD / MM / YYYY";
      if (!dobInput.value) { dobInput.value = TEMPLATE; dobInput.classList.add("is-placeholder"); }
      dobInput.inputMode = "numeric";

      const setCursor = (pos) => requestAnimationFrame(() => dobInput.setSelectionRange(pos, pos));
      const getDigits = () => dobInput.value.replace(/\D/g, "").split("");
      const render = (digits) => {
        const d = [...digits, "", "", "", "", "", "", "", ""];
        return `${d[0]||"D"}${d[1]||"D"} / ${d[2]||"M"}${d[3]||"M"} / ${d[4]||"Y"}${d[5]||"Y"}${d[6]||"Y"}${d[7]||"Y"}`;
      };

      dobInput.addEventListener("focus", () => { if (dobInput.value === TEMPLATE) setCursor(0); });
      dobInput.addEventListener("click", () => {
         const digits = getDigits();
         setCursor([0, 1, 5, 6, 10, 11, 12, 13][digits.length] ?? 0);
      });
      dobInput.addEventListener("keydown", (e) => {
        const key = e.key; const digits = getDigits();
        if (["ArrowLeft", "ArrowRight", "Tab"].includes(key)) return;
        if (key === "Backspace") { e.preventDefault(); digits.pop(); } 
        else if (/^\d$/.test(key) && digits.length < 8) {
            e.preventDefault();
            if (digits.length === 0 && key > "3") digits.push("0", key);
            else if (digits.length === 2 && key > "1") digits.push("0", key);
            else digits.push(key);
        } else if (key.length === 1) e.preventDefault();

        dobInput.value = render(digits);
        dobInput.classList.toggle("is-placeholder", dobInput.value === TEMPLATE);
        setCursor([0, 1, 5, 6, 10, 11, 12, 13][digits.length] ?? 14);
        if (digits.length === 8) sessionStorage.setItem("dob_full", digits.join(""));
      });
    }

    // Phone
    const phoneInput = document.getElementById("phone1");
    if (phoneInput && !phoneInput.dataset.bound) {
      phoneInput.dataset.bound = "true";
      phoneInput.inputMode = "numeric";
      phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      });
    }

    // Postcode
    const pcInput = document.getElementById("postcode");
    if (pcInput && !pcInput.dataset.bound) {
      pcInput.dataset.bound = "true";
      pcInput.addEventListener("blur", async () => {
        const val = pcInput.value.trim();
        if (!val) return;
        try {
          const res = await fetch(`${API_BASE}/api/validateAddressUK.js`, {
             method: "POST", headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ postcode: val })
          });
          const data = await res.json();
          if (data.valid && data.formatted) {
            pcInput.value = data.formatted; pcInput.classList.remove("error");
          } else { pcInput.classList.add("error"); }
        } catch(e) {}
      });
    }
  }

  // 3. API & PAYLOAD
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

    // Base Payload
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
      t_id, ip,
      f_1453_campagne_url: window.location.href,
      f_55_optindate: new Date().toISOString().split(".")[0] + "+0000",
      is_shortform: campaign.is_shortform || false,
    };

    // Voeg coreg antwoorden toe als ze in het campaign object zitten
    if (campaign.f_2014_coreg_answer) payload.f_2014_coreg_answer = campaign.f_2014_coreg_answer;
    if (campaign.f_2575_coreg_answer_dropdown) payload.f_2575_coreg_answer_dropdown = campaign.f_2575_coreg_answer_dropdown;

    return payload;
  }

  window.fetchLead = async function(payload) {
    if (!payload?.cid || !payload?.sid) return { success: false };
    const key = `${payload.cid}_${payload.sid}`;
    if (window.submittedCampaigns.has(key)) return { skipped: true };

    try {
      const res = await fetch(`${API_BASE}/api/lead.js`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      window.submittedCampaigns.add(key);
      return await res.json();
    } catch (err) { return { success: false }; }
  }

  // 4. HANDLERS
  let submitting = false;

  async function handleShortForm(e) {
    const form = document.getElementById("lead-form");
    const btn = e.currentTarget;

    if (!form.checkValidity()) return; 
    
    const dobEl = document.getElementById("dob");
    if (dobEl && dobEl.value.replace(/\D/g,"").length !== 8) {
       e.preventDefault(); e.stopPropagation();
       alert("Please enter a valid Date of Birth (DD / MM / YYYY)");
       return;
    }

    e.preventDefault(); e.stopPropagation();
    if (submitting) return;

    // Save Data
    const genderEl = form.querySelector("input[name='gender']:checked");
    if (genderEl) sessionStorage.setItem("gender", genderEl.value);
    ["firstname", "lastname", "email"].forEach(id => {
       const el = document.getElementById(id);
       if (el) sessionStorage.setItem(id, el.value.trim());
    });
    getIpOnce();

    // Slide-up Logic
    const useSlideUp = form.dataset.sponsorSlideup === "true";
    const slideup = document.getElementById("sponsor-slideup");

    if (useSlideUp && slideup) {
      slideup.classList.add("is-visible");
      
      if (!slideup.dataset.bound) {
         slideup.dataset.bound = "true";
         
         const confirmBtn = document.getElementById("slideup-confirm");
         confirmBtn.addEventListener("click", async () => {
           confirmBtn.classList.add("is-loading");
           const span = confirmBtn.querySelector("span");
           if(span) span.innerText = "Please wait...";
           submitting = true;
           
           sessionStorage.setItem("sponsorsAccepted", "true");
           sendUkSponsorLeads(); // Background
           await finalizeUkShortForm();
         });

         document.getElementById("slideup-deny").addEventListener("click", async () => {
           slideup.classList.remove("is-visible");
           btn.innerHTML = "Please wait...";
           submitting = true;
           sessionStorage.setItem("sponsorsAccepted", "false");
           await finalizeUkShortForm();
         });
      }
    } else {
      submitting = true;
      btn.disabled = true;
      btn.innerHTML = "Please wait...";
      await finalizeUkShortForm();
    }
  }

  async function sendUkSponsorLeads() {
    try {
      const res = await fetch(`${API_BASE}/api/cosponsors.js`);
      const json = await res.json();
      if(Array.isArray(json.data)) {
        json.data.forEach(async s => {
           const p = await window.buildPayload({ cid: s.cid, sid: s.sid, is_shortform: true });
           window.fetchLead(p);
        });
      }
    } catch {}
  }

  async function finalizeUkShortForm() {
    try {
      const ukBasePayload = await window.buildPayload({ cid: "5743", sid: "34", is_shortform: true });
      await window.fetchLead(ukBasePayload);
    } catch (err) { console.error(err); }

    sessionStorage.setItem("shortFormCompleted", "true");
    document.dispatchEvent(new Event("shortFormSubmitted"));
  }

  // -----------------------------------------------------------
  // 5. BOOTSTRAP
  // -----------------------------------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFormLogic);
  } else {
    initFormLogic();
  }

  // -----------------------------------------------------------
  // ⚠️ CRUCIAAL: LONG FORM HANDLER (HERSTELD!)
  // Hier worden de coreg campagnes uit de slides verstuurd.
  // -----------------------------------------------------------
  document.addEventListener("click", async e => {
    if (!e.target.matches("#submit-long-form")) return;
    
    e.preventDefault();
    
    // 1. Validatie
    const reqFields = ["postcode", "address1", "city", "phone1"];
    const invalid = reqFields.filter(id => !document.getElementById(id)?.value.trim());
    
    if (invalid.length) {
        alert("Please fill in all required fields.");
        return;
    }
    
    const phoneVal = document.getElementById("phone1").value.replace(/\D/g,"");
    if (!/^07\d{9}$/.test(phoneVal)) {
        alert("Please enter a valid UK mobile number.");
        return;
    }

    // 2. Data Opslaan
    reqFields.forEach(id => sessionStorage.setItem(id, document.getElementById(id).value.trim()));
    const ad2 = document.getElementById("address2");
    if (ad2) sessionStorage.setItem("address2", ad2.value.trim());

    // 3. Coreg Verzenden (uit queue)
    const pending = JSON.parse(sessionStorage.getItem("longFormCampaigns") || "[]");
    
    // Async verzenden van alle pending coregs
    (async () => {
      await Promise.allSettled(pending.map(async camp => {
         const ans = sessionStorage.getItem(`f_2014_coreg_answer_${camp.cid}`);
         const drop = sessionStorage.getItem(`f_2575_coreg_answer_dropdown_${camp.cid}`);
         
         const payload = await window.buildPayload({
           cid: camp.cid, 
           sid: camp.sid, 
           is_shortform: false, // Dit is belangrijk!
           f_2014_coreg_answer: ans || undefined,
           f_2575_coreg_answer_dropdown: drop || undefined
         });
         
         return window.fetchLead(payload);
      }));
      
      // Leegmaken na verzenden
      sessionStorage.removeItem("longFormCampaigns");
    })();

    // 4. Navigatie triggeren
    document.dispatchEvent(new Event("longFormSubmitted"));
  });

  console.info("🎉 formSubmit loaded (UK Full Restore)");
}
