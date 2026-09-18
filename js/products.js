// products.js
const APPS_DATA = {
  nia: {
    id: 'nia',
    title: 'NIA 1.0',
    badge: 'FLAGSHIP AI AGENT',
    tagline: 'Autonomous Cognitive Assistant & Workflow Copilot',
    category: 'AI & Agents',
    gradient: 'from-sky-500 via-indigo-600 to-purple-600',
    icon: 'bot',
    overview: 'NIA 1.0 represents NDTechHub’s frontier AI product: an autonomous, multi-modal personal copilot engineered for executive research, code generation, local computer control, and workflow automation. It executes complex multi-step reasoning with natural human-like voice synthesis.',
    features: [
      { title: 'Agentic Tool Use', desc: 'Queries APIs, reads PDF/Excel files, and synthesizes summarized research without human prompting.' },
      { title: 'Sub-Second Voice Chat', desc: 'Integrated real-time PCM audio streaming with natural prosody and voice interruption.' },
      { title: 'Zero-Knowledge Privacy', desc: 'Runs local memory caches with client-side cryptographic encryption for enterprise data.' },
      { title: 'Cross-Device Synchronization', desc: 'Seamlessly switch from mobile voice tasks to desktop workspace environments.' }
    ],
    techStack: ['Python 3.12', 'FastAPI', 'Gemini Multimodal Live', 'React 19', 'WebSockets', 'Vector DB (Chroma)'],
    downloadUrl: '#download-nia',
    demoUrl: 'https://ndtechhub.com/demo/nia'
  },
  studio: {
    id: 'studio',
    title: 'ND Studio',
    badge: 'CREATIVE WORKSPACE',
    tagline: 'High-Velocity Digital Creative & Asset Suite',
    category: 'Creative / Developer Tools',
    gradient: 'from-purple-500 via-fuchsia-600 to-pink-500',
    icon: 'palette',
    overview: 'ND Studio is an all-in-one digital creation suite tailored for designers, UI/UX engineers, and digital artists. Powered by WebAssembly graphics pipelines, it offers buttery smooth 120 FPS canvas manipulation and automated design-to-code conversions.',
    features: [
      { title: 'WebAssembly Rendering Core', desc: 'Zero lag zoom and manipulation of vector paths and 4K bitmap layers.' },
      { title: 'Instant Code Export', desc: 'Converts mockups straight into production-ready Tailwind CSS and React JSX components.' },
      { title: 'Cloud Collaboration', desc: 'Multi-cursor real-time multiplayer editing using WebRTC data channels.' },
      { title: 'Asset Hub', desc: 'Integrated vector library with thousands of icons, glassmorphism templates, and 3D shapes.' }
    ],
    techStack: ['Rust / WebAssembly', 'TypeScript', 'HTML5 Canvas API', 'WebRTC', 'Tailwind CSS'],
    downloadUrl: '#download-studio',
    demoUrl: 'https://ndtechhub.com/demo/ndstudio'
  },
  stock: {
    id: 'stock',
    title: 'Stock Manager',
    badge: 'FINTECH & LOGISTICS ERP',
    tagline: 'Multi-Warehouse Inventory, POS & Ledger System',
    category: 'Enterprise SaaS',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-500',
    icon: 'trending-up',
    overview: 'Stock Manager solves supply chain bottlenecks for retailers and distributors. With instantaneous barcode scanning, real-time inventory reconciliation, and intelligent reorder threshold predictions, it eliminates stockouts and shrinkage.',
    features: [
      { title: 'Multi-Location Sync', desc: 'Live ledger tracking across physical retail outlets, warehouses, and e-commerce stores.' },
      { title: 'Smart Purchase Automation', desc: 'Predicts replenishment dates based on seasonal velocities and sends supplier purchase orders.' },
      { title: 'Barcode & Thermal POS', desc: 'Rapid point-of-sale checkout with barcode scanner integration and receipt printing.' },
      { title: 'Tax & Ledger Compliance', desc: 'Automated GST/VAT calculations, daily profit statements, and downloadable audit reports.' }
    ],
    techStack: ['Node.js', 'PostgreSQL', 'Express', 'Tailwind CSS', 'Redis Caching'],
    downloadUrl: '#download-stock',
    demoUrl: 'https://ndtechhub.com/demo/stockmanager'
  },
  hospital: {
    id: 'hospital',
    title: 'Hospital Management',
    badge: 'HEALTHTECH SYSTEM',
    tagline: 'Comprehensive Inpatient, Clinical & Billing OS',
    category: 'HealthTech SaaS',
    gradient: 'from-rose-500 via-red-600 to-orange-500',
    icon: 'activity',
    overview: 'A HIPAA and HL7-compliant digital operating system designed for modern clinics and multi-specialty hospitals. Streamlines patient admission, doctor scheduling, electronic medical records (EMR), and diagnostic laboratory reporting.',
    features: [
      { title: 'Electronic Medical Records', desc: 'Secure, paperless patient health histories, digital prescriptions, and vital tracking.' },
      { title: 'Bed & ICU Allocation', desc: 'Real-time graphic floor map showing bed occupancies, maintenance, and triage status.' },
      { title: 'Pharmacy & Lab Integration', desc: 'Direct order routing from doctor consultations to diagnostic labs and in-house dispensary.' },
      { title: 'Insurance & Claims Engine', desc: 'Quick pre-authorization processing, cashless claim filing, and itemized billing.' }
    ],
    techStack: ['Next.js 15', 'Prisma ORM', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
    downloadUrl: '#download-hospital',
    demoUrl: 'https://ndtechhub.com/demo/hospital'
  },
  school: {
    id: 'school',
    title: 'School Management',
    badge: 'EDTECH INFRASTRUCTURE',
    tagline: 'Multi-Campus Institutional Academic ERP',
    category: 'EdTech SaaS',
    gradient: 'from-amber-500 via-orange-500 to-yellow-400',
    icon: 'graduation-cap',
    overview: 'School Nexus powers primary schools, colleges, and university campuses. It unifies administrative operations, digital grade cards, online tuition payments, teacher lesson plans, and biometric student attendance.',
    features: [
      { title: 'Student & Guardian Portal', desc: 'Dedicated mobile-ready web portal for tracking academic progress, schedules, and bus tracking.' },
      { title: 'Online Fee Collection', desc: 'Integrated payment gateways with automatic late fee calculations and instant receipt generation.' },
      { title: 'Automated Examination Grading', desc: 'Configurable grading curves, GPA calculation, and instant batch report card PDF creation.' },
      { title: 'Staff Payroll & Roster', desc: 'Leave management, biometrics clock-in, and monthly payroll distribution.' }
    ],
    techStack: ['React', 'Express.js', 'MongoDB', 'Chart.js', 'AWS S3'],
    downloadUrl: '#download-school',
    demoUrl: 'https://ndtechhub.com/demo/school'
  }
};

function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-slate-950');
        b.classList.add('bg-white/5', 'text-slate-300');
    });

    const activeBtn = document.getElementById(`filter-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white/5', 'text-slate-300');
        activeBtn.classList.add('bg-sky-500', 'text-slate-950');
    }

    cards.forEach(card => {
        const itemCat = card.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}
