# NDTechHub — Optimized Production Build

This build keeps the existing NDTechHub design and functionality while applying a performance and reliability pass.

## What was fixed

- Converted large local PNG brand/blog artwork to optimized WebP assets.
- Added responsive image dimensions, lazy loading and async decoding.
- Deferred non-critical classic scripts so HTML parsing is not blocked.
- Pinned Lucide and Devicon CDN versions; removed `@latest` runtime drift.
- Reduced canvas device-pixel-ratio work and fixed repeated canvas scaling on resize.
- Disabled expensive hero particles/card tilt on touch/mobile and `prefers-reduced-motion` devices.
- Reduced Three.js splash particle count and pixel ratio; skipped WebGL on small/reduced-motion devices.
- Added visibility-aware animation guards so hidden tabs do less work.
- Kept the existing visual identity and desktop effects.
- Hardened Firebase Firestore/Storage write permissions to the configured admin accounts.
- Removed repository history and Firebase emulator logs from the distributable ZIP.

## Firebase deployment

From the project root:

```bash
firebase deploy --only hosting,firestore:rules,storage
```

If your Firebase CLI project selection differs, run `firebase use` first.

## Important production note

The homepage Speed Audit widget in the original project was a visual simulator rather than a real external-site performance test. It should not be advertised as a real PageSpeed/Lighthouse result unless a server-side PageSpeed/Lighthouse endpoint is connected.

## Recommended production checks

After deployment, test the live site with:

- Lighthouse / Chrome DevTools
- PageSpeed Insights
- WebPageTest
- Search Console URL Inspection
- Firebase Rules simulator

Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1 on a representative mobile connection.
