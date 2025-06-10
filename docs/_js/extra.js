
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

// 页面增强功能
document.addEventListener('DOMContentLoaded', function() {
    // 添加平滑滚动
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // 图片懒加载和点击放大
    const images = document.querySelectorAll('.md-typeset img');
    images.forEach(img => {
        // 添加加载状态
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        // 点击图片放大
        // img.addEventListener('click', function() {
        //     if (this.style.transform === 'scale(1.5)') {
        //         this.style.transform = 'scale(1)';
        //         this.style.zIndex = 'auto';
        //         this.style.position = 'relative';
        //     } else {
        //         this.style.transform = 'scale(1.5)';
        //         this.style.zIndex = '1000';
        //         this.style.position = 'relative';
        //         this.style.transition = 'all 0.3s ease';
        //     }
        // });
    });
    
    // 代码块复制功能增强
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
    });
    
    // 为链接添加外部链接图标
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    externalLinks.forEach(link => {
        if (!link.querySelector('.external-icon')) {
            const icon = document.createElement('span');
            icon.innerHTML = ' ↗';
            icon.className = 'external-icon';
            icon.style.fontSize = '0.8em';
            icon.style.opacity = '0.7';
            link.appendChild(icon);
        }
    });
    
    // 添加阅读进度条
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
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    // 更新阅读进度
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
    
    // 为表格添加响应式包装
    const tables = document.querySelectorAll('.md-typeset table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            wrapper.style.cssText = `
                overflow-x: auto;
                margin: 1rem 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            `;
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // 添加返回顶部按钮动画
    const backToTop = document.querySelector('.md-top');
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            const startY = window.scrollY;
            const targetY = 0;
            const distance = targetY - startY;
            const duration = Math.min(Math.abs(distance) / 2, 500);
            let start = null;
            
            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                window.scrollTo(0, startY + distance * ease);
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            
            requestAnimationFrame(step);
        });
    }
    
    // 添加打字机效果到标题
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // 为主页英雄标题添加打字机效果
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }
});

// 主题切换动画
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('[data-md-component="palette"]');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
    }
});
