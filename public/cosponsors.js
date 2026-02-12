// =============================================================
// ✅ cosponsors.js (UK Version - Absolute URL Fix)
// =============================================================

(function () {
  let sponsorsData = [];
  // 👇 DEZE URL MOET NAAR JE VERCEL BACKEND WIJZEN
  const API_BASE = "https://coregflowuk.vercel.app"; 

  // 1. Popup HTML & CSS Injectie
  function injectPopup() {
    if (document.getElementById("cosponsor-popup")) return;

    const style = document.createElement("style");
    style.textContent = `
      .footer-popup {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 999999; display: flex; align-items: center; justify-content: center;
        opacity: 0; visibility: hidden; transition: opacity 0.3s ease;
      }
      .footer-popup.is-visible { opacity: 1; visibility: visible; }
      .footer-overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
      }
      .footer-content {
        position: relative; background: #fff; width: 90%; max-width: 500px;
        border-radius: 16px; padding: 24px; z-index: 10; max-height: 85vh;
        display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      }
      #close-cosponsor-popup {
        position: absolute; top: 12px; right: 12px; background: #f0f0f0; border: none;
        width: 32px; height: 32px; border-radius: 50%; font-size: 20px; cursor: pointer;
        display: flex; align-items: center; justify-content: center; color: #333;
      }
      #close-cosponsor-popup:hover { background: #e0e0e0; }
      .cosponsor-list {
        display: flex; flex-direction: column; gap: 15px; margin-top: 20px;
        overflow-y: auto; padding-right: 5px;
      }
      .cosponsor-item {
        display: flex; gap: 15px; border-bottom: 1px solid #f0f0f0;
        padding-bottom: 15px; align-items: flex-start;
      }
      .cosponsor-logo { flex: 0 0 70px; display: flex; align-items: center; justify-content: center; }
      .cosponsor-logo img { max-width: 100%; max-height: 50px; object-fit: contain; }
      .cosponsor-details { flex: 1; font-size: 13px; color: #555; text-align: left; }
      .cosponsor-name { font-weight: 700; color: #222; font-size: 15px; margin-bottom: 4px; display: block; }
      .cosponsor-address { display: block; font-style: italic; color: #999; font-size: 11px; margin-bottom: 6px; }
      .cosponsor-links a { color: #14B670; text-decoration: none; margin-right: 10px; font-size: 12px; }
      .cosponsor-links a:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);

    const popupHTML = `
      <div id="cosponsor-popup" class="footer-popup">
        <div class="footer-overlay"></div>
        <div class="footer-content" role="dialog" aria-modal="true">
          <button id="close-cosponsor-popup" aria-label="Close">×</button>
          <h3 style="margin:0 0 10px 0; font-size:20px; text-align:center; font-family:'Plus Jakarta Sans',sans-serif;">Our Partners</h3>
          <p style="font-size:14px; color:#666; text-align:center; line-height:1.5; margin-bottom:0;">
            The following partners may contact you with special offers via email or telephone:
          </p>
          <div id="cosponsor-list" class="cosponsor-list">
            <div style="text-align:center; padding: 20px; color:#888;">Loading partners...</div>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = popupHTML;
    document.body.appendChild(div.firstElementChild);
  }

  // 2. Data Ophalen (Absolute URL Fix)
  async function loadSponsors() {
    try {
      // ✅ Gebruik absolute URL naar Vercel backend
      const res = await fetch(`${API_BASE}/api/cosponsors.js`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      sponsorsData = json.data || [];
    } catch (e) {
      console.error("Error loading UK sponsors:", e);
      const list = document.getElementById("cosponsor-list");
      if(list) list.innerHTML = "<p style='text-align:center'>Could not load partners.</p>";
    }
  }

  // 3. Renderen
  function renderSponsors() {
    const list = document.getElementById("cosponsor-list");
    if (!list) return;

    if (sponsorsData.length === 0) {
      list.innerHTML = "<p style='text-align:center; padding:20px;'>No partners available at this moment.</p>";
      return;
    }

    list.innerHTML = sponsorsData.map(s => {
      const imageHtml = s.logo 
        ? `<img src="${s.logo}" alt="${s.name}" loading="lazy">` 
        : `<span style="font-size:10px; color:#ccc;">No Logo</span>`;

      return `
        <div class="cosponsor-item">
          <div class="cosponsor-logo">${imageHtml}</div>
          <div class="cosponsor-details">
            <span class="cosponsor-name">${s.name}</span>
            ${s.address ? `<span class="cosponsor-address">${s.address}</span>` : ""}
            <div class="cosponsor-desc">${s.description || ""}</div>
            <div class="cosponsor-links">
              ${s.url_privacy ? `<a href="${s.url_privacy}" target="_blank">Privacy Policy</a>` : ""}
              </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 4. Event Listeners
  document.addEventListener("click", async (e) => {
    if (e.target.matches(".open-sponsor-popup") || e.target.closest(".open-sponsor-popup")) {
      e.preventDefault(); e.stopPropagation();
      const popup = document.getElementById("cosponsor-popup");
      if (popup) {
        popup.classList.add("is-visible");
        document.body.style.overflow = "hidden";
        if (sponsorsData.length === 0) {
           await loadSponsors();
           renderSponsors();
        }
      }
    }
    if (e.target.id === "close-cosponsor-popup" || e.target.classList.contains("footer-overlay")) {
      const popup = document.getElementById("cosponsor-popup");
      if (popup) {
        popup.classList.remove("is-visible");
        document.body.style.overflow = "";
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectPopup);
  } else {
    injectPopup();
  }
})();
