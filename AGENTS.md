# Repository Guidelines

Before compile ,you must use the command "pt" to activate specific python env.

## Project Structure & Module Organization

This repository is a MkDocs Material documentation site. Source content lives in `docs/`, with Markdown pages grouped by topic:

- `docs/incourse/`: course notes and resources.
- `docs/article/`: reading notes and outside-study articles.
- `docs/tools/`, `docs/life/`, `docs/friends.md`: site sections and standalone pages.
- `docs/css/` and `docs/_js/`: custom styles and scripts loaded by `mkdocs.yml`.
- `docs/smaterials/`: downloadable PDFs, ZIPs, and other course materials.
- `overrides/`: MkDocs Material template overrides.
- `site/`: generated static output; avoid editing it directly unless intentionally updating built artifacts.

Navigation, theme settings, plugins, Markdown extensions, CSS, and JavaScript entries are configured in `mkdocs.yml`.

## Build, Test, and Development Commands

Install the same tooling used by CI:

```bash
pip install mkdocs mkdocs-material pymdown-extensions mkdocs-minify-plugin mkdocs-statistics-plugin mkdocs-glightbox mkdocs-git-revision-date-localized-plugin mkdocs-git-authors-plugin
```

Run locally:

```bash
mkdocs serve
```

Build the static site:

```bash
mkdocs build
```

Deployments are handled by `.github/workflows/ci.yml`, which runs `mkdocs gh-deploy --force` on pushes to `main` or `master`.

## Coding Style & Naming Conventions

Use 4-space indentation for YAML, HTML, CSS, and JavaScript changes where indentation is needed. Keep Markdown filenames and nav entries stable; changing a path requires updating `mkdocs.yml`. Prefer concise Markdown headings, fenced code blocks with language tags, and standard LaTeX math syntax when needed. When writing documentation content, favor MkDocs Material blocks such as `!!! note`, `!!! tip`, and `=== "Tab"` for callouts and grouped content instead of stacking many `###` headings. Use `camelCase` for JavaScript variables/functions and keep custom CSS selectors descriptive.

## Testing Guidelines

There is no dedicated unit test suite. Treat `mkdocs build` as the required validation step before submitting changes. For content updates, check that new pages are linked from `mkdocs.yml`, internal links resolve, images/assets load, and math/admonition syntax renders correctly. For CSS or JavaScript changes, verify affected pages with `mkdocs serve`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit prefixes such as `feat:` and `docs:`, alongside short imperative summaries. Prefer Conventional Commits, for example:

```text
docs: add quantum lecture notes
feat: update course navigation
```

Pull requests should include a brief description, affected directories or pages, screenshots for visible UI/style changes, and links to related issues when applicable. Note whether `mkdocs build` passed locally.

## Agent-Specific Notes

Keep edits focused on source files under `docs/`, `overrides/`, and `mkdocs.yml`. Do not introduce dependency managers or generated fallback code unless the project explicitly needs them.
