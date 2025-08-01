// Theme Toggle Functionality
(function() {
    'use strict';
    
    // Theme constants
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };
    
    const STORAGE_KEY = 'uma-musume-theme';
    
    // Get system preference
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
    }
    
    // Get saved theme or system preference
    function getSavedTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved || getSystemTheme();
    }
    
    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle button state
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            toggleButton.setAttribute('aria-label', 
                theme === THEMES.DARK ? 'Switch to light mode' : 'Switch to dark mode'
            );
            toggleButton.setAttribute('title', 
                theme === THEMES.DARK ? 'Switch to light mode' : 'Switch to dark mode'
            );
        }
    }
    
    // Save theme preference
    function saveTheme(theme) {
        localStorage.setItem(STORAGE_KEY, theme);
    }
    
    // Toggle between themes
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || THEMES.LIGHT;
        const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        
        applyTheme(newTheme);
        saveTheme(newTheme);
    }
    
    // Create theme toggle button
    function createThemeToggle() {
        // Check if theme toggle already exists
        const existingToggle = document.querySelector('.theme-toggle');
        if (existingToggle) {
            return existingToggle;
        }

        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        button.setAttribute('title', 'Toggle theme');
        
        // Add SVG icons for light and dark modes
        button.innerHTML = `
            <svg class="theme-icon light-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="m12 1 0 2"/>
                <path d="m12 21 0 2"/>
                <path d="m4.22 4.22 1.42 1.42"/>
                <path d="m18.36 18.36 1.42 1.42"/>
                <path d="m1 12 2 0"/>
                <path d="m21 12 2 0"/>
                <path d="m4.22 19.78 1.42-1.42"/>
                <path d="m18.36 5.64 1.42-1.42"/>
            </svg>
            <svg class="theme-icon dark-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;
        
        button.addEventListener('click', toggleTheme);
        
        // Add to navigation controls container
        const navControls = document.querySelector('.nav-controls');
        if (navControls) {
            navControls.appendChild(button);
        } else {
            // Fallback to main nav if nav-controls doesn't exist
            const nav = document.querySelector('.main-nav');
            if (nav) {
                nav.appendChild(button);
            }
        }
        
        return button;
    }
    
    // Listen for system theme changes
    function watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only update if user hasn't manually set a preference
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
            }
        });
    }
    
    // Initialize theme system
    function initTheme() {
        // Apply saved or system theme immediately to prevent flash
        const theme = getSavedTheme();
        applyTheme(theme);
        
        // Create toggle button
        createThemeToggle();
        
        // Watch for system theme changes
        watchSystemTheme();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();