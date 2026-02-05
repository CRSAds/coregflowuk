// =============================================================
// ✅ footer-loader.js — UK Version (Immediate Interaction)
// =============================================================

(function () {
  console.log("🦶 footer-loader.js started (UK)");
  
  // 👇 HARDE URL NAAR JE VERCEL BACKEND
  const API_BASE = "https://coregflowuk.vercel.app";

  // State voor data (standaard leeg)
  let footerData = {
    terms_content: "<p>Loading terms...</p>",
    privacy_content: "<p>Loading privacy policy...</p>",
    actievoorwaarden: "<p>Loading conditions...</p>"
  };

  // === Helpers ===
  function lockScroll() {
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }
  function unlockScroll() {
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }
  function el(html) {
    const div = document.createElement("div");
    div.innerHTML = html.trim();
    return div.firstElementChild;
  }

  // === 1. Injectie & Setup (Draait meteen) ===
  function init() {
    // A. Popup HTML Injecteren (indien niet aanwezig)
    if (!document.getElementById("footer-popup")) {
      const popupHTML = `
        <div id="footer-popup" class="footer-popup" style="display:none;">
          <div class="footer-overlay"></div>
          <div class="footer-content" role="dialog" aria-modal="true">
            <button id="close-footer-popup" aria-label="Close">×</button>
            <div id="footer-popup-content">
              <div class="spinner">Loading...</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(el(popupHTML));
    }

    // B. CSS Injecteren
    if (!document.getElementById("footer-styles")) {
      const style = document.createElement("style");
      style.id = "footer-styles";
      style.textContent = `
        /* Footer Basis */
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
        .footer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); }
        .footer-content { position: relative; background: #fff; padding: 40px; width: min(94vw, 850px); max-height: 85vh; overflow-y: auto; border-radius: 12px; z-index: 2; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.7; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        #close-footer-popup { position: absolute; top: 10px; right: 20px; font-size: 22px; border: none; background: none; cursor: pointer; color: #666; }
        #close-footer-popup:hover { color: #000; }
        html.modal-open, body.modal-open { overflow: hidden !important; }
        
        .spinner { text-align: center; color: #888; padding: 20px; }
      `;
      document.head.appendChild(style);
    }

    // C. Click Handlers (Meteen activeren!)
    setupEventDelegation();

    // D. Data Ophalen (Async)
    fetchFooterData();
  }

  // === 2. Event Listeners ===
  function setupEventDelegation() {
    document.addEventListener("click", (e) => {
      const popup = document.getElementById("footer-popup");
      const popupContent = document.getElementById("footer-popup-content");
      if (!popup || !popupContent) return;

      // A. "Terms & Conditions" (Checkbox Link OF Footer Link)
      if (e.target.closest("#open-actievoorwaarden-inline") || e.target.closest("#open-terms")) {
        e.preventDefault();
        e.stopPropagation(); // Voorkom dat de checkbox zelf togglet
        
        console.log("📄 Terms clicked");
        
        // Logica: Als het de inline link is, toon actievoorwaarden. Anders algemene terms.
        // Fallback: Als actievoorwaarden leeg is, toon terms.
        const isInline = e.target.closest("#open-actievoorwaarden-inline");
        let content = isInline 
          ? (footerData.actievoorwaarden || footerData.terms_content)
          : footerData.terms_content;

        popupContent.innerHTML = content || "<p>Loading content...</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // B. Privacy Policy
      if (e.target.closest("#open-privacy")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.privacy_content || "<p>Loading content...</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // C. Sluiten
      if (e.target.id === "close-footer-popup" || e.target.classList.contains("footer-overlay")) {
        e.preventDefault();
        popup.style.display = "none";
        unlockScroll();
      }
    });
  }

  // === 3. Data Fetching ===
  async function fetchFooterData() {
    try {
      console.log("🔄 Fetching footer data...");
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      
      const coregPathKey = window.activeCoregPathKey || "default";
      // Zoek specifieke footer, anders fallback naar eerste
      const found = data.find(f => f.coreg_path === coregPathKey) || data[0];

      if (found) {
        footerData = found;
        renderFooter(found);
        
        // Fallback injectie voor statische tekst
        const actieDiv = document.getElementById("actievoorwaarden");
        if (actieDiv && found.actievoorwaarden) {
          actieDiv.innerHTML = found.actievoorwaarden;
        }
        console.log("✅ Footer data loaded");
      }
    } catch (err) {
      console.error("❌ Error loading footer:", err);
      footerData.terms_content = "<p>Could not load terms. Please contact support.</p>";
    }
  }

  // === 4. Render Footer (Onderaan) ===
  function renderFooter(data) {
    let footerContainer = document.getElementById("dynamic-footer");
    if (!footerContainer) {
      footerContainer = document.createElement("div");
      footerContainer.id = "dynamic-footer";
      document.body.appendChild(footerContainer);
    }

    const termsIcon = data.icon_terms ? `<img class="icon" src="${data.icon_terms}">` : `<span>🔒</span>`;
    const privacyIcon = data.icon_privacy ? `<img class="icon" src="${data.icon_privacy}">` : `<span>✅</span>`;
    const logo = data.logo ? `<img src="${data.logo}" alt="Logo" loading="lazy">` : "";

    footerContainer.innerHTML = `
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

  // === 5. Boot ===
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
