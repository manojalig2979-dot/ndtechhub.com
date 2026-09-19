// chatbot.js — NIA 1.0 Powered by Groq Cloud AI

const NDT_SYSTEM_PROMPT = `You are NIA 1.0, the intelligent AI assistant for NDTechHub (ndtechhub.com) — a Delhi-based software company founded by Manoj Singh. You are embedded on the NDTechHub website to help visitors.

Key facts about NDTechHub:
- Services: Custom web apps, mobile apps, AI integrations, SaaS platforms, logo & branding, API integrations, admin dashboards, domain & hosting, monthly maintenance.
- Products: NIA 1.0 (AI Agent, live at nia.ndtechhub.com), Rameshta Devotional Hub (rameshta.online), Hospital Care SaaS (ndmedcare.web.app), ND Studio (ndstudio-79509.web.app).
- Pricing: Websites from ₹15,000, Web Apps from ₹50,000, Mobile Apps from ₹75,000, Logo Design from ₹3,500.
- Contact: hello@ndtechhub.com | +91 8587001712 | 105-B Shiv Vihar, Karawal Nagar, Delhi 110094.
- Registered: UDYAM-DL-05-0079535 (A unit of NAVDIVA GROUP).

Instructions:
- Be concise, warm, and professional. 
- Answer questions about NDTechHub's services, products, and pricing accurately.
- For custom quotes or partnerships, direct users to contact@ndtechhub.com or the Contact page.
- If asked something unrelated to NDTechHub, gently bring the conversation back.
- Use markdown formatting (bold, bullets) to keep responses readable.
- Keep responses under 120 words unless the user needs detailed information.`;

function toggleChatbot() {
    const windowEl = document.getElementById('chatbot-window');
    windowEl.classList.toggle('hidden');
}

function sendQuickPrompt(promptText) {
    document.getElementById('chat-input').value = promptText;
    handleChatSubmit(new Event('submit'));
}

function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const userText = input.value.trim();
    if (!userText) return;

    const chatContainer = document.getElementById('chat-messages');

    // Render User Message
    const userBubble = document.createElement('div');
    userBubble.className = "flex justify-end";
    userBubble.innerHTML = `
      <div class="p-3 rounded-2xl rounded-tr-none bg-sky-500 text-slate-950 font-medium max-w-[85%]">
        ${userText}
      </div>
    `;
    chatContainer.appendChild(userBubble);
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    const typingBubble = document.createElement('div');
    typingBubble.id = typingId;
    typingBubble.className = "flex items-start gap-2 max-w-[90%]";
    typingBubble.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex-shrink-0 flex items-center justify-center mt-0.5">
        <i data-lucide="bot" class="w-3.5 h-3.5"></i>
      </div>
      <div class="p-3 rounded-2xl rounded-tl-none bg-white/10 border border-white/10 text-slate-400 text-sm italic">
        NIA is thinking...
      </div>
    `;
    chatContainer.appendChild(typingBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Try Groq first, fall back to local response
    const groqKey = localStorage.getItem('ndg_groq_api_key');
    const groqModel = localStorage.getItem('ndg_groq_model') || 'llama3-8b-8192';

    if (groqKey) {
        callGroqAPI(userText, groqKey, groqModel)
            .then(reply => renderBotReply(chatContainer, typingId, reply))
            .catch(() => renderBotReply(chatContainer, typingId, generateNiaFallback(userText)));
    } else {
        setTimeout(() => {
            renderBotReply(chatContainer, typingId, generateNiaFallback(userText));
        }, 500);
    }
}

async function callGroqAPI(userMessage, apiKey, model) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: NDT_SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 200,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || generateNiaFallback(userMessage);
}

function renderBotReply(chatContainer, typingId, replyText) {
    // Remove typing indicator
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    // Simple markdown-like rendering: **bold**, bullet points
    const formatted = replyText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n- /g, '<br>• ')
        .replace(/\n/g, '<br>');

    const botBubble = document.createElement('div');
    botBubble.className = "flex items-start gap-2 max-w-[90%]";
    botBubble.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex-shrink-0 flex items-center justify-center mt-0.5">
        <i data-lucide="bot" class="w-3.5 h-3.5"></i>
      </div>
      <div class="p-3 rounded-2xl rounded-tl-none bg-white/10 border border-white/10 text-slate-200" style="line-height: 1.6;">
        ${formatted}
      </div>
    `;
    chatContainer.appendChild(botBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Local keyword fallback — used when no Groq API key is configured
function generateNiaFallback(query) {
    const q = query.toLowerCase();

    if (q.includes('nia') || q.includes('agent') || q.includes('ai')) {
        return `**NIA 1.0** is our flagship AI assistant built by NDTechHub! It features multimodal tool usage, natural conversation, and real-time knowledge. Try it live at **nia.ndtechhub.com**!`;
    }
    if (q.includes('studio') || q.includes('creative') || q.includes('design')) {
        return `**ND Studio** is our creative workstation with powerful design-to-code exports. Try it at **ndstudio-79509.web.app**.`;
    }
    if (q.includes('hospital') || q.includes('health') || q.includes('clinic') || q.includes('medcare')) {
        return `Our **Hospital Care SaaS** handles patient records, appointments, pharmacy, and ICU management. Live demo at **ndmedcare.web.app**.`;
    }
    if (q.includes('rameshta') || q.includes('devotional') || q.includes('spiritual')) {
        return `**Rameshta** is our devotional platform with bhajans, mantras, and spiritual content. Visit **rameshta.online**!`;
    }
    if (q.includes('price') || q.includes('cost') || q.includes('quote') || q.includes('budget') || q.includes('rate')) {
        return `Our pricing:\n- **Websites**: from ₹15,000\n- **Web Apps**: from ₹50,000\n- **Mobile Apps**: from ₹75,000\n- **Logo Design**: from ₹3,500\n\nContact us at **hello@ndtechhub.com** for a custom quote!`;
    }
    if (q.includes('contact') || q.includes('hire') || q.includes('call') || q.includes('whatsapp') || q.includes('reach')) {
        return `Reach us at:\n- **Email**: hello@ndtechhub.com\n- **Phone**: +91 8587001712\n- **Location**: Delhi, India\n\nOr visit our **Contact** page!`;
    }
    if (q.includes('service') || q.includes('what do you') || q.includes('what can')) {
        return `NDTechHub builds:\n- **Custom Web & Mobile Apps**\n- **AI Integrations & Chatbots**\n- **SaaS Platforms**\n- **Logo & Branding**\n- **Domain, Hosting & Maintenance**\n\nCheck the **Services** tab for full details!`;
    }

    return `Hi! I'm **NIA**, NDTechHub's AI assistant. We build custom web apps, mobile apps, AI integrations, and SaaS platforms. How can I help you today?\n\n📧 hello@ndtechhub.com | 📞 +91 8587001712`;
}
