// js/blog-post.js — Single Post Reader (2026 Resilient Image & Bento Layout)
import { db, auth, isAdmin, watchAuthState, openAuthModal, signOutUser }
  from "./firebase-auth.js";
import {
  doc, getDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;
const postId = new URLSearchParams(location.search).get('id');

// Default Curated Posts Content Fallback
const DEFAULT_POSTS_CONTENT = {
  "zero-bloat-bento-2026": {
    id: "zero-bloat-bento-2026",
    title: "Engineering Zero-Bloat Bento Web Applications in 2026",
    coverImage: "assets/blog/bento-arch.webp",
    tags: ["Engineering", "Web Dev", "Performance"],
    authorName: "Manoj Singh",
    authorEmail: "manoj.alig2979@gmail.com",
    readTime: 4,
    createdAt: { toDate: () => new Date("2026-08-25") },
    content: `
      <h2>The Shift to Lean, High-Performance Web Architectures</h2>
      <p>Over the last decade, web development became weighed down by hundreds of megabytes of nested JavaScript dependencies and sluggish single-page frameworks. In 2026, NDTechHub has pioneered the <strong>Zero-Bloat Bento Standard</strong>: high-speed, modular architectures engineered with vanilla HTML5, semantic CSS variables, and modern web components.</p>
      
      <h3>Why Bento Grid UI Wins</h3>
      <p>Bento grids organize complex technical information into modular, digestable glassmorphic cells. Instead of infinite generic scrolling, visitors receive dense, structured interactive cards with sub-second cold starts.</p>

      <blockquote>"Speed is the ultimate luxury in web engineering. A website that loads in 200ms converts 300% better than one loading in 3 seconds." — Manoj Singh</blockquote>

      <h3>Key Principles We Enforce at NDTechHub</h3>
      <ul>
        <li><strong>Sub-50ms Cold Starts:</strong> Clean HTML/CSS with zero runtime compile penalties.</li>
        <li><strong>Liquid Glassmorphism:</strong> Specular reflections, inset bevel highlights, and hardware-accelerated blur.</li>
        <li><strong>100/100 Lighthouse Standard:</strong> Zero unused CSS or blocking scripts.</li>
      </ul>
    `
  },
  "neural-ai-groq-cloud": {
    id: "neural-ai-groq-cloud",
    title: "Deploying Sub-50ms Neural AI Chatbots with Groq Cloud & Llama 3",
    coverImage: "assets/blog/neural-ai.webp",
    tags: ["AI & ML", "Groq", "Automation"],
    authorName: "Manoj Singh",
    authorEmail: "manoj.alig2979@gmail.com",
    readTime: 5,
    createdAt: { toDate: () => new Date("2026-08-22") },
    content: `
      <h2>Inference Speed as a Competitive Advantage</h2>
      <p>Traditional cloud LLMs often have 2 to 4 second time-to-first-token latencies. By integrating <strong>Groq Cloud's LPU (Language Processing Unit) architecture</strong> directly into NDTechHub's 2026 floating assistant, we achieved responses streaming in under 50 milliseconds.</p>

      <h3>Real-Time Streaming Physics</h3>
      <p>Combining Groq with a liquid glass floating UI transforms chatbot interaction from a waiting game into an instantaneous conversational experience.</p>
    `
  },
  "building-ghar-civil-logic": {
    id: "building-ghar-civil-logic",
    title: "Architecting GHAR: Algorithmic Civil Estimation & BOQ Generation",
    coverImage: "assets/blog/ghar-structural.webp",
    tags: ["Civil Logic", "SaaS", "Engineering"],
    authorName: "NDTechHub Lead",
    authorEmail: "connect@ndtechhub.com",
    readTime: 6,
    createdAt: { toDate: () => new Date("2026-08-18") },
    content: `
      <h2>Automating Civil Estimation Logic</h2>
      <p>Calculating Bill of Quantities (BOQ), concrete grade mixes, and steel reinforcement schedules is traditionally manual and error-prone. <strong>GHAR</strong> codifies IS 456 standards and CPWD schedules of rates into automated instant calculation matrices.</p>
    `
  }
};

// ── Reading Progress Bar ─────────────────────────────────────────────────────
function initProgressBar() {
  const bar = document.getElementById('read-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = Math.min(100, (scrollTop / docHeight) * 100) + '%';
  });
}

// ── Render Post ──────────────────────────────────────────────────────────────
async function loadPost() {
  const container = document.getElementById('post-container');
  if (!postId || !container) {
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,.6);">
          <h2 style="font-size:24px;color:#fff;margin-bottom:12px;">Article Not Specified</h2>
          <p style="margin-bottom:24px;font-size:14px;color:rgba(255,255,255,0.7);">Please select an article from our main blog directory.</p>
          <a href="blog" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#00f2fe,#4facfe);color:#080c14;font-weight:800;border-radius:10px;text-decoration:none;">View All Articles</a>
        </div>
      `;
    }
    return;
  }

  try {
    let post = null;

    // Check Firestore first if available
    try {
      const snap = await getDoc(doc(db, 'blog_posts', postId));
      if (snap && snap.exists()) {
        post = { id: snap.id, ...snap.data() };
      }
    } catch (fsErr) {
      console.warn('Firestore fetch notice:', fsErr);
    }

    // Fallback to default curated post if not in Firestore
    if (!post && DEFAULT_POSTS_CONTENT[postId]) {
      post = DEFAULT_POSTS_CONTENT[postId];
    }

    if (!post) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,.6);">
          <h2 style="font-size:24px;color:#fff;margin-bottom:12px;">Article Not Found</h2>
          <p style="margin-bottom:24px;font-size:14px;color:rgba(255,255,255,0.7);">The requested article could not be located.</p>
          <a href="blog" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#00f2fe,#4facfe);color:#080c14;font-weight:800;border-radius:10px;text-decoration:none;">Return to Blog</a>
        </div>
      `;
      return;
    }

    const date = post.createdAt?.toDate
      ? post.createdAt.toDate().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : 'Recently';
    const tags = (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('');
    const authorIsAdmin = isAdmin({ email: post.authorEmail });
    const canEdit = currentUser && (currentUser.uid === post.authorId || isAdmin(currentUser));

    // Update SEO page title, description, canonical link & JSON-LD
    document.title = `${post.title} — NDTechHub Blog`;

    const plainTextSummary = (post.summary || post.content || '').replace(/<[^>]+>/g, '').substring(0, 160);

    let descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', plainTextSummary);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute('href', `https://ndtechhub.com/blog-post?id=${post.id}`);

    // Cover image with robust fallback
    function resolvePostCover(p) {
      if (!p) return 'assets/blog/bento-arch.webp';

      const pid = (p.id || '').toLowerCase();
      const pt = (p.title || '').toLowerCase();
      const ptags = (p.tags || []).join(' ').toLowerCase();

      // 1. GHAR / Civil Engineering / Structural Logic
      if (
        pid.includes('ghar') ||
        pid.includes('civil') ||
        pid.includes('structural') ||
        pt.includes('ghar') ||
        pt.includes('civil') ||
        pt.includes('structural') ||
        pt.includes('boq') ||
        pt.includes('estimation') ||
        ptags.includes('civil')
      ) {
        return 'assets/blog/ghar-structural.webp';
      }

      // 2. Neural AI / Groq Cloud / LLM
      if (
        pid.includes('groq') ||
        pid.includes('neural') ||
        pid.includes('chatbot') ||
        pt.includes('groq') ||
        pt.includes('neural') ||
        pt.includes('chatbot') ||
        pt.includes('llama') ||
        /\bai\b/i.test(pt) ||
        ptags.includes('ai')
      ) {
        return 'assets/blog/neural-ai.webp';
      }

      // 3. Bento / Web Architecture / Performance
      if (
        pid.includes('bento') ||
        pid.includes('zero-bloat') ||
        pt.includes('bento') ||
        pt.includes('zero-bloat') ||
        pt.includes('lighthouse') ||
        pt.includes('performance') ||
        pt.includes('web') ||
        ptags.includes('performance')
      ) {
        return 'assets/blog/bento-arch.webp';
      }

      if (p.coverImage && typeof p.coverImage === 'string' && p.coverImage.trim() !== '' && !p.coverImage.includes('ndtechhub.png') && !p.coverImage.includes('.svg')) {
        return p.coverImage.trim();
      }
      return 'assets/blog/bento-arch.webp';
    }

    const imageSrc = resolvePostCover(post);
    const coverHtml = `
      <div style="width:100%;height:400px;border-radius:20px;overflow:hidden;margin-bottom:40px;position:relative;background:#0c121e;">
        <img 
          src="${imageSrc}" 
          alt="${post.title}" 
          style="width:100%;height:100%;object-fit:cover;"
          onerror="this.onerror=null; this.src='${imageSrc}';"
        >
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(8,12,20,.95));pointer-events:none;"></div>
      </div>
    `;

    container.innerHTML = `
      ${coverHtml}
      <div class="glass-panel" style="padding:48px;max-width:800px;margin:0 auto;">
        <!-- Tags & meta -->
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">${tags}</div>
        <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;color:#fff;line-height:1.15;letter-spacing:-.03em;margin:0 0 24px;">${post.title}</h1>

        <!-- Author row -->
        <div style="display:flex;align-items:center;gap:14px;padding:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;margin-bottom:36px;">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#00f2fe,#4facfe);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#080c14;flex-shrink:0;">${(post.authorName || '?')[0].toUpperCase()}</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:800;color:#fff;display:flex;align-items:center;gap:6px;">
              ${post.authorName || 'Anonymous'}
              ${authorIsAdmin ? '<span style="font-size:9px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);color:#fff;padding:2px 8px;border-radius:10px;font-weight:800;">NDTechHub</span>' : ''}
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px;">${date} · ${post.readTime || 1} min read</div>
          </div>
          ${canEdit ? `
            <div style="display:flex;gap:8px;">
              <a href="blog-editor?edit=${post.id}" style="padding:8px 16px;border-radius:9px;background:rgba(0,242,254,.1);border:1px solid rgba(0,242,254,.2);color:#00f2fe;font-size:12px;font-weight:700;text-decoration:none;">✏️ Edit</a>
              <button id="del-post-btn" style="padding:8px 16px;border-radius:9px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#ef4444;font-size:12px;font-weight:700;cursor:pointer;">🗑 Delete</button>
            </div>` : ''}
        </div>

        <!-- Content -->
        <div class="blog-post-content" id="post-body">${post.content || ''}</div>

        <!-- Back link -->
        <div style="margin-top:48px;padding-top:32px;border-top:1px solid rgba(255,255,255,.07);">
          <a href="blog" style="display:inline-flex;align-items:center;gap:8px;color:rgba(255,255,255,.5);font-size:13px;font-weight:600;text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#00f2fe'" onmouseout="this.style.color='rgba(255,255,255,.5)'">← Back to Blog</a>
        </div>
      </div>`;

    // Delete handler
    document.getElementById('del-post-btn')?.addEventListener('click', async () => {
      if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
        window.location.href = 'blog';
      } catch (err) { alert('Delete failed: ' + err.message); }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<p style="text-align:center;color:#ef4444;padding:60px;">Error loading post: ${err.message}</p>`;
  }
}

// ── Auth Header ──────────────────────────────────────────────────────────────
function renderAuthHeader(user) {
  const area = document.getElementById('auth-header-area');
  if (!area) return;
  if (user) {
    const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
    const name = user.displayName || user.email;
    area.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00f2fe,#4facfe);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#080c14;">${initial}</div>
      <span style="font-size:13px;color:rgba(255,255,255,.7);font-weight:600;">${name}</span>
      <button id="post-signout-btn" style="padding:7px 14px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);font-size:12px;cursor:pointer;font-weight:600;">Sign Out</button>
    </div>`;
    document.getElementById('post-signout-btn')?.addEventListener('click', () => signOutUser());
  } else {
    area.innerHTML = `<button id="post-signin-btn" style="padding:9px 20px;border-radius:10px;background:linear-gradient(135deg,#00f2fe,#4facfe);border:none;color:#080c14;font-weight:800;font-size:13px;cursor:pointer;">Sign In</button>`;
    document.getElementById('post-signin-btn')?.addEventListener('click', () => openAuthModal());
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  loadPost(); // Immediate render

  watchAuthState(user => {
    currentUser = user;
    renderAuthHeader(user);
    loadPost(); // Re-render with author actions if matching
  });
});
