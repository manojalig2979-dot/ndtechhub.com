/**
 * NDTechHub - 3D Holographic Cybernetic Splash Screen
 * Interactive WebGL / Three.js Core with 2026 Liquid Glass HUD & Telemetry
 */

(function () {
  'use strict';

  // Splash Configuration
  const CONFIG = {
    durationMs: 3000,          // Total splash duration in milliseconds
    autoDismiss: true,         // Automatically exit after duration
    sessionKey: 'nd_splash_seen',
    particlesCount: 220,
    coreCyanColor: 0x00f2fe,
    coreVioletColor: 0x7f00ff,
    coreBlueColor: 0x4facfe
  };

  let scene, camera, renderer, animationFrameId;
  let coreGroup, outerPoly, innerPoly, ring1, ring2, ring3, particleSystem;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let isExiting = false;
  let startTime = null;

  // DOM Elements
  let splashEl, progressBarEl, percentEl, statusTextEl, skipBtnEl;

  // Telemetry stages based on progress
  const TELEMETRY_STAGES = [
    { threshold: 0, text: 'Initializing Neural Core v3.0...' },
    { threshold: 25, text: 'Calibrating Quantum Architecture...' },
    { threshold: 52, text: 'Synthesizing Zero-Bloat Ecosystem...' },
    { threshold: 78, text: 'Architectural AI Systems Online...' },
    { threshold: 98, text: 'Ecosystem Ready. Entering...' }
  ];

  function initSplashScreen() {
    splashEl = document.getElementById('nd-splash-screen');
    if (!splashEl) return;

    progressBarEl = document.getElementById('splash-progress-bar');
    percentEl = document.getElementById('splash-percent');
    statusTextEl = document.getElementById('splash-status-text');
    skipBtnEl = document.getElementById('splash-skip-btn');

    // Render Lucide icons in splash HUD if present
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Attach User Interaction Listeners
    if (skipBtnEl) {
      skipBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissSplash();
      });
    }

    // Keyboard Shortcuts (Enter, Space, Escape)
    window.addEventListener('keydown', handleKeydown);

    // Initialize 3D Three.js Scene if available
    if (typeof THREE !== 'undefined') {
      initThreeScene();
    } else {
      console.warn('Three.js not loaded, starting fallback timer.');
    }

    // Start progress & telemetry loop
    requestAnimationFrame(updateProgressLoop);
  }

  function handleKeydown(e) {
    if (isExiting) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      dismissSplash();
    }
  }

  // ── 3D Scene Initialization ───────────────────────────────────────────────
  function initThreeScene() {
    const container = document.getElementById('splash-canvas-container');
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8.5;

    // WebGL Renderer with Alpha & Antialiasing
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Central 3D Group
    coreGroup = new THREE.Group();
    // Slightly offset vertically so it sits comfortably above HUD
    coreGroup.position.y = 0.75;
    scene.add(coreGroup);

    // 1. Inner Glowing Polyhedron (Dual Solid/Wireframe Icosahedron)
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshPhongMaterial({
      color: CONFIG.coreVioletColor,
      emissive: 0x3d007a,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
      shininess: 90,
      flatShading: true
    });
    innerPoly = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerPoly);

    // 2. Outer Holographic Wireframe Cage
    const outerGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: CONFIG.coreCyanColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    outerPoly = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerPoly);

    // 3. Cybernetic Gyroscopic Rings (Nested Toruses)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: CONFIG.coreCyanColor,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: CONFIG.coreBlueColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: CONFIG.coreVioletColor,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.025, 12, 60), ringMat1);
    ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.02, 12, 60), ringMat2);
    ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.02, 12, 60), ringMat3);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;

    coreGroup.add(ring1);
    coreGroup.add(ring2);
    coreGroup.add(ring3);

    // 4. Floating Quantum Stardust Particles
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particlesCount * 3);
    const colors = new Float32Array(CONFIG.particlesCount * 3);

    const cyan = new THREE.Color(CONFIG.coreCyanColor);
    const violet = new THREE.Color(CONFIG.coreVioletColor);
    const blue = new THREE.Color(CONFIG.coreBlueColor);

    for (let i = 0; i < CONFIG.particlesCount; i++) {
      const idx = i * 3;
      // Spherical distribution
      const radius = 3.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[idx + 2] = radius * Math.cos(phi);

      // Color variation
      const chosenColor = i % 3 === 0 ? cyan : (i % 3 === 1 ? blue : violet);
      colors[idx] = chosenColor.r;
      colors[idx + 1] = chosenColor.g;
      colors[idx + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Dynamic Cybernetic Lighting
    const ambientLight = new THREE.AmbientLight(0x0e1420, 1.8);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(CONFIG.coreCyanColor, 3, 20);
    cyanPoint.position.set(5, 5, 5);
    scene.add(cyanPoint);

    const violetPoint = new THREE.PointLight(CONFIG.coreVioletColor, 3, 20);
    violetPoint.position.set(-5, -4, 3);
    scene.add(violetPoint);

    // Responsive Window Resize Handler
    window.addEventListener('resize', handleResize);

    // Mouse Parallax Listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Start 3D Animation Loop
    animateThree();
  }

  function handleResize() {
    if (!renderer || !camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function handleMouseMove(e) {
    const halfX = window.innerWidth / 2;
    const halfY = window.innerHeight / 2;
    targetMouseX = (e.clientX - halfX) / halfX;
    targetMouseY = (e.clientY - halfY) / halfY;
  }

  function handleTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      targetMouseX = (touch.clientX - halfX) / halfX;
      targetMouseY = (touch.clientY - halfY) / halfY;
    }
  }

  // ── 3D Render Loop ────────────────────────────────────────────────────────
  function animateThree() {
    if (isExiting && !renderer) return;

    animationFrameId = requestAnimationFrame(animateThree);

    // Smooth Mouse Lerp
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    if (coreGroup) {
      // Base Rotations
      innerPoly.rotation.x += 0.008;
      innerPoly.rotation.y -= 0.012;

      outerPoly.rotation.x -= 0.005;
      outerPoly.rotation.y += 0.007;

      ring1.rotation.x += 0.014;
      ring1.rotation.y += 0.01;

      ring2.rotation.y += 0.012;
      ring2.rotation.z += 0.008;

      ring3.rotation.z += 0.01;
      ring3.rotation.x -= 0.007;

      // Mouse Parallax & Gentle Breathing
      const time = performance.now() * 0.0015;
      const breathingScale = 1 + Math.sin(time * 2) * 0.035;

      coreGroup.scale.set(breathingScale, breathingScale, breathingScale);
      coreGroup.rotation.y = mouseX * 0.6;
      coreGroup.rotation.x = mouseY * -0.4;
    }

    if (particleSystem) {
      particleSystem.rotation.y += 0.0015;
      particleSystem.rotation.x += 0.0008;
    }

    // Hyperspace spin acceleration during exit transition
    if (isExiting && coreGroup) {
      coreGroup.rotation.y += 0.08;
      coreGroup.rotation.x += 0.05;
      coreGroup.scale.multiplyScalar(1.025);
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // ── Telemetry & Progress Loop ─────────────────────────────────────────────
  function updateProgressLoop(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / CONFIG.durationMs, 1);

    // Eased percentage calculation
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const displayPercent = Math.floor(easeOutCubic(progress) * 100);

    // Update Progress UI
    if (progressBarEl) {
      progressBarEl.style.width = `${displayPercent}%`;
    }
    if (percentEl) {
      percentEl.textContent = `${displayPercent}%`;
    }

    // Update Telemetry Message
    if (statusTextEl) {
      for (let i = TELEMETRY_STAGES.length - 1; i >= 0; i--) {
        if (displayPercent >= TELEMETRY_STAGES[i].threshold) {
          if (statusTextEl.textContent !== TELEMETRY_STAGES[i].text) {
            statusTextEl.textContent = TELEMETRY_STAGES[i].text;
          }
          break;
        }
      }
    }

    if (progress < 1 && !isExiting) {
      requestAnimationFrame(updateProgressLoop);
    } else if (progress >= 1 && CONFIG.autoDismiss && !isExiting) {
      setTimeout(dismissSplash, 180);
    }
  }

  // ── Dismiss & Cleanup Transition ──────────────────────────────────────────
  function dismissSplash() {
    if (isExiting) return;
    isExiting = true;

    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleTouchMove);

    if (splashEl) {
      splashEl.classList.add('splash-exit');
    }

    // Trigger completion event for external components if needed
    try {
      window.dispatchEvent(new CustomEvent('ndSplashCompleted', { detail: { timestamp: Date.now() } }));
    } catch (e) {}

    // Cleanup resources after CSS transition finishes
    setTimeout(() => {
      if (splashEl) {
        splashEl.classList.add('splash-hidden');
        splashEl.setAttribute('aria-hidden', 'true');
      }

      // Dispose Three.js geometries, materials, textures & stop loop to free GPU
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }

      if (renderer && renderer.domElement) {
        renderer.dispose();
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
    }, 850);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplashScreen);
  } else {
    initSplashScreen();
  }
})();
