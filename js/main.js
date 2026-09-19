// main.js - Core functionality

window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setActiveNav();
});

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.innerText = msg;
    toast.classList.remove('translate-x-20', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.add('translate-x-20', 'opacity-0');
        toast.classList.remove('translate-x-0', 'opacity-100');
    }, 4000);
}

function setActiveNav() {
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // Normalize path just in case
    if (currentPath === '') currentPath = 'index.html';
    
    const navLinks = document.querySelectorAll('header nav a.nav-link');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('nav-pill-active');
        } else {
            link.classList.remove('nav-pill-active');
        }
    });
}

function filterPricing(category, btn) {
    const tabs = document.querySelectorAll('.pricing-tab-btn');
    tabs.forEach(t => {
        t.className = 'pricing-tab-btn px-4 py-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all';
    });
    if (btn) {
        btn.className = 'pricing-tab-btn px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/40 font-semibold transition-all';
    }

    const webGroup = document.querySelector('[data-category="web"]');
    const specialtyGroup = document.querySelector('[data-category="specialty"]');
    const subCards = document.querySelectorAll('[data-sub]');

    if (category === 'all') {
        if (webGroup) webGroup.classList.remove('hidden');
        if (specialtyGroup) specialtyGroup.classList.remove('hidden');
        subCards.forEach(c => c.classList.remove('hidden'));
    } else if (category === 'web') {
        if (webGroup) webGroup.classList.remove('hidden');
        if (specialtyGroup) specialtyGroup.classList.add('hidden');
    } else if (category === 'maintenance') {
        if (webGroup) webGroup.classList.add('hidden');
        if (specialtyGroup) specialtyGroup.classList.remove('hidden');
        subCards.forEach(c => {
            if (c.getAttribute('data-sub') === 'maintenance') {
                c.classList.remove('hidden');
            } else {
                c.classList.add('hidden');
            }
        });
    } else if (category === 'consulting') {
        if (webGroup) webGroup.classList.add('hidden');
        if (specialtyGroup) specialtyGroup.classList.remove('hidden');
        subCards.forEach(c => {
            if (c.getAttribute('data-sub') === 'consulting') {
                c.classList.remove('hidden');
            } else {
                c.classList.add('hidden');
            }
        });
    }
}

