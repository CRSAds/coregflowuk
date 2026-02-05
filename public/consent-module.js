// =============================================================
// ✅ consent-module.js — UK Version (NL Style)
// =============================================================

(function () {

  // 1. Checkbox Logic
  function initSponsorConsent() {
    // Zoek op ID (NL) of class (UK)
    const checkbox = document.getElementById("consent-sponsors") || 
                     document.querySelector(".consent-row input[type='checkbox']");
    
    if (checkbox) {
      sessionStorage.setItem("sponsorsAccepted", "false");
      checkbox.addEventListener("change", () => {
        sessionStorage.setItem("sponsorsAccepted", checkbox.checked ? "true" : "false");
      });
    }
  }

  // 2. Utils
  function waitForElement(id, timeout = 5000) {
    return new Promise(resolve => {
      if (document.getElementById(id)) return resolve(document.getElementById(id));
      const timer = setInterval(() => {
        const el = document.getElementById(id);
        if (el) { clearInterval(timer); resolve(el); }
      }, 100);
      setTimeout(() => { clearInterval(timer); resolve(null); }, timeout);
    });
  }

  // 3. Modal Logic
  let modalOverlay = null;

  function createModal() {
    if (modalOverlay) return modalOverlay;
    
    modalOverlay = document.createElement("div");
    modalOverlay.className = "pb-modal-overlay"; // CSS uit combined-coreg.css
    modalOverlay.setAttribute("aria-hidden", "true");
    modalOverlay.innerHTML = `
      <div class="pb-modal" role="dialog">
        <div class="pb-modal-header">
          <h3 class="pb-modal-title">Terms & Conditions</h3>
          <button type="button" class="pb-modal-close">✕</button>
        </div>
        <div class="pb-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Sluiten
    const close = () => {
        modalOverlay.classList.remove("is-open");
        document.documentElement.style.overflow = "";
    };
    
    modalOverlay.querySelector(".pb-modal-close").addEventListener("click", close);
    modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) close(); });
    
    return modalOverlay;
  }

  // 4. Click Handler
  function initClickHandlers() {
    document.addEventListener("click", async (e) => {
      // Inline Link in checkbox
      if (e.target.closest("#open-actievoorwaarden-inline")) {
        e.preventDefault();
        
        const wrapper = await waitForElement("actievoorwaarden-wrapper");
        if (!wrapper) return; // Zou niet moeten gebeuren met nieuwe footer-loader

        const overlay = createModal();
        const body = overlay.querySelector(".pb-modal-body");
        
        // Verplaats wrapper in modal en maak zichtbaar
        if (!body.contains(wrapper)) {
            body.appendChild(wrapper);
        }
        wrapper.style.display = "block"; // BELANGRIJK: Unhide de content

        overlay.classList.add("is-open");
        document.documentElement.style.overflow = "hidden";
      }
    });
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initSponsorConsent(); initClickHandlers(); });
  } else {
    initSponsorConsent(); initClickHandlers();
  }

})();
