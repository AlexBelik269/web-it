---
title: "Frontend Performance"
description: "Core Web Vitals, resource loading, code splitting, image optimisation, caching strategies, and performance budgets."
---

Frontend performance directly impacts user experience, SEO rankings, and conversion rates. Every 100 ms of additional load time reduces conversions by ~1% (Google research). Performance engineering is about reducing the time between "user initiates action" and "result is visible and interactive."

## Core Web Vitals

Google's Core Web Vitals are the primary quality signals for web performance:

| Metric | Measures | Good | Needs work | Poor |
|---|---|---|---|---|
| **LCP** Largest Contentful Paint | Loading | ≤ 2.5 s | 2.5–4 s | > 4 s |
| **INP** Interaction to Next Paint | Interactivity | ≤ 200 ms | 200–500 ms | > 500 ms |
| **CLS** Cumulative Layout Shift | Visual stability | ≤ 0.1 | 0.1–0.25 | > 0.25 |

Supporting metrics:
- **TTFB** (Time to First Byte) — server response speed
- **FCP** (First Contentful Paint) — first text or image
- **TBT** (Total Blocking Time) — JS blocking main thread

## Measuring performance

```javascript
// Navigation timing API
const nav = performance.getEntriesByType('navigation')[0];
console.log(`TTFB: ${nav.responseStart - nav.requestStart} ms`);
console.log(`DOM loaded: ${nav.domContentLoadedEventEnd} ms`);

// Web Vitals library
import { getLCP, getINP, getCLS } from 'web-vitals';
getLCP(console.log);
getINP(console.log);
getCLS(console.log);
```

Tools: **Lighthouse** (lab), **PageSpeed Insights** (field + lab), **Chrome DevTools Performance tab**, **WebPageTest**, **Real User Monitoring (RUM)**.

## Resource loading optimisation

### Preloading critical resources

```html
<!-- Preload LCP image -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">

<!-- Preload key font -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect to third-party origins -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://analytics.example.com">
```

### Script loading strategies

```html
<!-- Critical UI logic — inline or preload -->
<script>/* critical inline code */</script>

<!-- Non-critical — defer (executes after DOMContentLoaded) -->
<script src="app.js" defer></script>

<!-- Truly non-critical (analytics) — async (runs ASAP, unpredictable order) -->
<script src="analytics.js" async></script>

<!-- Dynamic import — load on demand -->
<button id="load-chart">Show chart</button>
<script>
document.getElementById('load-chart').addEventListener('click', async () => {
    const { renderChart } = await import('./chart.js');
    renderChart();
});
</script>
```

## Code splitting

Split your bundle so users only download what they need:

```javascript
// React route-based splitting
const ProductPage = React.lazy(() => import('./ProductPage'));
const AdminPage   = React.lazy(() => import('./AdminPage'));

// Vite / Webpack manual chunks
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    charts:  ['recharts'],
                },
            },
        },
    },
});
```

## Image optimisation

Images are often the largest bytes on the page.

### Format choice

| Format | Use case | Compression |
|---|---|---|
| AVIF | Photos, complex images | Best (but slow to encode) |
| WebP | Universal modern choice | ~30% smaller than JPEG |
| JPEG | Photographic fallback | Good |
| PNG | Lossless, transparency | Large |
| SVG | Icons, illustrations | Scales perfectly |
| GIF | Animation only | Replaced by WebP/APNG |

### Responsive images

```html
<picture>
    <!-- AVIF for modern browsers -->
    <source srcset="hero-400.avif 400w, hero-800.avif 800w" type="image/avif">
    <!-- WebP fallback -->
    <source srcset="hero-400.webp 400w, hero-800.webp 800w" type="image/webp">
    <!-- JPEG fallback -->
    <img
        src="hero-800.jpg"
        srcset="hero-400.jpg 400w, hero-800.jpg 800w"
        sizes="(max-width: 600px) 400px, 800px"
        alt="Hero image"
        width="800" height="450"
        loading="lazy"
        decoding="async"
    >
</picture>
```

Always set `width` and `height` on images to prevent CLS. Use `loading="lazy"` for below-the-fold images.

## Caching strategies

### Long-term caching with content hashing

```
/assets/main.a3f1b2c4.js  →  Cache-Control: max-age=31536000, immutable
/index.html               →  Cache-Control: no-cache  (always revalidate)
```

The bundle filename changes when content changes, so you can cache JS/CSS forever while always serving the latest HTML.

### Service Worker caching

```javascript
// sw.js — Cache First for static assets
self.addEventListener('fetch', event => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(cached =>
                cached ?? fetch(event.request).then(res => {
                    const clone = res.clone();
                    caches.open('images').then(cache => cache.put(event.request, clone));
                    return res;
                })
            )
        );
    }
});
```

| Strategy | Description | Use case |
|---|---|---|
| Cache First | Check cache, fall back to network | Static assets |
| Network First | Try network, fall back to cache | API calls |
| Stale While Revalidate | Serve cache, fetch fresh in background | News feeds |
| Cache Only | Serve from cache only | Offline shell |
| Network Only | Always fetch | Authentication |

## JavaScript performance

### Avoid long tasks

Tasks > 50 ms block the main thread. Break them up:

```javascript
// Process large array in chunks
async function processInChunks(items, chunkSize = 100) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        processChunk(chunk);
        // yield to browser between chunks
        await new Promise(r => setTimeout(r, 0));
    }
}
```

Or use Web Workers for truly CPU-intensive tasks.

### Debounce and throttle

```javascript
// Debounce — only fires after N ms of silence
function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// Throttle — fires at most once per N ms
function throttle(fn, ms) {
    let last = 0;
    return (...args) => {
        if (Date.now() - last >= ms) {
            last = Date.now();
            fn(...args);
        }
    };
}

window.addEventListener('scroll', throttle(updateScrollBar, 16));
input.addEventListener('input', debounce(searchAPI, 300));
```

## Performance budget

Set measurable targets before building:

| Metric | Budget |
|---|---|
| Total JS (compressed) | < 200 KB |
| Total CSS (compressed) | < 50 KB |
| Total images (per page) | < 500 KB |
| LCP | < 2.5 s (4G) |
| TBT | < 200 ms |

Enforce with Lighthouse CI in your CI/CD pipeline — fail builds that regress beyond the budget.
