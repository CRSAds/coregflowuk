// =============================================================
// ✅ cosponsors.js (UK Version)
// Haalt cosponsors op en toont popup.
// Luistert naar kliks op .open-sponsor-popup
// =============================================================

(function () {
  let sponsorsData = [];

  // 1. Popup HTML Injectie
  function injectPopup() {
    if (document.getElementById("cosponsor-popup")) return;

    const popupHTML = `
      <div id="cosponsor-popup" class="footer-popup" style="display:none;">
        <div class="footer-overlay"></div>
        <div class="footer-content" role="dialog" aria-modal="true">
          <button id="close-cosponsor-popup" aria-label="Close">×</button>
          <h3 style="margin-top:0; font-size:18px;">Our Partners</h3>
          <p style="font-size:14px; color:#666;">
            The following partners may contact you with special offers:
          </p>
          <div id="cosponsor-list" style="margin-top:20px; text-align:left;">
            <p>Loading partners...</p>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = popupHTML;
    document.body.appendChild(div.firstElementChild);

    // CSS (hergebruik footer styles of voeg toe)
    const style = document.createElement("style");
    style.textContent = `
      .cosponsor-item {
        border-bottom: 1px solid #eee;
        padding: 10px 0;
        font-size: 14px;
      }
      .cosponsor-item strong { display: block; color: #333; }
      .cosponsor-item span { color: #888; font-size: 12px; }
    `;
    document.head.appendChild(style);
  }

  // 2. Data Ophalen
  async function loadSponsors() {
    try {
      const res = await fetch("https://coregflowuk.vercel.app/api/cosponsors.js");
      const json = await res.json();
      sponsorsData = json.data || [];
    } catch (e) {
      console.error("Error loading UK sponsors:", e);
    }
  }

  // 3. Renderen
  function renderSponsors() {
    const list = document.getElementById("cosponsor-list");
    if (!list) return;

    if (sponsorsData.length === 0) {
      list.innerHTML = "<p>No partners available at this moment.</p>";
      return;
    }

    list.innerHTML = sponsorsData.map(s => `
      <div class="cosponsor-item">
        <strong>${s.name || "Partner"}</strong>
        <span>${s.description || "Special offers and promotions"}</span>
      </div>
    `).join("");
  }

  // 4. Event Listeners (Global Delegate)
  document.addEventListener("click", async (e) => {
    // Check of er op een .open-sponsor-popup knop is geklikt (ook die in de slide-up)
    if (e.target.matches(".open-sponsor-popup") || e.target.closest(".open-sponsor-popup")) {
      e.preventDefault();
      
      const popup = document.getElementById("cosponsor-popup");
      if (popup) {
        popup.style.display = "flex";
        document.body.classList.add("modal-open");
        
        // Render als nog niet gedaan
        const list = document.getElementById("cosponsor-list");
        if (list && list.innerHTML.includes("Loading")) {
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
