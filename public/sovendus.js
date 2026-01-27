// =============================================================
// ✅ sovendus.js — UK Version (Fix: Loader removal on Button/Link)
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

    // Clear container
    container.innerHTML = '';

    // 3. "Loading" bericht toevoegen
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'sovendus-loading';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '16px';
    loadingDiv.innerHTML = `<p style="font-size: 16px; font-family: sans-serif; color: #555;">Please wait… your reward is loading!</p>`;
    container.appendChild(loadingDiv);

    // 4. Data ophalen
    const t_id = sessionStorage.getItem('t_id') || crypto.randomUUID();
    const gender = sessionStorage.getItem('gender') || ''; 
    const firstname = sessionStorage.getItem('firstname') || '';
    const lastname = sessionStorage.getItem('lastname') || '';
    const email = sessionStorage.getItem('email') || '';
    
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

    // 5. Global Consumer Object
    window.sovConsumer = {
      consumerSalutation: gender,
      consumerFirstName: firstname,
      consumerLastName: lastname,
      consumerEmail: email
    };

    // 6. Global Iframe Config
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

    // 7. Laad het script
    const script = document.createElement('script');
    script.src = 'https://api.sovendus.com/sovabo/common/js/flexibleIframe.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ Sovendus script geladen');

      // 🛡️ Safety: Haal tekst sowieso weg na 3.5 sec (voorkomt blijvende tekst)
      setTimeout(() => {
        const el = document.getElementById('sovendus-loading');
        if (el) el.remove();
      }, 3500);

      const observer = new MutationObserver((_, obs) => {
        // 🔍 FIX: Check niet alleen op iframe, maar ook op links (buttons) of divs
        // De UK versie laadt vaak een knop (<a>) i.p.v. iframe.
        const content = container.querySelector("iframe, a[href*='sovendus'], div:not(#sovendus-loading)");
        
        if (content) {
          console.log("🎯 Sovendus content (iframe/button) gedetecteerd");
          
          const loadingEl = document.getElementById('sovendus-loading');
          if (loadingEl) loadingEl.remove();

          obs.disconnect();
        }
      });

      observer.observe(container, { childList: true, subtree: true });
    };

    script.onerror = () => {
      console.error('❌ Sovendus script failed to load');
      const loadingEl = document.getElementById('sovendus-loading');
      if (loadingEl) loadingEl.style.display = 'none';
    };

    document.body.appendChild(script);
  };
})();
