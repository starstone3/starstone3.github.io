"""Generate the homepage update list and trim oversized code from search."""

from __future__ import annotations

from datetime import datetime
from html import escape, unescape
import logging
from pathlib import Path
import re
import subprocess
from typing import Any, Iterable

from mkdocs.plugins import event_priority


log = logging.getLogger("mkdocs.hooks.recent_updates")
RECENT_UPDATES_MARKER = "<!-- recent-updates -->"
RECENT_UPDATES_LIMIT = 8
SEARCH_CODE_LIMIT = 1_600
PRE_BLOCK_PATTERN = re.compile(r"<pre(?P<attrs>[^>]*)>.*?</pre>", re.DOTALL | re.IGNORECASE)


def _collect_nav_titles(nav: Any, titles: dict[str, str]) -> None:
    if isinstance(nav, list):
        for item in nav:
            _collect_nav_titles(item, titles)
        return

    if not isinstance(nav, dict):
        return

    for label, value in nav.items():
        if isinstance(value, str) and value.endswith(".md"):
            titles[value] = str(label)
        else:
            _collect_nav_titles(value, titles)


def _clean_title(title: str) -> str:
    title = re.sub(r"<[^>]+>", "", title)
    title = re.sub(r"[*_`#\[\]]", "", title)
    return title.strip()


def _fallback_title(source_path: Path) -> str:
    try:
        source = source_path.read_text(encoding="utf-8")
    except OSError:
        return source_path.stem

    frontmatter = re.match(r"\A---\s*\n(?P<meta>.*?)\n---\s*\n", source, re.DOTALL)
    if frontmatter:
        title_match = re.search(r"^title\s*:\s*[\"']?(.*?)[\"']?\s*$", frontmatter.group("meta"), re.MULTILINE)
        if title_match:
            return _clean_title(title_match.group(1))

    heading = re.search(r"^#\s+(.+?)\s*$", source, re.MULTILINE)
    return _clean_title(heading.group(1)) if heading else source_path.stem


def _documentation_files(files: Iterable[Any]) -> dict[str, Any]:
    return {
        file.src_uri: file
        for file in files
        if getattr(file, "src_uri", "").endswith(".md")
    }


def _git_updates(repo_root: Path, documentation_files: dict[str, Any]) -> list[tuple[str, str]]:
    result = subprocess.run(
        [
            "git",
            "-c",
            "core.quotepath=false",
            "log",
            "--format=@@%cI",
            "--name-only",
            "--",
            "docs",
        ],
        cwd=repo_root,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )

    updates: list[tuple[str, str]] = []
    seen: set[str] = set()
    commit_time = ""

    for line in result.stdout.splitlines():
        if line.startswith("@@"):
            commit_time = line[2:]
            continue
        if not commit_time or not line.startswith("docs/") or not line.endswith(".md"):
            continue

        source_uri = line.removeprefix("docs/")
        if source_uri == "index.md" or source_uri in seen or source_uri not in documentation_files:
            continue

        seen.add(source_uri)
        updates.append((source_uri, commit_time))
        if len(updates) >= RECENT_UPDATES_LIMIT:
            break

    return updates


def _render_recent_updates(page: Any, config: Any, files: Iterable[Any]) -> str:
    repo_root = Path(config.config_file_path).resolve().parent
    documentation_files = _documentation_files(files)
    nav_titles: dict[str, str] = {}
    _collect_nav_titles(config.get("nav", []), nav_titles)

    try:
        updates = _git_updates(repo_root, documentation_files)
    except (OSError, subprocess.SubprocessError) as error:
        log.warning("无法从 Git 读取最近更新：%s", error)
        return '<p class="recent-updates__empty">暂无更新记录。</p>'

    if not updates:
        return '<p class="recent-updates__empty">暂无更新记录。</p>'

    items = []
    for source_uri, commit_time in updates:
        file = documentation_files[source_uri]
        title = nav_titles.get(source_uri) or _fallback_title(repo_root / "docs" / source_uri)
        try:
            display_time = datetime.fromisoformat(commit_time).strftime("%Y-%m-%d %H:%M")
        except ValueError:
            display_time = commit_time

        items.append(
            "<li>"
            f'<a href="{escape(file.url, quote=True)}">{escape(title)}</a>'
            f'<time datetime="{escape(commit_time, quote=True)}" aria-label="更新时间 {escape(display_time)}">'
            f"{escape(display_time)}</time>"
            "</li>"
        )

    return '<ul class="recent-updates" aria-label="最近更新的页面">' + "".join(items) + "</ul>"


def on_page_markdown(markdown: str, page: Any, config: Any, files: Iterable[Any], **_: Any) -> str:
    """Replace the homepage marker with a Git-backed list of Markdown pages."""
    if page.file.src_uri != "index.md" or RECENT_UPDATES_MARKER not in markdown:
        return markdown

    return markdown.replace(RECENT_UPDATES_MARKER, _render_recent_updates(page, config, files), 1)


@event_priority(100)
def on_page_content(html: str, **_: Any) -> str:
    """Keep unusually large code dumps out of the client-side search index."""

    def exclude_large_code(match: re.Match[str]) -> str:
        attrs = match.group("attrs")
        if "data-search-exclude" in attrs:
            return match.group(0)

        visible_text = unescape(re.sub(r"<[^>]+>", "", match.group(0)))
        if len(visible_text) < SEARCH_CODE_LIMIT:
            return match.group(0)

        return match.group(0).replace(f"<pre{attrs}", f'<pre{attrs} data-search-exclude="true"', 1)

    return PRE_BLOCK_PATTERN.sub(exclude_large_code, html)
