// =============================================================
// ✅ sovendus.js — UK Version (ID 7675 + Loading Message)
// =============================================================

(function() {
  let hasInitialized = false;

  window.setupSovendus = function() {
    // 1. Voorkom dubbele executie
    if (hasInitialized) {
      console.log("⚠️ Sovendus setup already ran — skipping");
      return;
    }
    hasInitialized = true;
    console.log("👉 setupSovendus started (UK ID: 7675)");

    // 2. Check container
    const containerId = 'sovendus-container-1';
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`❌ Container #${containerId} not found`);
      return;
    }

    // Clear container (voor zekerheid)
    container.innerHTML = '';

    // 3. "Loading" bericht toevoegen (Goede UX!)
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'sovendus-loading';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '16px';
    loadingDiv.innerHTML = `<p style="font-size: 16px; font-family: sans-serif; color: #555;">Please wait… your reward is loading!</p>`;
    container.appendChild(loadingDiv);

    // 4. Data ophalen
    const t_id = sessionStorage.getItem('t_id') || crypto.randomUUID();
    const gender = sessionStorage.getItem('gender') || ''; // Bevat "Mr" of "Mrs"
    const firstname = sessionStorage.getItem('firstname') || '';
    const lastname = sessionStorage.getItem('lastname') || '';
    const email = sessionStorage.getItem('email') || '';
    
    // Tijdstempel (Formaat uit jouw snippet: YYYYMMDDHHMMSS)
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

    // 5. Global Consumer Object (Specifiek voor jouw UK setup)
    window.sovConsumer = {
      consumerSalutation: gender,
      consumerFirstName: firstname,
      consumerLastName: lastname,
      consumerEmail: email
    };

    // 6. Global Iframe Config
    window.sovIframes = window.sovIframes || [];
    window.sovIframes.push({
      trafficSourceNumber: '7675', // 🇬🇧 JOUW UK ID
      trafficMediumNumber: '1',    // Standaard
      sessionId: t_id,
      timestamp: timestamp,
      orderId: '',                 // Leadgen heeft geen order ID
      orderValue: '',              // Leadgen is gratis
      orderCurrency: 'GBP',        // Valuta UK
      usedCouponCode: '',
      iframeContainerId: containerId
    });

    // 7. Laad het script
    const script = document.createElement('script');
    script.src = 'https://api.sovendus.com/sovabo/common/js/flexibleIframe.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ Sovendus UK loaded');
      // Verwijder het laadbericht zodra het script er is
      const loadingEl = document.getElementById('sovendus-loading');
      if (loadingEl) loadingEl.remove();
    };

    script.onerror = () => {
      console.error('❌ Sovendus script failed to load');
      // Bij error laadbericht ook weghalen of aanpassen
      const loadingEl = document.getElementById('sovendus-loading');
      if (loadingEl) loadingEl.style.display = 'none';
    };

    document.body.appendChild(script);
  };
})();
