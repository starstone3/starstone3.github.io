(() => {
    "use strict";

    let progressFrame = null;

    function resolveAssetUrl(path) {
        return new URL(path, window.location.href).href;
    }

    function findAsset(selector, url) {
        return Array.from(document.querySelectorAll(selector)).find((asset) => {
            const assetUrl = asset.href || asset.src;
            return assetUrl === url;
        });
    }

    function loadStylesheet(path) {
        const url = resolveAssetUrl(path);
        if (findAsset('link[rel="stylesheet"]', url)) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.dataset.pageStylesheet = "true";
        document.head.appendChild(link);
    }

    function loadScript(path) {
        const url = resolveAssetUrl(path);
        if (findAsset("script[src]", url)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.async = false;
            script.dataset.pageScript = "true";
            script.addEventListener("load", resolve, { once: true });
            script.addEventListener("error", () => {
                reject(new Error(`页面脚本加载失败：${url}`));
            }, { once: true });
            document.body.appendChild(script);
        });
    }

    async function loadPageAssets() {
        const marker = document.querySelector("#page-assets");
        const stylesheetPaths = marker
            ? Array.from(marker.querySelectorAll("[data-page-stylesheet]"), (item) => item.dataset.pageStylesheet)
            : [];
        const scriptPaths = marker
            ? Array.from(marker.querySelectorAll("[data-page-script]"), (item) => item.dataset.pageScript)
            : [];
        const desiredScripts = new Set(scriptPaths.map(resolveAssetUrl));

        document.querySelectorAll("script[data-page-script][src]").forEach((script) => {
            if (!desiredScripts.has(script.src)) {
                script.remove();
            }
        });

        stylesheetPaths.forEach(loadStylesheet);

        try {
            await Promise.all(scriptPaths.map(loadScript));
            if (typeof window.initializeSeQuizPage === "function") {
                window.initializeSeQuizPage();
            }
        } catch (error) {
            console.error(error);
        }
    }

    function addExternalLinkIcons() {
        document.querySelectorAll('article a[href^="http"]').forEach((link) => {
            let target;
            try {
                target = new URL(link.href, window.location.href);
            } catch (_error) {
                return;
            }

            if (
                target.origin === window.location.origin ||
                link.querySelector("img, picture, svg") ||
                link.querySelector(".external-icon") ||
                !link.textContent.trim()
            ) {
                return;
            }

            const icon = document.createElement("span");
            icon.className = "external-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = " ↗";
            link.appendChild(icon);
        });
    }

    function updateReadingProgress() {
        progressFrame = null;
        const progressBar = document.querySelector("#reading-progress");
        if (!progressBar) {
            return;
        }

        const root = document.documentElement;
        const scrollableHeight = root.scrollHeight - root.clientHeight;
        const progress = scrollableHeight > 0
            ? Math.min(100, Math.max(0, (root.scrollTop / scrollableHeight) * 100))
            : 0;
        progressBar.style.width = `${progress}%`;
    }

    function scheduleReadingProgressUpdate() {
        if (progressFrame === null) {
            progressFrame = window.requestAnimationFrame(updateReadingProgress);
        }
    }

    function initializeReadingProgress() {
        let progressBar = document.querySelector("#reading-progress");
        if (!progressBar) {
            progressBar = document.createElement("div");
            progressBar.id = "reading-progress";
            progressBar.setAttribute("aria-hidden", "true");
            document.body.appendChild(progressBar);
        }

        if (document.documentElement.dataset.readingProgressBound !== "true") {
            window.addEventListener("scroll", scheduleReadingProgressUpdate, { passive: true });
            window.addEventListener("resize", scheduleReadingProgressUpdate, { passive: true });
            document.documentElement.dataset.readingProgressBound = "true";
        }
        scheduleReadingProgressUpdate();
    }

    function initializeThemeTransition() {
        const themeToggle = document.querySelector('[data-md-component="palette"]');
        if (!themeToggle || themeToggle.dataset.transitionBound === "true") {
            return;
        }

        themeToggle.addEventListener("change", () => {
            document.body.classList.add("theme-transitioning");
            window.setTimeout(() => {
                document.body.classList.remove("theme-transitioning");
            }, 200);
        });
        themeToggle.dataset.transitionBound = "true";
    }

    function initializePage() {
        loadPageAssets();
        addExternalLinkIcons();
        initializeReadingProgress();
        initializeThemeTransition();
    }

    if (typeof document$ !== "undefined") {
        document$.subscribe(initializePage);
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializePage, { once: true });
    } else {
        initializePage();
    }
})();
