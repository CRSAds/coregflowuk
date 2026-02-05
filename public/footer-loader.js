// =============================================================
// ✅ footer-loader.js — UK Version (Fixed Loading Order)
// =============================================================

(function () {
  console.log("🦶 footer-loader.js started (UK)");
  const API_BASE = "https://coregflowuk.vercel.app";

  // Data container (start leeg)
  let footerData = {
    terms_content: "<p>Loading terms...</p>",
    privacy_content: "<p>Loading privacy policy...</p>",
    actievoorwaarden: "<p>Loading details...</p>"
  };

  // === 1. Directe Setup (Wacht niet op fetch) ===
  function setupDOM() {
    // A. Footer Popup HTML
    if (!document.getElementById("footer-popup")) {
      const div = document.createElement("div");
      div.innerHTML = `
        <div id="footer-popup" class="footer-popup" style="display:none;">
          <div class="footer-overlay"></div>
          <div class="footer-content" role="dialog" aria-modal="true">
            <button id="close-footer-popup" aria-label="Close">×</button>
            <div id="footer-popup-content">Loading...</div>
          </div>
        </div>
      `;
      document.body.appendChild(div.firstElementChild);
    }

    // B. Actievoorwaarden Wrapper (De 'Brug' naar consent-module)
    if (!document.getElementById("actievoorwaarden-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.id = "actievoorwaarden-wrapper";
      wrapper.style.display = "none"; // Verberg standaard
      wrapper.innerHTML = '<div id="actievoorwaarden"></div>';
      document.body.appendChild(wrapper);
    }

    // C. CSS Injectie
    if (!document.getElementById("uk-footer-css")) {
      const style = document.createElement("style");
      style.id = "uk-footer-css";
      style.textContent = `
        #dynamic-footer { text-align: left; font-family: 'Inter', sans-serif; padding: 15px 5px; color: #444; font-size: 13px; line-height: 1.6; position: relative; z-index: 1; }
        #dynamic-footer .footer-inner { max-width: 980px; margin: 0 auto; padding: 0 10px; }
        #dynamic-footer .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
        #dynamic-footer .brand img { height: 40px; width: auto; display: block; }
        #dynamic-footer .fade-rule { height: 1px; margin: 10px auto 12px; border: 0; background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.06), rgba(0,0,0,0)); }
        #dynamic-footer .link-row { display: inline-flex; gap: 12px; flex-wrap: wrap; }
        #dynamic-footer .soft-link { background: none; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 4px 2px; color: inherit; }
        #dynamic-footer .soft-link img.icon { width: 16px; height: 16px; }
        
        /* Popup Styles */
        .footer-popup { position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; z-index: 2147483647; }
        .footer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
        .footer-content { position: relative; background: #fff; padding: 40px; width: min(94vw, 850px); max-height: 85vh; overflow-y: auto; border-radius: 12px; z-index: 2; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.7; box-shadow: 0 8px 28px rgba(0,0,0,0.25); }
        #close-footer-popup { position: absolute; top: 10px; right: 20px; font-size: 22px; border: none; background: none; cursor: pointer; color: #666; }
        html.modal-open, body.modal-open { overflow: hidden !important; }
        @media (max-width: 768px) { #dynamic-footer { padding: 20px; } .footer-content { padding: 24px; max-height: 88vh; } }
      `;
      document.head.appendChild(style);
    }
  }

  // === 2. Event Listeners (Altijd actief) ===
  function setupListeners() {
    const popup = document.getElementById("footer-popup");
    const popupContent = document.getElementById("footer-popup-content");

    document.addEventListener("click", (e) => {
      // Footer: Terms
      if (e.target.closest("#open-terms")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.terms_content || "<p>Loading...</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      // Footer: Privacy
      else if (e.target.closest("#open-privacy")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.privacy_content || "<p>Loading...</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      // Popup Sluiten
      else if (e.target.id === "close-footer-popup" || e.target.classList.contains("footer-overlay")) {
        popup.style.display = "none";
        unlockScroll();
      }
    });
  }

  // === 3. Data Fetching ===
  async function loadData() {
    try {
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      const coregPathKey = window.activeCoregPathKey || "default";
      const found = data.find(f => f.coreg_path === coregPathKey) || data[0];

      if (found) {
        footerData = found;
        renderFooter(found);
        
        // Vul de brug voor consent-module
        const actieDiv = document.getElementById("actievoorwaarden");
        if (actieDiv) {
            actieDiv.innerHTML = found.actievoorwaarden || found.terms_content;
        }
      }
    } catch (err) {
      console.error("❌ Footer load failed:", err);
    }
  }

  function renderFooter(data) {
    let container = document.getElementById("dynamic-footer");
    if (!container) {
      container = document.createElement("div");
      container.id = "dynamic-footer";
      document.body.appendChild(container);
    }

    const termsIcon = data.icon_terms ? `<img class="icon" src="${data.icon_terms}">` : `<span>🔒</span>`;
    const privacyIcon = data.icon_privacy ? `<img class="icon" src="${data.icon_privacy}">` : `<span>✅</span>`;
    const logo = data.logo ? `<img src="${data.logo}" alt="Logo" loading="lazy">` : "";

    container.innerHTML = `
      <div class="footer-inner">
        <div class="brand">${logo}</div>
        <hr class="fade-rule">
        <p>${data.text || ""}</p>
        <div class="link-row">
          <button class="soft-link" id="open-terms">${termsIcon}<span>Terms & Conditions</span></button>
          <button class="soft-link" id="open-privacy">${privacyIcon}<span>Privacy Policy</span></button>
        </div>
      </div>
    `;
  }

  function lockScroll() { document.documentElement.classList.add("modal-open"); document.body.classList.add("modal-open"); }
  function unlockScroll() { document.documentElement.classList.remove("modal-open"); document.body.classList.remove("modal-open"); }

  // === Boot ===
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { setupDOM(); setupListeners(); loadData(); });
  } else {
    setupDOM(); setupListeners(); loadData();
  }
})();
