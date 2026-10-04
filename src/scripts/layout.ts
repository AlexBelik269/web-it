const root = document.documentElement;

function store(key: string, value: string | null) {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {}
}

/* ---------- Text zoom ---------- */

const ZOOM_KEY = 'it-zoom';
const ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.2, 1.35, 1.5];

function currentZoom() {
	return parseFloat(root.style.getPropertyValue('--it-zoom')) || 1;
}

function setZoom(z: number) {
	if (z === 1) root.style.removeProperty('--it-zoom');
	else root.style.setProperty('--it-zoom', String(z));
	store(ZOOM_KEY, z === 1 ? null : String(z));
	updateZoomLabels();
}

function updateZoomLabels() {
	const label = `${Math.round(currentZoom() * 100)}%`;
	document.querySelectorAll('.zoom-level').forEach((el) => (el.textContent = label));
}

document.addEventListener('click', (e) => {
	const btn = (e.target as Element).closest<HTMLButtonElement>('[data-zoom]');
	if (!btn) return;
	const z = currentZoom();
	const i = ZOOM_STEPS.findIndex((s) => s >= z - 0.001);
	if (btn.dataset.zoom === 'in') setZoom(ZOOM_STEPS[Math.min(i + 1, ZOOM_STEPS.length - 1)]);
	else if (btn.dataset.zoom === 'out') setZoom(ZOOM_STEPS[Math.max(i - 1, 0)]);
	else setZoom(1);
});
updateZoomLabels();

/* ---------- Resizable sidebar ---------- */

const SIDEBAR_KEY = 'it-sidebar-width';

if (document.querySelector('#starlight__sidebar')) {
	const handle = document.createElement('div');
	handle.className = 'sidebar-resizer print:hidden';
	handle.setAttribute('role', 'separator');
	handle.setAttribute('aria-orientation', 'vertical');
	handle.setAttribute('aria-label', 'Resize sidebar');
	handle.tabIndex = 0;
	handle.title = 'Drag to resize · double-click to reset';
	document.body.append(handle);

	const minWidth = () => 11 * parseFloat(getComputedStyle(root).fontSize);
	const sidebarWidth = () => document.querySelector('#starlight__sidebar')!.getBoundingClientRect().width;
	const setWidth = (px: number) => {
		const w = Math.round(Math.min(Math.max(px, minWidth()), window.innerWidth * 0.5));
		root.style.setProperty('--it-sidebar-user', `${w}px`);
		return w;
	};

	handle.addEventListener('pointerdown', (e) => {
		e.preventDefault();
		handle.setPointerCapture(e.pointerId);
		root.classList.add('it-resizing');
		const move = (ev: PointerEvent) => setWidth(ev.clientX);
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
			handle.removeEventListener('pointercancel', up);
			root.classList.remove('it-resizing');
			store(SIDEBAR_KEY, String(Math.round(sidebarWidth())));
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
		handle.addEventListener('pointercancel', up);
	});

	handle.addEventListener('dblclick', () => {
		root.style.removeProperty('--it-sidebar-user');
		store(SIDEBAR_KEY, null);
	});

	handle.addEventListener('keydown', (e) => {
		const delta = e.key === 'ArrowLeft' ? -16 : e.key === 'ArrowRight' ? 16 : 0;
		if (!delta) return;
		e.preventDefault();
		store(SIDEBAR_KEY, String(setWidth(sidebarWidth() + delta)));
	});
}

/* ---------- Diagram viewer (zoom & pan) ---------- */

function markZoomable() {
	document.querySelectorAll<HTMLElement>('pre.mermaid:not([data-zoomable])').forEach((pre) => {
		if (!pre.querySelector('svg')) return;
		pre.dataset.zoomable = '';
		pre.tabIndex = 0;
		pre.setAttribute('role', 'button');
		pre.setAttribute('aria-label', 'Open diagram in zoomable viewer');
	});
}
new MutationObserver(markZoomable).observe(document.body, { childList: true, subtree: true });
markZoomable();

function openViewer(svg: SVGSVGElement) {
	const dialog = document.createElement('dialog');
	dialog.className = 'diagram-viewer';
	dialog.setAttribute('aria-label', 'Diagram viewer');
	dialog.innerHTML = `
		<div class="dv-toolbar">
			<button type="button" data-act="out" aria-label="Zoom out">−</button>
			<span class="dv-level" aria-live="polite"></span>
			<button type="button" data-act="in" aria-label="Zoom in">+</button>
			<button type="button" data-act="fit">Fit</button>
			<span class="dv-hint">Scroll or pinch to zoom · drag to pan · Esc to close</span>
			<button type="button" data-act="close" class="dv-close" aria-label="Close">✕</button>
		</div>
		<div class="dv-stage"><div class="dv-canvas"></div></div>`;
	const stage = dialog.querySelector<HTMLElement>('.dv-stage')!;
	const canvas = dialog.querySelector<HTMLElement>('.dv-canvas')!;
	const level = dialog.querySelector<HTMLElement>('.dv-level')!;

	// Render the clone at the diagram's natural size; zooming is done with a CSS transform.
	const box = svg.viewBox.baseVal;
	const rect = svg.getBoundingClientRect();
	const w = box?.width || rect.width;
	const h = box?.height || rect.height;
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.removeAttribute('style');
	clone.setAttribute('width', String(w));
	clone.setAttribute('height', String(h));
	canvas.append(clone);

	let s = 1, x = 0, y = 0;
	const apply = () => {
		canvas.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
		level.textContent = `${Math.round(s * 100)}%`;
	};
	const zoomAt = (factor: number, cx: number, cy: number) => {
		const next = Math.min(Math.max(s * factor, 0.1), 10);
		x = cx - (cx - x) * (next / s);
		y = cy - (cy - y) * (next / s);
		s = next;
		apply();
	};
	const zoomCenter = (factor: number) => zoomAt(factor, stage.clientWidth / 2, stage.clientHeight / 2);
	const fit = () => {
		const sw = stage.clientWidth, sh = stage.clientHeight;
		s = Math.min((sw * 0.95) / w, (sh * 0.95) / h, 3);
		x = (sw - w * s) / 2;
		y = (sh - h * s) / 2;
		apply();
	};
	// Wide diagrams on narrow screens get unreadable when fitted; start them at a legible
	// size instead, aligned to the start so the reader can pan along.
	const initialView = () => {
		fit();
		const readable = Math.min(0.75, (stage.clientHeight * 0.95) / h);
		if (s >= 0.5 || readable <= s) return;
		s = readable;
		x = stage.clientWidth * 0.025;
		y = (stage.clientHeight - h * s) / 2;
		apply();
	};

	dialog.addEventListener('click', (e) => {
		const act = (e.target as Element).closest<HTMLElement>('[data-act]')?.dataset.act;
		if (act === 'in') zoomCenter(1.25);
		else if (act === 'out') zoomCenter(0.8);
		else if (act === 'fit') fit();
		else if (act === 'close') dialog.close();
	});
	dialog.addEventListener('keydown', (e) => {
		if (e.key === '+' || e.key === '=') zoomCenter(1.25);
		else if (e.key === '-') zoomCenter(0.8);
		else if (e.key === '0') fit();
	});
	stage.addEventListener(
		'wheel',
		(e) => {
			e.preventDefault();
			const r = stage.getBoundingClientRect();
			zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
		},
		{ passive: false }
	);
	stage.addEventListener('dblclick', (e) => {
		const r = stage.getBoundingClientRect();
		zoomAt(2, e.clientX - r.left, e.clientY - r.top);
	});

	// Drag to pan with one pointer, pinch to zoom with two.
	const pointers = new Map<number, { x: number; y: number }>();
	let pinchDist = 0;
	const mid = () => {
		const [a, b] = [...pointers.values()];
		const r = stage.getBoundingClientRect();
		return { x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top, d: Math.hypot(a.x - b.x, a.y - b.y) };
	};
	stage.addEventListener('pointerdown', (e) => {
		stage.setPointerCapture(e.pointerId);
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size === 2) pinchDist = mid().d;
	});
	stage.addEventListener('pointermove', (e) => {
		const prev = pointers.get(e.pointerId);
		if (!prev) return;
		if (pointers.size === 1) {
			x += e.clientX - prev.x;
			y += e.clientY - prev.y;
			pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
			apply();
		} else if (pointers.size === 2) {
			const before = mid();
			pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
			const after = mid();
			x += after.x - before.x;
			y += after.y - before.y;
			if (pinchDist) zoomAt(after.d / pinchDist, after.x, after.y);
			pinchDist = after.d;
		}
	});
	const release = (e: PointerEvent) => {
		pointers.delete(e.pointerId);
		pinchDist = 0;
	};
	stage.addEventListener('pointerup', release);
	stage.addEventListener('pointercancel', release);

	const onResize = () => fit();
	window.addEventListener('resize', onResize);
	dialog.addEventListener('close', () => {
		window.removeEventListener('resize', onResize);
		dialog.remove();
		root.style.overflow = '';
	});

	document.body.append(dialog);
	root.style.overflow = 'hidden';
	dialog.showModal();
	initialView();
}

document.addEventListener('click', (e) => {
	const pre = (e.target as Element).closest<HTMLElement>('pre.mermaid[data-zoomable]');
	const svg = pre?.querySelector('svg');
	if (svg) openViewer(svg);
});
document.addEventListener('keydown', (e) => {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	const pre = (e.target as Element).closest?.<HTMLElement>('pre.mermaid[data-zoomable]');
	const svg = pre?.querySelector('svg');
	if (!svg) return;
	e.preventDefault();
	openViewer(svg);
});
