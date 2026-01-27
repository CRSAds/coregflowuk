// =============================================================
// ✅ sovendus.js — UK Version (ID 7675 | Flow Controlled)
// =============================================================

(function() {
  let hasInitialized = false;
  let hasAdvanced = false;
  const SOV_TIMEOUT_MS = 10000; // 10 seconden timer

  // =============================================================
  // ➡️ Flow vervolgen na Sovendus (Timer of Error)
  // =============================================================
  function advanceAfterSovendus() {
    if (hasAdvanced) return;
    hasAdvanced = true;

    // Zoek huidige en volgende sectie
    const current = document.getElementById("sovendus-section") || 
                    document.getElementById("sovendus-container-1")?.closest('.flow-section');
    
    if (!current) return;

    let next = current.nextElementSibling;
    // IVR logic skip (zelfde als initFlow)
    while (next && next.classList.contains("ivr-section")) {
      next = next.nextElementSibling;
    }

    if (next) {
      current.style.display = "none";
      next.style.display = "block";

      if (typeof window.reloadImages === "function") {
        window.reloadImages(next);
      }

      // Gebruik de global scroll fix
      if (typeof window.forceScrollTop === "function") {
        window.forceScrollTop();
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      
      console.log("➡️ Auto-advancing flow after Sovendus timer");
    } else {
      console.log("🏁 No next section found after Sovendus");
    }
  }

  // =============================================================
  // 🚀 setupSovendus — wordt aangeroepen vanuit initFlow
  // =============================================================
  window.setupSovendus = function() {
    if (hasInitialized) {
      console.log("⚠️ Sovendus setup already ran — skipping");
      return;
    }
    hasInitialized = true;
    console.log("👉 setupSovendus started (UK ID: 7675)");

    const containerId = "sovendus-container-1";
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`❌ Container #${containerId} not found`);
      return;
    }

    // 🔧 Layout setup
    container.style.minHeight = "60px";
    container.style.display = "block";
    container.innerHTML = '';

    // 1. Loading Message (English)
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "sovendus-loading";
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.padding = "16px";
    loadingDiv.innerHTML = `<p style="font-size:16px; font-family:sans-serif; color:#555;">Please wait… your reward is loading!</p>`;
    container.appendChild(loadingDiv);

    // 2. Data ophalen
    const t_id = sessionStorage.getItem('t_id') || crypto.randomUUID();
    const gender = sessionStorage.getItem('gender') || '';
    const firstname = sessionStorage.getItem('firstname') || '';
    const lastname = sessionStorage.getItem('lastname') || '';
    const email = sessionStorage.getItem('email') || '';
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

    // 3. Sovendus Config
    window.sovConsumer = {
      consumerSalutation: gender,
      consumerFirstName: firstname,
      consumerLastName: lastname,
      consumerEmail: email
    };

    window.sovIframes = window.sovIframes || [];
    window.sovIframes.push({
      trafficSourceNumber: '7675', // 🇬🇧 UK ID
      trafficMediumNumber: '1',
      sessionId: t_id,
      timestamp: timestamp,
      orderId: '',
      orderValue: '',
      orderCurrency: 'GBP',
      usedCouponCode: '',
      iframeContainerId: containerId
    });

    // 4. Script Laden
    const script = document.createElement('script');
    script.src = 'https://api.sovendus.com/sovabo/common/js/flexibleIframe.js';
    script.async = true;

    // Helper: Loader verwijderen
    const removeLoader = () => {
      const el = document.getElementById('sovendus-loading');
      if (el) el.remove();
    };

    script.onload = () => {
      console.log('✅ Sovendus script loaded');

      // 🛡️ Safety: Haal tekst sowieso weg na 3.5 sec
      setTimeout(removeLoader, 3500);

      // 👀 Observer: Detecteer content (Breder dan NL: iframe OF button OF div)
      const observer = new MutationObserver((_, obs) => {
        // UK laadt vaak een <a> (knop) of <div> ipv iframe
        const content = container.querySelector("iframe, a[href*='sovendus'], div:not(#sovendus-loading)");
        
        if (content) {
          console.log("🎯 Sovendus content detected");
          removeLoader();

          // ⏰ Start 10s Timer voor Auto-Advance
          setTimeout(() => {
             const section = document.getElementById("sovendus-section");
             // Check of we nog steeds op de sovendus slide zitten
             if (section && window.getComputedStyle(section).display !== "none") {
                advanceAfterSovendus();
             }
          }, SOV_TIMEOUT_MS);

          obs.disconnect();
        }
      });

      observer.observe(container, { childList: true, subtree: true });
    };

    script.onerror = () => {
      console.error('❌ Sovendus script failed to load');
      removeLoader();
      // Bij error: ga sneller door (2 sec) zodat user niet vastloopt
      setTimeout(advanceAfterSovendus, 2000);
    };

    document.body.appendChild(script);
  };
})();
