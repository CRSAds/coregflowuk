// =============================================================
// ✅ cosponsors.js (UK Version - Full Details)
// =============================================================

(function () {
  let sponsorsData = [];

  // 1. Popup HTML & CSS Injectie
  function injectPopup() {
    if (document.getElementById("cosponsor-popup")) return;

    // CSS voor een nette lijst met logo's
    const style = document.createElement("style");
    style.textContent = `
      .cosponsor-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 20px;
        max-height: 60vh;
        overflow-y: auto;
      }
      .cosponsor-item {
        display: flex;
        gap: 15px;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 15px;
        align-items: flex-start;
      }
      .cosponsor-logo {
        flex: 0 0 80px; /* Vaste breedte voor logo kolom */
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cosponsor-logo img {
        max-width: 100%;
        max-height: 60px;
        object-fit: contain;
      }
      .cosponsor-details {
        flex: 1;
        font-size: 13px;
        color: #555;
        text-align: left;
      }
      .cosponsor-name {
        font-weight: 700;
        color: #222;
        font-size: 15px;
        margin-bottom: 4px;
        display: block;
      }
      .cosponsor-address {
        display: block;
        font-style: italic;
        color: #999;
        font-size: 11px;
        margin-bottom: 6px;
      }
      .cosponsor-links {
        margin-top: 6px;
        font-size: 12px;
      }
      .cosponsor-links a {
        color: #14B670;
        text-decoration: none;
        margin-right: 10px;
      }
      .cosponsor-links a:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);

    // HTML Structuur
    const popupHTML = `
      <div id="cosponsor-popup" class="footer-popup" style="display:none;">
        <div class="footer-overlay"></div>
        <div class="footer-content" role="dialog" aria-modal="true">
          <button id="close-cosponsor-popup" aria-label="Close">×</button>
          
          <h3 style="margin-top:0; font-size:20px; text-align:center;">Our Partners</h3>
          <p style="font-size:14px; color:#666; text-align:center;">
            The following partners may contact you with special offers via email or telephone:
          </p>
          
          <div id="cosponsor-list" class="cosponsor-list">
            <p style="text-align:center;">Loading partners...</p>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = popupHTML;
    document.body.appendChild(div.firstElementChild);
  }

  // 2. Data Ophalen
  async function loadSponsors() {
    try {
      const res = await fetch("https://coregflowuk.vercel.app/api/cosponsors.js");
      const json = await res.json();
      sponsorsData = json.data || [];
    } catch (e) {
      console.error("Error loading UK sponsors:", e);
      document.getElementById("cosponsor-list").innerHTML = "<p>Could not load partners.</p>";
    }
  }

  // 3. Renderen (Met Logo's en Links)
  function renderSponsors() {
    const list = document.getElementById("cosponsor-list");
    if (!list) return;

    if (sponsorsData.length === 0) {
      list.innerHTML = "<p style='text-align:center'>No partners available at this moment.</p>";
      return;
    }

    list.innerHTML = sponsorsData.map(s => {
      // Als er een logo is, toon die. Anders een placeholder of de naam.
      const imageHtml = s.logo 
        ? `<img src="${s.logo}" alt="${s.name}" loading="lazy">` 
        : `<span style="font-size:10px; color:#ccc;">No Logo</span>`;

      return `
        <div class="cosponsor-item">
          <div class="cosponsor-logo">
            ${imageHtml}
          </div>
          <div class="cosponsor-details">
            <span class="cosponsor-name">${s.name}</span>
            ${s.address ? `<span class="cosponsor-address">${s.address}</span>` : ""}
            <div class="cosponsor-desc">${s.description || ""}</div>
            
            <div class="cosponsor-links">
              ${s.url_privacy ? `<a href="${s.url_privacy}" target="_blank">Privacy Policy</a>` : ""}
              ${s.url_terms ? `<a href="${s.url_terms}" target="_blank">Terms & Conditions</a>` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 4. Event Listeners
  document.addEventListener("click", async (e) => {
    // Openen
    if (e.target.matches(".open-sponsor-popup") || e.target.closest(".open-sponsor-popup")) {
      e.preventDefault();
      
      const popup = document.getElementById("cosponsor-popup");
      if (popup) {
        popup.style.display = "flex";
        document.body.classList.add("modal-open");
        
        // Eerste keer laden
        const list = document.getElementById("cosponsor-list");
        if (list && (list.innerHTML.includes("Loading") || sponsorsData.length === 0)) {
           await loadSponsors();
           renderSponsors();
        }
      }
    }

    // Sluiten
    if (e.target.id === "close-cosponsor-popup" || e.target.classList.contains("footer-overlay")) {
      const popup = document.getElementById("cosponsor-popup");
      if (popup) {
        popup.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    }
  });

  // Init
  document.addEventListener("DOMContentLoaded", injectPopup);

})();
