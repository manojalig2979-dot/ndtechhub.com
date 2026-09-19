// js/blog.js — NDTechHub Blog Index & Discovery Module
import { database } from "./firebase-init.js";
import { auth, isAdmin } from "./firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref as dbRef, get, child } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Comprehensive Initial Seed Posts (Ensures zero empty states)
const SEED_POSTS = [
    {
        id: "seed-zero-bloat-architecture",
        slug: "zero-bloat-web-architecture-100-lighthouse",
        title: "Zero-Bloat Web Architecture: How NDTechHub Achieves 100/100 Lighthouse Performance",
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        tags: ["architecture", "performance", "web"],
        snippet: "Modern web development is drowned in megabytes of JavaScript frameworks. Here is our architectural blueprint for sub-30ms first contentful paint and pure HTML-first efficiency.",
        readTime: "5 min read",
        author: {
            name: "Manoj Singh",
            email: "manoj.alig2979@gmail.com",
            photoURL: "assets/team/manoj.webp"
        },
        createdAt: 1726700000000,
        published: true
    },
    {
        id: "seed-nia-autonomous-ai-agents",
        slug: "nia-autonomous-ai-agent-stateful-local-reasoning",
        title: "NIA 1.0 Autonomous Agent: Designing Stateful Local AI Reasoning Nodes for Enterprise",
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        tags: ["ai", "agents", "automation"],
        snippet: "How we engineered our sovereign autonomous agent platform using Ollama and Groq LPUs, enabling deterministic enterprise task execution without data telemetry leaks.",
        readTime: "7 min read",
        author: {
            name: "NDTechHub AI Labs",
            email: "connect@ndtechhub.com",
            photoURL: "assets/logos/ndtechhub.webp"
        },
        createdAt: 1726786400000,
        published: true
    },
    {
        id: "seed-cloud-edge-migration",
        slug: "edge-compute-migration-decoupling-monoliths",
        title: "Cloud Economics 2026: Migrating From Costly Monoliths to Modular Edge Micro-Runtimes",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        tags: ["cloud", "devops", "infrastructure"],
        snippet: "A breakdown of serverless latency, real cloud bill optimizations, and how edge caching reduces server compute spend by up to 74% across production workloads.",
        readTime: "6 min read",
        author: {
            name: "DevOps Engineering",
            email: "support@navdiva.com",
            photoURL: "assets/logos/navdiva.webp"
        },
        createdAt: 1726872800000,
        published: true
    }
];

let allPosts = [];
let activeTag = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('blog-grid');
    const searchInput = document.getElementById('blog-search');
    const tagFilterBar = document.getElementById('tag-filter-bar');
    const writePostBtn = document.getElementById('write-post-btn');

    // 1. Check Admin Auth state for "+ Write New Article" button
    onAuthStateChanged(auth, (user) => {
        if (user && isAdmin(user)) {
            if (writePostBtn) writePostBtn.style.display = 'inline-flex';
        } else {
            if (writePostBtn) writePostBtn.style.display = 'none';
        }
    });

    // 2. Load Posts from Firebase Realtime Database
    try {
        const snapshot = await get(child(dbRef(database), 'posts'));
        let dbPosts = [];
        if (snapshot.exists()) {
            const val = snapshot.val();
            dbPosts = Object.values(val).filter(p => p.published !== false);
        }

        // Combine DB posts with seed posts (avoid duplicates by ID or slug)
        const combined = [...dbPosts];
        SEED_POSTS.forEach(seed => {
            if (!combined.some(p => p.slug === seed.slug || p.id === seed.id)) {
                combined.push(seed);
            }
        });

        // Sort descending by date
        combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        allPosts = combined;
    } catch (err) {
        console.warn("Could not reach Firebase Database. Using offline seed posts:", err);
        allPosts = [...SEED_POSTS];
    }

    // 3. Render Tag Filters
    renderTagFilters(tagFilterBar);

    // 4. Render Initial Grid
    renderPosts(grid);

    // 5. Setup Search Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderPosts(grid);
        });
    }
});

function renderTagFilters(container) {
    if (!container) return;
    const tagSet = new Set(['all']);
    allPosts.forEach(post => {
        if (Array.isArray(post.tags)) {
            post.tags.forEach(t => tagSet.add(t.toLowerCase().trim()));
        }
    });

    container.innerHTML = '';
    tagSet.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `tag-chip ${tag === activeTag ? 'active' : ''}`;
        btn.textContent = tag === 'all' ? 'All Articles' : `#${tag}`;
        btn.addEventListener('click', () => {
            activeTag = tag;
            document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            renderPosts(document.getElementById('blog-grid'));
        });
        container.appendChild(btn);
    });
}

function renderPosts(container) {
    if (!container) return;

    const filtered = allPosts.filter(post => {
        const matchesTag = activeTag === 'all' || (Array.isArray(post.tags) && post.tags.map(t => t.toLowerCase()).includes(activeTag));
        const matchesSearch = !searchQuery ||
            (post.title && post.title.toLowerCase().includes(searchQuery)) ||
            (post.snippet && post.snippet.toLowerCase().includes(searchQuery)) ||
            (Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(searchQuery))) ||
            (post.author && post.author.name && post.author.name.toLowerCase().includes(searchQuery));
        return matchesTag && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4);">
                <i data-lucide="file-question" style="width: 48px; height: 48px; margin: 0 auto 16px; color: rgba(0,242,254,0.4);"></i>
                <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px;">No matching articles found</h3>
                <p style="font-size: 14px;">Try searching for different keywords or select "All Articles".</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(post => {
        const dateStr = post.createdAt
            ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent';
        const cover = post.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
        const authorName = (post.author && post.author.name) ? post.author.name : 'NDTechHub';
        const authorAvatar = (post.author && post.author.photoURL) ? post.author.photoURL : 'assets/logos/ndtechhub.webp';

        const tagsHtml = (Array.isArray(post.tags) ? post.tags : ['tech'])
            .slice(0, 3)
            .map(t => `<span class="blog-tag">#${t}</span>`)
            .join(' ');

        return `
            <article class="bento-card col-span-12 md:col-span-6 lg:col-span-4 blog-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <a href="blog-post.html?slug=${post.slug || post.id}" class="blog-card-cover">
                        <img src="${cover}" alt="${post.title}" class="blog-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';" />
                    </a>
                    <div style="padding: 24px 24px 16px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px;">
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                ${tagsHtml}
                            </div>
                            <span style="font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.4);">${post.readTime || '5 min read'}</span>
                        </div>
                        <h2 style="font-size: 18px; font-weight: 800; color: #fff; line-height: 1.4; margin-bottom: 10px;">
                            <a href="blog-post.html?slug=${post.slug || post.id}" style="color: inherit; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#00f2fe'" onmouseout="this.style.color='#fff'">
                                ${post.title}
                            </a>
                        </h2>
                        <p style="font-size: 13.5px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 16px;">
                            ${post.snippet || ''}
                        </p>
                    </div>
                </div>
                <div style="padding: 16px 24px 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${authorAvatar}" alt="${authorName}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(0,242,254,0.3);" onerror="this.src='assets/logos/ndtechhub.webp';" />
                        <span style="font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500;">${authorName}</span>
                    </div>
                    <span style="font-size: 11px; color: rgba(255,255,255,0.4);">${dateStr}</span>
                </div>
            </article>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}
