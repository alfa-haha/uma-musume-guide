// Back to Top Functionality
(function() {
    'use strict';
    
    // Create back to top button
    function createBackToTopButton() {
        const button = document.createElement('a');
        button.href = '#';
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.setAttribute('title', 'Back to top');
        
        // Prevent default link behavior and scroll to top
        button.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToTop();
        });
        
        document.body.appendChild(button);
        return button;
    }
    
    // Smooth scroll to top function
    function scrollToTop() {
        const scrollDuration = 500;
        const scrollStep = -window.scrollY / (scrollDuration / 15);
        
        function scrollAnimation() {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep);
                requestAnimationFrame(scrollAnimation);
            }
        }
        
        // Use modern smooth scroll if supported, fallback to animation
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            requestAnimationFrame(scrollAnimation);
        }
    }
    
    // Show/hide button based on scroll position
    function toggleButtonVisibility(button) {
        const scrollThreshold = 300; // Show button after scrolling 300px
        
        if (window.scrollY > scrollThreshold) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    }
    
    // Initialize back to top functionality
    function initBackToTop() {
        const button = createBackToTopButton();
        
        // Throttle scroll event for better performance
        let ticking = false;
        
        function handleScroll() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    toggleButtonVisibility(button);
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
        toggleButtonVisibility(button);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackToTop);
    } else {
        initBackToTop();
    }
})();