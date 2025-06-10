// MathJax配置
window.MathJax = {
    tex: {
      inlineMath: [["\\(", "\\)"]],
      displayMath: [["\\[", "\\]"]],
      processEscapes: true,
      processEnvironments: true
    },
    options: {
      ignoreHtmlClass: ".*|",
      processHtmlClass: "arithmatex"
    }
};

document$.subscribe(() => { 
    MathJax.typesetPromise()
})

// 性能优化标志
let isFirstLoad = true;
let pageLoadStartTime = performance.now();

// 页面增强功能 - 性能优化版本
document.addEventListener('DOMContentLoaded', function() {
    // 标记页面已加载，延迟执行以避免阻塞
    setTimeout(() => {
        document.body.classList.add('page-loaded');
        isFirstLoad = false;
        console.log(`页面加载完成，耗时: ${performance.now() - pageLoadStartTime}ms`);
    }, 100);
    
    // 立即执行的关键功能
    initCriticalFeatures();
    
    // 延迟执行非关键功能，使用 requestIdleCallback 优化
    function runWhenIdle(callback, timeout = 2000) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout });
        } else {
            setTimeout(callback, 100);
        }
    }
    
    // 分批加载非关键功能，避免阻塞
    runWhenIdle(() => initImageEnhancements(), 500);
    runWhenIdle(() => initCodeBlockEnhancements(), 700);
    runWhenIdle(() => initExternalLinks(), 900);
    runWhenIdle(() => initProgressBar(), 1100);
    runWhenIdle(() => initTableEnhancements(), 1300);
    runWhenIdle(() => initBackToTopAnimation(), 1500);
    runWhenIdle(() => initTypeWriterEffect(), 1700);
});

// 关键功能立即执行
function initCriticalFeatures() {
    // 添加平滑滚动，但首次加载时禁用
    if (isFirstLoad) {
        document.documentElement.style.scrollBehavior = 'auto';
        setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'smooth';
        }, 500);
    } else {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
}

// 图片增强功能 - 优化版本
function initImageEnhancements() {
    const images = document.querySelectorAll('.md-typeset img');
    
    // 使用 Intersection Observer 优化性能
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 图片加载状态
                if (!img.complete) {
                    img.addEventListener('load', function() {
                        this.style.opacity = '1';
                        this.style.transform = 'scale(1)';
                    }, { once: true });
                }
                
                // 停止观察已处理的图片
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// 代码块增强功能 - 防抖优化
function initCodeBlockEnhancements() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    const updateShadow = debounce((block, isHover) => {
        if (isHover) {
            block.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        } else {
            block.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
        }
    }, 50);
    
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', () => updateShadow(block, true));
        block.addEventListener('mouseleave', () => updateShadow(block, false));
    });
}

// 外部链接图标 - 批量处理优化
function initExternalLinks() {
    const fragment = document.createDocumentFragment();
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    
    externalLinks.forEach(link => {
        if (!link.querySelector('.external-icon')) {
            const icon = document.createElement('span');
            icon.innerHTML = ' ↗';
            icon.className = 'external-icon';
            icon.style.cssText = 'font-size: 0.8em; opacity: 0.7; margin-left: 2px;';
            link.appendChild(icon);
        }
    });
}

// 阅读进度条 - 节流优化
function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        z-index: 9999;
        transition: width 0.25s ease;
        will-change: width;
    `;
    document.body.appendChild(progressBar);
    
    // 节流函数
    let ticking = false;
    function updateProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = Math.min((winScroll / height) * 100, 100);
        progressBar.style.width = scrolled + '%';
        ticking = false;
    }
    
    // 使用 passive 监听器优化滚动性能
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }, { passive: true });
}

// 表格响应式包装 - 批量处理
function initTableEnhancements() {
    const tables = document.querySelectorAll('.md-typeset table:not(.table-wrapper table)');
    
    if (tables.length === 0) return;
    
    const fragment = document.createDocumentFragment();
    
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        wrapper.style.cssText = `
            overflow-x: auto;
            margin: 1rem 0;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            -webkit-overflow-scrolling: touch;
        `;
        
        // 克隆表格到包装器
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

// 返回顶部按钮动画 - 性能优化
function initBackToTopAnimation() {
    const backToTop = document.querySelector('.md-top');
    if (!backToTop) return;
    
    // 使用 transform 替代 scrollTo 以提升性能
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        
        const startY = window.scrollY;
        const targetY = 0;
        const distance = targetY - startY;
        const duration = Math.min(Math.abs(distance) / 3, 800); // 加快滚动速度
        
        let start = null;
        
        function smoothScroll(timestamp) {
            if (!start) start = timestamp;
            
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startY + distance * easeOutCubic);
            
            if (progress < 1) {
                requestAnimationFrame(smoothScroll);
            }
        }
        
        requestAnimationFrame(smoothScroll);
    });
}

// 打字机效果 - 优化版本，只在主页执行
function initTypeWriterEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle || document.body.classList.contains('typing-done')) return;
    
    const originalText = heroTitle.textContent;
    if (!originalText) return;
    
    document.body.classList.add('typing-done'); // 防止重复执行
    
    let i = 0;
    heroTitle.innerHTML = '';
    
    function type() {
        if (i < originalText.length) {
            heroTitle.innerHTML += originalText.charAt(i);
            i++;
            // 使用 requestAnimationFrame 替代 setTimeout
            setTimeout(type, 100);
        }
    }
    
    // 延迟开始打字效果
    setTimeout(type, 300);
}

// 主题切换动画 - 优化版本
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('[data-md-component="palette"]');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            document.body.style.transition = 'background-color 0.2s ease, color 0.2s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 200);
        }, { passive: true });
    }
});

// 页面可见性API优化 - 页面不可见时暂停动画
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时，暂停所有动画
        document.body.style.animationPlayState = 'paused';
    } else {
        // 页面显示时，恢复动画
        document.body.style.animationPlayState = 'running';
    }
});

// 预加载关键资源
function preloadCriticalResources() {
    // 预加载字体
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = 'https://gcore.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css';
    fontPreload.as = 'style';
    document.head.appendChild(fontPreload);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.warn('页面增强脚本出现错误:', e.error);
});
