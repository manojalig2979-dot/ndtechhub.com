// chatbot.js
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

    // Generate Intelligent Response
    setTimeout(() => {
        const botResponse = generateNiaResponse(userText);
        const botBubble = document.createElement('div');
        botBubble.className = "flex items-start gap-2 max-w-[90%]";
        botBubble.innerHTML = `
          <div class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex-shrink-0 flex items-center justify-center mt-0.5">
            <i data-lucide="bot" class="w-3.5 h-3.5"></i>
          </div>
          <div class="p-3 rounded-2xl rounded-tl-none bg-white/10 border border-white/10 text-slate-200">
            ${botResponse}
          </div>
        `;
        chatContainer.appendChild(botBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }, 600);
}

function generateNiaResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('nia') || q.includes('agent') || q.includes('ai')) {
        return `**NIA 1.0** is our flagship autonomous agent built by NDTechHub! It features multimodal tool usage, direct file indexing, and natural speech synthesis. You can view its case study on the **Products & Apps** page or download its binary.`;
    }
    if (q.includes('studio') || q.includes('creative') || q.includes('design')) {
        return `**ND Studio** is our high-performance creative workstation featuring WebAssembly vector rendering, instantaneous design-to-code exports, and real-time canvas collaboration.`;
    }
    if (q.includes('stock') || q.includes('inventory') || q.includes('ledger')) {
        return `**Stock Manager** is our retail & warehouse inventory ERP with barcode POS integration, low-stock predictive replenishment, and automated tax accounting. Would you like to schedule a demonstration?`;
    }
    if (q.includes('hospital') || q.includes('health') || q.includes('clinic')) {
        return `Our **Hospital Management SaaS** handles patient EMRs, automated ICU bed allocations, pharmacy dispensing, and doctor appointments under strict HIPAA security protocols.`;
    }
    if (q.includes('school') || q.includes('edtech') || q.includes('student')) {
        return `**School Nexus** is our multi-campus institutional ERP managing 50,000+ students, automated fee payments, digital report cards, and attendance tracking.`;
    }
    if (q.includes('price') || q.includes('cost') || q.includes('quote') || q.includes('estimate') || q.includes('budget')) {
        return `Our custom software builds typically range from **$1,500 for rapid MVPs** to **$5,000+ for enterprise multi-tenant systems**. You can use our interactive **Scope Estimator** in the Services tab or submit an inquiry in the Contact page!`;
    }
    if (q.includes('download') || q.includes('apk') || q.includes('app')) {
        return `You can download all NDTechHub apps directly from the **Products & Portfolio** tab by tapping the download icon next to each product.`;
    }
    if (q.includes('contact') || q.includes('hire') || q.includes('call') || q.includes('whatsapp')) {
        return `You can reach the NDTechHub founders directly at **contact@ndtechhub.com** or tap the **WhatsApp icon on the bottom-left** of your screen for instant chat!`;
    }

    return `At **NDTechHub (ndtechhub.com)**, we specialize in high-velocity software engineering: custom AI agents (NIA 1.0), enterprise SaaS, and mobile platforms. Feel free to navigate to our **Products** or **Services** tabs, or let me know if you want a custom quote!`;
}
