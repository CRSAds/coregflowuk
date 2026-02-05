// =============================================================
// ✅ footer-loader.js — UK Version (Safe Update)
// =============================================================

(function () {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  
  // 👇 HARDE URL NAAR JE VERCEL BACKEND
  const API_BASE = "https://coregflowuk.vercel.app";

  console.log("🦶 footer-loader.js started (UK)");

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

  document.addEventListener("DOMContentLoaded", async () => {
    // === Popup injecteren (English) ===
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

    // === CSS (Identiek aan NL - BEHOUDEN) ===
    const style = document.createElement("style");
    style.textContent = `
      #dynamic-footer {
        text-align: left;
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        padding: 15px 5px;
        background: transparent;
        color: #444;
        font-size: 13px;
        line-height: 1.6;
        position: relative;
        z-index: 1;
      }
      #dynamic-footer .footer-inner {
        max-width: 980px;
        margin: 0 auto;
        padding: 0 10px;
      }
      #dynamic-footer .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        justify-content: flex-start;
        margin-bottom: 10px;
      }
      #dynamic-footer .brand img {
        height: 40px;
        width: auto;
        display: block;
      }
      #dynamic-footer .fade-rule {
        height: 1px;
        margin: 10px auto 12px;
        border: 0;
        background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.06), rgba(0,0,0,0));
      }
      #dynamic-footer p { margin-bottom: 8px; }

      #dynamic-footer .link-row {
        display: inline-flex;
        align-items: left;
        gap: 12px;
        flex-wrap: wrap;
      }
      #dynamic-footer .soft-link {
        background: none;
        border: none;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        color: inherit;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 2px;
      }
      #dynamic-footer .soft-link img.icon {
        width: 16px;
        height: 16px;
        display: inline-block;
      }

      .footer-popup {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2147483647;
        isolation: isolate;
      }
      .footer-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.6);
      }
      .footer-content {
        position: relative;
        background: #fff;
        padding: 40px;
        max-width: 850px;
        width: min(94vw, 850px);
        max-height: 85vh;
        overflow-y: auto;
        border-radius: 12px;
        z-index: 2147483647;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: #333;
        line-height: 1.7;
        box-shadow: 0 8px 28px rgba(0,0,0,0.25);
      }
      #close-footer-popup {
        position: absolute;
        top: 10px;
        right: 20px;
        font-size: 22px;
        border: none;
        background: none;
        cursor: pointer;
        color: #666;
      }
      #close-footer-popup:hover { color: #000; }

      html.modal-open, body.modal-open { overflow: hidden !important; }

      @media (max-width: 768px) {
        #dynamic-footer { text-align: left; padding: 20px; }
        #dynamic-footer p { text-align: justify; }
        .footer-content { max-height: 88vh; padding: 24px; }
        #dynamic-footer .brand { justify-content: flex-start; }
      }
    `;
    document.head.appendChild(style);

    // === Data ophalen ===
    let footerData = null;
    try {
      // ✅ Absolute URL
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      
      const coregPathKey = window.activeCoregPathKey || "default";
      footerData = data.find(f => f.coreg_path === coregPathKey) || data[0]; // Fallback

      if (!footerData) {
        console.warn("⚠️ No UK footer data found.");
        return;
      }
    } catch (err) {
      console.error("❌ Error loading footer:", err);
      return;
    }

    // === Footer container ===
    let footerContainer = document.getElementById("dynamic-footer");
    if (!footerContainer) {
      footerContainer = document.createElement("div");
      footerContainer.id = "dynamic-footer";
      document.body.appendChild(footerContainer);
    }

    // === Footer inhoud ===
    const termsIcon = footerData.icon_terms
      ? `<img class="icon" src="${footerData.icon_terms}" alt="">`
      : `<span aria-hidden="true">🔒</span>`;
    const privacyIcon = footerData.icon_privacy
      ? `<img class="icon" src="${footerData.icon_privacy}" alt="">`
      : `<span aria-hidden="true">✅</span>`;
    const logo = footerData.logo
      ? `<img src="${footerData.logo}" alt="Logo" loading="lazy">`
      : "";

    // Translations in HTML
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

    // === Popup gedrag ===
    document.addEventListener("click", (e) => {
      // 1. Terms (Footer knop)
      if (e.target.closest("#open-terms")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.terms_content || "<p>No terms available.</p>";
        popup.style.display = "flex";
        lockScroll();
      }

      // 2. Actievoorwaarden (Inline link in checkbox)
      // ✅ Gebruik .closest() zodat het ook werkt als je op de tekst klikt
      if (e.target.closest("#open-actievoorwaarden-inline")) {
        e.preventDefault();
        // Toon specifieke actievoorwaarden als ze er zijn, anders fallback naar algemene terms
        popupContent.innerHTML = footerData.actievoorwaarden || footerData.terms_content || "<p>No terms available.</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // 3. Privacy
      if (e.target.closest("#open-privacy")) {
        e.preventDefault();
        popupContent.innerHTML = footerData.privacy_content || "<p>No privacy policy available.</p>";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // 4. Close
      if (e.target.id === "close-footer-popup" || e.target.classList.contains("footer-overlay")) {
        popup.style.display = "none";
        unlockScroll();
      }
    });

    // === Actievoorwaarden Injectie (Fallback) ===
    const actieDiv = document.getElementById("actievoorwaarden");
    if (actieDiv && footerData.actievoorwaarden) {
      actieDiv.innerHTML = footerData.actievoorwaarden;
    }

    // Popup hoisten
    const popupEl = document.getElementById("footer-popup");
    if (popupEl && popupEl.parentElement !== document.body) document.body.appendChild(popupEl);

    console.log("✅ UK Footer loaded.");
  });
})();
