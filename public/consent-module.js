// =============================================================
// ✅ consent-module.js — UK Version (NL Architecture)
// =============================================================

(function () {

  // 1. Sponsor consent state (Checkbox Logic)
  function initSponsorConsent() {
    // FIX: Zoek op ID (NL stijl) OF op class (UK stijl)
    const checkbox = document.getElementById("consent-sponsors") || 
                     document.querySelector(".consent-row input[type='checkbox']");
    
    if (!checkbox) {
      console.warn("⚠️ Consent checkbox niet gevonden.");
      return;
    }

    // Standaard waarde instellen
    sessionStorage.setItem("sponsorsAccepted", "false");

    checkbox.addEventListener("change", () => {
      sessionStorage.setItem(
        "sponsorsAccepted",
        checkbox.checked ? "true" : "false"
      );
    });
  }

  // 2. Utils
  function waitForElement(id, timeout = 5000, interval = 100) {
    return new Promise((resolve) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.getElementById(id);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(timer);
          resolve(null);
        }
      }, interval);
    });
  }

  // 3. Actievoorwaarden Modal Logic
  let voorwaardenModal = null;

  function createVoorwaardenModal() {
    if (voorwaardenModal) return voorwaardenModal;

    const overlay = document.createElement("div");
    overlay.className = "pb-modal-overlay"; // Gebruikt styling uit combined-coreg.css
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
      <div class="pb-modal" role="dialog" aria-modal="true">
        <div class="pb-modal-header">
          <h3 class="pb-modal-title">Terms & Conditions</h3>
          <button type="button" class="pb-modal-close" aria-label="Close">✕</button>
        </div>
        <div class="pb-modal-body"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event listeners voor sluiten
    overlay.querySelector(".pb-modal-close").addEventListener("click", closeVoorwaardenModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeVoorwaardenModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeVoorwaardenModal(); });

    voorwaardenModal = overlay;
    return overlay;
  }

  async function openVoorwaardenModal() {
    // Wacht tot footer-loader.js het element heeft aangemaakt en gevuld
    const content = await waitForElement("actievoorwaarden-wrapper");

    if (!content) {
      console.warn("❌ Content niet gevonden (actievoorwaarden-wrapper ontbreekt).");
      return;
    }

    const overlay = createVoorwaardenModal();
    const body = overlay.querySelector(".pb-modal-body");

    // Verplaats content naar modal indien nodig
    if (!body.contains(content)) {
      body.appendChild(content);
    }

    // FIX: Maak zichtbaar (footer-loader maakt het hidden aan)
    content.style.display = "block";

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  }

  function closeVoorwaardenModal() {
    if (!voorwaardenModal) return;
    voorwaardenModal.classList.remove("is-open");
    voorwaardenModal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  // 4. Click Handling (Alleen Inline Link)
  function initClickHandlers() {
    document.addEventListener("click", (e) => {
      // 🎯 Actievoorwaarden link in de checkbox tekst
      if (e.target.closest("#open-actievoorwaarden-inline")) {
        e.preventDefault();
        openVoorwaardenModal();
      }
    });
  }

  // 5. Init
  function init() {
    initSponsorConsent();
    initClickHandlers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
