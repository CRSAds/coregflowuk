// =============================================================
// ✅ initFlow-lite.js — UK Version (Production + Scroll Fix)
// =============================================================

// Debug toggle (false = production)
const FLOW_DEBUG = false;
const flowLog  = (...args) => { if (FLOW_DEBUG) console.log(...args); };

// =============================================================
// 🟢 Sovendus hook — start only when section becomes active
// =============================================================
function maybeStartSovendus(section) {
  if (!section) return;
  if (section.id !== "sovendus-section") return;

  if (typeof window.setupSovendus === "function") {
    console.log("🟢 Sovendus section active → setupSovendus()");
    window.setupSovendus();
  } else {
    console.warn("⚠️ window.setupSovendus missing (sovendus.js not loaded?)");
  }
}

window.addEventListener("DOMContentLoaded", initFlowLite);

// =============================================================
// 🚫 Access Control (Status Check)
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  // 🇬🇧 UK Logic: Removed 'energie', kept 'online' and 'live'
  if (status !== "online" && status !== "live") {
    // Hide all main content
    document.querySelectorAll("section, footer, .sp-section, #dynamic-footer")
      .forEach(el => el.style.display = "none");

    // Show English error message
    document.body.innerHTML = `
      <style>
        html, body {
          margin: 0; padding: 0; height: 100%; overflow: hidden;
          background: #f8f8f8; display: flex; justify-content: center; align-items: center;
          font-family: Inter, Helvetica, Arial; text-align: center; color: #333;
        }
        h1 { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
        p { font-size: 15px; line-height: 1.6; color: #555; }
      </style>
      <div>
        <h1>Page Not Accessible</h1>
        <p>This page is currently unavailable.<br>
        Please check your link or try again later.</p>
      </div>
    `;
  }
});

// =============================================================
// 🚀 Main Init — Flow Controller
// =============================================================
function initFlowLite() {

  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "online";

  // Get all sections
  const allSections = Array.from(document.querySelectorAll(".flow-section, .ivr-section"));
  allSections.forEach(el => el.style.display = "none");

  // Ensure Coreg container is visible (if present)
  const coregContainer = document.getElementById("coreg-container");
  if (coregContainer) coregContainer.style.display = "block";

  // Show first visible section (skip IVR initially)
  const firstVisible = allSections.find(el => !el.classList.contains("ivr-section"));
  if (firstVisible) {
    firstVisible.style.display = "block";
    reloadImages(firstVisible);
    maybeStartSovendus(firstVisible);
  }

  // -----------------------------------------------------------
  // 1. Navigation Buttons Click Handler
  // -----------------------------------------------------------
  const flowButtons = document.querySelectorAll(".flow-next");
  flowButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.closest("#lead-form")) return; // Shortform is handled by event

      const current = btn.closest(".flow-section, .ivr-section");
      if (!current) return;
      
      let next = current.nextElementSibling;
      if (!next) return;
      
      current.style.display = "none";

      // Skip IVR if status is online
      while (
        next &&
        next.classList.contains("ivr-section") &&
        status === "online"
      ) {
        next = next.nextElementSibling;
      }

      // Skip Longform if not required
      if (next && next.id === "long-form-section") {
        const needsLF = sessionStorage.getItem("requiresLongForm") === "true";
        if (!needsLF) next = next.nextElementSibling;
      }

      if (next) {
        next.style.display = "block";
        reloadImages(next);
        maybeStartSovendus(next);
        
        // ✅ SCROLL FIX: Button Click
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // -----------------------------------------------------------
  // 2. Event: After Short Form Submit
  // -----------------------------------------------------------
  document.addEventListener("shortFormSubmitted", () => {
    const form = document.getElementById("lead-form");
    if (!form) return;
    
    const current = form.closest(".flow-section");
    if (!current) return;
    
    let next = current.nextElementSibling;
    if (!next) return;

    // Skip IVR
    while (
      next &&
      next.classList.contains("ivr-section") &&
      status === "online"
    ) {
      next = next.nextElementSibling;
    }

    // Skip Longform
    if (next && next.id === "long-form-section") {
      const showLong = sessionStorage.getItem("requiresLongForm") === "true";
      if (!showLong) next = next.nextElementSibling;
    }

    current.style.display = "none";
    next.style.display = "block";
    reloadImages(next);
    maybeStartSovendus(next);
    
    // ✅ SCROLL FIX: After Short Form
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // -----------------------------------------------------------
  // 3. Event: After Long Form Submit
  // -----------------------------------------------------------
  document.addEventListener("longFormSubmitted", () => {
    const current = document.getElementById("long-form-section");
    if (!current) return;
    
    let next = current.nextElementSibling;
    if (!next) return;

    // Skip IVR
    while (
      next &&
      next.classList.contains("ivr-section") &&
      status === "online"
    ) {
      next = next.nextElementSibling;
    }

    current.style.display = "none";
    next.style.display = "block";
    reloadImages(next);
    maybeStartSovendus(next);

    // ✅ SCROLL FIX: After Long Form
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =============================================================
// Helpers
// =============================================================
function reloadImages(section) {
  if (!section) return;
  const imgs = section.querySelectorAll("img[data-src]");
  imgs.forEach(img => img.src = img.dataset.src);

  // Force redraw fix for some mobile browsers
  window.scrollBy(0, 1);
  setTimeout(() => window.scrollBy(0, -1), 150);
}

console.info("🎉 initFlow-lite (UK) loaded");
