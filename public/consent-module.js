// =============================================================
// consent-module.js — UK Version (Checkbox Logic Only)
// =============================================================

(function () {

  /* ============================================================
     1. Sponsor consent state
     ============================================================ */
  function initSponsorConsent() {
    const checkbox = document.getElementById("consent-sponsors");
    if (!checkbox) return;

    sessionStorage.setItem("sponsorsAccepted", "false");

    checkbox.addEventListener("change", () => {
      sessionStorage.setItem(
        "sponsorsAccepted",
        checkbox.checked ? "true" : "false"
      );
    });
  }

  /* ============================================================
     2. Boot
     ============================================================ */
  function init() {
    initSponsorConsent();
    // Geen click handlers meer voor popups hier; 
    // footer-loader.js en cosponsors.js regelen de modals.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
