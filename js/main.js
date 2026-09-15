// NDTechHub Global JS Interactions - Theme Toggle, Mobile Nav, Bento Light-Trail

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Initialize the decorative particle field only when it is worthwhile.
  // Respect reduced-motion and touch/mobile devices to keep input and battery performance high.
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (motionOK && finePointer) init3DParticles();

  // 2. Enforce Dark Theme
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('nd-theme', 'dark');

  // 3. 2026 Bento Island Navbar - Scroll Compaction & Specular Lighting
  const bentoHeader = document.querySelector('header, .bento-header');
  const bentoNavbar = document.querySelector('.bento-navbar');

  if (bentoNavbar) {
    // Dynamic Specular Photon Light Sheen tracking cursor
    bentoNavbar.addEventListener('mousemove', (e) => {
      const rect = bentoNavbar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      bentoNavbar.style.setProperty('--nav-mouse-x', `${x}px`);
      bentoNavbar.style.setProperty('--nav-mouse-y', `${y}px`);
    });

    // Scroll-triggered dynamic compact HUD state
    const handleNavScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (bentoHeader) bentoHeader.classList.toggle('scrolled', isScrolled);
      bentoNavbar.classList.toggle('scrolled', isScrolled);
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  // 4. 2026 Magnetic Sliding Indicator Pill
  const navLinksContainer = document.querySelector('.nav-links');
  if (navLinksContainer) {
    let indicatorPill = navLinksContainer.querySelector('.nav-indicator-pill');
    if (!indicatorPill) {
      indicatorPill = document.createElement('li');
      indicatorPill.className = 'nav-indicator-pill';
      navLinksContainer.prepend(indicatorPill);
    }

    const rawPath = window.location.pathname.split('/').filter(Boolean).pop() || '';
    const cleanCurrent = rawPath.replace(/\.html$/, '');
    const navItems = Array.from(navLinksContainer.querySelectorAll('li:not(.nav-indicator-pill)'));
    
    // Set staggered animation indices for mobile drawer
    navItems.forEach((li, index) => {
      li.style.setProperty('--i', index);
      const a = li.querySelector('a');
      if (a) {
        const href = a.getAttribute('href') || '';
        const cleanHref = href.split('/').filter(Boolean).pop()?.replace(/\.html$/, '') || '';
        const isHome = (cleanCurrent === '' || cleanCurrent === 'index') && (cleanHref === '' || cleanHref === 'index' || href === '/' || href === 'index.html');
        const isMatch = isHome || (cleanCurrent && cleanHref === cleanCurrent);
        
        if (isMatch) {
          li.classList.add('active');
          a.classList.add('active');
        } else {
          li.classList.remove('active');
          a.classList.remove('active');
        }
      }
    });

    const activeItem = navLinksContainer.querySelector('li.active:not(.nav-indicator-pill)');

    const positionPill = (targetEl) => {
      if (!targetEl || window.innerWidth <= 1080) {
        indicatorPill.style.opacity = '0';
        return;
      }
      const containerRect = navLinksContainer.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const leftOffset = targetRect.left - containerRect.left;
      const width = targetRect.width;

      indicatorPill.style.transform = `translateX(${leftOffset}px)`;
      indicatorPill.style.width = `${width}px`;
      indicatorPill.style.opacity = '1';
    };

    // Position indicator pill on page load
    if (activeItem) {
      setTimeout(() => {
        positionPill(activeItem);
        navLinksContainer.classList.add('js-pill-ready');
      }, 50);
    } else {
      indicatorPill.style.opacity = '0';
      navLinksContainer.classList.add('js-pill-ready');
    }

    // Hover glide across items
    navItems.forEach((item) => {
      item.addEventListener('mouseenter', () => positionPill(item));
    });

    // Reset back to active item on mouseleave
    navLinksContainer.addEventListener('mouseleave', () => {
      if (activeItem) {
        positionPill(activeItem);
      } else {
        indicatorPill.style.opacity = '0';
      }
    });

    window.addEventListener('resize', () => {
      const currentActive = navLinksContainer.querySelector('li.active:not(.nav-indicator-pill)');
      if (currentActive) positionPill(currentActive);
    }, { passive: true });
  }

  // 5. 2026 Mobile HUD Menu Toggle & Morph
  const mobileToggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggleBtn && navLinks) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !navLinks.classList.contains('active');
      navLinks.classList.toggle('active', isOpen);
      mobileToggleBtn.classList.toggle('active', isOpen);
      mobileToggleBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = (isOpen && window.innerWidth <= 1080) ? 'hidden' : '';
    };

    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking outside or clicking any nav link
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 1080) toggleMenu(false);
      });
    });

    // ESC key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu(false);
      }
    });
  }

  // 6. Premium Bento Card 3D Tilt & Specular Light Trail Effect (2026 Liquid Glass Physics)
  const bentoCards = (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ? document.querySelectorAll('.bento-card, .glass-panel') : [];
  
  bentoCards.forEach(card => {
    let rafId = null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
    });
  });

  // 6. Interactive Speed Audit Simulator with Tailored Suggestions
  const auditBtn = document.getElementById('runAuditBtn');
  const auditUrl = document.getElementById('auditUrl');
  const auditResults = document.getElementById('auditResults');
  const auditLoader = document.getElementById('auditLoader');
  const auditMetrics = document.getElementById('auditMetrics');
  const auditProgressBar = document.getElementById('auditProgressBar');
  const auditReportMessage = document.getElementById('auditReportMessage');
  const auditSuggestions = document.getElementById('auditSuggestions');
  const suggestionsList = document.getElementById('suggestionsList');
  const claimRoadmapBtn = document.getElementById('claimAuditRoadmapBtn');

  if (auditBtn && auditUrl) {
    auditBtn.addEventListener('click', () => {
      let url = auditUrl.value.trim();
      if (!url) {
        alert('Please enter a website URL to diagnose.');
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
        auditUrl.value = url;
      }
      
      // Reset & show loader
      auditResults.style.display = 'block';
      auditLoader.style.display = 'block';
      auditMetrics.style.display = 'none';
      auditReportMessage.style.display = 'none';
      if (auditSuggestions) auditSuggestions.style.display = 'none';
      auditProgressBar.style.width = '0%';
      auditBtn.disabled = true;
      auditUrl.disabled = true;
      auditBtn.textContent = 'Analyzing...';

      // Animate progress bar
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        auditProgressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Hide loader, show metrics & suggestions
            auditLoader.style.display = 'none';
            auditMetrics.style.display = 'flex';
            auditReportMessage.style.display = 'block';
            if (auditSuggestions) auditSuggestions.style.display = 'block';
            
            // Randomize current score to simulate analysis (representing standard bloated sites)
            const currentScore = Math.floor(Math.random() * 20) + 42; // 42-62
            
            // Update performance gauge
            const gauges = auditMetrics.querySelectorAll('.gauge-circle');
            if (gauges.length >= 3) {
              gauges[0].textContent = currentScore;
              gauges[0].style.borderColor = currentScore < 50 ? '#ef4444' : '#eab308';
              gauges[0].style.color = currentScore < 50 ? '#ef4444' : '#eab308';
              gauges[0].style.boxShadow = `0 0 15px ${currentScore < 50 ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`;
            }

            auditReportMessage.innerHTML = `
              <p style="font-weight: 700; color: #fff; margin-bottom: 5px; font-size: 13px;">Diagnostic Complete for <span style="color: var(--cyan-electric);">${url}</span></p>
              <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 0;">Estimated Score: <strong style="color: ${currentScore < 50 ? '#ef4444' : '#eab308'};">${currentScore}/100</strong> (Bottlenecks detected in Hydration &amp; Render Blocking Assets).</p>
            `;

            // Populate Actionable Suggestions
            if (suggestionsList) {
              const suggestions = [
                {
                  icon: 'zap',
                  color: '#ef4444',
                  impact: 'HIGH IMPACT',
                  title: 'Eliminate JS Hydration Overhead',
                  desc: 'Replace heavy client frameworks with zero-bloat HTML-first progressive hydration.',
                  gain: '+28 pts'
                },
                {
                  icon: 'image',
                  color: '#f59e0b',
                  impact: 'HIGH IMPACT',
                  title: 'Next-Gen Media & Critical CSS',
                  desc: 'Convert assets to AVIF/WebP and inline above-the-fold critical stylesheets.',
                  gain: '-1.4s LCP'
                },
                {
                  icon: 'globe',
                  color: '#00f2fe',
                  impact: 'RECOMMENDED',
                  title: 'Global Edge CDN & Brotli-11',
                  desc: 'Deploy ultra-fast edge routing for sub-100ms TTFB globally.',
                  gain: '+12 pts'
                }
              ];

              suggestionsList.innerHTML = suggestions.map(s => `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 12px; display: flex; align-items: flex-start; gap: 10px;">
                  <div style="color: ${s.color}; margin-top: 2px;">
                    <i data-lucide="${s.icon}" style="width: 16px; height: 16px;"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px;">
                      <strong style="color: #fff; font-size: 12px;">${s.title}</strong>
                      <span style="font-size: 9px; font-weight: 700; color: ${s.color}; background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px; white-space: nowrap;">${s.gain}</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 11px; margin: 0; line-height: 1.35;">${s.desc}</p>
                  </div>
                </div>
              `).join('');

              if (typeof lucide !== 'undefined') {
                lucide.createIcons();
              }
            }

            // Wire up Claim Roadmap Button
            if (claimRoadmapBtn) {
              claimRoadmapBtn.onclick = () => {
                const serviceSelect = document.getElementById('contact-service');
                const messageTextarea = document.getElementById('contact-message');
                const claimSection = document.getElementById('claim-audit');

                if (serviceSelect) serviceSelect.value = 'web-dev';
                if (messageTextarea) {
                  messageTextarea.value = `Hi NDTechHub Team,\n\nI ran a performance audit for my website (${url}) and received a score of ${currentScore}/100.\n\nI would like to request your free tailored speed optimization roadmap to achieve a 99-100 Core Web Vitals score.`;
                }

                if (claimSection) {
                  claimSection.scrollIntoView({ behavior: 'smooth' });
                  const formPanel = claimSection.querySelector('.glass-panel');
                  if (formPanel) {
                    formPanel.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
                    formPanel.style.borderColor = 'var(--cyan-electric)';
                    formPanel.style.boxShadow = '0 0 30px rgba(0, 242, 254, 0.4)';
                    setTimeout(() => {
                      formPanel.style.borderColor = '';
                      formPanel.style.boxShadow = '';
                    }, 2500);
                  }
                }
              };
            }
            
            auditBtn.disabled = false;
            auditUrl.disabled = false;
            auditBtn.textContent = 'Re-Analyze';
          }, 300);
        }
      }, 80);
    });
  }

  // 7. Global Helper for AI Service Selection
  window.selectAIService = function() {
    const selectEl = document.querySelector('select[name="service"]');
    if (selectEl) {
      selectEl.value = 'ai-chatbot';
    }
  };

  // 8. Stat Counter Animation (Intersection Observer)
  const counterEl = document.querySelector('.stat-number-counter');
  if (counterEl) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = 100;
          const duration = 1600;
          const startTime = performance.now();
          function updateCounter(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.floor(easeProgress * (end - start) + start);
            counterEl.textContent = currentVal + '%';
            if (progress < 1) requestAnimationFrame(updateCounter);
          }
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    counterObserver.observe(counterEl);
  }
});

// PDF Download — uses string concatenation to avoid template literal HTML parser issues
window.downloadPricingPDF = function() {
  const btn = document.querySelector('[onclick="downloadPricingPDF()"]');
  if (btn) { btn.textContent = 'Generating PDF...'; btn.disabled = true; }

  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const year = new Date().getFullYear();

  const css = [
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { font-family: Arial, sans-serif; background: #fff; color: #111; padding: 32px; width: 760px; }',
    '.brand { font-size: 30px; font-weight: 900; letter-spacing: -1px; text-align: center; margin-bottom: 6px; }',
    '.brand span { color: #0099cc; }',
    '.subtitle { font-size: 11px; color: #7c3aed; font-weight: 700; letter-spacing: 2px; text-align: center; text-transform: uppercase; }',
    '.meta { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 4px; }',
    '.divider { border: none; border-top: 2px solid #e5e7eb; margin: 20px 0; }',
    '.intro { font-size: 12px; color: #6b7280; line-height: 1.7; margin-bottom: 22px; }',
    '.card { border-radius: 10px; padding: 20px; margin-bottom: 18px; }',
    '.card-light { background: #f9fafb; border: 1px solid #e5e7eb; }',
    '.card-dark { background: #080c14; border: 2px solid #7c3aed; }',
    '.card-name-light { font-size: 17px; font-weight: 800; color: #111; margin-bottom: 4px; }',
    '.card-name-dark { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 4px; }',
    '.card-desc-light { font-size: 12px; color: #6b7280; line-height: 1.5; }',
    '.card-desc-dark { font-size: 12px; color: #9ca3af; line-height: 1.5; }',
    '.price-light { font-size: 24px; font-weight: 900; color: #080c14; }',
    '.price-dark { font-size: 24px; font-weight: 900; color: #7c3aed; }',
    '.per { font-size: 11px; color: #9ca3af; }',
    '.badge { display: inline-block; background: #7c3aed; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }',
    '.features-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin: 12px 0 8px; }',
    '.features-light { color: #374151; }',
    '.features-dark { color: #d1d5db; }',
    '.feat { font-size: 12px; padding: 2px 0; }',
    '.addon-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; margin-bottom: 24px; }',
    '.badge { display: inline-block; background: #7c3aed; color: #fff; font-weight: 800; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; }',
    '.footer-row { font-size: 11px; color: #9ca3af; }',
    'table { border-collapse: collapse; width: 100%; }',
    'td { vertical-align: top; }'
  ].join('\n');

  const htmlString = '<div style="font-family: Arial, sans-serif; background: #ffffff; color: #111; padding: 32px; width: 760px; box-sizing: border-box;">'
    + '<style>' + css + '</style>'
    + '<div class="brand">ND<span>TechHub</span>.</div>'
    + '<div class="subtitle">Official Project Package &amp; Pricing Specifications</div>'
    + '<div class="meta">Reg: UDYAM-DL-05-0079535 &nbsp;|&nbsp; A unit of NAVDIVA GROUP Pvt. Ltd.</div>'
    + '<div class="meta">ndtechhub.com &nbsp;|&nbsp; connect@ndtechhub.com &nbsp;|&nbsp; +91 8587001712</div>'
    + '<hr class="divider">'
    + '<p class="intro">The following packages serve as baseline guidelines for high-performance web development, maintenance, and technical consultation. All pricing is in Indian Rupees (&#8377;) and subject to final scope confirmation.</p>'
    
    // Category 1
    + '<div style="font-size: 13px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">1. Web &amp; Application Development</div>'
    + '<div class="card card-light" style="margin-bottom: 8px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">High-Performance Static Site</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">&#8377;25,000 – &#8377;45,000</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">5-7 pages, blazing-fast loading speeds, fully responsive, basic SEO setup, optimized vanilla architecture.</td></tr>'
    + '  </table>'
    + '</div>'
    + '<div class="card card-dark" style="margin-bottom: 8px; padding: 14px 18px;">'
    + '  <div class="badge" style="margin-bottom: 6px; font-size: 8px; padding: 2px 8px;">Most Popular</div>'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#fff;">Dynamic / Custom Business Site</td><td style="width:30%; text-align:right; font-weight:bold; color:#7c3aed; font-size:12px;">&#8377;50,000 – &#8377;90,000</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#9ca3af; padding-top:3px;">CMS integration, custom administrative dashboard, secure user authentication, and full database management.</td></tr>'
    + '  </table>'
    + '</div>'
    + '<div class="card card-light" style="margin-bottom: 8px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">E-Commerce Platform</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">&#8377;85,000 – &#8377;1,80,000+</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">Retail/wholesale structure, seamless payment gateway integration, automated inventory tracking, advanced filtering, and multi-user roles.</td></tr>'
    + '  </table>'
    + '</div>'
    + '<div class="card card-light" style="margin-bottom: 18px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">Custom Web Application / Portal</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">Custom Quote (Based on scope)</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">Tailor-made software solutions, complex automation logic, third-party API configurations, and business dashboards.</td></tr>'
    + '  </table>'
    + '</div>'

    // Category 2
    + '<div style="font-size: 13px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">2. Maintenance, Optimization &amp; Performance</div>'
    + '<div class="card card-light" style="margin-bottom: 8px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">Monthly Maintenance Retainer</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">&#8377;8,000 / month</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">Regular bug fixes, continuous server monitoring, periodic database backups, and up to 5 hours of support.</td></tr>'
    + '  </table>'
    + '</div>'
    + '<div class="card card-light" style="margin-bottom: 18px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">Speed &amp; Performance Optimization</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">Starting &#8377;20,000</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">Auditing legacy sites, migrating bloated systems to lightweight codebases, and optimizing Core Web Vitals.</td></tr>'
    + '  </table>'
    + '</div>'

    // Category 3
    + '<div style="font-size: 13px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">3. Technology Consulting &amp; System Architecture</div>'
    + '<div class="card card-light" style="margin-bottom: 8px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">Hourly Tech Consultation</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">&#8377;3,500 / hour</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">1-on-1 expert session covering architecture planning, technology stack selection, or layout planning.</td></tr>'
    + '  </table>'
    + '</div>'
    + '<div class="card card-light" style="margin-bottom: 18px; padding: 14px 18px;">'
    + '  <table>'
    + '    <tr><td style="width:70%; font-weight:bold; font-size:12px; color:#111;">System Architecture &amp; Security Audit</td><td style="width:30%; text-align:right; font-weight:bold; color:#111; font-size:12px;">Starting &#8377;40,000</td></tr>'
    + '    <tr><td colspan="2" style="font-size:10.5px; color:#6b7280; padding-top:3px;">Comprehensive database structural design, workflow logic planning, vulnerability assessment, and security roadmapping.</td></tr>'
    + '  </table>'
    + '</div>'

    + '<hr class="divider" style="margin-bottom:10px;">'
    + '<div style="font-size:9.5px; color:#9ca3af; text-align:center; font-style:italic; margin-bottom:12px;">* Terms Note: These rates serve as baseline guidelines. Final project estimates depend on exact features, integration complexities, and delivery timelines.</div>'
    + '<table><tr><td class="footer-row">Generated: ' + today + '</td><td class="footer-row" style="text-align:right;">&#169; ' + year + ' NAVDIVA GROUP Pvt. Ltd. All rights reserved.</td></tr></table>'
    + '</div>';

  const opt = {
    margin:      0.4,
    filename:    'NDTechHub_Pricing_Packages.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: 760 },
    jsPDF:       { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  if (typeof html2pdf === 'undefined') {
    alert('PDF library not loaded. Please refresh the page and try again.');
    if (btn) { btn.innerHTML = '<i data-lucide="download" style="width:14px;height:14px;"></i> Download Price List PDF'; btn.disabled = false; }
    return;
  }

  html2pdf().set(opt).from(htmlString).save().then(() => {
    if (btn) {
      btn.innerHTML = '<i data-lucide="download" style="width:14px;height:14px;"></i> Download Price List PDF';
      btn.disabled = false;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }).catch(err => {
    console.error('PDF error:', err);
    if (btn) {
      btn.innerHTML = '<i data-lucide="download" style="width:14px;height:14px;"></i> Download Price List PDF';
      btn.disabled = false;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });
};

// ── 3D Particles Animation for Hero Section ──────────────────────────────────
function init3DParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.offsetWidth;
  let height = canvas.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles = [];
  const particleCount = 45;
  const focalLength = 300;
  let rotX = 0.001;
  let rotY = 0.002;
  let rotZ = 0.0005;

  let targetRotX = 0.001;
  let targetRotY = 0.002;

  // Initialize particles in 3D box space
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.5) * 450,
      z: (Math.random() - 0.5) * 450,
      radius: Math.random() * 1.5 + 0.5,
      color: i % 2 === 0 ? 'rgba(0, 242, 254, 0.55)' : 'rgba(139, 92, 246, 0.55)'
    });
  }

  // Mouse responsiveness
  const parent = canvas.parentElement;
  parent.addEventListener('mousemove', (e) => {
    const rect = parent.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    targetRotY = (x / (rect.width / 2)) * 0.008;
    targetRotX = -(y / (rect.height / 2)) * 0.008;
  });

  parent.addEventListener('mouseleave', () => {
    targetRotX = 0.001;
    targetRotY = 0.002;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });

  function rotateX(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const y1 = p.y * cos - p.z * sin;
    const z1 = p.z * cos + p.y * sin;
    p.y = y1;
    p.z = z1;
  }

  function rotateY(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x1 = p.x * cos + p.z * sin;
    const z1 = p.z * cos - p.x * sin;
    p.x = x1;
    p.z = z1;
  }

  function rotateZ(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x1 = p.x * cos - p.y * sin;
    const y1 = p.y * cos + p.x * sin;
    p.x = x1;
    p.y = y1;
  }

  // Animation Loop
  function animate() {
    if (document.hidden) { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, width, height);

    // Smooth transition rotation speeds
    rotX += (targetRotX - rotX) * 0.05;
    rotY += (targetRotY - rotY) * 0.05;

    const projected = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      rotateX(p, rotX);
      rotateY(p, rotY);
      rotateZ(p, rotZ);

      const scale = focalLength / (focalLength + p.z);
      const projX = p.x * scale + centerX;
      const projY = p.y * scale + centerY;

      projected.push({
        x: projX,
        y: projY,
        z: p.z,
        scale: scale,
        radius: p.radius,
        color: p.color
      });
    }

    // Sort by depth (Z-buffer)
    projected.sort((a, b) => b.z - a.z);

    // Draw connection lines
    ctx.lineWidth = 0.5;
    for (let i = 0; i < projected.length; i++) {
      const p1 = projected[i];
      if (p1.z > 150) continue;

      for (let j = i + 1; j < projected.length; j++) {
        const p2 = projected[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 90) {
          const alpha = (1 - dist / 90) * 0.15 * (p1.scale * p2.scale);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.radius * p.scale), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 3 * p.scale;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
  }

  animate();
}
