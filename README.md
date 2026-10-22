# IT Knowledge Base

Study notes and reference pages on security, networking, development, cloud, databases, operating systems, AI, and math.
Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) and published at <https://alex-belik.cz/it/>.

## Commands

| Command           | Action                                        |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Install dependencies                          |
| `npm run dev`     | Start the dev server at `localhost:4321/it/`  |
| `npm run build`   | Build the site into `./dist/`                 |
| `npm run preview` | Preview the built site                        |
| `npm run deploy`  | Build and upload the site to the web server   |

## Publishing (Forpsi FTP)

One-time setup:
1. Copy `.env.example` to `.env` and put your FTP password after `FTP_PASSWORD=`.
   If the password contains `#`, spaces or quotes, wrap it in double quotes: `FTP_PASSWORD="my#pass"`.
   `.env` is git-ignored, so the password never ends up on GitHub.
2. Optional: `npm run deploy:dry` shows what would be uploaded without changing anything.

Then publish with:

```
npm run deploy
```

This builds the site and uploads only the files that changed since the last upload. Pages you deleted are removed
from the server too. The server keeps a `.ftp-deploy-sync-state.json` file in `/www/it/` to track this — don't delete it
(if you do, the next upload just re-sends everything). `npm run deploy:upload` uploads without rebuilding.

## Project layout

```
src/
├── content/docs/        # all pages (.md / .mdx); the folder path is the URL
├── components/          # Callout banner, sidebar tabs, header/zoom controls
│   └── tabs.ts          # which sidebar groups each tab shows
├── plugins/
│   └── rehype-site-links.mjs  # makes content links work under the /it base path
├── scripts/layout.ts    # text zoom, resizable sidebar, zoomable diagrams
└── styles/              # custom.css (look & feel), layout.css (layout)
astro.config.mjs         # site config and the sidebar navigation
```

## Writing pages

- Add a page under `src/content/docs/<section>/...` and add it to the `sidebar` in `astro.config.mjs`.
- Links between pages can be written either way — both work on the live site:
  - from the site root: `[DNS](/network/addressing/dns)` (no `/it` needed)
  - relative to the file, like on GitHub: `[DNS](../addressing/dns.mdx)`
- Coloured section banners: `import Callout from '../../../components/Callout.astro'`, then
  `<Callout type="green">` with a heading inside. Types: `note`, `tip`, `caution`, `danger`, `green`, `yellow`.
- For notes and warnings inside text, prefer Starlight's built-in `<Aside type="note|tip|caution|danger">`.
