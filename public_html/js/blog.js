// js/blog.js — Blog Listing Page Logic (2026 Resilient Image & Bento Layout)
import { db, auth, isAdmin, watchAuthState, openAuthModal, signOutUser }
  from "./firebase-auth.js";
import {
  collection, query, orderBy, onSnapshot, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;
let allPosts    = [];
let activeTag   = null;

const DEFAULT_COVERS = [
  'assets/blog/bento-arch.webp',
  'assets/blog/neural-ai.webp',
  'assets/blog/ghar-structural.webp'
];

function getPostCover(post, index = 0) {
  if (!post) return DEFAULT_COVERS[index % DEFAULT_COVERS.length];

  const id = (post.id || '').toLowerCase();
  const title = (post.title || '').toLowerCase();
  const tagsStr = (post.tags || []).join(' ').toLowerCase();

  // 1. GHAR / Civil Engineering / Structural Logic
  if (
    id.includes('ghar') ||
    id.includes('civil') ||
    id.includes('structural') ||
    title.includes('ghar') ||
    title.includes('civil') ||
    title.includes('structural') ||
    title.includes('boq') ||
    title.includes('estimation') ||
    tagsStr.includes('civil')
  ) {
    return 'assets/blog/ghar-structural.webp';
  }

  // 2. Neural AI / Groq Cloud / LLM
  if (
    id.includes('groq') ||
    id.includes('neural') ||
    id.includes('chatbot') ||
    title.includes('groq') ||
    title.includes('neural') ||
    title.includes('chatbot') ||
    title.includes('llama') ||
    /\bai\b/i.test(title) ||
    tagsStr.includes('ai')
  ) {
    return 'assets/blog/neural-ai.webp';
  }

  // 3. Bento / Web Architecture / Performance
  if (
    id.includes('bento') ||
    id.includes('zero-bloat') ||
    title.includes('bento') ||
    title.includes('zero-bloat') ||
    title.includes('lighthouse') ||
    title.includes('performance') ||
    title.includes('web') ||
    tagsStr.includes('performance')
  ) {
    return 'assets/blog/bento-arch.webp';
  }

  // Custom valid cover image if provided
  if (post.coverImage && typeof post.coverImage === 'string' && post.coverImage.trim() !== '' && !post.coverImage.includes('ndtechhub.png') && !post.coverImage.includes('.svg')) {
    return post.coverImage.trim();
  }

  // Rotating fallback
  return DEFAULT_COVERS[index % DEFAULT_COVERS.length];
}

// Default Curated Posts
export const DEFAULT_POSTS = [
  {
    id: "zero-bloat-bento-2026",
    title: "Engineering Zero-Bloat Bento Web Applications in 2026",
    excerpt: "Why modern web engineering is shifting from heavy component frameworks to ultra-fast vanilla HTML/CSS/JS, Bento modularity, and sub-second cold starts.",
    coverImage: "assets/blog/bento-arch.webp",
    tags: ["Engineering", "Web Dev", "Performance"],
    authorName: "Manoj Singh",
    authorEmail: "manoj.alig2979@gmail.com",
    readTime: 4,
    createdAt: { toDate: () => new Date("2026-08-25") }
  },
  {
    id: "neural-ai-groq-cloud",
    title: "Deploying Sub-50ms Neural AI Chatbots with Groq Cloud & Llama 3",
    excerpt: "A deep dive into ultra-low latency inference using Groq LPUs, liquid glass floating UI design, and context-aware system prompting.",
    coverImage: "assets/blog/neural-ai.webp",
    tags: ["AI & ML", "Groq", "Automation"],
    authorName: "Manoj Singh",
    authorEmail: "manoj.alig2979@gmail.com",
    readTime: 5,
    createdAt: { toDate: () => new Date("2026-08-22") }
  },
  {
    id: "building-ghar-civil-logic",
    title: "Architecting GHAR: Algorithmic Civil Estimation & BOQ Generation",
    excerpt: "How we codified Indian standard civil structural rules into an automated, instant rate analysis and architectural planning suite.",
    coverImage: "assets/blog/ghar-structural.webp",
    tags: ["Civil Logic", "SaaS", "Engineering"],
    authorName: "NDTechHub Lead",
    authorEmail: "connect@ndtechhub.com",
    readTime: 6,
    createdAt: { toDate: () => new Date("2026-08-18") }
  },
  {
    id: "react-vs-angular-vs-vue",
    title: "React vs. Angular vs. Vue",
    excerpt: "A comprehensive comparison of the top three JavaScript frameworks for modern web development.",
    coverImage: "assets/blog/React vs. Angular vs. Vue.webp",
    tags: ["Engineering", "Web Dev", "Frameworks"],
    authorName: "Manoj Singh",
    authorEmail: "manoj.alig2979@gmail.com",
    readTime: 5,
    createdAt: { toDate: () => new Date() }
  },
  {
    id: "zero-trust-network",
    title: "The Zero-Trust Network",
    excerpt: "Exploring the fundamentals and implementation strategies of Zero-Trust Architecture for robust enterprise security.",
    coverImage: "assets/blog/The Zero-Trust Network.webp",
    tags: ["Security", "Architecture", "Engineering"],
    authorName: "Manoj Singh",
    authorEmail: "manoj.alig2979@gmail.com",
    readTime: 6,
    createdAt: { toDate: () => new Date() }
  }
];

// ── Auth Header ──────────────────────────────────────────────────────────────
function renderAuthHeader(user) {
  const area = document.getElementById('auth-header-area');
  if (!area) return;
  if (user) {
    const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
    const name    = user.displayName || user.email;
    const avatar  = user.photoURL
      ? `<img src="${user.photoURL}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,242,254,.4);">`
      : `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00f2fe,#4facfe);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#080c14;">${initial}</div>`;
    area.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        ${avatar}
        <span style="font-size:13px;color:rgba(255,255,255,.7);font-weight:600;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
        ${isAdmin(user) ? '<span style="font-size:10px;font-weight:800;background:linear-gradient(135deg,#8b5cf6,#a78bfa);color:#fff;padding:2px 8px;border-radius:20px;letter-spacing:.04em;">ADMIN</span>' : ''}
        <button id="blog-signout-btn" style="padding:7px 14px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);font-size:12px;cursor:pointer;font-weight:600;">Sign Out</button>
      </div>`;
    document.getElementById('blog-signout-btn')?.addEventListener('click', () => signOutUser());
  } else {
    area.innerHTML = `<button id="blog-signin-btn" style="padding:9px 20px;border-radius:10px;background:linear-gradient(135deg,#00f2fe,#4facfe);border:none;color:#080c14;font-weight:800;font-size:13px;cursor:pointer;">Sign In</button>`;
    document.getElementById('blog-signin-btn')?.addEventListener('click', () => openAuthModal());
  }

  // Write button visibility
  const writeBtn = document.getElementById('write-post-btn');
  if (writeBtn) writeBtn.style.display = user ? 'inline-flex' : 'none';
}

// ── Build Tag Filters ────────────────────────────────────────────────────────
function buildTagFilters(posts) {
  const tagSet = new Set();
  posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
  const bar = document.getElementById('tag-filter-bar');
  if (!bar) return;
  bar.innerHTML = `<button class="tag-chip ${!activeTag ? 'active' : ''}" data-tag="">All Posts</button>`
    + [...tagSet].map(t => `<button class="tag-chip ${activeTag===t?'active':''}" data-tag="${t}">${t}</button>`).join('');
  bar.querySelectorAll('.tag-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTag = btn.dataset.tag || null;
      bar.querySelectorAll('.tag-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPosts();
    });
  });
}

// ── Render Post Cards ────────────────────────────────────────────────────────
function renderPosts() {
  const grid    = document.getElementById('blog-grid');
  const search  = (document.getElementById('blog-search')?.value || '').toLowerCase();
  if (!grid) return;

  const displayList = allPosts.length > 0 ? allPosts : DEFAULT_POSTS;
  let posts = displayList;

  if (activeTag) posts = posts.filter(p => (p.tags||[]).includes(activeTag));
  if (search)    posts = posts.filter(p =>
    p.title.toLowerCase().includes(search) ||
    (p.excerpt||'').toLowerCase().includes(search) ||
    (p.authorName||'').toLowerCase().includes(search));

  if (!posts.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:rgba(255,255,255,.4);">
      <div style="font-size:48px;margin-bottom:16px;">📭</div>
      <p style="font-size:16px;font-weight:600;">No matching posts found.</p>
      ${currentUser ? `<a href="blog-editor" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#00f2fe,#4facfe);color:#080c14;font-weight:800;border-radius:10px;text-decoration:none;">Write a New Post</a>` : ''}
    </div>`;
    return;
  }

  grid.innerHTML = posts.map((post, idx) => {
    const date = post.createdAt?.toDate
      ? post.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
      : 'Recently';
    const tags = (post.tags||[]).map(t => `<span class="blog-tag">${t}</span>`).join('');
    
    // Always resolve to a high-quality SVG graphic if missing or failed
    const imageSrc = getPostCover(post, idx);
    const coverHtml = `
      <div class="blog-card-cover">
        <img 
          src="${imageSrc}" 
          alt="${post.title || 'Blog Post'}" 
          class="blog-card-img"
          loading="lazy"
          onerror="this.onerror=null; this.src='${imageSrc}';"
        />
        <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(8,12,20,0.6) 0%, rgba(8,12,20,0.02) 60%, transparent 100%);pointer-events:none;"></div>
      </div>
    `;

    const adminBadge = isAdmin({ email: post.authorEmail })
      ? `<span style="font-size:9px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);color:#fff;padding:1px 6px;border-radius:10px;font-weight:800;margin-left:4px;">NDTechHub</span>` : '';
    const canEdit = currentUser && (currentUser.uid === post.authorId || isAdmin(currentUser));

    return `
    <div class="glass-panel bento-col-4 blog-card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;">
      <a href="blog-post?id=${post.id}" style="text-decoration:none;display:flex;flex-direction:column;flex:1;">
        ${coverHtml}
        <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">${tags}</div>
          <h3 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 10px;line-height:1.35;letter-spacing:-.01em;">${post.title}</h3>
          <p style="font-size:13px;color:rgba(255,255,255,.55);line-height:1.6;margin:0 0 auto;">${post.excerpt||''}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#00f2fe,#4facfe);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#080c14;flex-shrink:0;">${(post.authorName||'?')[0].toUpperCase()}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${post.authorName||'Anonymous'}${adminBadge}</div>
              <div style="font-size:11px;color:rgba(255,255,255,.35);">${date} · ${post.readTime||1} min read</div>
            </div>
          </div>
        </div>
      </a>
      ${canEdit ? `<div style="padding:0 24px 16px;display:flex;gap:8px;">
        <a href="blog-editor?edit=${post.id}" style="flex:1;text-align:center;padding:7px;border-radius:8px;background:rgba(0,242,254,.08);border:1px solid rgba(0,242,254,.15);color:#00f2fe;font-size:12px;font-weight:700;text-decoration:none;">✏️ Edit</a>
        <button onclick="window.__deleteBlogPost('${post.id}','${(post.title||'').replace(/'/g,"\\'")}',this)" style="flex:1;padding:7px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#ef4444;font-size:12px;font-weight:700;cursor:pointer;">🗑 Delete</button>
      </div>` : ''}
    </div>`;
  }).join('');
}

// ── Delete Handler ───────────────────────────────────────────────────────────
window.__deleteBlogPost = async (id, title, btn) => {
  if (!confirm(`Delete post "${title}"? This cannot be undone.`)) return;
  btn.disabled = true; btn.textContent = 'Deleting...';
  try {
    await deleteDoc(doc(db, 'blog_posts', id));
  } catch (err) {
    alert('Delete failed: ' + err.message);
    btn.disabled = false; btn.textContent = '🗑 Delete';
  }
};

window.__blogSignOut = async () => {
  await signOutUser();
};

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Auth watcher
  watchAuthState(user => {
    currentUser = user;
    renderAuthHeader(user);
    renderPosts();
  });

  // Search input handler
  document.getElementById('blog-search')?.addEventListener('input', renderPosts);

  // Initial render with default posts immediately
  buildTagFilters(DEFAULT_POSTS);
  renderPosts();

  // Load real-time posts from Firestore
  try {
    const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
    onSnapshot(q, snap => {
      if (snap && !snap.empty) {
        allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        allPosts = [];
      }
      buildTagFilters(allPosts.length > 0 ? allPosts : DEFAULT_POSTS);
      renderPosts();
    }, err => {
      console.warn('Firestore blog listener notice:', err);
      buildTagFilters(DEFAULT_POSTS);
      renderPosts();
    });
  } catch (err) {
    console.warn('Firestore init notice:', err);
  }
});
