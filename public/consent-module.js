// =============================================================
// ✅ consent-module.js — UK Version (Self-Contained & Robust)
// =============================================================

(function () {
  const API_BASE = "https://coregflowuk.vercel.app";

  // 1. Checkbox Logic
  function initSponsorConsent() {
    const checkbox = document.querySelector(".consent-row input[type='checkbox']");
    if (checkbox) {
      sessionStorage.setItem("sponsorsAccepted", "false");
      checkbox.addEventListener("change", () => {
        sessionStorage.setItem("sponsorsAccepted", checkbox.checked ? "true" : "false");
      });
    }
  }

  // 2. Modal Logic (Eigen modal, wacht niet op footer-loader)
  let modalOverlay = null;

  function createModal() {
    if (modalOverlay) return modalOverlay;
    
    modalOverlay = document.createElement("div");
    modalOverlay.className = "pb-modal-overlay"; // Gebruikt bestaande CSS
    modalOverlay.setAttribute("aria-hidden", "true");
    modalOverlay.innerHTML = `
      <div class="pb-modal" role="dialog">
        <div class="pb-modal-header">
          <h3 class="pb-modal-title">Terms & Conditions</h3>
          <button type="button" class="pb-modal-close">✕</button>
        </div>
        <div class="pb-modal-body">
           <div id="inline-terms-content">Loading terms...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Sluiten logic
    const close = () => {
        modalOverlay.classList.remove("is-open");
        document.documentElement.style.overflow = "";
    };
    modalOverlay.querySelector(".pb-modal-close").addEventListener("click", close);
    modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) close(); });
    
    return modalOverlay;
  }

  // 3. Data Ophalen (Specifiek voor deze modal)
  async function fetchAndShowTerms() {
    const contentDiv = document.getElementById("inline-terms-content");
    if (!contentDiv) return;

    try {
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      const coregPathKey = window.activeCoregPathKey || "default";
      const footerData = data.find(f => f.coreg_path === coregPathKey) || data[0];

      if (footerData) {
        // Gebruik actievoorwaarden als beschikbaar, anders algemene terms
        contentDiv.innerHTML = footerData.actievoorwaarden || footerData.terms_content;
      } else {
        contentDiv.innerHTML = "<p>No terms available.</p>";
      }
    } catch (e) {
      contentDiv.innerHTML = "<p>Error loading terms.</p>";
    }
  }

  // 4. Click Handler
  function initClickHandlers() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#open-actievoorwaarden-inline")) {
        e.preventDefault();
        const overlay = createModal();
        overlay.classList.add("is-open");
        document.documentElement.style.overflow = "hidden";
        
        // Haal data op (of toon cache als we dat zouden bouwen)
        fetchAndShowTerms();
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
