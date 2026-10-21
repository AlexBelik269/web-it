// Rewrites links inside content pages so they work on the deployed site:
//   /security/web/xss        -> /it/security/web/xss/   (adds the `base` path)
//   ./monoliths, ../x/y.md   -> /it/web/architecture/monoliths/  (resolved from the source file's folder,
//                                like on GitHub, instead of from the page URL)
// Relative links are only rewritten when the target page exists, so typos still show up as broken links.
import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.resolve('src/content/docs');
const SKIP = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i; // http:, mailto:, #anchor, //host

function pageExists(slug) {
	const base = path.join(DOCS_DIR, slug);
	return ['.md', '.mdx', '/index.md', '/index.mdx'].some((ext) => fs.existsSync(base + ext));
}

function withSlash(p) {
	return p === '' || p.endsWith('/') ? p : p + '/';
}

export default function rehypeSiteLinks({ base = '/' } = {}) {
	const prefix = base.replace(/\/$/, '');

	function rewrite(href, fileDir) {
		if (typeof href !== 'string' || !href || SKIP.test(href)) return href;
		const m = href.match(/^([^?#]*)(.*)$/);
		let [, target, rest] = m;
		if (!target) return href;

		if (target.startsWith('/')) {
			if (prefix && (target === prefix || target.startsWith(prefix + '/'))) return href;
			// Leave links to static files (e.g. /favicon.svg) alone apart from the base.
			return prefix + target + rest;
		}

		// Relative link: resolve from the folder of the source file.
		const resolved = path.posix
			.normalize(path.posix.join(fileDir, target))
			.replace(/\.mdx?$/i, '')
			.replace(/\/index$/i, '')
			.replace(/\/$/, '');
		if (resolved.startsWith('..')) return href;
		const slug = resolved.toLowerCase();
		if (!pageExists(resolved) && !pageExists(slug)) return href;
		return withSlash(`${prefix}/${slug}`) + rest;
	}

	return (tree, file) => {
		const filePath = file.path || file.history?.[0];
		if (!filePath || !path.resolve(filePath).startsWith(DOCS_DIR)) return;
		const fileDir = path.posix.dirname(path.relative(DOCS_DIR, path.resolve(filePath)).split(path.sep).join('/'));
		const dir = fileDir === '.' ? '' : fileDir;

		const visit = (node) => {
			if (node.type === 'element' && node.tagName === 'a' && node.properties) {
				node.properties.href = rewrite(node.properties.href, dir);
			} else if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.attributes) {
				for (const attr of node.attributes) {
					if (attr.type === 'mdxJsxAttribute' && attr.name === 'href' && typeof attr.value === 'string') {
						attr.value = rewrite(attr.value, dir);
					}
				}
			}
			if (node.children) node.children.forEach(visit);
		};
		visit(tree);
	};
}
