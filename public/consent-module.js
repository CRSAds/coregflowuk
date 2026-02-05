// =============================================================
// ✅ consent-module.js — UK Version (Self-Contained Styles)
// =============================================================

(function () {

  // 1. CSS Injectie (Zodat popup altijd werkt)
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
      }
      .pb-title { margin: 0; font-size: 16px; font-weight: 700; color: #111; font-family: sans-serif; }
      .pb-close {
        background: none; border: none; font-size: 24px; cursor: pointer; color: #888;
      }
      .pb-body { padding: 20px; overflow-y: auto; font-size: 14px; line-height: 1.6; color: #333; font-family: sans-serif; }
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
    
    injectStyles(); // Zeker weten dat styles er zijn

    overlay = document.createElement("div");
    overlay.className = "pb-overlay";
    overlay.innerHTML = `
      <div class="pb-card">
        <div class="pb-header">
          <h3 class="pb-title">Terms & Conditions</h3>
          <button class="pb-close">×</button>
        </div>
        <div class="pb-body" id="pb-content">Loading...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
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
      // Wacht op de div die footer-loader maakt
      const check = setInterval(() => {
        const el = document.getElementById("actievoorwaarden");
        if (el && el.innerHTML.trim().length > 0) {
          clearInterval(check);
          resolve(el.innerHTML);
        }
      }, 200);
      
      // Of timeout na 3 sec en toon fallback
      setTimeout(() => {
        clearInterval(check);
        resolve(null);
      }, 3000);
    });
  }

  // 4. Click Handler (Inline Link)
  document.addEventListener("click", async (e) => {
    if (e.target.closest("#open-actievoorwaarden-inline")) {
      e.preventDefault();
      
      const modal = getModal();
      const body = modal.querySelector("#pb-content");
      
      modal.classList.add("is-visible");
      document.body.style.overflow = "hidden"; // Lock scroll

      // Probeer content te pakken uit de brug
      const content = await waitForContent();
      if (content) {
        body.innerHTML = content;
      } else {
        // Fallback als footer-loader traag is of faalt
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
