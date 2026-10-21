// Sidebar tabs: each tab shows only some of the top-level sidebar groups (labels from astro.config.mjs).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export interface Tab {
	id: string;
	label: string;
	href: string;
	/** URL sections (first path segment after the base) that belong to this tab. */
	sections: string[];
	/** Top-level sidebar group labels shown while this tab is active. */
	groups: string[];
	icon: string;
}

export const tabs: Tab[] = [
	{
		id: 'overview',
		label: 'Overview',
		href: `${BASE}/overview/`,
		sections: ['', 'overview'],
		groups: ['Overview'],
		icon: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
	},
	{
		id: 'dev',
		label: 'Dev',
		href: `${BASE}/programming/`,
		sections: ['programming', 'web'],
		groups: ['Programming', 'Web'],
		icon: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
	},
	{
		id: 'security',
		label: 'Security',
		href: `${BASE}/security/`,
		sections: ['security', 'auth', 'network'],
		groups: ['Security', 'Auth', 'Networking'],
		icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
	},
	{
		id: 'ai',
		label: 'AI',
		href: `${BASE}/ai/`,
		sections: ['ai'],
		groups: ['AI & LLMs'],
		icon: `<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`,
	},
	{
		id: 'math',
		label: 'Math',
		href: `${BASE}/math/`,
		sections: ['math'],
		groups: ['Mathematics'],
		icon: `<path d="M16 4 L4 4 L11 12 L4 20 L16 20" fill="none"/>`,
	},
	{
		id: 'infra',
		label: 'Infra',
		href: `${BASE}/cloud/`,
		sections: ['cloud', 'databases', 'os', 'tools'],
		groups: ['Cloud & Containers', 'Databases', 'Operating Systems', 'Tools'],
		icon: `<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>`,
	},
];

/** Returns the tab that owns the given URL path (falls back to the overview tab). */
export function activeTab(pathname: string): Tab {
	const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
	const section = rest.replace(/^\/+/, '').split('/')[0];
	return tabs.find((t) => t.sections.includes(section)) ?? tabs[0];
}
