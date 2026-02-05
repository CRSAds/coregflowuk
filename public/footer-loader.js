// =============================================================
// ✅ footer-loader.js — UK Version (Styling Fix)
// =============================================================

(function () {
  console.log("🦶 footer-loader.js started (UK)");
  const API_BASE = "https://coregflowuk.vercel.app";

  let footerData = null;

  // === 1. Setup & CSS Injectie ===
  function setup() {
    if (!document.getElementById("fl-styles")) {
      const style = document.createElement("style");
      style.id = "fl-styles";
      style.textContent = `
        /* Footer Styling */
        #dynamic-footer { text-align: left; font-family: 'Inter', sans-serif; padding: 15px 5px; color: #444; font-size: 13px; line-height: 1.6; position: relative; z-index: 1; }
        #dynamic-footer .footer-inner { max-width: 980px; margin: 0 auto; padding: 0 10px; }
        #dynamic-footer .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
        #dynamic-footer .brand img { height: 40px; width: auto; display: block; }
        #dynamic-footer .fade-rule { height: 1px; margin: 10px auto 12px; border: 0; background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.06), rgba(0,0,0,0)); }
        #dynamic-footer .link-row { display: inline-flex; gap: 12px; flex-wrap: wrap; }
        #dynamic-footer .soft-link { background: none; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 4px 2px; color: inherit; }
        #dynamic-footer .soft-link img.icon { width: 16px; height: 16px; }

        /* Popup Styling */
        .fl-popup { 
          position: fixed; inset: 0; z-index: 999999; 
          display: none; justify-content: center; align-items: center; 
        }
        .fl-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); }
        .fl-content { 
          position: relative; background: #fff; padding: 40px; 
          width: min(94vw, 850px); max-height: 85vh; overflow-y: auto; 
          border-radius: 12px; z-index: 2; box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; color: #333;
        }
        .fl-close { position: absolute; top: 10px; right: 20px; font-size: 24px; border: none; background: none; cursor: pointer; color: #666; }
        .fl-close:hover { color: #000; }
        
        /* Content Reset voor CMS data */
        .fl-content h1, .fl-content h2, .fl-content h3, .fl-content h4 {
           font-size: 16px; font-weight: 700; margin: 1.2em 0 0.5em 0; color: #111; line-height: 1.4;
        }
        .fl-content h1:first-child, .fl-content h2:first-child { margin-top: 0; }
        .fl-content p { margin-bottom: 1em; }
        .fl-content ul, .fl-content ol { padding-left: 20px; margin-bottom: 1em; }
        .fl-content li { margin-bottom: 4px; }
        
        body.fl-locked { overflow: hidden !important; }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById("fl-popup")) {
      const div = document.createElement("div");
      div.innerHTML = `
        <div id="fl-popup" class="fl-popup">
          <div class="fl-overlay"></div>
          <div class="fl-content">
            <button class="fl-close">×</button>
            <div id="fl-content-body">Loading...</div>
          </div>
        </div>
      `;
      document.body.appendChild(div.firstElementChild);
    }

    if (!document.getElementById("actievoorwaarden-wrapper")) {
      const w = document.createElement("div");
      w.id = "actievoorwaarden-wrapper";
      w.style.display = "none";
      w.innerHTML = '<div id="actievoorwaarden"></div>';
      document.body.appendChild(w);
    }
  }

  // === 2. Logic ===
  function showPopup(html) {
    const popup = document.getElementById("fl-popup");
    const body = document.getElementById("fl-content-body");
    if(popup && body) {
      body.innerHTML = html;
      popup.style.display = "flex";
      document.body.classList.add("fl-locked");
    }
  }

  function hidePopup() {
    const popup = document.getElementById("fl-popup");
    if(popup) {
      popup.style.display = "none";
      document.body.classList.remove("fl-locked");
    }
  }

  async function loadData() {
    try {
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      const key = window.activeCoregPathKey || "default";
      footerData = data.find(f => f.coreg_path === key) || data[0];

      if(footerData) {
        renderFooter();
        const bridge = document.getElementById("actievoorwaarden");
        // Gebruik actievoorwaarden als beschikbaar, anders terms_content
        const content = footerData.actievoorwaarden || footerData.terms_content;
        if(bridge && content) bridge.innerHTML = content;
      }
    } catch(e) { console.error(e); }
  }

  function renderFooter() {
    let box = document.getElementById("dynamic-footer");
    if (!box) {
      box = document.createElement("div");
      box.id = "dynamic-footer";
      document.body.appendChild(box);
    }
    const ti = footerData.icon_terms ? `<img class="icon" src="${footerData.icon_terms}">` : `<span>🔒</span>`;
    const pi = footerData.icon_privacy ? `<img class="icon" src="${footerData.icon_privacy}">` : `<span>✅</span>`;
    const logo = footerData.logo ? `<img src="${footerData.logo}" loading="lazy">` : "";

    box.innerHTML = `
      <div class="footer-inner">
        <div class="brand">${logo}</div>
        <hr class="fade-rule">
        <p>${footerData.text || ""}</p>
        <div class="link-row">
          <button class="soft-link" id="btn-terms">${ti}<span>Terms & Conditions</span></button>
          <button class="soft-link" id="btn-privacy">${pi}<span>Privacy Policy</span></button>
        </div>
      </div>
    `;
  }

  // === 3. Event Listeners ===
  document.addEventListener("click", (e) => {
    if (e.target.closest("#btn-terms")) {
      e.preventDefault();
      showPopup(footerData?.terms_content || "No terms loaded.");
    }
    if (e.target.closest("#btn-privacy")) {
      e.preventDefault();
      showPopup(footerData?.privacy_content || "No privacy loaded.");
    }
    if (e.target.closest(".fl-close") || e.target.classList.contains("fl-overlay")) {
      hidePopup();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { setup(); loadData(); });
  } else {
    setup(); loadData();
  }
})();
