/**
 * NDTechHub Neural AI Assistant – 2026 Liquid Glass Chat Engine
 * Powered by Groq Cloud API (Llama 3.3 70B Versatile / Llama 3.1 8B Instant)
 * Unit of NAVDIVA GROUP PVT LTD
 * 
 * Note: Groq API Key and Model are managed securely via the Admin Console Gateway.
 */

(function () {
  'use strict';

  // Fallback default key (can be populated directly or managed from Admin Console)
  const DEFAULT_GROQ_API_KEY = ""; 

  // ── NDTechHub Knowledge Context for Groq ──────────────────────────────────
  const ND_SYSTEM_PROMPT = `You are the official AI Assistant for NDTechHub (ndtechhub.com), a premier architectural AI and custom web engineering company based in Delhi, India.
NDTechHub is a core unit of NAVDIVA GROUP PVT LTD, founded and led by Manoj Singh (Owner and CEO).

Key Company Information:
- Founder & CEO: Manoj Singh
- Parent Entity: NAVDIVA GROUP PVT LTD
- Ecosystem Units: NDTechHub, NDMart (ndmart.store), Rameshta (rameshta.online), NDEduHub (ndtechhub.com), NDInsights (ndinsights.navdiva.com), Navdiva Group (navdiva.com)
- Headquarters: 105-B, Gali No. 5, Mahalaxmi Vihar, Phase 7, Block A, Shiv Vihar, Karawal Nagar, Delhi, 110094
- Official Email: support@navdiva.com / connect@ndtechhub.com
- Phone / WhatsApp: +91 8587001712

Services & Capabilities:
1. Zero-Bloat HTML-First Web Development: Ultra-high performance, Bento grid layouts, glassmorphism, 100/100 Google Lighthouse scores.
2. Custom Enterprise AI & RAG Pipelines: Retrieval-Augmented Generation, fine-tuned LLM agents, knowledge graph integrations, automated workflows.
3. SaaS & Custom Web Applications: Scalable cloud architectures, real-time analytics dashboards, secure portals.
4. E-Commerce Solutions: Custom checkout flows, payment gateway integrations (Stripe, Razorpay, WhatsApp alerts), inventory sync.
5. Code Modernization & Performance Audits: Sub-second load times, SEO architecture, zero render-blocking bloat.

Standard Service Packages:
- Starter Static Architecture: ₹15,000 (~$180) — Fast 5-page bento layout, SEO-optimized, mobile responsive.
- Dynamic Web Application: ₹35,000 (~$420) — Firebase/Firestore backend, authentication, custom CMS/blog, API integrations.
- Full E-Commerce Platform: ₹60,000 (~$720) — Multi-product catalog, cart, payments, automated WhatsApp/SMS alerts.
- Enterprise AI & Custom Engineering: Custom Pricing — Tailored RAG pipelines, bespoke LLM agents, dedicated infrastructure.

Guidelines for your responses:
- Be polite, tech-savvy, concise, and helpful.
- Suggest appropriate NDTechHub services or direct users to [Contact Us](/contact) or [Services](/services) or [Portfolio](/portfolio).
- Format responses cleanly with markdown bullet points and bold text where helpful.`;

  // ── Intelligent Local Fallback Engine (when no Groq API Key is entered) ────
  const FALLBACK_KNOWLEDGE = [
    {
      keywords: ['price', 'pricing', 'package', 'cost', 'rate', 'charge', 'quote', 'how much'],
      reply: `Here are **NDTechHub's Core Engineering Packages**:\n\n` +
        `• **Starter Static Architecture**: ₹15,000 (~$180) — Ultra-fast 5-page Bento design, 100/100 Lighthouse score.\n` +
        `• **Dynamic Web Application**: ₹35,000 (~$420) — Full Firebase backend, user auth, dynamic CMS & APIs.\n` +
        `• **Full E-Commerce Platform**: ₹60,000 (~$720) — Payment gateways, inventory management, WhatsApp order alerts.\n` +
        `• **Enterprise AI & RAG Pipelines**: Custom quote based on architecture.\n\n` +
        `👉 You can [Request a Custom Quote](/contact) or message Manoj Singh directly on WhatsApp!`
    },
    {
      keywords: ['service', 'services', 'what do you do', 'offer', 'skills', 'stack', 'technology'],
      reply: `**NDTechHub specializes in:**\n\n` +
        `1. **Zero-Bloat Web Development**: Modern 2026 Bento UI, glassmorphism, instant load speeds.\n` +
        `2. **Enterprise AI & RAG Solutions**: Custom AI agents, LLM pipelines, automated workflows.\n` +
        `3. **SaaS Platforms & Dashboards**: High-concurrency architectures, analytics sandboxes.\n` +
        `4. **SEO & Performance Optimization**: 95+ PageSpeed scores, structured schema.\n\n` +
        `Explore our full breakdown on the [Services Page](/services)!`
    },
    {
      keywords: ['contact', 'call', 'email', 'phone', 'reach', 'location', 'address', 'where', 'manoj'],
      reply: `**Connect with NDTechHub & Manoj Singh:**\n\n` +
        `• 📞 **Phone / WhatsApp**: [+91 8587001712](https://wa.me/918587001712)\n` +
        `• 📧 **Email**: [connect@ndtechhub.com](mailto:connect@ndtechhub.com) / support@navdiva.com\n` +
        `• 📍 **Headquarters**: 105-B, Gali No. 5, Mahalaxmi Vihar, Phase 7, Karawal Nagar, Delhi 110094\n` +
        `• 📄 **Online Form**: [Book a Consultation / Audit](/contact)`
    },
    {
      keywords: ['portfolio', 'work', 'project', 'client', 'demo', 'template', 'case study'],
      reply: `**Explore Our Work & Live Sandboxes:**\n\n` +
        `• **NDMart**: High-speed grocery & retail commerce platform.\n` +
        `• **Shanti Medicos**: Healthcare clinic booking portal.\n` +
        `• **Apex Console**: SaaS analytics performance dashboard.\n` +
        `• **Bento Showcase**: Modern interactive agency templates.\n\n` +
        `Check them out in action on our [Portfolio Page](/portfolio) and [Templates Page](/templates)!`
    },
    {
      keywords: ['ceo', 'founder', 'owner', 'who are you', 'about', 'navdiva'],
      reply: `**NDTechHub** is an AI-first web engineering unit of **NAVDIVA GROUP PVT LTD**, led by **Manoj Singh** (Owner & CEO).\n\nWe build high-performance web applications and custom generative AI infrastructure for businesses across Delhi NCR and globally.`
    }
  ];

  function getFallbackResponse(query) {
    const q = query.toLowerCase();
    for (const item of FALLBACK_KNOWLEDGE) {
      if (item.keywords.some(k => q.includes(k))) {
        return item.reply;
      }
    }
    return `Thank you for reaching out! **NDTechHub** specializes in high-performance web development, AI integration (RAG pipelines, custom agents), and modern 2026 digital infrastructure led by **Manoj Singh**.\n\n` +
      `How can we assist your project today? You can:\n` +
      `• [View Our Services](/services)\n` +
      `• [Explore Ready Templates](/templates)\n` +
      `• [Contact Manoj Singh on WhatsApp](https://wa.me/918587001712)\n` +
      `• [Book a Consultation / Technical Audit](/contact)`;
  }

  // ── State Management ──────────────────────────────────────────────────────
  let chatHistory = [];
  let isGenerating = false;

  function getGroqKey() {
    return localStorage.getItem('ndg_groq_api_key') || DEFAULT_GROQ_API_KEY || '';
  }

  function getGroqModel() {
    return localStorage.getItem('ndg_groq_model') || 'llama3-8b-8192';
  }

  // ── Simple Markdown Parser ────────────────────────────────────────────────
  function formatMarkdown(text) {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');
    // Links [text](url)
    escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-chat-link">$1</a>');
    // Line breaks and bullet points
    const lines = escaped.split('\n');
    let inList = false;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemContent = trimmed.substring(2);
        if (!inList) {
          inList = true;
          return '<ul class="ai-chat-list"><li>' + itemContent + '</li>';
        }
        return '<li>' + itemContent + '</li>';
      } else {
        if (inList) {
          inList = false;
          return '</ul>' + (trimmed ? '<p>' + trimmed + '</p>' : '');
        }
        return trimmed ? '<p>' + trimmed + '</p>' : '<br>';
      }
    });

    if (inList) formattedLines.push('</ul>');
    return formattedLines.join('');
  }

  // ── Inject DOM & Widget ───────────────────────────────────────────────────
  function initChatWidget() {
    if (document.getElementById('ndtechhub-ai-bot-root')) return;

    // Root wrapper
    const root = document.createElement('div');
    root.id = 'ndtechhub-ai-bot-root';
    root.innerHTML = `
      <!-- Left Floating AI Trigger Button -->
      <div class="ai-floating-container" id="ai-floating-btn-container">
        <div class="ai-floating-icon-wrapper">
          <button type="button" 
                  class="ai-bot-float" 
                  id="ai-bot-toggle-btn"
                  aria-label="Chat with NDTechHub Neural AI"
                  title="Chat with NDTechHub Neural AI">
            <svg viewBox="0 0 24 24" class="ai-bot-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8v4a8 8 0 0 0 16 0v-4a8 8 0 0 0-8-8z"/>
              <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
              <path d="M9 16c1 .67 2 .67 3 0" stroke-width="2"/>
              <path d="M12 2v-2" stroke-width="2"/>
              <path d="M2 12h2" stroke-width="2"/>
              <path d="M20 12h2" stroke-width="2"/>
            </svg>
          </button>
          <div class="ai-status-dot" title="Neural AI Engine Active"></div>
        </div>
      </div>

      <!-- 2026 Liquid Glass AI Chat Window (Protected Client Interface) -->
      <div class="ai-chat-window" id="ai-chat-window" role="dialog" aria-label="NDTechHub AI Chat Assistant">
        <!-- Header -->
        <div class="ai-chat-header">
          <div class="ai-header-left">
            <div class="ai-avatar-ring">
              <svg viewBox="0 0 24 24" class="ai-avatar-svg" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a8 8 0 0 0-8 8v4a8 8 0 0 0 16 0v-4a8 8 0 0 0-8-8z"/>
                <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
                <path d="M9 16c1 .67 2 .67 3 0" stroke-width="2"/>
              </svg>
            </div>
            <div class="ai-header-info">
              <div class="ai-header-title">
                <span>NDTechHub Neural AI</span>
                <span class="ai-groq-badge" id="ai-groq-badge">Groq Cloud</span>
              </div>
              <div class="ai-header-subtitle">
                <span class="ai-pulse-pip"></span> Instant Architecture & AI Advisory
              </div>
            </div>
          </div>
          <div class="ai-header-actions">
            <button class="ai-icon-btn" id="ai-clear-btn" title="Clear Conversation" aria-label="Clear Chat">
              🔄
            </button>
            <button class="ai-icon-btn ai-close-btn" id="ai-chat-close-btn" title="Close Chat" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="ai-messages-container" id="ai-messages-container">
          <!-- Welcome message -->
          <div class="ai-msg ai-msg-bot">
            <div class="ai-msg-bubble">
              <p>👋 <strong>Hello! Welcome to NDTechHub.</strong></p>
              <p>I am your 2026 Neural Assistant powered by ultra-fast <strong>Groq Cloud AI</strong>. How can I help engineer your digital future today?</p>
            </div>
          </div>

          <!-- Quick Suggestion Chips -->
          <div class="ai-chips-wrapper" id="ai-chips-wrapper">
            <button class="ai-chip" data-prompt="What are NDTechHub web development packages and pricing?">💰 Pricing & Packages</button>
            <button class="ai-chip" data-prompt="What AI and RAG pipeline services do you offer?">🤖 AI & RAG Solutions</button>
            <button class="ai-chip" data-prompt="Show me your portfolio and live sandbox templates.">🎨 Portfolio & Demos</button>
            <button class="ai-chip" data-prompt="How can I contact Manoj Singh and schedule a consultation?">📞 Connect with Manoj</button>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div class="ai-typing-indicator" id="ai-typing-indicator" style="display:none;">
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <span>Synthesizing response...</span>
        </div>

        <!-- Input Bar -->
        <form class="ai-chat-input-form" id="ai-chat-form">
          <input type="text" 
                 id="ai-chat-input" 
                 class="ai-chat-input" 
                 placeholder="Ask about web dev, AI, pricing, templates..." 
                 autocomplete="off" />
          <button type="submit" class="ai-chat-send-btn" id="ai-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(root);
    bindChatEvents();
    updateKeyStatusIndicator();
  }

  // ── Event Handlers ────────────────────────────────────────────────────────
  function bindChatEvents() {
    const toggleBtn = document.getElementById('ai-bot-toggle-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const clearBtn = document.getElementById('ai-clear-btn');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');

    // Toggle Chat Window
    toggleBtn?.addEventListener('click', () => {
      window.NDGChat.toggle();
    });

    closeBtn?.addEventListener('click', () => {
      window.NDGChat.close();
    });

    // Clear Chat
    clearBtn?.addEventListener('click', () => {
      if (confirm('Clear chat history?')) {
        chatHistory = [];
        const container = document.getElementById('ai-messages-container');
        container.innerHTML = `
          <div class="ai-msg ai-msg-bot">
            <div class="ai-msg-bubble">
              <p>👋 Chat cleared. Ask me anything about <strong>NDTechHub</strong>, web engineering, or AI systems!</p>
            </div>
          </div>
          <div class="ai-chips-wrapper" id="ai-chips-wrapper">
            <button class="ai-chip" data-prompt="What are NDTechHub web development packages and pricing?">💰 Pricing & Packages</button>
            <button class="ai-chip" data-prompt="What AI and RAG pipeline services do you offer?">🤖 AI & RAG Solutions</button>
            <button class="ai-chip" data-prompt="Show me your portfolio and live sandbox templates.">🎨 Portfolio & Demos</button>
            <button class="ai-chip" data-prompt="How can I contact Manoj Singh and schedule a consultation?">📞 Connect with Manoj</button>
          </div>
        `;
        bindChipEvents();
      }
    });

    // Quick Chips
    function bindChipEvents() {
      document.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt');
          if (prompt) {
            handleUserMessage(prompt);
          }
        });
      });
    }
    bindChipEvents();

    // Form Submit
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text || isGenerating) return;
      chatInput.value = '';
      handleUserMessage(text);
    });
  }

  function updateKeyStatusIndicator() {
    const key = getGroqKey();
    const badge = document.getElementById('ai-groq-badge');
    if (key) {
      if (badge) {
        badge.textContent = 'Groq Cloud • Active';
        badge.style.background = 'rgba(0, 242, 254, 0.2)';
        badge.style.borderColor = '#00f2fe';
      }
    } else {
      if (badge) {
        badge.textContent = 'Neural AI Ready';
        badge.style.background = 'rgba(255, 255, 255, 0.1)';
        badge.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      }
    }
  }

  // ── Append Messages ───────────────────────────────────────────────────────
  function appendUserMessage(text) {
    const container = document.getElementById('ai-messages-container');
    const msgEl = document.createElement('div');
    msgEl.className = 'ai-msg ai-msg-user';
    msgEl.innerHTML = `<div class="ai-msg-bubble"><p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>`;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  function appendBotMessage(markdownText) {
    const container = document.getElementById('ai-messages-container');
    const msgEl = document.createElement('div');
    msgEl.className = 'ai-msg ai-msg-bot';
    msgEl.innerHTML = `<div class="ai-msg-bubble">${formatMarkdown(markdownText)}</div>`;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  // ── Groq Cloud API Caller ─────────────────────────────────────────────────
  async function callGroqAPI(userText) {
    const apiKey = getGroqKey();
    const model = getGroqModel();

    if (!apiKey) {
      // Use local intelligent fallback
      await new Promise(r => setTimeout(r, 600));
      return getFallbackResponse(userText);
    }

    const messages = [
      { role: 'system', content: ND_SYSTEM_PROMPT },
      ...chatHistory.slice(-8),
      { role: 'user', content: userText }
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.6,
        max_tokens: 600,
        stream: false
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Groq API Error (${res.status})`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || 'No response generated.';
  }

  // ── User Interaction Flow ─────────────────────────────────────────────────
  async function handleUserMessage(text) {
    appendUserMessage(text);
    chatHistory.push({ role: 'user', content: text });

    const typingEl = document.getElementById('ai-typing-indicator');
    const sendBtn = document.getElementById('ai-send-btn');
    if (typingEl) typingEl.style.display = 'flex';
    if (sendBtn) sendBtn.disabled = true;
    isGenerating = true;

    const container = document.getElementById('ai-messages-container');
    container.scrollTop = container.scrollHeight;

    try {
      const reply = await callGroqAPI(text);
      if (typingEl) typingEl.style.display = 'none';
      appendBotMessage(reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      if (typingEl) typingEl.style.display = 'none';
      appendBotMessage(`⚠️ **Groq Connection Issue**: ${err.message}\n\n*Falling back to local knowledge:*\n\n${getFallbackResponse(text)}`);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      isGenerating = false;
      container.scrollTop = container.scrollHeight;
    }
  }

  // ── Global Public Interface ───────────────────────────────────────────────
  window.NDGChat = {
    open() {
      initChatWidget();
      const win = document.getElementById('ai-chat-window');
      if (win) {
        win.classList.add('active');
        const input = document.getElementById('ai-chat-input');
        setTimeout(() => input?.focus(), 200);
      }
    },
    close() {
      const win = document.getElementById('ai-chat-window');
      if (win) win.classList.remove('active');
    },
    toggle() {
      const win = document.getElementById('ai-chat-window');
      if (win && win.classList.contains('active')) {
        this.close();
      } else {
        this.open();
      }
    },
    isOpen() {
      const win = document.getElementById('ai-chat-window');
      return !!(win && win.classList.contains('active'));
    }
  };

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
})();
