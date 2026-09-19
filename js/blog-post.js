// js/blog-post.js — NDTechHub Individual Article Reader
import { database } from "./firebase-init.js";
import { auth, isAdmin } from "./firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref as dbRef, get, child } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Comprehensive Initial Seed Posts (Ensures zero broken links for default articles)
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
        content: `
            <p>Modern frontend engineering has succumbed to framework obesity. The average enterprise webpage now bundles between 2.5MB and 5MB of minified JavaScript, resulting in high Time to Interactive (TTI), battery drain on mobile devices, and poor SEO indexing.</p>
            
            <h2>The Cost of JavaScript Hydration</h2>
            <p>Hydration is the silent killer of mobile performance. When a browser downloads server-rendered HTML alongside large JSON payloads and vendor bundles, it must parse, compile, and execute scripts before single buttons respond to user clicks.</p>
            
            <blockquote>"The fastest code is the code that is never sent over the wire. Clean, semantically structured HTML and vanilla CSS will consistently outperform multi-layer virtual DOM reconciliations."</blockquote>
            
            <h2>Our Architectural Principles</h2>
            <ul>
                <li><strong>Zero Unused Assets:</strong> CSS is modularized and purged of unused classes.</li>
                <li><strong>Native Browser APIs:</strong> Utilize modern Web Components, IntersectionObserver, and CSS backdrop-filters instead of heavy polyfills.</li>
                <li><strong>Static Edge Delivery:</strong> Cache immutable assets across multi-region edge caches for sub-30ms TTFB across Delhi NCR and global nodes.</li>
            </ul>

            <h2>Benchmarking the Difference</h2>
            <p>By shifting to an HTML-first runtime with lightweight modular micro-scripts, NDTechHub client platforms consistently achieve perfect 100/100 Lighthouse audits across Performance, Accessibility, Best Practices, and SEO.</p>
        `
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
        content: `
            <p>As enterprises adopt Large Language Models, data sovereignty and latency have emerged as non-negotiable bottlenecks. Relying entirely on remote cloud APIs introduces unpredictable outages, vendor lock-in, and compliance risks under modern privacy statutes.</p>
            
            <h2>Introducing NIA 1.0</h2>
            <p>NIA 1.0 is NDTechHub's sovereign neural agent architecture. Built with dual-runtime capability, NIA can execute on dedicated on-premise hardware using Ollama-accelerated quantizations, or burst to Groq LPU clusters for ultra-low latency sub-second inference.</p>
            
            <h2>Key Capabilities</h2>
            <ul>
                <li><strong>Deterministic Function Calling:</strong> Strict JSON-schema enforcement eliminates hallucinations during database operations.</li>
                <li><strong>Context Vector Isolation:</strong> Client knowledge graphs reside in encrypted local memory, guaranteeing zero external model training on proprietary documents.</li>
                <li><strong>Self-Healing Execution Loops:</strong> If a tool invocation encounters an API change, NIA analyzes the stack trace and adapts parameters autonomously.</li>
            </ul>

            <p>Learn more about implementing NIA within your operational stack by consulting our engineering team directly.</p>
        `
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
        content: `
            <p>For over a decade, engineering organizations followed the cloud migration gold rush—often moving sprawling monolithic architectures directly into expensive container clusters without re-architecting for efficiency.</p>
            
            <h2>The Hidden Costs of Always-On Virtual Machines</h2>
            <p>Traditional compute instances incur round-the-clock expenses regardless of actual request traffic. Edge micro-runtimes flip this model: compute executes only when invoked, directly inside the edge node closest to the client.</p>
            
            <h2>Concrete Migration Steps</h2>
            <ol>
                <li><strong>Decouple Static Assets:</strong> Offload all static media to persistent storage buckets fronted by global edge CDNs.</li>
                <li><strong>Adopt Serverless Database Queries:</strong> Shift read-heavy endpoints to distributed key-value stores and edge-replicated databases.</li>
                <li><strong>Micro-Frontends:</strong> Separate administrative portals from public-facing landing zones.</li>
            </ol>
            
            <p>Our migration audits have demonstrated an average 68% reduction in monthly cloud invoices within 60 days of rollout.</p>
        `
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    const postContainer = document.getElementById('post-container');
    const readProgressBar = document.getElementById('read-progress');

    // 1. Reading Progress Bar
    window.addEventListener('scroll', () => {
        if (!readProgressBar) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            readProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    });

    // 2. Parse Query Parameter (?slug=... or ?id=...)
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');

    if (!slug && !id) {
        renderNotFound(postContainer);
        return;
    }

    let post = null;

    // 3. Fetch from Firebase Realtime Database
    try {
        const snapshot = await get(child(dbRef(database), 'posts'));
        if (snapshot.exists()) {
            const postsObj = snapshot.val();
            const postsList = Object.values(postsObj);
            post = postsList.find(p => (slug && p.slug === slug) || (id && p.id === id) || p.slug === id || p.id === slug);
        }
    } catch (err) {
        console.warn("Could not query Firebase Realtime Database:", err);
    }

    // 4. Fallback to Seed Posts
    if (!post) {
        post = SEED_POSTS.find(p => (slug && p.slug === slug) || (id && p.id === id) || p.slug === id || p.id === slug);
    }

    if (!post) {
        renderNotFound(postContainer);
        return;
    }

    // 5. Check if current user is admin to show Edit button
    let isAdminUser = false;
    onAuthStateChanged(auth, (user) => {
        if (user && isAdmin(user)) {
            isAdminUser = true;
            const editBtn = document.getElementById('admin-edit-post-btn');
            if (editBtn) editBtn.style.display = 'inline-flex';
        }
    });

    // 6. Render Post
    renderPost(postContainer, post);
});

function renderPost(container, post) {
    if (!container) return;

    // Update document metadata
    document.title = `${post.title} — NDTechHub Blog`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && post.snippet) {
        metaDesc.setAttribute('content', post.snippet);
    }

    const dateStr = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Recently Published';

    const authorName = (post.author && post.author.name) ? post.author.name : 'NDTechHub Editorial';
    const authorAvatar = (post.author && post.author.photoURL) ? post.author.photoURL : 'assets/logos/ndtechhub.webp';

    const tagsHtml = (Array.isArray(post.tags) ? post.tags : ['engineering'])
        .map(t => `<a href="blog.html" class="blog-tag" style="text-decoration:none;">#${t}</a>`)
        .join(' ');

    const currentUrl = encodeURIComponent(window.location.href);
    const postTitleEncoded = encodeURIComponent(post.title);

    container.innerHTML = `
        <!-- Breadcrumbs -->
        <nav style="margin-bottom: 24px; font-size: 13px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <a href="index.html" style="color: inherit; text-decoration: none;" onmouseover="this.style.color='#00f2fe'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Home</a>
            <span>/</span>
            <a href="blog.html" style="color: inherit; text-decoration: none;" onmouseover="this.style.color='#00f2fe'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Blog</a>
            <span>/</span>
            <span style="color: rgba(0,242,254,0.8);">${post.title.length > 35 ? post.title.slice(0, 35) + '...' : post.title}</span>
        </nav>

        <!-- Header -->
        <header style="margin-bottom: 32px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${tagsHtml}
                </div>
                <a href="blog-editor.html?id=${post.id || post.slug}" id="admin-edit-post-btn" style="display: none; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; background: rgba(0,242,254,0.12); border: 1px solid rgba(0,242,254,0.3); color: #00f2fe; font-size: 12px; font-weight: 700; text-decoration: none;">
                    <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Edit Article
                </a>
            </div>

            <h1 style="font-size: clamp(2rem, 4.5vw, 3.2rem); font-weight: 900; color: #fff; line-height: 1.2; letter-spacing: -0.03em; margin-bottom: 20px;">
                ${post.title}
            </h1>

            <div style="display: flex; align-items: center; gap: 14px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap;">
                <img src="${authorAvatar}" alt="${authorName}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,242,254,0.4);" onerror="this.src='assets/logos/ndtechhub.webp';" />
                <div>
                    <div style="font-size: 14px; font-weight: 700; color: #fff;">${authorName}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.4); display: flex; gap: 10px;">
                        <span>${dateStr}</span>
                        <span>•</span>
                        <span>${post.readTime || '5 min read'}</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Cover Image -->
        ${post.coverImage ? `
            <div style="margin-bottom: 40px; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <img src="${post.coverImage}" alt="${post.title}" style="width: 100%; max-height: 480px; object-fit: cover; display: block;" onerror="this.style.display='none';" />
            </div>
        ` : ''}

        <!-- Article Body -->
        <div class="blog-post-content" style="margin-bottom: 48px;">
            ${post.content || `<p>${post.snippet}</p>`}
        </div>

        <!-- Share & Return Footer -->
        <footer style="padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase;">Share:</span>
                <a href="https://twitter.com/intent/tweet?url=${currentUrl}&text=${postTitleEncoded}" target="_blank" rel="noopener noreferrer" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); display: inline-flex; align-items: center; justify-content: center; color: #fff; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    <i data-lucide="twitter" style="width: 16px; height: 16px;"></i>
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}" target="_blank" rel="noopener noreferrer" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); display: inline-flex; align-items: center; justify-content: center; color: #fff; text-decoration: none; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    <i data-lucide="linkedin" style="width: 16px; height: 16px;"></i>
                </a>
                <button onclick="navigator.clipboard.writeText(window.location.href); alert('Article link copied to clipboard!');" style="height: 36px; padding: 0 14px; border-radius: 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                    <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy Link
                </button>
            </div>

            <a href="blog.html" style="display: inline-flex; align-items: center; gap: 8px; color: #00f2fe; text-decoration: none; font-size: 14px; font-weight: 700;">
                <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to All Articles
            </a>
        </footer>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNotFound(container) {
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
            <div style="font-size: 56px; margin-bottom: 12px;">📰</div>
            <h1 style="font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 12px;">Article Not Found</h1>
            <p style="color: rgba(255,255,255,0.5); font-size: 15px; max-width: 440px; margin: 0 auto 28px; line-height: 1.6;">
                The requested technical post may have moved or been updated. Please explore our article directory below.
            </p>
            <a href="blog.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 12px; background: linear-gradient(135deg, #00f2fe, #4facfe); color: #080c14; font-weight: 800; font-size: 14px; text-decoration: none;">
                Browse All Articles
            </a>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
