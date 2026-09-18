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
