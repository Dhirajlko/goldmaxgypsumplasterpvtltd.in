/**
 * Goldmax Gypsum Plaster Pvt. Ltd.
 * Master Client-Side Application Script
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Sticky Navbar & Mobile Navigation
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }

    highlightActiveNav();
  });

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  // Back to top button
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Active navigation link highlighting on scroll
  function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);

      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
          targetLink.classList.add('active');
        }
      }
    });
  }

  /* ==========================================================================
     2. Animated Number Counters
     ========================================================================== */
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const countUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const duration = 1800; // ms
          const increment = target / (duration / 25);

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = isDecimal ? target.toFixed(1) : Math.floor(target).toLocaleString();
              clearInterval(timer);
            } else {
              counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
            }
          }, 25);
        });
        animated = true;
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.querySelector('.hero-trust-metrics');
  if (metricsSection) {
    countUpObserver.observe(metricsSection);
  }

  /* ==========================================================================
     3. Gypsum Plaster & Cost Estimator Logic
     ========================================================================== */
  const areaInput = document.getElementById('areaInput');
  const unitSqFtBtn = document.getElementById('unitSqFt');
  const unitSqMBtn = document.getElementById('unitSqM');
  const thicknessSelect = document.getElementById('thicknessSelect');
  const substrateSelect = document.getElementById('substrateSelect');
  const estRateInput = document.getElementById('estRate');
  const recalcBtn = document.getElementById('recalcBtn');
  const transferCalcToQuote = document.getElementById('transferCalcToQuote');

  const resultBags = document.getElementById('resultBags');
  const resultTonnes = document.getElementById('resultTonnes');
  const resultCost = document.getElementById('resultCost');
  const resultWater = document.getElementById('resultWater');
  const resultTime = document.getElementById('resultTime');
  const resultWeight = document.getElementById('resultWeight');
  const bondingNotice = document.getElementById('bondingNotice');
  const resultBondIt = document.getElementById('resultBondIt');

  let currentUnit = 'sqft'; // 'sqft' or 'sqm'

  unitSqFtBtn.addEventListener('click', () => {
    if (currentUnit !== 'sqft') {
      currentUnit = 'sqft';
      unitSqFtBtn.classList.add('active');
      unitSqMBtn.classList.remove('active');
      // Convert current value from sq.m to sq.ft
      areaInput.value = Math.round(parseFloat(areaInput.value || 0) * 10.764);
      calculateEstimates();
    }
  });

  unitSqMBtn.addEventListener('click', () => {
    if (currentUnit !== 'sqm') {
      currentUnit = 'sqm';
      unitSqMBtn.classList.add('active');
      unitSqFtBtn.classList.remove('active');
      // Convert current value from sq.ft to sq.m
      areaInput.value = Math.round(parseFloat(areaInput.value || 0) / 10.764);
      calculateEstimates();
    }
  });

  function calculateEstimates() {
    let areaVal = parseFloat(areaInput.value) || 0;
    if (areaVal < 0) areaVal = 0;

    // Normalize to sq. ft. for formula baseline
    const areaInSqFt = currentUnit === 'sqm' ? areaVal * 10.7639 : areaVal;
    const thickness = parseFloat(thicknessSelect.value) || 12;
    const substrate = substrateSelect.value;
    const bagRate = parseFloat(estRateInput.value) || 260;

    // Base coverage of Goldmax Elite One-Coat at 12mm thickness is ~21 sq. ft. per 25kg bag
    let coveragePerBag = 21 * (12 / thickness);

    // Substrate wastage / absorption factors
    let substrateFactor = 1.0;
    if (substrate === 'redbrick') {
      substrateFactor = 1.15; // +15% mortar joints undulation
    } else if (substrate === 'solidblock') {
      substrateFactor = 1.08;
    } else if (substrate === 'aac') {
      substrateFactor = 1.0; // uniform AAC blocks
    } else if (substrate === 'rcc') {
      substrateFactor = 0.95; // very smooth, thin coat required
    }

    const calculatedBags = Math.ceil((areaInSqFt / coveragePerBag) * substrateFactor);
    const metricTonnes = ((calculatedBags * 25) / 1000).toFixed(2);
    const totalCost = calculatedBags * bagRate;

    // Sustainability and performance metrics
    const waterSavedLiters = Math.round(areaInSqFt * 12.5); // traditional needs ~12-15 L/sqft curing water
    const deadLoadSavedKg = Math.round(areaInSqFt * 1.45); // traditional plaster is ~2.2 kg/sqft at 12mm, gypsum ~0.75 kg
    const daysSaved = Math.max(7, Math.round(14 + (areaInSqFt / 500)));

    // Update DOM
    resultBags.textContent = calculatedBags.toLocaleString();
    resultTonnes.textContent = metricTonnes;
    resultCost.textContent = `₹ ${totalCost.toLocaleString('en-IN')}`;
    resultWater.textContent = `${waterSavedLiters.toLocaleString('en-IN')} Liters`;
    resultTime.textContent = `${daysSaved} Days`;
    resultWeight.textContent = `${deadLoadSavedKg.toLocaleString('en-IN')} Kg`;

    // RCC Substrate Goldmax Bond-It check
    if (substrate === 'rcc') {
      bondingNotice.style.display = 'flex';
      const bondItKg = Math.ceil(areaInSqFt / 50); // ~50 sqft/kg
      resultBondIt.textContent = `${bondItKg} Kg (Buckets)`;
    } else {
      bondingNotice.style.display = 'none';
    }
  }

  // Event listeners for inputs
  [areaInput, thicknessSelect, substrateSelect, estRateInput].forEach(element => {
    element.addEventListener('input', calculateEstimates);
    element.addEventListener('change', calculateEstimates);
  });

  recalcBtn.addEventListener('click', calculateEstimates);

  // Initial calculation run
  calculateEstimates();

  // Transfer Calculation to Official Quote Form
  transferCalcToQuote.addEventListener('click', () => {
    const bags = resultBags.textContent;
    const tonnes = resultTonnes.textContent;
    const area = areaInput.value;
    const unitLabel = currentUnit === 'sqm' ? 'Sq. Meters' : 'Sq. Ft.';

    const volumeField = document.getElementById('estimatedVolume');
    const msgField = document.getElementById('messageText');
    const productField = document.getElementById('productInterest');

    if (volumeField) {
      volumeField.value = `${bags} bags (${tonnes} MT) for ${area} ${unitLabel} area`;
    }

    if (productField) {
      productField.value = 'Goldmax Elite One-Coat Plaster';
    }

    if (msgField) {
      msgField.value = `Calculated Estimate: ${bags} bags at ${thicknessSelect.value}mm thickness on ${substrateSelect.options[substrateSelect.selectedIndex].text}. Requesting factory price with freight.`;
    }

    // Scroll to contact form smoothly
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Focus on name
      setTimeout(() => {
        const contactName = document.getElementById('contactName');
        if (contactName) contactName.focus();
      }, 600);
    }
  });

  /* ==========================================================================
     4. Product Filter Tabs
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     5. "Inquire Now" Trigger on Product Cards
     ========================================================================== */
  document.querySelectorAll('.quote-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productName = e.target.getAttribute('data-product');
      const productSelect = document.getElementById('productInterest');
      
      if (productSelect && productName) {
        for (let i = 0; i < productSelect.options.length; i++) {
          if (productSelect.options[i].text.toLowerCase().includes(productName.toLowerCase()) || 
              productName.toLowerCase().includes(productSelect.options[i].value.toLowerCase())) {
            productSelect.selectedIndex = i;
            break;
          }
        }
      }

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nameInput = document.getElementById('contactName');
          if (nameInput) nameInput.focus();
        }, 500);
      }
    });
  });

  /* ==========================================================================
     6. Technical Specification Modal Data & Logic
     ========================================================================== */
  const specModal = document.getElementById('specModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCloseAction = document.getElementById('modalCloseAction');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalInquireBtn = document.getElementById('modalInquireBtn');

  const technicalDataSheets = {
    'spec-onecoat': {
      title: 'Technical Data Sheet: Goldmax Elite One-Coat Gypsum Plaster',
      content: `
        <p><strong>Description:</strong> Ultra-white, high-purity hemihydrate calcium sulphate ($CaSO_4 \\cdot 0.5H_2O$) plaster enriched with specialty surface-active polymers and light aggregates.</p>
        <table class="modal-spec-table">
          <tr><th>Parameter</th><th>Value / Standard</th></tr>
          <tr><td>Standard Compliance</td><td>IS 2547 (Part I & II) - 1976</td></tr>
          <tr><td>Appearance & Color</td><td>Superfine Bright White Powder (Whiteness > 90%)</td></tr>
          <tr><td>Dry Bulk Density</td><td>650 - 750 kg/m³</td></tr>
          <tr><td>Wet Mix Density</td><td>1,200 - 1,300 kg/m³</td></tr>
          <tr><td>Setting Time</td><td>Initial: 15-20 min | Final: 25-30 min</td></tr>
          <tr><td>Water to Plaster Ratio</td><td>1 : 1.2 to 1 : 1.4 by weight (approx. 18-20L per bag)</td></tr>
          <tr><td>Compressive Strength</td><td>> 4.5 N/mm² (at 28 days)</td></tr>
          <tr><td>Thermal Conductivity (λ)</td><td>0.25 W/mK</td></tr>
          <tr><td>Fire Protection</td><td>Class '0' Spread of Flame (Non-combustible)</td></tr>
          <tr><td>Coverage (at 12mm thickness)</td><td>20 - 22 sq. ft. per 25 Kg bag</td></tr>
        </table>
        <p><strong>Application Guide:</strong> Mix thoroughly in clean water with a mechanical stirrer. Apply on pre-wetted masonry or AAC blocks using a steel trowel. Level with an aluminum straight edge. Leave for 72 hours to air-dry before painting.</p>
      `
    },
    'spec-bondit': {
      title: 'Technical Data Sheet: Goldmax Bond-It Gypsum Bonding Agent',
      content: `
        <p><strong>Description:</strong> High-performance polymer resin dispersion with graded micro-silica aggregates designed to provide chemical and mechanical keying on smooth concrete.</p>
        <table class="modal-spec-table">
          <tr><th>Parameter</th><th>Value / Standard</th></tr>
          <tr><td>Form & Base</td><td>Aqueous polymer emulsion with silica quartz</td></tr>
          <tr><td>Color</td><td>Green (for immediate visual application verification)</td></tr>
          <tr><td>Specific Gravity</td><td>1.25 - 1.35 g/cm³</td></tr>
          <tr><td>Pull-Off Bond Strength</td><td>> 1.5 N/mm² (Cohesive failure in substrate)</td></tr>
          <tr><td>Drying Period</td><td>24 Hours before plaster application</td></tr>
          <tr><td>Theoretical Coverage</td><td>45 - 55 sq. ft. per Kg (depending on porosity)</td></tr>
          <tr><td>Application Method</td><td>Roller or paintbrush in a single uniform coat</td></tr>
          <tr><td>Toxicity & VOC</td><td>Zero VOC, Non-hazardous, Eco-friendly</td></tr>
        </table>
        <p><strong>Recommendation:</strong> Mandatory for all RCC monolithic shear walls, columns, precast slabs, and ceilings before applying gypsum plaster or POP.</p>
      `
    },
    'spec-pop': {
      title: 'Technical Data Sheet: Goldmax Superfine Plaster of Paris (POP)',
      content: `
        <p><strong>Description:</strong> Milled from selected high-grade gypsum deposits to over 300-mesh fineness, offering instantaneous smoothness and high tensile molding strength.</p>
        <table class="modal-spec-table">
          <tr><th>Parameter</th><th>Value / Standard</th></tr>
          <tr><td>Chemical Formula</td><td>$CaSO_4 \\cdot 0.5H_2O$ (High purity hemihydrate)</td></tr>
          <tr><td>Sieve Analysis (Residue on 90µm)</td><td>< 1.0%</td></tr>
          <tr><td>Whiteness Index</td><td>> 92%</td></tr>
          <tr><td>Initial Setting Time</td><td>8 - 12 Minutes</td></tr>
          <tr><td>Final Setting Time</td><td>18 - 25 Minutes</td></tr>
          <tr><td>Standard Consistency</td><td>60% - 65% water requirement</td></tr>
          <tr><td>Shelf Life</td><td>6 Months in moisture-tight bags</td></tr>
        </table>
      `
    },
    'spec-putty': {
      title: 'Technical Data Sheet: Goldmax Wall Master Polymer Putty',
      content: `
        <p><strong>Description:</strong> White cement-based polymer skim-coat formulated with specialized anti-efflorescence and water-repellent polymers for silky smooth wall finishing.</p>
        <table class="modal-spec-table">
          <tr><th>Parameter</th><th>Value / Standard</th></tr>
          <tr><td>Standard Specification</td><td>HDB Standard / EN 998</td></tr>
          <tr><td>Pot Life</td><td>2 - 2.5 Hours after mixing</td></tr>
          <tr><td>Tensile Adhesion Strength</td><td>> 1.0 N/mm²</td></tr>
          <tr><td>Water Absorption (Karsten Tube)</td><td>< 0.5 ml after 60 minutes</td></tr>
          <tr><td>Coverage (2 Coats at 1.5mm)</td><td>16 - 20 sq. ft. per Kg</td></tr>
        </table>
      `
    },
    'spec-boards': {
      title: 'Technical Data Sheet: Goldmax Gypsum Boards',
      content: `
        <p><strong>Description:</strong> Engineered non-combustible gypsum boards manufactured in Standard Core, Moisture Resistant (MR), and Fire Stop specifications conforming to IS 2095.</p>
        <table class="modal-spec-table">
          <tr><th>Parameter</th><th>Value / Standard</th></tr>
          <tr><td>Dimensions Available</td><td>6' x 4' / 8' x 4'</td></tr>
          <tr><td>Thickness Options</td><td>9.5mm, 12.5mm, 15mm</td></tr>
          <tr><td>Core Density</td><td>680 - 750 kg/m³</td></tr>
          <tr><td>Thermal Resistance (R)</td><td>0.07 m² K/W (for 12.5mm)</td></tr>
          <tr><td>Acoustic Insulation (Rw)</td><td>36 - 45 dB (Drywall Assembly)</td></tr>
        </table>
      `
    },
    'spec-joint': {
      title: 'Technical Data Sheet: Goldmax Jointex Compound & Tape',
      content: `
        <p><strong>Description:</strong> Vinyl-polymer joint compound and crack-resistant fiberglass mesh tape engineered for continuous seamless joints in drywall and ceiling boards.</p>
        <table class="modal-spec-table">
          <tr><th>Parameter</th><th>Value / Standard</th></tr>
          <tr><td>Drying Time</td><td>3 - 4 Hours between coats</td></tr>
          <tr><td>Shrinkage</td><td>Minimal volumetric contraction</td></tr>
          <tr><td>Sandability</td><td>Extremely easy feather-edge sanding</td></tr>
        </table>
      `
    }
  };

  document.querySelectorAll('.spec-modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const modalKey = trigger.getAttribute('data-modal');
      const data = technicalDataSheets[modalKey];

      if (data) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        specModal.classList.add('active');
      }
    });
  });

  function closeModal() {
    specModal.classList.remove('active');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalCloseAction.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  modalInquireBtn.addEventListener('click', () => {
    closeModal();
  });

  /* ==========================================================================
     7. Brochure Download Modal
     ========================================================================== */
  const brochureModal = document.getElementById('brochureModal');
  const openBrochureBtn = document.getElementById('openBrochureBtn');
  const brochureCloseBtn = document.getElementById('brochureCloseBtn');
  const brochureBackdrop = document.getElementById('brochureBackdrop');
  const brochureDownloadForm = document.getElementById('brochureDownloadForm');

  if (openBrochureBtn) {
    openBrochureBtn.addEventListener('click', (e) => {
      e.preventDefault();
      brochureModal.classList.add('active');
    });
  }

  function closeBrochureModal() {
    brochureModal.classList.remove('active');
  }

  if (brochureCloseBtn) brochureCloseBtn.addEventListener('click', closeBrochureModal);
  if (brochureBackdrop) brochureBackdrop.addEventListener('click', closeBrochureModal);

  if (brochureDownloadForm) {
    brochureDownloadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('brochureName').value;
      const phone = document.getElementById('brochurePhone').value;

      closeBrochureModal();
      showToast(`Thank you, ${name}!`, 'Goldmax Product Catalog download initialized.');

      // Mock PDF trigger / download confirmation
      setTimeout(() => {
        window.open(`https://wa.me/919876543210?text=Hi%20Goldmax,%20my%20name%20is%20${encodeURIComponent(name)}%20(${phone}).%20Please%20send%20the%20complete%20technical%20brochure%20and%20price%20list.`, '_blank');
      }, 1000);
    });
  }

  /* ==========================================================================
     8. FAQ Accordion Toggle
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all others
      faqItems.forEach(other => other.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     9. Quote Inquiry Form Submission & Toast Notifications
     ========================================================================== */
  const quoteForm = document.getElementById('quoteInquiryForm');
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');

  function showToast(title, message) {
    toastTitle.textContent = title;
    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value;
      const phone = document.getElementById('contactPhone').value;
      const product = document.getElementById('productInterest').value;
      const location = document.getElementById('projectLocation').value;
      const volume = document.getElementById('estimatedVolume').value;

      const submitBtn = document.getElementById('submitQuoteBtn');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;

      // Simulate API response
      setTimeout(() => {
        submitBtn.innerHTML = originalHtml;
        submitBtn.disabled = false;

        showToast(
          'Quotation Inquiry Received!',
          `Thank you, ${name}. Our regional sales engineer for ${location} will contact you shortly.`
        );

        // Pre-fill WhatsApp link redirect option
        const whatsappMsg = `Hello Goldmax Plasters,\nI submitted a quote request for:\n- Product: ${product}\n- Name: ${name}\n- Phone: ${phone}\n- Location: ${location}\n- Requirement: ${volume || 'N/A'}`;
        const waUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMsg)}`;
        
        quoteForm.reset();

        // Optional prompt to continue on WhatsApp
        setTimeout(() => {
          if (confirm('Would you like to instantly connect with our WhatsApp sales team for immediate dispatch pricing?')) {
            window.open(waUrl, '_blank');
          }
        }, 1200);

      }, 800);
    });
  /* ==========================================================================
     10. Interactive Before/After Finish Comparison Slider
     ========================================================================== */
  const baRangeInput = document.getElementById('baRangeInput');
  const baAfterLayer = document.getElementById('baAfterLayer');
  const baHandle = document.getElementById('baHandle');

  if (baRangeInput && baAfterLayer && baHandle) {
    baRangeInput.addEventListener('input', (e) => {
      const val = e.target.value;
      baAfterLayer.style.width = `${val}%`;
      baHandle.style.left = `${val}%`;
    });
  }

});
