// =============================================================
// ✅ footer-loader.js — UK Version (Bridge Fix + Absolute URL)
// =============================================================

(function () {
  console.log("🦶 footer-loader.js started (UK)");
  
  // 👇 HARDE URL NAAR JE VERCEL BACKEND
  const API_BASE = "https://coregflowuk.vercel.app";

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

  document.addEventListener("DOMContentLoaded", async () => {
    // 1. Popup HTML Injecteren (Voor Footer Links)
    if (!document.getElementById("footer-popup")) {
        const popupHTML = `
          <div id="footer-popup" class="footer-popup" style="display:none;">
            <div class="footer-overlay"></div>
            <div class="footer-content" role="dialog" aria-modal="true">
              <button id="close-footer-popup" aria-label="Close">×</button>
              <div id="footer-popup-content">Loading...</div>
            </div>
          </div>
        `;
        document.body.appendChild(el(popupHTML));
    }

    const popup = document.getElementById("footer-popup");
    const popupContent = document.getElementById("footer-popup-content");

    // 2. CSS Injecteren
    const style = document.createElement("style");
    style.textContent = `
      #dynamic-footer { text-align: left; font-family: 'Inter', sans-serif; padding: 15px 5px; color: #444; font-size: 13px; line-height: 1.6; position: relative; z-index: 1; }
      #dynamic-footer .footer-inner { max-width: 980px; margin: 0 auto; padding: 0 10px; }
      #dynamic-footer .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
      #dynamic-footer .brand img { height: 40px; width: auto; display: block; }
      #dynamic-footer .fade-rule { height: 1px; margin: 10px auto 12px; border: 0; background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.06), rgba(0,0,0,0)); }
      #dynamic-footer .link-row { display: inline-flex; gap: 12px; flex-wrap: wrap; }
      #dynamic-footer .soft-link { background: none; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 4px 2px; color: inherit; }
      #dynamic-footer .soft-link img.icon { width: 16px; height: 16px; }

      .footer-popup { position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; z-index: 2147483647; isolation: isolate; }
      .footer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
      .footer-content { position: relative; background: #fff; padding: 40px; width: min(94vw, 850px); max-height: 85vh; overflow-y: auto; border-radius: 12px; z-index: 2; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.7; box-shadow: 0 8px 28px rgba(0,0,0,0.25); }
      #close-footer-popup { position: absolute; top: 10px; right: 20px; font-size: 22px; border: none; background: none; cursor: pointer; color: #666; }
      html.modal-open, body.modal-open { overflow: hidden !important; }
      @media (max-width: 768px) { #dynamic-footer { padding: 20px; } }
    `;
    document.head.appendChild(style);

    // 3. Data Ophalen
    let footerData = null;
    try {
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      
      const coregPathKey = window.activeCoregPathKey || "default";
      // Zoek specifieke footer, anders fallback naar eerste
      footerData = data.find(f => f.coreg_path === coregPathKey) || data[0];

      if (!footerData) {
        console.warn("⚠️ No UK footer data found.");
        return;
      }
    } catch (err) {
      console.error("❌ Error loading footer:", err);
      return;
    }

    // 4. Footer Renderen
    let footerContainer = document.getElementById("dynamic-footer");
    if (!footerContainer) {
      footerContainer = document.createElement("div");
      footerContainer.id = "dynamic-footer";
      document.body.appendChild(footerContainer);
    }

    const termsIcon = footerData.icon_terms ? `<img class="icon" src="${footerData.icon_terms}">` : `<span>🔒</span>`;
    const privacyIcon = footerData.icon_privacy ? `<img class="icon" src="${footerData.icon_privacy}">` : `<span>✅</span>`;
    const logo = footerData.logo ? `<img src="${footerData.logo}" alt="Logo" loading="lazy">` : "";

    footerContainer.innerHTML = `
      <div class="footer-inner">
        <div class="brand">${logo}</div>
        <hr class="fade-rule">
        <p>${footerData.text || ""}</p>
        <div class="link-row">
          <button class="soft-link" id="open-terms">${termsIcon}<span>Terms & Conditions</span></button>
          <button class="soft-link" id="open-privacy">${privacyIcon}<span>Privacy Policy</span></button>
        </div>
      </div>
    `;

    // 5. Click Handlers (Footer Links)
    document.addEventListener("click", (e) => {
      // Footer Terms
      if (e.target.closest("#open-terms")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.terms_content || "<p>No terms available.</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // Footer Privacy
      if (e.target.closest("#open-privacy")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.privacy_content || "<p>No privacy policy available.</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // Close
      if (e.target.id === "close-footer-popup" || e.target.classList.contains("footer-overlay")) {
        popup.style.display = "none";
        unlockScroll();
      }
    });

    // 6. Actievoorwaarden Injectie (HET BRUGGETJE)
    // FIX: Maak de wrapper aan als deze niet bestaat, zodat consent-module.js hem kan vinden
    let actieWrapper = document.getElementById("actievoorwaarden-wrapper");
    if (!actieWrapper) {
        actieWrapper = document.createElement("div");
        actieWrapper.id = "actievoorwaarden-wrapper";
        actieWrapper.style.display = "none"; // Verbergen, wordt getoond in popup
        actieWrapper.innerHTML = '<div id="actievoorwaarden"></div>';
        document.body.appendChild(actieWrapper);
    }

    // Vul de content
    const actieDiv = document.getElementById("actievoorwaarden");
    // Gebruik actievoorwaarden als beschikbaar, anders terms_content als fallback
    const contentToInject = footerData.actievoorwaarden || footerData.terms_content;
    
    if (actieDiv && contentToInject) {
      actieDiv.innerHTML = contentToInject;
      console.log("✅ Actievoorwaarden/Terms injected for popup.");
    }

    // Popup hoisten
    const popupEl = document.getElementById("footer-popup");
    if (popupEl && popupEl.parentElement !== document.body) document.body.appendChild(popupEl);

    console.log("✅ UK Footer loaded.");
  });
})();
