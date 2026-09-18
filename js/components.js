// components.js - Modals and shared UI components

function openAppModal(appKey) {
    if (typeof APPS_DATA === 'undefined') {
        console.error("APPS_DATA is not defined. Ensure products.js is loaded.");
        return;
    }
    const data = APPS_DATA[appKey];
    if (!data) return;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
      <div class="flex flex-col gap-6">
        
        <!-- Modal Hero Banner -->
        <div class="rounded-2xl p-6 bg-gradient-to-r ${data.gradient} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <span class="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-black/30 border border-white/20 uppercase font-bold">${data.badge}</span>
            <h2 class="font-display font-extrabold text-2xl sm:text-3xl mt-2">${data.title}</h2>
            <p class="text-xs sm:text-sm text-white/90 font-medium">${data.tagline}</p>
          </div>
          <div class="w-14 h-14 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center self-start sm:self-auto">
            <i data-lucide="${data.icon}" class="w-7 h-7 text-white"></i>
          </div>
        </div>

        <!-- Problem & Solution Overview -->
        <div>
          <h4 class="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2">Executive Overview</h4>
          <p class="text-slate-200 text-xs sm:text-sm leading-relaxed">${data.overview}</p>
        </div>

        <!-- Feature Matrix -->
        <div>
          <h4 class="text-xs font-mono text-sky-400 uppercase tracking-wider mb-3">Core Technical Features</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${data.features.map(f => `
              <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div class="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
                  <i data-lucide="check" class="w-3.5 h-3.5 text-brand-neon"></i>
                  ${f.title}
                </div>
                <p class="text-[11px] text-slate-400 leading-normal">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Architecture & Stack -->
        <div>
          <h4 class="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2">Technology Stack</h4>
          <div class="flex flex-wrap gap-2">
            ${data.techStack.map(t => `<span class="text-xs font-mono px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">${t}</span>`).join('')}
          </div>
        </div>

        <!-- Actions: Download & Demo -->
        <div class="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-slate-400">
            Direct release built for enterprise deployment.
          </div>
          <div class="flex items-center gap-2">
            <button onclick="triggerDownload('${data.title}')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Download App / Binary</span>
            </button>
            <a href="contact.html?subject=${encodeURIComponent(data.title + ' Custom Deployment')}" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors">
              Request Deployment
            </a>
          </div>
        </div>

      </div>
    `;

    document.getElementById('app-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeAppModal() {
    document.getElementById('app-modal').classList.add('hidden');
}

// Close on outside click
document.addEventListener('click', (e) => {
    if (e.target.id === 'app-modal') closeAppModal();
});

function triggerDownload(appName) {
    if(typeof showToast === 'function') {
        showToast(`Initiating download for ${appName}... Latest 2026 build.`);
    }
    
    setTimeout(() => {
        if(typeof showToast === 'function') {
            showToast(`Download link active! Check your downloads or repository.`);
        }
    }, 1500);
}
