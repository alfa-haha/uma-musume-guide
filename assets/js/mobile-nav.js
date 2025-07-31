// 修复版移动端导航
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        const mobileNavToggle = document.getElementById('mobile-nav-toggle');
        const mobileNavLinks = document.getElementById('mobile-nav-links');
        
        if (!mobileNavToggle || !mobileNavLinks) {
            console.warn('移动端导航元素未找到');
            return;
        }

        // 创建遮罩层
        let overlay = document.getElementById('mobile-nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-nav-overlay';
            overlay.id = 'mobile-nav-overlay';
            document.body.appendChild(overlay);
        }

        function openMenu() {
            mobileNavLinks.classList.add('show');
            overlay.classList.add('show');
            mobileNavToggle.setAttribute('aria-expanded', 'true');
            mobileNavToggle.innerHTML = '✕ Close';
            document.body.style.overflow = 'hidden';
            
            // 添加调试日志
            console.log('菜单已打开');
        }

        function closeMenu() {
            mobileNavLinks.classList.remove('show');
            overlay.classList.remove('show');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            mobileNavToggle.innerHTML = '☰ Menu';
            document.body.style.overflow = '';
            
            // 添加调试日志
            console.log('菜单已关闭');
        }

        // 切换菜单
        mobileNavToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = mobileNavLinks.classList.contains('show');
            
            if (isExpanded) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // 点击遮罩关闭
        overlay.addEventListener('click', closeMenu);

        // 点击链接导航 - 修复版本
        const navLinks = mobileNavLinks.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                console.log('链接被点击:', this.href);
                // 不阻止默认行为，让浏览器正常跳转
                closeMenu();
                // 确保没有阻止事件传播
            });
        });

        // 点击外部关闭 - 使用setTimeout避免冲突
        document.addEventListener('click', function(event) {
            setTimeout(() => {
                if (!mobileNavToggle.contains(event.target) && 
                    !mobileNavLinks.contains(event.target) && 
                    mobileNavLinks.classList.contains('show')) {
                    closeMenu();
                }
            }, 0);
        });

        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNavLinks.classList.contains('show')) {
                closeMenu();
            }
        });

        // 窗口大小改变时关闭
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });

        // 初始化状态
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavToggle.innerHTML = '☰ Menu';
        
        console.log('移动端导航已初始化完成');
    });
})();