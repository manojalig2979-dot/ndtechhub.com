import os
import re

FILES_TO_CONVERT = [
    "about.html", "admin.html", "blog-editor.html", "blog-post.html",
    "blog.html", "cookie-policy.html", "press-release.html", "privacy-policy.html",
    "team.html", "terms-of-service.html"
]

NEW_HEAD_INCLUDES = """
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="js/tailwind-config.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="stylesheet" href="css/styles.css" />
  <script type="module" src="js/firebase-init.js"></script>
</head>
<body class="selection:bg-brand-500/30 selection:text-brand-400 font-sans antialiased min-h-screen relative flex flex-col justify-between text-slate-300">
  <div class="ambient-orb w-[600px] h-[600px] bg-sky-600/15 top-[-100px] left-1/2 -translate-x-1/2 animation-float-slow"></div>
  <div class="ambient-orb w-[500px] h-[500px] bg-purple-600/15 top-[600px] -left-40 animation-float-reverse"></div>
  <div class="fixed inset-0 pointer-events-none z-0 opacity-20" style="background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px); background-size: 32px 32px;"></div>
"""

NEW_HEADER = """
  <header class="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
    <nav class="liquid-glass rounded-full px-4 py-2.5 flex items-center justify-between gap-3 md:gap-8 max-w-5xl w-full shadow-2xl transition-all duration-300">
      <a href="index.html" class="flex items-center gap-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-400 to-brand-violet flex items-center justify-center p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
          <div class="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center backdrop-blur-md">
            <span class="font-display font-extrabold text-sm tracking-tighter text-white">ND</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-display font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
            NDTechHub
            <span class="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">LABS</span>
          </span>
          <span class="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">ndtechhub.com</span>
        </div>
      </a>
      <div class="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/10 text-xs font-medium text-slate-300">
        <a href="index.html" class="px-4 py-1.5 rounded-full transition-all hover:text-white nav-link">Home</a>
        <a href="products.html" class="px-4 py-1.5 rounded-full transition-all hover:text-white nav-link">Products & Apps</a>
        <a href="services.html" class="px-4 py-1.5 rounded-full transition-all hover:text-white nav-link">Services</a>
        <a href="about.html" class="px-4 py-1.5 rounded-full transition-all hover:text-white nav-link">About</a>
        <a href="contact.html" class="px-4 py-1.5 rounded-full transition-all hover:text-white nav-link">Contact</a>
      </div>
      <div class="flex items-center gap-2.5">
        <a href="contact.html" class="relative group px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium text-xs shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5">
          <span>Start Build</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
        </a>
      </div>
    </nav>
  </header>
"""

NEW_FOOTER = """
  <navdiva-footer></navdiva-footer>
  <script src="js/main.js"></script>
  <script src="js/components.js"></script>
  <script src="js/chatbot.js"></script>
  <script src="js/ndtechhub-footer.js"></script>
</body>
</html>
"""

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist.")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Strip old styles from head and inject new ones, change body tag
    # Find </head>\s*<body> or <body ...>
    content = re.sub(r'<!-- Stylesheets -->.*?<body[^>]*>', NEW_HEAD_INCLUDES, content, flags=re.DOTALL)
    content = re.sub(r'<!-- Standard Stylesheets -->.*?<body[^>]*>', NEW_HEAD_INCLUDES, content, flags=re.DOTALL)
    
    # In case the head wasn't matched properly:
    if 'class="selection:bg-brand-500/30' not in content:
        content = re.sub(r'</head>\s*<body[^>]*>', NEW_HEAD_INCLUDES, content, flags=re.DOTALL)

    # 2. Replace old Bento header
    content = re.sub(r'<header class="bento-header">.*?</header>', NEW_HEADER, content, flags=re.DOTALL)

    # 3. Replace old Footer and bottom scripts
    content = re.sub(r'<footer class="bento-footer">.*</html>', NEW_FOOTER, content, flags=re.DOTALL)
    if '<navdiva-footer>' not in content:
        content = re.sub(r'</body>\s*</html>', NEW_FOOTER, content, flags=re.DOTALL)

    # 4. Class replacements for Bento -> Tailwind
    replacements = {
        'class="container"': 'class="relative z-10 pt-28 md:pt-36 pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-grow"',
        'class="section-header"': 'class="mb-12"',
        'class="section-title"': 'class="font-display font-extrabold text-3xl sm:text-5xl text-white mb-4"',
        'class="section-subtitle"': 'class="text-slate-400 text-sm max-w-2xl"',
        'class="bento-grid"': 'class="grid grid-cols-1 md:grid-cols-12 gap-6"',
        'class="glass-panel': 'class="liquid-glass border border-white/10 rounded-3xl p-6 hover:border-sky-500/30 transition-colors',
        'bento-col-8"': 'md:col-span-8"',
        'bento-col-4"': 'md:col-span-4"',
        'bento-col-6"': 'md:col-span-6"',
        'bento-col-12"': 'md:col-span-12"',
        'class="card-tag"': 'class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 inline-block mb-3 border border-sky-500/30"',
        'class="card-title"': 'class="font-display font-bold text-xl text-white mb-3"',
        'class="card-desc"': 'class="text-slate-300 text-sm leading-relaxed mb-4"',
        'class="card-icon"': 'class="w-10 h-10 rounded-xl flex items-center justify-center mb-4"',
        'style="color: var(--text-muted);"': 'class="text-slate-400"',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

for file in FILES_TO_CONVERT:
    process_file(file)
