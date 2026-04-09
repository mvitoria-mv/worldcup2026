# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

Requires a local HTTP server (ES Modules use `fetch()`, which is blocked by `file://` CORS):

```bash
npx live-server .
# or
python -m http.server 8080
```

No build step, no bundler, no package manager. Open `index.html` directly via the server.

## Architecture

Single-page app: `index.html` is a static shell. `js/router.js` listens for `hashchange` and `DOMContentLoaded`, reads `window.location.hash`, and dynamically imports the matching section module (e.g. `import('./sections/grupos.js')`). Each section module exports a single `render(container)` function that fetches its JSON data and writes HTML into the `<main>` element.

**Routing:** hash-based (`#home`, `#jogos`, `#grupos`, `#selecoes`, `#estatisticas`, `#historico`, `#sedes`). No hash → defaults to `home`.

**Data:** all static JSON files under `data/`. No API calls to external services. Data is sourced manually from FIFA and reliable sports sources.

**Shared utilities** live in `js/utils.js`: `fetchJSON(path)`, `formatDate()`, `formatTime()`, `getFlag(codigo)`, `renderTemplate()`.

**CSS variables** (theme) are defined in `styles/main.css` under `:root`. The Vibrant theme uses `--color-primary: #BF0A30`, `--color-secondary: #002868`, `--color-accent: #FFD700`, `--color-bg: #0d0a1e`.

## Key data schemas

- `data/jogos.json` — 104 matches; `status` field is `"agendado"` or `"encerrado"` (no live state — data is static)
- `data/selecoes.json` — 48 teams; includes `elenco[]`, `stats_torneio`, `titulos_copa`, `anos_titulo`
- `data/grupos.json` — 12 groups (A–L) with standings table
- `data/historico.json` — all World Cups 1930–2022
- `data/artilharia.json` — top scorers for the 2026 tournament
- `data/sedes.json` — 16 stadiums across USA, Mexico, Canada

## Spec & design

Full design spec: `docs/superpowers/specs/2026-04-08-worldcup2026-site-design.md`  
PRD: `.llm/prd.md`

## Skills

`brainstorming` skill is available at `.claude/skills/brainstorming/`. Use it before adding any new feature or section — invoke via the `brainstorming` skill tool, not by reading the SKILL.md directly.
