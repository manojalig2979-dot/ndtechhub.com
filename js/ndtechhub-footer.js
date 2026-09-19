class NavdivaFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const currentYear = new Date().getFullYear();

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    /* Self-contained CSS Variables to ensure it looks the same everywhere */
                        --bg-deep: #0f172a;
                        --navy-brand: #1e293b;
                    --cyan-electric: #00B8FF;
                    --text-main: #f8fafc;
                    --border: rgba(255, 255, 255, 0.1);
                    --text-secondary: rgba(248, 250, 252, 0.7);
                    --nav-glow: rgba(0, 184, 255, 0.05);
                    
                    display: block;
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    box-sizing: border-box;
                    width: 100%;
                    overflow-x: hidden;
                }
                *, *::before, *::after { box-sizing: inherit; }
                
                .site-footer {
                    width: 100%;
                    background: rgba(0, 184, 255, 0.05);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-top: 1px solid var(--cyan-electric);
                    color: var(--text-main);
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .back-to-top {
                    display: block;
                    width: 100%;
                    background-color: var(--navy-brand);
                    color: var(--text-main);
                    text-align: center;
                    padding: 15px 0;
                    font-size: 13px;
                    text-decoration: none;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: none;
                    border-bottom: 1px solid rgba(0, 184, 255, 0.2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .back-to-top:hover {
                    background-color: #0c2759;
                    color: var(--cyan-electric);
                    box-shadow: inset 0 0 20px rgba(0, 184, 255, 0.2);
                }
                .main-footer-links {
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                    box-sizing: border-box;
                    width: 100%;
                }
                .footer-grid {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
                    gap: 40px;
                }
                .footer-col h4 {
                    color: var(--cyan-electric);
                    margin-bottom: 15px;
                    margin-top: 0;
                    font-size: 1.1rem;
                }
                .footer-col p { margin-top: 0; line-height: 1.6; font-size: 0.9rem; }
                .footer-col ul { list-style: none; padding: 0; margin: 0; }
                .footer-col ul li { margin-bottom: 10px; font-size: 0.95rem; }
                .footer-col {
                    word-break: break-word;
                }
                .footer-col a {
                    color: var(--text-main);
                    text-decoration: none !important;
                    transition: opacity 0.3s ease, color 0.3s ease;
                }
                .footer-col a:hover { color: var(--cyan-electric); }
                
                .btn-primary {
                    background: rgba(0, 184, 255, 0.05);
                    border: 1px solid rgba(0, 184, 255, 0.3);
                    border-radius: 8px;
                    color: var(--cyan-electric);
                    text-decoration: none !important;
                    display: inline-flex;
                    align-items: center;
                    padding: 0.6rem 1.2rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 4px 15px rgba(0, 184, 255, 0.1);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }
                .btn-primary:hover {
                    background: var(--cyan-electric);
                    color: #0f172a;
                    box-shadow: 0 8px 25px rgba(0, 184, 255, 0.4);
                    transform: translateY(-3px) scale(1.02);
                }
                /* 2026 Liquid Glass Social Media Icons */
                .social-icons { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 15px; }
                .social-icons a {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(16px) saturate(190%);
                    -webkit-backdrop-filter: blur(16px) saturate(190%);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    border-top: 1px solid rgba(255, 255, 255, 0.45);
                    box-shadow: 
                        inset 0 1px 1px rgba(255, 255, 255, 0.35),
                        inset 0 -2px 5px rgba(0, 0, 0, 0.4),
                        0 8px 24px rgba(0, 0, 0, 0.35);
                    margin: 3px 2px;
                    text-decoration: none;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                }
                .social-icons a::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 6px;
                    right: 6px;
                    height: 45%;
                    border-radius: 50px 50px 30px 30px;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%);
                    pointer-events: none;
                    z-index: 1;
                }
                .social-icons a svg {
                    width: 20px;
                    height: 20px;
                    fill: #ffffff;
                    position: relative;
                    z-index: 2;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .social-icons a:hover {
                    transform: translateY(-5px) scale(1.12);
                    border-top-color: #ffffff;
                }
                .social-icons a:hover svg {
                    transform: scale(1.12);
                }

                /* Liquid Brand backgrounds */
                .social-icons a[aria-label="Facebook"]    { background: linear-gradient(135deg, rgba(24, 119, 242, 0.88) 0%, rgba(13, 71, 161, 0.95) 100%); }
                .social-icons a[aria-label="YouTube"]     { background: linear-gradient(135deg, rgba(255, 0, 0, 0.88) 0%, rgba(183, 28, 28, 0.95) 100%); }
                .social-icons a[aria-label="Instagram"]   { background: radial-gradient(circle at 30% 107%, rgba(253, 244, 151, 0.95) 0%, rgba(253, 89, 73, 0.88) 45%, rgba(214, 36, 159, 0.92) 60%, rgba(40, 90, 235, 0.95) 90%); }
                .social-icons a[aria-label="LinkedIn"]    { background: linear-gradient(135deg, rgba(0, 119, 181, 0.88) 0%, rgba(2, 62, 138, 0.95) 100%); }
                .social-icons a[aria-label="WhatsApp"],
                .social-icons a.social-whatsapp { 
                    width: 46px;
                    height: 46px;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    background: linear-gradient(135deg, rgba(37, 211, 102, 0.25) 0%, rgba(37, 211, 102, 0.08) 50%, rgba(13, 27, 42, 0.6) 100%); 
                    border: 1px solid rgba(37, 211, 102, 0.35);
                    border-top: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.4), 0 0 15px rgba(37, 211, 102, 0.25);
                }
                .social-icons a[aria-label="WhatsApp"]::after,
                .social-icons a.social-whatsapp::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
                    opacity: 0;
                    transform: scale(0.5) rotate(0deg);
                    transition: opacity 0.4s ease, transform 0.4s ease;
                    pointer-events: none;
                    z-index: 1;
                }
                .social-icons a[aria-label="WhatsApp"]:hover::after,
                .social-icons a.social-whatsapp:hover::after {
                    opacity: 1;
                    transform: scale(1.2) rotate(30deg);
                }
                .social-icons a[aria-label="X (Twitter)"] { background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(10, 15, 25, 0.95) 100%); border: 1px solid rgba(255,255,255,0.25); }
                .social-icons a[aria-label="Pinterest"]   { background: linear-gradient(135deg, rgba(230, 0, 35, 0.88) 0%, rgba(160, 0, 20, 0.95) 100%); }
                .social-icons a[aria-label="Telegram"]    { background: linear-gradient(135deg, rgba(38, 165, 228, 0.88) 0%, rgba(14, 116, 175, 0.95) 100%); }

                /* Per-brand liquid glow caustics on hover */
                .social-icons a[aria-label="Facebook"]:hover    { box-shadow: 0 10px 28px rgba(24,119,242,0.65),  0 0 18px rgba(24,119,242,0.45); }
                .social-icons a[aria-label="YouTube"]:hover     { box-shadow: 0 10px 28px rgba(255,0,0,0.65),     0 0 18px rgba(255,0,0,0.45); }
                .social-icons a[aria-label="Instagram"]:hover   { box-shadow: 0 10px 28px rgba(214,36,159,0.65),  0 0 18px rgba(253,89,73,0.45); }
                .social-icons a[aria-label="LinkedIn"]:hover    { box-shadow: 0 10px 28px rgba(0,119,181,0.65),   0 0 18px rgba(0,119,181,0.45); }
                .social-icons a[aria-label="WhatsApp"]:hover,
                .social-icons a.social-whatsapp:hover { 
                    transform: translateY(-5px) scale(1.14);
                    background: linear-gradient(135deg, rgba(37, 211, 102, 0.88) 0%, rgba(18, 140, 62, 0.95) 100%);
                    border-color: #25D366;
                    border-top-color: #25D366;
                    box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.6), 0 0 25px rgba(37, 211, 102, 0.9), 0 0 50px rgba(37, 211, 102, 0.5);
                }
                .social-icons a[aria-label="X (Twitter)"]:hover { box-shadow: 0 10px 28px rgba(255,255,255,0.4),  0 0 18px rgba(255,255,255,0.25); }
                .social-icons a[aria-label="Pinterest"]:hover   { box-shadow: 0 10px 28px rgba(230,0,35,0.65),    0 0 18px rgba(230,0,35,0.45); }
                .social-icons a[aria-label="Telegram"]:hover    { box-shadow: 0 10px 28px rgba(38,165,228,0.65),  0 0 18px rgba(38,165,228,0.45); }
                
                .bottom-footer {
                    background-color: var(--bg-deep);
                    color: var(--text-secondary);
                    padding: 30px 20px;
                    text-align: center;
                    font-size: 12px;
                    border-top: 1px solid rgba(0, 184, 255, 0.2);
                    box-sizing: border-box;
                    width: 100%;
                }
                .brand-logo {
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: -1px;
                    display: inline-block;
                    margin-bottom: 20px;
                }
                .bottom-links {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                }
                .bottom-links a {
                    color: inherit;
                    text-decoration: none !important;
                    transition: color 0.3s ease;
                }
                .bottom-links a:hover {
                    color: var(--cyan-electric);
                }
                .eco-badge {
                    margin-top: 1.5rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background-color: var(--nav-glow);
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    border: 1px solid var(--cyan-electric);
                    color: var(--cyan-electric);
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .hiring-badge {
                    background: rgba(0, 184, 255, 0.1);
                    color: var(--cyan-electric);
                    border: 1px solid var(--cyan-electric);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    margin-left: 5px;
                    animation: pulse 2s infinite;
                    vertical-align: middle;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 184, 255, 0.4); }
                    70% { box-shadow: 0 0 0 4px rgba(0, 184, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 184, 255, 0); }
                }
                .social-strip {
                    width: 100%;
                    padding: 28px 20px;
                    background: linear-gradient(135deg, rgba(0,184,255,0.06) 0%, rgba(0,0,0,0) 60%);
                    border-bottom: 1px solid rgba(0,184,255,0.15);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    box-sizing: border-box;
                }
                .social-strip-heading {
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .social-strip-heading::before,
                .social-strip-heading::after {
                    content: '';
                    display: block;
                    width: 60px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0,184,255,0.5));
                }
                .social-strip-heading::after {
                    background: linear-gradient(90deg, rgba(0,184,255,0.5), transparent);
                }
                .social-strip .social-icons {
                    margin-top: 0;
                    justify-content: center;
                }

            </style>
            
            <footer class="site-footer">
                <!-- Back to top -->
                <button class="back-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'});">Back to top</button>

                <!-- Social Strip -->
                <div class="social-strip">
                    <div class="social-strip-heading">Get Connected with us on social networks</div>
                    <div class="social-icons">
                        <a href="https://www.facebook.com/NDG0304" class="social-icon-btn social-facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg></a>
                        <a href="https://www.youtube.com/@NDG0304" class="social-icon-btn social-youtube" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
                        <a href="https://www.instagram.com/NDG0304" class="social-icon-btn social-instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24"><defs><radialGradient id="ig-grad2" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497" /><stop offset="5%" stop-color="#fdf497" /><stop offset="45%" stop-color="#fd5949" /><stop offset="60%" stop-color="#d6249f" /><stop offset="90%" stop-color="#285AEB" /></radialGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
                        <a href="https://www.linkedin.com/in/ndg0304" class="social-icon-btn social-linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                        <a href="https://wa.me/+918979640795" class="social-icon-btn social-whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
                        <a href="https://x.com/NDG0304" class="social-icon-btn social-twitter" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><svg viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg></a>
                        <a href="https://in.pinterest.com/NDG0304/" class="social-icon-btn social-pinterest" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
                        <a href="https://t.me/NDG030" class="social-icon-btn social-telegram" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>
                    </div>
                </div>

                <div class="main-footer-links">
                  <div class="footer-grid">
                    <div class="footer-col">
                        <h4>ND<span style="color: var(--cyan-electric);">TechHub</span></h4>
                        <p style="color: var(--text-secondary); margin-bottom: 15px;">Engineering the digital future of Delhi NCR with high-performance, AI-driven web solutions.</p>
                        <a href="about" class="btn-primary">📄 About NDTechHub</a>
                        <div class="eco-badge">
                            <span>🌱</span> Eco-Friendly & Greenery Supported
                        </div>
                    </div>
                    <div class="footer-col">
                        <h4>The ND Ecosystem</h4>
                        <ul>
                            <li><a href="https://navdiva.com" target="_blank">Navdiva Group</a></li>
                            <li><a href="https://ndmart.store" target="_blank">NDMart</a></li>
                            <li><a href="https://rameshta.online" target="_blank">Rameshta</a></li>
                            <li><a href="https://ndtechhub.com" target="_blank">NDEduHub</a></li>
                            <li><a href="https://ndinsights.navdiva.com" target="_blank">NDInsights</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>Our Services</h4>
                        <ul>
                            <li><a href="services">Web Development</a></li>
                            <li><a href="skills">Skills & Expertise</a></li>
                            <li><a href="products">Products & Apps</a></li>
                        </ul>
                        <div style="margin-top: 1.5rem;">
                            <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">NDTechHub Connect:</h4>
                            <ul style="font-size: 0.85rem; color: var(--text-secondary);">
                                <li>📧 support@navdiva.com</li>
                                <li>📞 +91 8979640795</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="admin">Console Gateway</a></li>
                            <li><a href="team">Our Team</a></li>
                            <li>
                                <a href="https://navdiva.com/careers.html" class="hiring-link" target="_blank" rel="noopener noreferrer">
                                    Careers <span class="hiring-badge">We're Hiring</span>
                                </a>
                            </li>
                            <li><a href="press-release">Press Releases</a></li>
                            <li><a href="about">About Us</a></li>
                            <li><a href="contact">Contact Us</a></li>
                            <li><a href="contact?type=feedback">Leave Feedback</a></li>
                            <li><a href="privacy-policy">Privacy Policy</a></li>
                            <li><a href="terms-of-service">Terms of Service</a></li>
                        </ul>
                    </div>
                  </div>
                </div>

                <!-- Bottom Footer -->
                <div class="bottom-footer">
                    <div class="brand-logo">
                        <span style="color: var(--text-main);">ND</span><span style="color: var(--cyan-electric);">TechHub</span>
                    </div>
                    <div class="bottom-links">
                        <a href="privacy-policy">Privacy Policy</a>
                        <a href="cookie-policy">Cookie Policy</a>
                        <a href="contact">Contact Us</a>
                        <a href="terms-of-service">Terms of Service</a>
                    </div>
                    <div style="margin-bottom: 10px;">© 2019-${currentYear}, NDTechHub. All rights reserved.</div>
                    <div style="color: var(--text-secondary); margin-bottom: 5px; line-height: 1.5;">Reg: UDYAM-DL-05-0079535</div>
                    <div style="color: var(--text-secondary); margin-bottom: 5px; line-height: 1.5;">📍 Headquarters: 105-B, Gali No. 5, Mahalaxmi Vihar, Phase 7, Block A, Shiv Vihar, Karawal Nagar, Delhi, 110094</div>
                    <div style="color: var(--text-secondary); margin-bottom: 15px; line-height: 1.5;">📍 Aligarh Branch: NAVDIVA Aligarh, 5/27 M-15 Mangal Vihar, Banna Devi Thana, Aligarh 202002</div>
                    <div style="font-size: 11px; color: var(--cyan-electric); margin-top: 20px; letter-spacing: 0.5px;">A unit of <strong style="color: #fff;">NAVDIVA GROUP</strong></div>
                </div>
            </footer>
        `;

        // Dynamically load NDTechHub Groq Neural AI Assistant module (bot.js) if not loaded
        if (!window.NDGChat && !document.querySelector('script[src*="bot.js"]')) {
            const botScript = document.createElement('script');
            botScript.src = window.location.pathname.includes('/templates/') ? '../js/bot.js' : 'js/bot.js';
            botScript.defer = true;
            document.body.appendChild(botScript);
        }
    }
}

customElements.define('navdiva-footer', NavdivaFooter);