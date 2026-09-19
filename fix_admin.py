import re

filepath = r"e:\NDTechHub\public_html\admin.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS Variables
content = content.replace('var(--cyan-electric)', '#00f2fe')
content = content.replace('var(--text-muted)', '#94a3b8')
content = content.replace('var(--border-glass)', 'rgba(255,255,255,0.1)')
content = content.replace('var(--text-primary)', '#f8fafc')
content = content.replace('var(--accent-tertiary)', '#10b981')

# Fix Forms
content = content.replace('class="form-group"', 'class="flex flex-col gap-1.5"')
content = content.replace('class="form-control"', 'class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors focus:ring-1 focus:ring-sky-500"')

# Fix Labels (only exact `<label>`)
content = content.replace('<label>', '<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">')

# Fix Buttons
btn_tailwind = 'inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all'
content = content.replace('class="admin-gate-btn"', f'class="{btn_tailwind}"')

# There are some buttons with `style="flex: 1; min-width: 150px; justify-content: center; padding: 0.8rem; height: 42px;"` 
# I will strip padding and height from inline styles so Tailwind takes over
content = re.sub(r'height:\s*42px;?', '', content)
content = re.sub(r'padding:\s*0\.8rem;?', '', content)
content = re.sub(r'justify-content:\s*center;?', '', content)
content = re.sub(r'padding:\s*0\.8rem\s+2rem;?', '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("admin.html fixed!")
