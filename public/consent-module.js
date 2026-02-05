// =============================================================
// ✅ consent-module.js — UK Version (Readable Text Fix)
// =============================================================

(function () {

  // 1. CSS Injectie (Met agressieve reset voor leesbaarheid)
  function injectStyles() {
    if (document.getElementById("cm-styles")) return;
    const style = document.createElement("style");
    style.id = "cm-styles";
    style.textContent = `
      .pb-overlay {
        position: fixed; inset: 0; z-index: 999999;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
        display: none; justify-content: center; align-items: center;
      }
      .pb-overlay.is-visible { display: flex; }
      .pb-card {
        background: #fff; width: 90%; max-width: 500px;
        border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: flex; flex-direction: column; height: 80vh;
      }
      .pb-header {
        padding: 16px 20px; border-bottom: 1px solid #eee;
        display: flex; justify-content: space-between; align-items: center;
        background: #fff;
      }
      .pb-title { margin: 0; font-size: 16px; font-weight: 700; color: #111; font-family: 'Inter', sans-serif; text-transform: none; }
      .pb-close {
        background: none; border: none; font-size: 24px; cursor: pointer; color: #888;
        display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      }
      
      /* --- Content Styling & Reset --- */
      .pb-body { 
        padding: 20px; overflow-y: auto; color: #333; font-family: 'Inter', sans-serif; 
        text-align: left; /* Zorg dat tekst links lijnt */
      }
      
      /* Forceer alles naar normaal leesbaar formaat */
      .pb-body * {
        text-transform: none !important; /* GEEN HOOFDLETTERS */
        max-width: 100%;
      }
      
      /* Reset koppen (h1, h2, etc.) naar normaal formaat */
      .pb-body h1, .pb-body h2, .pb-body h3, .pb-body h4, .pb-body h5 {
        font-size: 15px !important;
        font-weight: 700 !important;
        margin: 15px 0 8px 0 !important;
        color: #111 !important;
        line-height: 1.4 !important;
        text-transform: none !important;
      }
      .pb-body h1:first-child, .pb-body h2:first-child { margin-top: 0 !important; }

      /* Reset paragrafen */
      .pb-body p, .pb-body li, .pb-body span, .pb-body div {
        font-size: 13px !important;
        line-height: 1.6 !important;
        margin-bottom: 10px !important;
        color: #444 !important;
        font-weight: 400 !important;
        text-transform: none !important;
      }
      .pb-body strong, .pb-body b { font-weight: 700 !important; color: #000 !important; }
      .pb-body ul, .pb-body ol { padding-left: 20px !important; margin-bottom: 10px !important; }
    `;
    document.head.appendChild(style);
  }

  // 2. Checkbox Logic
  function initSponsorConsent() {
    const checkbox = document.querySelector(".consent-row input[type='checkbox']");
    if (checkbox) {
      sessionStorage.setItem("sponsorsAccepted", "false");
      checkbox.addEventListener("change", () => {
        sessionStorage.setItem("sponsorsAccepted", checkbox.checked ? "true" : "false");
      });
    }
  }

  // 3. Modal Logic
  let overlay = null;

  function getModal() {
    if (overlay) return overlay;
    
    injectStyles();

    overlay = document.createElement("div");
    overlay.className = "pb-overlay";
    overlay.innerHTML = `
      <div class="pb-card">
        <div class="pb-header">
          <h3 class="pb-title">Terms & Conditions</h3>
          <button class="pb-close" aria-label="Close">×</button>
        </div>
        <div class="pb-body" id="pb-content">Loading...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove("is-visible");
      document.body.style.overflow = "";
    };
    overlay.querySelector(".pb-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    return overlay;
  }

  function waitForContent() {
    return new Promise(resolve => {
      const check = setInterval(() => {
        const el = document.getElementById("actievoorwaarden");
        if (el && el.innerHTML.trim().length > 0) {
          clearInterval(check);
          resolve(el.innerHTML);
        }
      }, 200);
      
      setTimeout(() => {
        clearInterval(check);
        resolve(null);
      }, 3000);
    });
  }

  // 4. Click Handler
  document.addEventListener("click", async (e) => {
    if (e.target.closest("#open-actievoorwaarden-inline")) {
      e.preventDefault();
      
      const modal = getModal();
      const body = modal.querySelector("#pb-content");
      
      modal.classList.add("is-visible");
      document.body.style.overflow = "hidden";

      const content = await waitForContent();
      if (content) {
        body.innerHTML = content;
      } else {
        body.innerHTML = "<p>Please verify terms in the footer.</p>";
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSponsorConsent);
  } else {
    initSponsorConsent();
  }

})();
