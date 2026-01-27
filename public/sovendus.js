// =============================================================
// ✅ sovendus.js — UK Version (Instant Loader Removal)
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

    // Clear container en maak zichtbaar
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.minHeight = '60px'; // Voorkom verspringen

    // 3. "Loading" bericht toevoegen
    // We geven het een specifieke class mee voor makkelijke detectie
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'sovendus-loading';
    loadingDiv.className = 'sovendus-loader-msg';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '16px';
    loadingDiv.innerHTML = `<p style="font-size: 16px; font-family: sans-serif; color: #555; margin: 0;">Please wait… your reward is loading!</p>`;
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

    // Functie om loader te verwijderen
    const removeLoader = () => {
      const loader = document.getElementById('sovendus-loading');
      if (loader) {
        loader.style.display = 'none'; // Eerst verbergen (sneller)
        loader.remove(); // Dan verwijderen
        console.log("🚀 Loader removed immediately");
      }
    };

    script.onload = () => {
      console.log('✅ Sovendus script geladen');

      // 🛡️ Safety: Haal tekst sowieso weg na 4 sec (fallback)
      setTimeout(removeLoader, 4000);

      // ⚡️ AGRESSIEVE OBSERVER
      // Kijkt of er IETS anders dan de loader in de container staat
      const observer = new MutationObserver((mutations, obs) => {
        // Check alle directe kinderen van de container
        const children = Array.from(container.children);
        
        const hasRealContent = children.some(child => {
          // Negeer het loader element zelf
          if (child.id === 'sovendus-loading') return false;
          // Negeer onzichtbare script tags (tracking)
          if (child.tagName === 'SCRIPT') return false;
          
          // Als het een DIV, IFRAME of A is -> BINGO
          return true;
        });

        if (hasRealContent) {
          console.log("🎯 Sovendus content detected -> killing loader");
          removeLoader();
          obs.disconnect(); // Stop met kijken
        }
      });

      observer.observe(container, { childList: true, subtree: true });
    };

    script.onerror = () => {
      console.error('❌ Sovendus script failed to load');
      removeLoader(); // Bij error tekst weghalen
    };

    document.body.appendChild(script);
  };
})();
