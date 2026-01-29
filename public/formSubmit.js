// =============================================================
// ✅ formSubmit.js — UK Version (Met Slide-up Fix & Vertaling)
// =============================================================

if (!window.formSubmitInitialized) {
  window.formSubmitInitialized = true;
  window.submittedCampaigns = window.submittedCampaigns || new Set();

  // --- HTML Template (UK English - Motivating) ---
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
  // 1. Init & Input Logic
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Tracking params opslaan
    const urlParams = new URLSearchParams(window.location.search);
    ["t_id", "aff_id", "sub_id", "sub2", "offer_id"].forEach(key => {
      const val = urlParams.get(key);
      if (val) sessionStorage.setItem(key, val);
    });

    // Inject Slide-up (indien ingeschakeld)
    const form = document.getElementById("lead-form");
    if (form && form.dataset.sponsorSlideup === "true") {
      form.insertAdjacentHTML('beforeend', SLIDEUP_TEMPLATE);

      // 🔧 FIX: Koppel de partner link in de slide-up aan de echte popup trigger
      // We wachten heel even om zeker te zijn dat de DOM klaar is
      setTimeout(() => {
        const slideupLink = form.querySelector("#sponsor-slideup .open-sponsor-popup");
        // Zoek de originele trigger die wél werkt (vaak in de footer of hidden op de pagina)
        // We proberen een paar selectors die vaak gebruikt worden in Swipepages/je template
        const realTrigger = document.getElementById("open-sponsor-popup") || 
                            document.querySelector(".open-sponsor-popup:not(.slideup-partner-link)");

        if (slideupLink && realTrigger) {
          slideupLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🇬🇧 Slide-up partner link clicked -> triggering real popup");
            realTrigger.click(); // Simuleer klik op de werkende knop
          });
        } else {
           // Fallback: Als er geen andere knop is, probeer cosponsors.js direct aan te roepen als die global is exposed
           // Of log een warning dat we de popup niet kunnen openen
           console.warn("⚠️ Could not find original sponsor popup trigger to bind to.");
        }
      }, 500);
    }

    // 🇬🇧 DOB Logic (Smart Masking)
    const dobInput = document.getElementById("dob");
    if (dobInput) {
      const TEMPLATE = "DD / MM / YYYY";
      const updatePlaceholderStyle = () => {
        if (dobInput.value === TEMPLATE) dobInput.classList.add("is-placeholder");
        else dobInput.classList.remove("is-placeholder");
      };

      dobInput.value = TEMPLATE;
      dobInput.inputMode = "numeric";
      updatePlaceholderStyle();

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
        const key = e.key; const digits = getDigits();
        if (["ArrowLeft", "ArrowRight", "Tab"].includes(key)) return;
        e.preventDefault();
        if (key === "Backspace") digits.pop();
        else if (/^\d$/.test(key) && digits.length < 8) {
          if (digits.length === 0 && key > "3") digits.push("0", key);
          else if (digits.length === 2 && key > "1") digits.push("0", key);
          else digits.push(key);
        }
        dobInput.value = render(digits);
        updatePlaceholderStyle();
        const cursorMap = [0, 1, 5, 6, 10, 11, 12, 13];
        setCursor(cursorMap[digits.length] ?? 14);
        if (digits.length === 8) sessionStorage.setItem("dob_full", digits.join(""));
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

    // 🇬🇧 Postcode Lookup
    const pcInput = document.getElementById("postcode");
    if (pcInput) {
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
    
    // DOB Conversie
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
  window.buildPayload = buildPayload;

  // API Call
  async function fetchLead(payload) {
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
  window.fetchLead = fetchLead;

  // -----------------------------------------------------------
  // 3. Submit Helpers (UK Specific)
  // -----------------------------------------------------------
  async function sendUkSponsorLeads() {
    try {
      // 🇬🇧 Placeholder: If you have a UK sponsors endpoint, call it here.
      // Example: await fetch("https://coregflowuk.vercel.app/api/cosponsors.js");
      console.log("🇬🇧 Sponsors accepted (UK Logic)");
    } catch {}
  }

  async function finalizeUkShortForm() {
    try {
      // 🇬🇧 Hardcoded Basis Lead
      const ukBasePayload = await window.buildPayload({ cid: "5743", sid: "34", is_shortform: true });
      window.fetchLead(ukBasePayload);
    } catch (err) { console.error(err); }

    sessionStorage.setItem("shortFormCompleted", "true");
    document.dispatchEvent(new Event("shortFormSubmitted"));
  }

  // -----------------------------------------------------------
  // 4. Submit Handlers
  // -----------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;

    const btn = form.querySelector(".flow-next, button[type='submit']");
    if (!btn) return;

    let submitting = false;

    const handleShortForm = async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (submitting) return;

      // 1. Validatie
      if (!form.checkValidity()) { form.reportValidity(); return; }
      
      const dobEl = document.getElementById("dob");
      if (dobEl && dobEl.value.replace(/\D/g,"").length !== 8) {
         alert("Please enter a valid Date of Birth (DD / MM / YYYY)");
         return;
      }

      // 2. Opslaan
      const genderEl = form.querySelector("input[name='gender']:checked");
      if (genderEl) sessionStorage.setItem("gender", genderEl.value);
      ["firstname", "lastname", "email"].forEach(id => {
         const el = document.getElementById(id);
         if (el) sessionStorage.setItem(id, el.value.trim());
      });
      if (typeof getIpOnce === "function") getIpOnce();

      // 3. Slide-up check
      const useSlideUp = form.dataset.sponsorSlideup === "true";

      if (useSlideUp) {
        const slideup = document.getElementById("sponsor-slideup");
        if (slideup) {
          slideup.classList.add("is-visible");
          
          if (!slideup.dataset.bound) {
             slideup.dataset.bound = "true";
             
             // YES - Confirm
             const confirmBtn = document.getElementById("slideup-confirm");
             confirmBtn.addEventListener("click", async () => {
               confirmBtn.classList.add("is-loading");
               const span = confirmBtn.querySelector("span");
               if(span) span.innerText = "Please wait...";
               submitting = true;
               
               sessionStorage.setItem("sponsorsAccepted", "true");
               await sendUkSponsorLeads();
               await finalizeUkShortForm();
               
               // Keep visible until page transition
             });

             // NO - Deny
             document.getElementById("slideup-deny").addEventListener("click", async () => {
               slideup.classList.remove("is-visible");
               btn.innerHTML = "Please wait...";
               submitting = true;
               
               sessionStorage.setItem("sponsorsAccepted", "false");
               await finalizeUkShortForm();
             });
          }
        } else {
          // Fallback if HTML missing
          await finalizeUkShortForm();
        }
      } else {
        // Old flow
        submitting = true;
        btn.disabled = true;
        await finalizeUkShortForm();
        btn.disabled = false;
        submitting = false;
      }
    };

    btn.addEventListener("click", handleShortForm, true);
  });

  // LONG FORM HANDLER (Onveranderd)
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
  
  console.info("🎉 formSubmit loaded (UK v3 Slide-up Fix)");
}
