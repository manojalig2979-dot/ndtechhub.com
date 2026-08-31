// js/firebase-contact.js — 2026-Era Interactive Contact & Project Discovery Engine
// Developed for NDTechHub • NAVDIVA GROUP PVT LTD

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCY2gFTgTW3uGgmdbjjyGdWFiIfdpGNgf4",
  authDomain: "ndtechhub-91464.firebaseapp.com",
  projectId: "ndtechhub-91464",
  storageBucket: "ndtechhub-91464.firebasestorage.app",
  messagingSenderId: "326061417911",
  appId: "1:326061417911:web:167c59d85be322652e7432",
  measurementId: "G-23XBQD2Z6F"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('c26-submit-btn');
  const serviceCards = document.querySelectorAll('.c26-choice-card[data-type="service"]');
  const budgetPills = document.querySelectorAll('.c26-pill-btn[data-type="budget"]');
  const timelinePills = document.querySelectorAll('.c26-pill-btn[data-type="timeline"]');
  const ratingGroup = document.getElementById('ratingGroup');
  const messageArea = document.getElementById('c26-message');
  const costBox = document.getElementById('c26-estimator-box');
  const costTotalEl = document.getElementById('c26-dynamic-total');
  const dropzone = document.getElementById('c26-dropzone');
  const fileInput = document.getElementById('c26-file-input');
  const fileChip = document.getElementById('c26-file-chip');
  const fileNameText = document.getElementById('c26-file-name');
  const removeFileBtn = document.getElementById('c26-remove-file');

  // State
  let selectedService = 'web-dev';
  let selectedBudget = '₹35,000 – ₹60,000';
  let selectedTimeline = '2-3 Weeks Rapid';
  let attachedFile = null;

  // Base pricing catalog for live estimator
  const SERVICE_PRICES = {
    'web-dev': 35000,
    'ai-agents': 65000,
    'ecommerce': 60000,
    'speed-seo': 18000,
    'enterprise': 120000,
    'feedback': 0
  };

  // ── 1. URL Parameter Parsing ──────────────────────────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  const templateParam = urlParams.get('template');
  const packageParam = urlParams.get('package') || 'custom';
  const serviceParam = urlParams.get('service');

  if (typeParam === 'feedback') {
    selectService('feedback');
  } else if (serviceParam) {
    selectService(serviceParam);
  } else if (templateParam === 'ecommerce-store') {
    selectService('ecommerce');
  } else if (templateParam) {
    selectService('web-dev');
  }

  // Pre-fill questionnaire if template is linked
  if (templateParam && messageArea) {
    const templateNames = {
      'ecommerce-store': 'wCom E-Commerce Suite',
      'saas-dashboard': 'Apex SaaS Launchpad Console',
      'bento-portfolio': 'Bento Creative Portfolio',
      'clinic-scheduler': 'MediBook Clinic Onboarding',
      'agency-portal': 'Nova Agency & Consulting Portal'
    };
    const tName = templateNames[templateParam] || templateParam;
    messageArea.value = `Hello Manoj & NDTechHub Engineering,\n\nI want to initialize development for the "${tName}" (Tier: ${packageParam}).\n\nKey parameters for my project:\n- Primary Industry / Domain:\n- Required Integrations:\n- Target Launch Date:`;
  }

  // ── 2. Service Selection Handler ──────────────────────────────────────────
  function selectService(serviceKey) {
    selectedService = serviceKey;
    serviceCards.forEach(card => {
      if (card.dataset.value === serviceKey) {
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      } else {
        card.classList.remove('active');
      }
    });

    if (ratingGroup) {
      ratingGroup.style.display = serviceKey === 'feedback' ? 'block' : 'none';
    }

    updateLiveEstimator();
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      selectService(card.dataset.value);
    });
  });

  // ── 3. Budget & Timeline Pill Selectors ───────────────────────────────────
  budgetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      budgetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedBudget = pill.dataset.value;
    });
  });

  timelinePills.forEach(pill => {
    pill.addEventListener('click', () => {
      timelinePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedTimeline = pill.dataset.value;
    });
  });

  // ── 4. Live Cost Estimator ────────────────────────────────────────────────
  function updateLiveEstimator() {
    if (!costBox || !costTotalEl) return;
    const base = SERVICE_PRICES[selectedService] || 0;
    if (base > 0) {
      costBox.style.display = 'block';
      let total = base;

      // Add checked addons
      document.querySelectorAll('.c26-addon-check:checked').forEach(chk => {
        total += parseInt(chk.dataset.price || '0', 10);
      });

      costTotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    } else {
      costBox.style.display = 'none';
    }
  }

  document.querySelectorAll('.c26-addon-check').forEach(chk => {
    chk.addEventListener('change', updateLiveEstimator);
  });
  updateLiveEstimator();

  // ── 5. File Upload Dropzone ───────────────────────────────────────────────
  if (dropzone && fileInput) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        handleFileSelect(fileInput.files[0]);
      }
    });

    function handleFileSelect(file) {
      attachedFile = file;
      if (fileChip && fileNameText) {
        fileNameText.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileChip.style.display = 'inline-flex';
      }
    }

    removeFileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      attachedFile = null;
      fileInput.value = '';
      if (fileChip) fileChip.style.display = 'none';
    });
  }

  // ── 6. Form Submission to Firestore ───────────────────────────────────────
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('c26-name')?.value.trim() || document.getElementById('contact-name')?.value.trim();
      const email = document.getElementById('c26-email')?.value.trim() || document.getElementById('contact-email')?.value.trim();
      const phone = document.getElementById('c26-phone')?.value.trim() || 'Not specified';
      const company = document.getElementById('c26-company')?.value.trim() || 'Direct Individual';
      const message = messageArea?.value.trim() || document.getElementById('contact-message')?.value.trim();
      const rating = selectedService === 'feedback' ? document.getElementById('c26-rating')?.value : null;

      if (!name || !email || !message) {
        alert('Please complete all required fields (Name, Email, Project Message).');
        return;
      }

      // Generate Ticket ID
      const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `ND-REQ-${randomTicketNum}`;

      // Submit State UI
      const btn = submitBtn || form.querySelector('button[type="submit"]');
      const origBtnContent = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
          <span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:8px;vertical-align:middle;"></span>
          Transmitting Parameters...
        `;
      }

      // Collect active addons
      const addons = [];
      document.querySelectorAll('.c26-addon-check:checked').forEach(chk => {
        addons.push(chk.dataset.name || chk.value);
      });

      try {
        await addDoc(collection(db, "contact_inquiries"), {
          ticketId,
          name,
          email,
          phone,
          company,
          service: selectedService,
          budget: selectedBudget,
          timeline: selectedTimeline,
          addons,
          rating,
          message,
          hasAttachment: !!attachedFile,
          attachmentName: attachedFile ? attachedFile.name : null,
          timestamp: new Date().toISOString(),
          source: 'ndtechhub-2026-contact'
        });

        // Show Modern Confirmation Modal
        showSuccessModal(ticketId, name, email, selectedService, message);
        form.reset();
        attachedFile = null;
        if (fileChip) fileChip.style.display = 'none';
        selectService('web-dev');
      } catch (err) {
        console.error('[NDTechHub] Firestore Error:', err);
        alert('Transmission notice: Connection issue logged. Routing your inquiry directly via executive email.');
        window.location.href = `mailto:connect@ndtechhub.com?subject=Project Inquiry (${ticketId})&body=Name: ${name}%0D%0AService: ${selectedService}%0D%0A%0D%0A${encodeURIComponent(message)}`;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            Transmit Secure Parameters 
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          `;
        }
      }
    });
  }

  // ── 7. Success Receipt Modal ──────────────────────────────────────────────
  function showSuccessModal(ticketId, name, email, service, message) {
    let modal = document.getElementById('c26-success-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'c26-success-modal';
      modal.className = 'c26-modal-overlay';
      document.body.appendChild(modal);
    }

    const waMsg = encodeURIComponent(
      `Hello Manoj Singh (CEO, NDTechHub),\n\nI just submitted project discovery parameters on ndtechhub.com!\nTicket ID: ${ticketId}\nName: ${name}\nService: ${service}\n\nLooking forward to collaborating!`
    );

    modal.innerHTML = `
      <div class="c26-modal-box">
        <div class="c26-success-icon-ring">
          ✓
        </div>
        <h3 style="font-size:22px;font-weight:800;color:#fff;margin:0 0 6px;">Transmission Verified</h3>
        <p style="font-size:13px;color:rgba(255,255,255,0.75);margin:0 0 10px;line-height:1.5;">
          Your architectural requirements have been logged into NDTechHub's review pipeline.
        </p>
        
        <div>
          <span class="c26-ticket-badge">REFERENCE: ${ticketId}</span>
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;font-size:12px;color:rgba(255,255,255,0.7);text-align:left;line-height:1.6;margin-bottom:16px;">
          <div>👤 <strong>Recipient:</strong> ${name} &lt;${email}&gt;</div>
          <div>🛠️ <strong>Target Service:</strong> ${service.toUpperCase()}</div>
          <div>⚡ <strong>Status:</strong> Routed to Manoj Singh (CEO)</div>
        </div>

        <a href="https://wa.me/918587001712?text=${waMsg}" 
           class="c26-whatsapp-cta" 
           target="_blank" 
           rel="noopener noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Fast-Track to Manoj Singh on WhatsApp →
        </a>

        <button type="button" id="c26-close-modal-btn" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:13px;cursor:pointer;margin-top:14px;text-decoration:underline;">
          Done & Close
        </button>
      </div>
    `;

    modal.classList.add('open');

    document.getElementById('c26-close-modal-btn')?.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }
});
