// =============================================================
// ✅ footer-loader.js — UK Version (Independent Footer)
// =============================================================

(function () {
  console.log("🦶 footer-loader.js started (UK)");
  const API_BASE = "https://coregflowuk.vercel.app";

  let footerData = null;

  function lockScroll() { document.documentElement.classList.add("modal-open"); document.body.classList.add("modal-open"); }
  function unlockScroll() { document.documentElement.classList.remove("modal-open"); document.body.classList.remove("modal-open"); }

  function createFooterPopup() {
    if (document.getElementById("footer-popup")) return;
    
    const div = document.createElement("div");
    div.innerHTML = `
      <div id="footer-popup" class="footer-popup" style="display:none;">
        <div class="footer-overlay"></div>
        <div class="footer-content" role="dialog">
          <button id="close-footer-popup">✕</button>
          <div id="footer-popup-content">Loading...</div>
        </div>
      </div>
    `;
    document.body.appendChild(div.firstElementChild);

    // CSS injectie voor de footer popup
    const style = document.createElement("style");
    style.textContent = `
      #dynamic-footer { text-align: left; font-family: 'Inter', sans-serif; padding: 15px 5px; color: #444; font-size: 13px; z-index: 1; position: relative; }
      #dynamic-footer .footer-inner { max-width: 980px; margin: 0 auto; padding: 0 10px; }
      #dynamic-footer .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
      #dynamic-footer .brand img { height: 40px; width: auto; }
      #dynamic-footer .fade-rule { height: 1px; margin: 10px auto 12px; border: 0; background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.06), rgba(0,0,0,0)); }
      #dynamic-footer .link-row { display: inline-flex; gap: 12px; flex-wrap: wrap; }
      #dynamic-footer .soft-link { background: none; border: none; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 4px 2px; color: inherit; }
      
      .footer-popup { position: fixed; inset: 0; display: flex; justify-content: center; align-items: center; z-index: 9999999; }
      .footer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
      .footer-content { position: relative; background: #fff; padding: 40px; width: 90%; max-width: 850px; max-height: 85vh; overflow-y: auto; border-radius: 12px; z-index: 2; font-family: 'Inter', sans-serif; line-height: 1.6; }
      #close-footer-popup { position: absolute; top: 10px; right: 20px; font-size: 22px; border: none; background: none; cursor: pointer; }
      html.modal-open, body.modal-open { overflow: hidden !important; }
    `;
    document.head.appendChild(style);
  }

  async function loadFooter() {
    try {
      const res = await fetch(`${API_BASE}/api/footers.js`);
      const { data } = await res.json();
      const coregPathKey = window.activeCoregPathKey || "default";
      footerData = data.find(f => f.coreg_path === coregPathKey) || data[0];

      if (footerData) renderFooter();
    } catch (e) { console.error("Footer load error:", e); }
  }

  function renderFooter() {
    let container = document.getElementById("dynamic-footer");
    if (!container) {
      container = document.createElement("div");
      container.id = "dynamic-footer";
      document.body.appendChild(container);
    }

    const logo = footerData.logo ? `<img src="${footerData.logo}" loading="lazy">` : "";
    
    container.innerHTML = `
      <div class="footer-inner">
        <div class="brand">${logo}</div>
        <hr class="fade-rule">
        <p>${footerData.text || ""}</p>
        <div class="link-row">
          <button class="soft-link" id="open-terms"><span>Terms & Conditions</span></button>
          <button class="soft-link" id="open-privacy"><span>Privacy Policy</span></button>
        </div>
      </div>
    `;
  }

  function initListeners() {
    document.addEventListener("click", (e) => {
      const popup = document.getElementById("footer-popup");
      const content = document.getElementById("footer-popup-content");
      
      if (!popup || !footerData) return;

      // Terms (Footer only)
      if (e.target.closest("#open-terms")) {
        e.preventDefault();
        content.innerHTML = footerData.terms_content || "No content.";
        popup.style.display = "flex";
        lockScroll();
      }
      
      // Privacy (Footer only)
      if (e.target.closest("#open-privacy")) {
        e.preventDefault();
        content.innerHTML = footerData.privacy_content || "No content.";
        popup.style.display = "flex";
        lockScroll();
      }

      // Close
      if (e.target.id === "close-footer-popup" || e.target.classList.contains("footer-overlay")) {
        popup.style.display = "none";
        unlockScroll();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { createFooterPopup(); loadFooter(); initListeners(); });
  } else {
    createFooterPopup(); loadFooter(); initListeners();
  }
})();
