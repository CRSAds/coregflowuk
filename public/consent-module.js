// =============================================================
// ✅ consent-module.js — UK Version (Styling Fix)
// =============================================================

(function () {

  // 1. CSS Injectie (Nu met reset voor CMS content)
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
        display: flex; flex-direction: column; max-height: 85vh;
      }
      .pb-header {
        padding: 16px 20px; border-bottom: 1px solid #eee;
        display: flex; justify-content: space-between; align-items: center;
        background: #fff;
      }
      .pb-title { margin: 0; font-size: 16px; font-weight: 700; color: #111; font-family: 'Inter', sans-serif; }
      .pb-close {
        background: none; border: none; font-size: 24px; cursor: pointer; color: #888;
        display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      }
      .pb-close:hover { color: #000; background: #f5f5f5; border-radius: 50%; }
      
      /* Content Styling & Resets */
      .pb-body { 
        padding: 20px; overflow-y: auto; font-size: 14px; line-height: 1.6; 
        color: #333; font-family: 'Inter', sans-serif; 
      }
      /* Zorg dat koppen uit CMS niet gigantisch zijn */
      .pb-body h1, .pb-body h2, .pb-body h3, .pb-body h4 {
        font-size: 16px; font-weight: 700; margin: 1.2em 0 0.5em 0; color: #111; line-height: 1.4;
      }
      .pb-body h1:first-child, .pb-body h2:first-child { margin-top: 0; }
      .pb-body p { margin-bottom: 1em; font-weight: 400; }
      .pb-body ul, .pb-body ol { padding-left: 20px; margin-bottom: 1em; }
      .pb-body li { margin-bottom: 4px; }
      .pb-body strong, .pb-body b { font-weight: 600; }
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

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSponsorConsent);
  } else {
    initSponsorConsent();
  }

})();
