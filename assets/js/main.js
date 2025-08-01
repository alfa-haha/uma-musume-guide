// Uma Musume Guide - Main JavaScript File

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Uma Musume Guide initialized');
    
    // Initialize image optimization first
    ImageOptimizer.init();
    
    // Initialize responsive navigation
    initializeNavigation();
    
    // Initialize character comparison if on main page
    if (document.getElementById('comparison')) {
        initializeCharacterComparison();
    }
    
    // Initialize image error handling (legacy support)
    initializeImageErrorHandling();
});

// ========================================
// IMAGE PROCESSING AND OPTIMIZATION
// ========================================

// Image optimization configuration
const ImageOptimizer = {
    // Supported formats in order of preference
    supportedFormats: ['webp', 'jpg', 'png'],
    
    // Image size variants
    sizeVariants: {
        thumbnail: { width: 150, height: 150, suffix: '_thumb' },
        portrait: { width: 300, height: 375, suffix: '_portraits' },
        full: { width: 600, height: 750, suffix: '_full' }
    },
    
    // Lazy loading configuration
    lazyLoadConfig: {
        rootMargin: '50px',
        threshold: 0.1
    },
    
    // WebP support detection
    webpSupported: null,
    
    // High DPI detection
    isHighDPI: window.devicePixelRatio > 1,
    
    // Initialize image optimization
    init() {
        this.detectWebPSupport();
        this.initializeLazyLoading();
        this.setupImageErrorHandling();
        this.preloadCriticalImages();
        
        console.log('Image optimization initialized', {
            webpSupported: this.webpSupported,
            isHighDPI: this.isHighDPI,
            devicePixelRatio: window.devicePixelRatio
        });
    },
    
    // Detect WebP support
    detectWebPSupport() {
        return new Promise((resolve) => {
            const webp = new Image();
            webp.onload = webp.onerror = () => {
                this.webpSupported = (webp.height === 2);
                document.documentElement.classList.add(
                    this.webpSupported ? 'webp-supported' : 'webp-not-supported'
                );
                resolve(this.webpSupported);
            };
            webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    },
    
    // Initialize lazy loading with Intersection Observer
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, this.lazyLoadConfig);
            
            // Observe all lazy images
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
            
            // Store observer for future use
            this.imageObserver = imageObserver;
        } else {
            // Fallback for browsers without Intersection Observer
            this.loadAllImages();
        }
    },
    
    // Load image with optimization
    loadImage(img) {
        const originalSrc = img.dataset.src || img.src;
        const optimizedSrc = this.getOptimizedImageSrc(originalSrc, img);
        
        // Show loading state
        this.showLoadingState(img);
        
        // Create new image for preloading
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            img.src = optimizedSrc;
            img.classList.add('loaded');
            img.classList.remove('loading');
            this.hideLoadingState(img);
        };
        
        imageLoader.onerror = () => {
            this.handleImageError(img, originalSrc);
        };
        
        // Start loading
        imageLoader.src = optimizedSrc;
    },
    
    // Get optimized image source
    getOptimizedImageSrc(originalSrc, img) {
        if (!originalSrc) return this.getPlaceholderSrc(img);
        
        // Determine image type from classes or size
        const imageType = this.getImageType(img);
        const sizeConfig = this.sizeVariants[imageType];
        
        // Build optimized path
        let optimizedSrc = originalSrc;
        
        // Add high DPI suffix if supported
        if (this.isHighDPI && sizeConfig) {
            optimizedSrc = this.addHighDPISuffix(optimizedSrc);
        }
        
        // Convert to WebP if supported
        if (this.webpSupported) {
            optimizedSrc = this.convertToWebP(optimizedSrc);
        }
        
        return optimizedSrc;
    },
    
    // Determine image type from element
    getImageType(img) {
        if (img.classList.contains('character-thumbnail')) return 'thumbnail';
        if (img.classList.contains('character-portrait')) return 'portrait';
        if (img.classList.contains('character-full-image')) return 'full';
        if (img.classList.contains('character-avatar')) return 'thumbnail';
        
        // Default based on size
        const width = img.width || img.offsetWidth;
        if (width <= 150) return 'thumbnail';
        if (width <= 300) return 'portrait';
        return 'full';
    },
    
    // Add high DPI suffix
    addHighDPISuffix(src) {
        const parts = src.split('.');
        const extension = parts.pop();
        const basePath = parts.join('.');
        return `${basePath}@2x.${extension}`;
    },
    
    // Convert to WebP format
    convertToWebP(src) {
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    },
    
    // Show loading state
    showLoadingState(img) {
        img.classList.add('loading');
        img.style.background = 'var(--pale-pink)';
        
        // Add skeleton loading animation
        if (!img.classList.contains('image-skeleton')) {
            img.classList.add('image-skeleton');
        }
    },
    
    // Hide loading state
    hideLoadingState(img) {
        img.classList.remove('loading', 'image-skeleton');
        img.style.background = '';
    },
    
    // Enhanced image error handling
    handleImageError(img, originalSrc) {
        // Prevent infinite error loops
        if (img.dataset.errorHandled) {
            return;
        }
        img.dataset.errorHandled = 'true';
        
        console.warn('Image failed to load:', originalSrc);
        
        // Try fallback formats and case variations
        this.tryFallbackFormats(img, originalSrc)
            .then(fallbackSrc => {
                if (fallbackSrc) {
                    img.src = fallbackSrc;
                    img.classList.add('loaded');
                } else {
                    this.setPlaceholderImage(img);
                }
            })
            .catch(() => {
                this.setPlaceholderImage(img);
            });
    },
    
    // Try fallback image formats and case variations
    async tryFallbackFormats(img, originalSrc) {
        const pathParts = originalSrc.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const basePath = pathParts.slice(0, -1).join('/');
        const baseName = fileName.replace(/\.(webp|jpg|jpeg|png)$/i, '');
        const extension = fileName.match(/\.(webp|jpg|jpeg|png)$/i)?.[1] || 'jpg';
        
        // Try different case variations and formats
        const variations = [
            // Original format variations
            `${basePath}/${baseName}.${extension}`,
            `${basePath}/${baseName}.jpg`,
            `${basePath}/${baseName}.png`,
            
            // Case variations
            `${basePath}/${this.toPascalCase(baseName)}.${extension}`,
            `${basePath}/${this.toPascalCase(baseName)}.jpg`,
            `${basePath}/${this.toPascalCase(baseName)}.png`,
            
            // Lowercase variations
            `${basePath}/${baseName.toLowerCase()}.${extension}`,
            `${basePath}/${baseName.toLowerCase()}.jpg`,
            `${basePath}/${baseName.toLowerCase()}.png`,
            
            // Remove WebP and try JPG
            originalSrc.replace(/\.webp$/i, '.jpg'),
            originalSrc.replace(/\.webp$/i, '.png')
        ];
        
        // Remove duplicates
        const uniqueVariations = [...new Set(variations)];
        
        for (const fallbackSrc of uniqueVariations) {
            if (fallbackSrc !== originalSrc && await this.testImageExists(fallbackSrc)) {
                console.log(`Found fallback image: ${originalSrc} -> ${fallbackSrc}`);
                return fallbackSrc;
            }
        }
        
        return null;
    },
    
    // Convert string to PascalCase (for filename variations)
    toPascalCase(str) {
        return str.split(/[_\s-]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_');
    },
    
    // Test if image exists
    testImageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    },
    
    // Set placeholder image
    setPlaceholderImage(img) {
        const placeholderSrc = this.getPlaceholderSrc(img);
        img.src = placeholderSrc;
        img.alt = 'Character image unavailable';
        img.classList.add('error', 'placeholder-image');
        img.classList.remove('loading', 'image-skeleton');
        
        // Add visual indicators
        img.style.opacity = '0.7';
        img.style.filter = 'grayscale(20%)';
    },
    
    // Get appropriate placeholder
    getPlaceholderSrc(img) {
        const imageType = this.getImageType(img);
        
        switch (imageType) {
            case 'thumbnail':
                return 'assets/images/placeholders/placeholder_thumbnail.svg';
            case 'portrait':
            case 'full':
            default:
                return 'assets/images/placeholders/placeholder_character.svg';
        }
    },
    
    // Setup global image error handling
    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target, e.target.src);
            }
        }, true);
    },
    
    // Preload critical images
    preloadCriticalImages() {
        // Preload placeholder images
        this.preloadImage('assets/images/placeholders/placeholder_character.svg');
        this.preloadImage('assets/images/placeholders/placeholder_thumbnail.svg');
        
        // Preload first few character thumbnails
        const firstCharacters = document.querySelectorAll('.character-thumbnail, .character-avatar');
        Array.from(firstCharacters).slice(0, 4).forEach(img => {
            const src = img.dataset.src || img.src;
            if (src) {
                this.preloadImage(this.getOptimizedImageSrc(src, img));
            }
        });
    },
    
    // Preload single image
    preloadImage(src) {
        if (!src) return;
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    },
    
    // Load all images (fallback)
    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
    },
    
    // Progressive image loading
    setupProgressiveLoading(img, lowQualitySrc, highQualitySrc) {
        const container = document.createElement('div');
        container.className = 'progressive-image';
        
        const placeholder = document.createElement('img');
        placeholder.className = 'progressive-image-placeholder';
        placeholder.src = lowQualitySrc;
        
        const mainImage = document.createElement('img');
        mainImage.className = 'progressive-image-main';
        mainImage.onload = () => {
            mainImage.classList.add('loaded');
        };
        mainImage.src = highQualitySrc;
        
        container.appendChild(placeholder);
        container.appendChild(mainImage);
        
        img.parentNode.replaceChild(container, img);
    },
    
    // Observe new images (for dynamic content)
    observeNewImages(container) {
        if (this.imageObserver) {
            container.querySelectorAll('img[data-src]').forEach(img => {
                this.imageObserver.observe(img);
            });
        }
    }
};

// Legacy functions for backward compatibility
function initializeImageErrorHandling() {
    ImageOptimizer.init();
}

function createPlaceholderImages() {
    // Set placeholder image paths for backward compatibility
    window.PLACEHOLDER_CHARACTER = 'assets/images/placeholders/placeholder_character.svg';
    window.PLACEHOLDER_THUMBNAIL = 'assets/images/placeholders/placeholder_thumbnail.svg';
}

function testImageExists(src, callback) {
    ImageOptimizer.testImageExists(src).then(callback);
}

function handleImageError(img) {
    ImageOptimizer.handleImageError(img, img.src);
}

// Navigation functionality
function initializeNavigation() {
    // Handle responsive navigation
    const nav = document.querySelector('nav');
    if (nav) {
        // Add mobile menu functionality (to be implemented in later tasks)
        console.log('Navigation initialized');
    }
}

// Character comparison initialization
async function initializeCharacterComparison() {
    console.log('Initializing character comparison system...');
    
    try {
        // Load character data
        const data = await UmaMusumeGuide.loadCharacterData();
        
        // Initialize character selector
        const characterSelector = new CharacterSelector('character-selector', data.characters);
        await characterSelector.initialize();
        
        // Store reference in UmaMusumeGuide
        UmaMusumeGuide.characterSelector = characterSelector;
        
        // Show cache status indicator
        showCacheStatus();
        
        console.log('Character comparison system initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize character comparison:', error);
        
        // Show error state
        const characterSelectorElement = document.getElementById('character-selector');
        if (characterSelectorElement) {
            characterSelectorElement.innerHTML = `
                <div class="selector-placeholder" style="color: #ff6b6b;">
                    ❌ Failed to load character data<br>
                    <small>Please check your connection and refresh the page</small>
                </div>
            `;
        }
    }
}

// Show cache status indicator
function showCacheStatus() {
    const status = UmaMusumeGuide.getCacheStatus();
    
    // Create cache status indicator
    let statusIndicator = document.querySelector('.cache-status');
    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.className = 'cache-status';
        document.body.appendChild(statusIndicator);
    }
    
    if (status.cached) {
        const ageMinutes = Math.floor(status.age / (1000 * 60));
        statusIndicator.textContent = `Data cached ${ageMinutes}m ago`;
        statusIndicator.classList.add('cached');
        
        if (status.expired) {
            statusIndicator.classList.add('expired');
            statusIndicator.textContent += ' (expired)';
        }
    } else {
        statusIndicator.textContent = 'Fresh data loaded';
        statusIndicator.classList.remove('cached', 'expired');
    }
    
    // Show indicator
    statusIndicator.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        statusIndicator.classList.remove('show');
    }, 5000);
}

// Data loading and caching functionality
class DataLoader {
    constructor() {
        this.cacheKey = 'uma_musume_characters';
        this.cacheTimestampKey = 'uma_musume_cache_timestamp';
        this.cacheExpiryHours = 24; // Cache expires after 24 hours
        this.dataUrl = '/assets/data/characters.json';
    }

    /**
     * Load character data with caching mechanism
     */
    async loadCharacterData() {
        try {
            // Check if we have valid cached data first
            const cachedData = this.getCachedData();
            if (cachedData) {
                console.log('Loading character data from cache');
                return cachedData;
            }

            // Fetch fresh data from server
            console.log('Fetching fresh character data from server');
            const response = await fetch(this.dataUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate data structure
            if (!this.validateDataStructure(data)) {
                throw new Error('Invalid data structure received');
            }

            // Cache the fresh data
            this.setCachedData(data);
            
            console.log(`Successfully loaded ${data.characters.length} characters`);
            return data;

        } catch (error) {
            console.error('Failed to load character data:', error);
            
            // Try to load from cache as fallback
            const fallbackData = this.getCachedData(true); // Force load even if expired
            if (fallbackData) {
                console.warn('Using expired cached data as fallback');
                return fallbackData;
            }

            // If no cache available, show user-friendly error
            this.showErrorMessage('Unable to load character data. Please check your connection and refresh the page.');
            throw error;
        }
    }

    /**
     * Get cached data if valid
     */
    getCachedData(ignoreExpiry = false) {
        try {
            const cachedDataStr = localStorage.getItem(this.cacheKey);
            const cacheTimestamp = localStorage.getItem(this.cacheTimestampKey);

            if (!cachedDataStr || !cacheTimestamp) {
                return null;
            }

            // Check if cache is expired
            if (!ignoreExpiry) {
                const cacheAge = Date.now() - parseInt(cacheTimestamp);
                const maxAge = this.cacheExpiryHours * 60 * 60 * 1000; // Convert to milliseconds
                
                if (cacheAge > maxAge) {
                    console.log('Cache expired, will fetch fresh data');
                    return null;
                }
            }

            const cachedData = JSON.parse(cachedDataStr);
            
            // Validate cached data structure
            if (!this.validateDataStructure(cachedData)) {
                console.warn('Invalid cached data structure, clearing cache');
                this.clearCache();
                return null;
            }

            return cachedData;

        } catch (error) {
            console.error('Error reading cached data:', error);
            this.clearCache();
            return null;
        }
    }

    /**
     * Cache data to localStorage
     */
    setCachedData(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
            localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
            console.log('Character data cached successfully');
        } catch (error) {
            console.error('Failed to cache data:', error);
            // Continue without caching if localStorage is full or unavailable
        }
    }

    /**
     * Clear cached data
     */
    clearCache() {
        try {
            localStorage.removeItem(this.cacheKey);
            localStorage.removeItem(this.cacheTimestampKey);
            console.log('Cache cleared');
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    /**
     * Validate data structure matches expected format
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        if (!Array.isArray(data.characters)) {
            return false;
        }

        // Validate at least one character has required fields
        if (data.characters.length > 0) {
            const firstChar = data.characters[0];
            const requiredFields = ['id', 'name', 'stats', 'skills'];
            
            for (const field of requiredFields) {
                if (!(field in firstChar)) {
                    console.error(`Missing required field: ${field}`);
                    return false;
                }
            }

            // Validate stats structure
            if (!firstChar.stats || typeof firstChar.stats !== 'object') {
                return false;
            }

            const requiredStats = ['speed', 'stamina', 'power', 'guts', 'wisdom'];
            for (const stat of requiredStats) {
                if (typeof firstChar.stats[stat] !== 'number') {
                    console.error(`Invalid stat field: ${stat}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Data Loading Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-button">Retry</button>
            </div>
        `;

        // Insert error message at the top of the page
        const main = document.querySelector('main') || document.body;
        main.insertBefore(errorDiv, main.firstChild);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }

    /**
     * Get cache status information
     */
    getCacheStatus() {
        const cacheTimestamp = localStorage.getItem(this.cacheTimestampKey);
        if (!cacheTimestamp) {
            return { cached: false };
        }

        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        const maxAge = this.cacheExpiryHours * 60 * 60 * 1000;
        
        return {
            cached: true,
            age: cacheAge,
            expired: cacheAge > maxAge,
            expiresIn: maxAge - cacheAge
        };
    }
}

// Character Selector Class
class CharacterSelector {
    constructor(containerId, characters) {
        this.container = document.getElementById(containerId);
        this.characters = characters || [];
        this.filteredCharacters = [...this.characters];
        this.selectedCharacters = [];
        this.maxSelections = 4;
        
        // DOM elements (will be set during initialization)
        this.searchInput = null;
        this.searchClear = null;
        this.typeFilter = null;
        this.rarityFilter = null;
        this.characterList = null;
    }
    
    async initialize() {
        if (!this.container) {
            throw new Error('Character selector container not found');
        }
        
        // Get DOM elements
        this.searchInput = this.container.querySelector('#character-search');
        this.searchClear = this.container.querySelector('#search-clear');
        this.typeFilter = this.container.querySelector('#type-filter');
        this.rarityFilter = this.container.querySelector('#rarity-filter');
        this.resetButton = this.container.querySelector('#reset-selection');
        this.characterList = this.container.querySelector('#character-list');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderCharacterList();
        this.updateSelectedDisplay();
        
        console.log(`Character selector initialized with ${this.characters.length} characters`);
    }
    
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.searchInput.value = '';
                this.handleSearch('');
            });
        }
        
        // Filter functionality
        if (this.typeFilter) {
            this.typeFilter.addEventListener('change', (e) => {
                this.handleFilter();
            });
        }
        
        if (this.rarityFilter) {
            this.rarityFilter.addEventListener('change', (e) => {
                this.handleFilter();
            });
        }
        
        // Reset button functionality
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                this.handleReset();
            });
        }
    }
    
    handleSearch(query) {
        const lowerQuery = query.toLowerCase().trim();
        
        if (lowerQuery === '') {
            this.filteredCharacters = [...this.characters];
        } else {
            this.filteredCharacters = this.characters.filter(character => 
                character.name.toLowerCase().includes(lowerQuery) ||
                character.nameJp.toLowerCase().includes(lowerQuery)
            );
        }
        
        // Apply current filters
        this.applyFilters();
        this.renderCharacterList();
    }
    
    handleFilter() {
        this.applyFilters();
        this.renderCharacterList();
    }
    
    applyFilters() {
        let filtered = [...this.characters];
        
        // Apply search filter
        const searchQuery = this.searchInput?.value.toLowerCase().trim() || '';
        if (searchQuery) {
            filtered = filtered.filter(character => 
                character.name.toLowerCase().includes(searchQuery) ||
                character.nameJp.toLowerCase().includes(searchQuery)
            );
        }
        
        // Apply type filter
        const typeFilter = this.typeFilter?.value || '';
        if (typeFilter) {
            filtered = filtered.filter(character => character.type === typeFilter);
        }
        
        // Apply rarity filter
        const rarityFilter = this.rarityFilter?.value || '';
        if (rarityFilter) {
            filtered = filtered.filter(character => character.rarity.toString() === rarityFilter);
        }
        
        this.filteredCharacters = filtered;
    }
    
    renderCharacterList() {
        if (!this.characterList) return;
        
        if (this.filteredCharacters.length === 0) {
            this.characterList.innerHTML = `
                <div class="no-results">
                    <h4>No characters found</h4>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        const charactersHTML = this.filteredCharacters.map(character => {
            const isSelected = this.selectedCharacters.some(selected => selected.id === character.id);
            const isDisabled = !isSelected && this.selectedCharacters.length >= this.maxSelections;
            
            return `
                <div class="character-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                     data-character-id="${character.id}">
                    <img src="${character.thumbnail}" 
                         alt="${character.name}" 
                         class="character-thumbnail"
                         loading="lazy"
                         onerror="this.src='assets/images/placeholders/placeholder_thumbnail.svg'">
                    <div class="character-info">
                        <div class="character-name">${character.name}</div>
                        <div class="character-details">
                            <span class="character-type">${character.type}</span>
                            <span class="character-rarity">${character.rarity}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.characterList.innerHTML = charactersHTML;
        
        // Images now load directly, no need for lazy loading observer
        
        // Add click event listeners to character options
        this.characterList.querySelectorAll('.character-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const characterId = option.dataset.characterId;
                this.handleCharacterSelect(characterId);
            });
        });
    }
    
    handleCharacterSelect(characterId) {
        const character = this.characters.find(char => char.id === characterId);
        if (!character) return;
        
        const isSelected = this.selectedCharacters.some(selected => selected.id === characterId);
        
        if (isSelected) {
            // Remove character
            this.removeCharacter(characterId);
        } else {
            // Add character (if not at max)
            if (this.selectedCharacters.length < this.maxSelections) {
                this.addCharacter(character);
            }
        }
    }
    
    addCharacter(character) {
        if (this.selectedCharacters.length >= this.maxSelections) {
            console.warn('Maximum number of characters already selected');
            return;
        }
        
        if (this.selectedCharacters.some(selected => selected.id === character.id)) {
            console.warn('Character already selected');
            return;
        }
        
        this.selectedCharacters.push(character);
        this.updateSelectedDisplay();
        this.renderCharacterList(); // Re-render to update selection states
        
        // Trigger comparison update
        this.onSelectionChange();
        
        console.log(`Added character: ${character.name}`);
    }
    
    removeCharacter(characterId) {
        const index = this.selectedCharacters.findIndex(char => char.id === characterId);
        if (index === -1) return;
        
        const removedCharacter = this.selectedCharacters.splice(index, 1)[0];
        this.updateSelectedDisplay();
        this.renderCharacterList(); // Re-render to update selection states
        
        // Trigger comparison update
        this.onSelectionChange();
        
        console.log(`Removed character: ${removedCharacter.name}`);
    }
    
    clearAllSelected() {
        this.selectedCharacters = [];
        this.updateSelectedDisplay();
        this.renderCharacterList();
        
        // Trigger comparison update
        this.onSelectionChange();
        
        console.log('Cleared all selected characters');
    }
    
    updateSelectedDisplay() {
        // Selected characters are now shown directly in the character-list with .selected class
        // No separate selected list needed
    }
    
    onSelectionChange() {
        // Update comparison table
        const comparisonTableContainer = document.getElementById('comparison-table-container');
        const comparisonGrid = document.getElementById('comparison-grid');
        
        if (this.selectedCharacters.length === 0) {
            // Hide table, show placeholder
            if (comparisonTableContainer) {
                comparisonTableContainer.style.display = 'none';
            }
            if (comparisonGrid) {
                comparisonGrid.innerHTML = `
                    <div class="grid-placeholder">
                        Select characters above to see detailed comparison
                    </div>
                `;
                comparisonGrid.removeAttribute('data-characters');
                comparisonGrid.style.display = 'block';
            }
        } else {
            // Hide placeholder, show table
            if (comparisonGrid) {
                comparisonGrid.style.display = 'none';
            }
            
            // Initialize and render comparison table
            if (!this.comparisonTable) {
                this.comparisonTable = new ComparisonTable('comparison-table-container');
            }
            this.comparisonTable.renderTable(this.selectedCharacters);
        }
        
        // Notify UmaMusumeGuide of selection change
        if (window.UmaMusumeGuide && typeof window.UmaMusumeGuide.onCharacterSelectionChange === 'function') {
            window.UmaMusumeGuide.onCharacterSelectionChange(this.selectedCharacters);
        }
    }
    
    // Public methods
    getSelectedCharacters() {
        return [...this.selectedCharacters];
    }
    
    setSelectedCharacters(characters) {
        this.selectedCharacters = characters.filter(char => 
            this.characters.some(available => available.id === char.id)
        ).slice(0, this.maxSelections);
        
        this.updateSelectedDisplay();
        this.renderCharacterList();
        this.onSelectionChange();
    }
    
    getFilteredCharacters() {
        return [...this.filteredCharacters];
    }
    
    handleReset() {
        // Clear all selections and reset filters
        this.reset();
        
        // Provide user feedback
        console.log('Character selection reset');
        
        // Optional: Show a brief feedback message
        if (this.resetButton) {
            const originalText = this.resetButton.textContent;
            this.resetButton.textContent = 'Reset ✓';
            this.resetButton.style.background = 'var(--grass-green)';
            this.resetButton.style.color = 'var(--white)';
            this.resetButton.style.borderColor = 'var(--grass-green)';
            
            setTimeout(() => {
                this.resetButton.textContent = originalText;
                this.resetButton.style.background = '';
                this.resetButton.style.color = '';
                this.resetButton.style.borderColor = '';
            }, 1000);
        }
    }
    
    reset() {
        this.selectedCharacters = [];
        this.searchInput.value = '';
        this.typeFilter.value = '';
        this.rarityFilter.value = '';
        this.filteredCharacters = [...this.characters];
        
        this.updateSelectedDisplay();
        this.renderCharacterList();
        this.onSelectionChange();
    }
}

// Comparison Table Class
class ComparisonTable {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.table = document.getElementById('comparison-table');
        this.tableHead = document.getElementById('comparison-table-head');
        this.tableBody = document.getElementById('comparison-table-body');
        this.characters = [];
        
        // Data grouping strategy
        this.dataGroups = {
            'Basic Stats': ['speed', 'stamina', 'power', 'guts', 'wisdom'],
            'Aptitudes': ['turf', 'dirt', 'short', 'mile', 'medium', 'long', 'front', 'pace', 'late', 'end'],
            'Skills': ['uniqueSkill', 'awakeningSkills']
        };
    }
    
    renderTable(characters) {
        if (!this.container || !this.table) {
            console.error('Comparison table elements not found');
            return;
        }
        
        this.characters = characters || [];
        
        if (this.characters.length === 0) {
            this.container.style.display = 'none';
            return;
        }
        
        // Show table container
        this.container.style.display = 'block';
        
        // Set data attribute for responsive behavior
        this.table.setAttribute('data-characters', this.characters.length);
        
        // Render table header and body
        this.renderTableHeader();
        this.renderTableBody();
        
        // Setup interactive effects
        this.setupInteractiveEffects();
        
        // Setup remove button handlers
        this.setupRemoveButtons();
        
        // Apply intelligent column width (only for tablet and desktop)
        if (window.innerWidth >= 768) {
            this.adjustColumnWidths();
        } else {
            // On mobile, show scroll indicator if needed
            if (this.characters.length > 1) {
                this.showScrollIndicator();
            }
        }
        
        // Setup window resize handler
        this.setupResizeHandler();
        
        console.log(`Rendered comparison table with ${this.characters.length} characters`);
    }
    
    setupInteractiveEffects() {
        if (!this.tableBody) return;
        
        // Add row hover effects with data highlighting
        const rows = this.tableBody.querySelectorAll('tr:not(.attribute-group-divider)');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                this.highlightRowData(row, true);
            });
            
            row.addEventListener('mouseleave', () => {
                this.highlightRowData(row, false);
            });
        });
    }
    
    highlightRowData(row, highlight) {
        const cells = row.querySelectorAll('td:not(:first-child)');
        
        cells.forEach((cell, index) => {
            if (highlight) {
                // Add subtle glow effect for all cells
                cell.style.boxShadow = '0 0 8px rgba(255, 105, 180, 0.3)';
            } else {
                cell.style.boxShadow = '';
            }
        });
    }
    
    renderTableHeader() {
        if (!this.tableHead) return;
        
        // Create header row
        const headerRow = document.createElement('tr');
        
        // First column: Attribute name
        const attributeHeader = document.createElement('th');
        attributeHeader.textContent = 'Attribute';
        headerRow.appendChild(attributeHeader);
        
        // Character columns
        this.characters.forEach(character => {
            const characterHeader = document.createElement('th');
            characterHeader.innerHTML = `
                <div class="character-header">
                    <button class="character-remove-btn" data-character-id="${character.id}" aria-label="Remove ${character.name}">×</button>
                    <div class="character-avatar-container">
                        <img src="${character.thumbnail}" 
                             alt="${character.name}" 
                             class="character-avatar"
                             loading="lazy"
                             onerror="this.src='assets/images/placeholders/placeholder_thumbnail.svg'">
                    </div>
                    <div class="character-name">${character.name}</div>
                    <div class="character-type type-${character.type}">${this.formatTypeName(character.type)}</div>
                    <div class="character-rarity-stars">${'★'.repeat(character.rarity)}</div>
                </div>
            `;
            headerRow.appendChild(characterHeader);
        });
        
        this.tableHead.innerHTML = '';
        this.tableHead.appendChild(headerRow);
        
        // Images now load directly, no need for lazy loading observer
    }
    
    formatTypeName(type) {
        const typeNames = {
            speed: 'Speed',
            stamina: 'Stamina',
            power: 'Power',
            guts: 'Guts',
            wisdom: 'Wisdom'
        };
        return typeNames[type] || type;
    }
    
    setupRemoveButtons() {
        if (!this.tableHead) return;
        
        const removeButtons = this.tableHead.querySelectorAll('.character-remove-btn');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const characterId = button.dataset.characterId;
                this.removeCharacter(characterId);
            });
        });
    }
    
    removeCharacter(characterId) {
        // Find the character selector and remove the character
        if (window.UmaMusumeGuide && window.UmaMusumeGuide.characterSelector) {
            window.UmaMusumeGuide.characterSelector.removeCharacter(characterId);
        }
    }
    
    adjustColumnWidths() {
        if (!this.table || this.characters.length === 0) return;
        
        const containerWidth = this.container.offsetWidth;
        const characterCount = this.characters.length;
        
        // Get responsive attribute column width
        let attributeColWidth;
        if (window.innerWidth < 768) {
            attributeColWidth = 120; // mobile
        } else if (window.innerWidth < 1024) {
            attributeColWidth = 150; // tablet
        } else {
            attributeColWidth = 180; // desktop
        }
        
        // For mobile, use CSS-based layout instead of JavaScript width setting
        if (window.innerWidth < 768) {
            // Remove any inline styles to let CSS handle the layout completely
            const allCells = this.table.querySelectorAll('th, td');
            allCells.forEach(cell => {
                cell.style.width = '';
                cell.style.minWidth = '';
                cell.style.maxWidth = '';
            });
            
            // Remove any table-level width constraints
            this.table.style.width = '';
            this.table.style.minWidth = '';
            
            // Let CSS variables handle the layout
            // The CSS already defines proper mobile layout with:
            // --attr-col-mobile: 120px and --char-col-min: 140px
            
            // Always show scroll indicator on mobile when there are multiple characters
            if (characterCount > 1) {
                this.showScrollIndicator();
            } else {
                this.hideScrollIndicator();
            }
            return;
        }
        
        // Calculate available width for character columns (tablet and desktop)
        const availableWidth = containerWidth - attributeColWidth - 40; // 40px for padding/borders
        const minCharacterColWidth = 140;
        const idealCharacterColWidth = Math.max(minCharacterColWidth, availableWidth / characterCount);
        
        // Apply calculated widths for tablet and desktop
        const firstCells = this.table.querySelectorAll('th:first-child, td:first-child');
        firstCells.forEach(cell => {
            cell.style.width = `${attributeColWidth}px`;
            cell.style.minWidth = `${attributeColWidth}px`;
        });
        
        // Apply character column widths
        for (let i = 1; i <= characterCount; i++) {
            const characterCells = this.table.querySelectorAll(`th:nth-child(${i + 1}), td:nth-child(${i + 1})`);
            characterCells.forEach(cell => {
                cell.style.width = `${idealCharacterColWidth}px`;
                cell.style.minWidth = `${minCharacterColWidth}px`;
            });
        }
        
        // Enable horizontal scroll if needed
        const totalWidth = attributeColWidth + (idealCharacterColWidth * characterCount);
        if (totalWidth > containerWidth) {
            this.table.style.minWidth = `${totalWidth}px`;
            this.showScrollIndicator();
        } else {
            this.table.style.minWidth = '100%';
            this.hideScrollIndicator();
        }
    }
    
    showScrollIndicator() {
        // Add scroll indicator if not exists
        let indicator = this.container.querySelector('.scroll-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            indicator.innerHTML = '← Scroll to see more →';
            this.container.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }
    
    hideScrollIndicator() {
        const indicator = this.container.querySelector('.scroll-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    showLoadingState() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="table-loading-state">
                <div class="loading-spinner"></div>
                <p>Loading comparison data...</p>
            </div>
        `;
    }
    
    showSkeletonScreen() {
        if (!this.tableBody) return;
        
        // Create skeleton rows
        const skeletonRows = Array.from({ length: 8 }, (_, index) => `
            <tr class="skeleton-row">
                <td class="skeleton-cell">
                    <div class="skeleton-text"></div>
                </td>
                ${Array.from({ length: this.characters.length }, () => `
                    <td class="skeleton-cell">
                        <div class="skeleton-text"></div>
                    </td>
                `).join('')}
            </tr>
        `).join('');
        
        this.tableBody.innerHTML = skeletonRows;
    }
    
    setupResizeHandler() {
        // Remove existing resize handler if any
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Create debounced resize handler
        this.resizeHandler = this.debounce(() => {
            if (this.characters.length > 0) {
                // Only adjust column widths on tablet and desktop
                // Let CSS handle mobile layout completely
                if (window.innerWidth >= 768) {
                    this.adjustColumnWidths();
                } else {
                    // On mobile, just ensure scroll indicator is shown if needed
                    if (this.characters.length > 1) {
                        this.showScrollIndicator();
                    } else {
                        this.hideScrollIndicator();
                    }
                }
            }
        }, 250);
        
        window.addEventListener('resize', this.resizeHandler);
    }
    
    debounce(func, wait) {
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
    
    destroy() {
        // Clean up event listeners
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }
    
    renderTableBody() {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = '';
        
        // Render each data group
        Object.entries(this.dataGroups).forEach(([groupName, attributes], groupIndex) => {
            // Add group divider (except for first group)
            if (groupIndex > 0) {
                this.addGroupDivider(groupName);
            }
            
            // Render attributes in this group
            attributes.forEach(attribute => {
                this.renderAttributeRow(attribute);
            });
        });
    }
    
    addGroupDivider(groupName) {
        const dividerRow = document.createElement('tr');
        dividerRow.className = 'attribute-group-divider';
        
        const dividerCell = document.createElement('td');
        dividerCell.colSpan = this.characters.length + 1;
        dividerCell.innerHTML = `<strong>${groupName}</strong>`;
        dividerCell.style.textAlign = 'center';
        dividerCell.style.background = 'var(--gradient-accent)';
        dividerCell.style.color = 'var(--primary-pink)';
        dividerCell.style.fontWeight = '600';
        dividerCell.style.padding = 'var(--spacing-sm)';
        
        dividerRow.appendChild(dividerCell);
        this.tableBody.appendChild(dividerRow);
    }
    
    renderAttributeRow(attribute) {
        // Special handling for awakening skills - render multiple rows
        if (attribute === 'awakeningSkills') {
            this.renderAwakeningSkillsRows();
            return;
        }
        
        const row = document.createElement('tr');
        
        // Attribute name cell
        const attributeCell = document.createElement('td');
        attributeCell.textContent = this.formatAttributeName(attribute);
        row.appendChild(attributeCell);
        
        // Get values for this attribute from all characters
        const values = this.characters.map(character => this.getAttributeValue(character, attribute));
        
        // Find highest and lowest values for highlighting (only for numeric values)
        const numericValues = values.filter(v => typeof v === 'number');
        const hasNumericValues = numericValues.length > 0;
        const maxValue = hasNumericValues ? Math.max(...numericValues) : null;
        const minValue = hasNumericValues ? Math.min(...numericValues) : null;
        
        // Character value cells
        this.characters.forEach((character, index) => {
            const valueCell = document.createElement('td');
            const value = values[index];
            
            // Format and display value
            valueCell.innerHTML = this.formatAttributeValue(attribute, value);
            
            // Remove highlighting logic - no longer adding stat-highest/stat-lowest classes
            
            row.appendChild(valueCell);
        });
        
        this.tableBody.appendChild(row);
    }
    
    renderAwakeningSkillsRows() {
        // Define the specific awakening skill types we want to display
        const awakeningSkillTypes = ['rare1', 'rare2'];
        const awakeningSkillLabels = {
            'rare1': 'awakening rare1',
            'rare2': 'awakening rare2'
        };
        
        // Check if any characters have awakening skills
        const hasAwakeningSkills = this.characters.some(character => {
            const awakeningSkills = character.awakeningSkills || {};
            return awakeningSkillTypes.some(type => awakeningSkills[type]);
        });
        
        // If no characters have awakening skills, show N/A rows for both types
        if (!hasAwakeningSkills) {
            awakeningSkillTypes.forEach(skillType => {
                const row = document.createElement('tr');
                
                // Attribute name cell
                const attributeCell = document.createElement('td');
                attributeCell.textContent = awakeningSkillLabels[skillType];
                row.appendChild(attributeCell);
                
                // Character value cells - all N/A
                this.characters.forEach(character => {
                    const valueCell = document.createElement('td');
                    valueCell.textContent = 'N/A';
                    row.appendChild(valueCell);
                });
                
                this.tableBody.appendChild(row);
            });
            return;
        }
        
        // Render a row for each awakening skill type (rare1, rare2)
        awakeningSkillTypes.forEach(skillType => {
            const row = document.createElement('tr');
            
            // Attribute name cell
            const attributeCell = document.createElement('td');
            attributeCell.textContent = awakeningSkillLabels[skillType];
            row.appendChild(attributeCell);
            
            // Character value cells
            this.characters.forEach(character => {
                const valueCell = document.createElement('td');
                const awakeningSkills = character.awakeningSkills || {};
                const skill = awakeningSkills[skillType];
                
                if (skill && skill.name) {
                    valueCell.innerHTML = `<span class="skill-name">${skill.name}</span>`;
                } else {
                    valueCell.textContent = 'N/A';
                }
                
                row.appendChild(valueCell);
            });
            
            this.tableBody.appendChild(row);
        });
    }
    
    getAttributeValue(character, attribute) {
        switch (attribute) {
            case 'speed':
            case 'stamina':
            case 'power':
            case 'guts':
            case 'wisdom':
                return character.stats[attribute];
            // Removed rarity and type - now displayed in table header
            case 'turf':
            case 'dirt':
            case 'short':
            case 'mile':
            case 'medium':
            case 'long':
            case 'front':
            case 'pace':
            case 'late':
            case 'end':
                return character.aptitudes?.[attribute] || 'N/A';
            case 'uniqueSkill':
                return character.uniqueSkill?.name || 'N/A';
            case 'awakeningSkills':
                // This will be handled by renderAwakeningSkillsRows
                return null;
            default:
                return 'N/A';
        }
    }
    
    formatAttributeName(attribute) {
        const attributeNames = {
            speed: 'Speed',
            stamina: 'Stamina',
            power: 'Power',
            guts: 'Guts',
            wisdom: 'Wisdom',
            rarity: 'Rarity',
            type: 'Type',
            turf: 'Turf',
            dirt: 'Dirt',
            short: 'Short',
            mile: 'Mile',
            medium: 'Medium',
            long: 'Long',
            front: 'Front Runner',
            pace: 'Pace Setter',
            late: 'Late Charge',
            end: 'Finisher',
            uniqueSkill: 'Unique Skill',
            awakeningSkills: 'Awakening Skills'
        };
        
        return attributeNames[attribute] || attribute;
    }
    
    formatAttributeValue(attribute, value) {
        switch (attribute) {
            case 'speed':
            case 'stamina':
            case 'power':
            case 'guts':
            case 'wisdom':
                return `<strong>${value}</strong>`;
            // Removed rarity and type formatting - now displayed in table header
            case 'turf':
            case 'dirt':
            case 'short':
            case 'mile':
            case 'medium':
            case 'long':
            case 'front':
            case 'pace':
            case 'late':
            case 'end':
                return `<span class="aptitude-grade aptitude-${value.toLowerCase()}">${value}</span>`;
            case 'uniqueSkill':
                return `<span class="skill-name">${value}</span>`;
            case 'awakeningSkills':
                // This will be handled by renderAwakeningSkillsRows
                return value;
            default:
                return value;
        }
    }
}

// Comparison Grid Class
class ComparisonGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.gridColumns = 1;
        this.characters = [];
    }
    
    renderGrid(characters) {
        if (!this.container) {
            console.error('Comparison grid container not found');
            return;
        }
        
        this.characters = characters || [];
        
        if (this.characters.length === 0) {
            this.container.innerHTML = `
                <div class="grid-placeholder">
                    Select characters above to see detailed comparison
                </div>
            `;
            return;
        }
        
        // Adjust columns based on character count
        this.adjustColumns(this.characters.length);
        
        // Render character cards
        const cardsHTML = this.characters.map(character => 
            this.renderCharacterCard(character)
        ).join('');
        
        this.container.innerHTML = cardsHTML;
        
        // Add event listeners for remove buttons
        this.setupCardEventListeners();
        
        console.log(`Rendered comparison grid with ${this.characters.length} characters`);
    }
    
    adjustColumns(characterCount) {
        this.gridColumns = characterCount;
        
        // The CSS handles responsive column adjustments based on data-characters attribute
        // This method is here for potential future JavaScript-based adjustments
        if (this.container) {
            this.container.setAttribute('data-characters', characterCount);
        }
    }
    
    renderCharacterCard(character) {
        // Calculate total stats for comparison
        const totalStats = Object.values(character.stats).reduce((sum, stat) => sum + stat, 0);
        const maxPossibleStats = 5 * 100; // 5 stats × 100 max each
        const overallRating = Math.round((totalStats / maxPossibleStats) * 100);
        
        // Find highest and lowest stats for highlighting
        const statsEntries = Object.entries(character.stats);
        const highestStat = statsEntries.reduce((max, [key, value]) => 
            value > max.value ? { key, value } : max, { key: '', value: 0 });
        const lowestStat = statsEntries.reduce((min, [key, value]) => 
            value < min.value ? { key, value } : min, { key: '', value: 100 });
        
        return `
            <div class="character-card" data-character-id="${character.id}">
                <div class="card-header">
                    <div class="character-image-container">
                        <img src="${character.image}" 
                             alt="${character.name}" 
                             class="character-image"
                             onerror="handleImageError(this)"
                        <div class="character-rarity rarity-${character.rarity}">
                            ${'★'.repeat(character.rarity)}
                        </div>
                    </div>
                    <div class="character-header-info">
                        <h3 class="character-card-name">${character.name}</h3>
                        <p class="character-card-name-jp">${character.nameJp}</p>
                        <div class="character-meta">
                            <span class="character-card-type type-${character.type}">${character.type}</span>
                            <span class="overall-rating">Overall: ${overallRating}%</span>
                        </div>
                    </div>
                    <button type="button" class="card-remove-btn" data-character-id="${character.id}" aria-label="Remove ${character.name}">
                        ×
                    </button>
                </div>
                
                <div class="card-body">
                    <div class="stats-section">
                        <h4 class="section-title">Stats</h4>
                        <div class="stats-grid">
                            ${Object.entries(character.stats).map(([statName, statValue]) => `
                                <div class="stat-item">
                                    <div class="stat-label">${this.formatStatName(statName)}</div>
                                    <div class="stat-value">${statValue}</div>
                                    <div class="stat-bar">
                                        <div class="stat-fill" style="width: ${statValue}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="skills-section">
                        <h4 class="section-title">Skills</h4>
                        <div class="skills-list">
                            ${character.skills.map(skill => `
                                <div class="skill-item">
                                    <div class="skill-header">
                                        <span class="skill-name">${skill.name}</span>
                                        <span class="skill-type skill-type-${skill.type}">${this.formatSkillType(skill.type)}</span>
                                    </div>
                                    <p class="skill-description">${skill.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatStatName(statName) {
        const statNames = {
            speed: 'Speed',
            stamina: 'Stamina', 
            power: 'Power',
            guts: 'Guts',
            wisdom: 'Wisdom'
        };
        return statNames[statName] || statName;
    }
    
    formatSkillType(skillType) {
        const typeNames = {
            speed_boost: 'Speed',
            stamina_boost: 'Stamina',
            power_boost: 'Power',
            acceleration: 'Accel',
            efficiency: 'Efficiency',
            all_boost: 'All Stats',
            random_boost: 'Random',
            situational: 'Situational'
        };
        return typeNames[skillType] || skillType;
    }
    
    setupCardEventListeners() {
        // Add event listeners for remove buttons
        const removeButtons = this.container.querySelectorAll('.card-remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const characterId = button.dataset.characterId;
                this.handleCharacterRemove(characterId);
            });
        });
        
        // Add event listeners for character replacement (future feature)
        const characterCards = this.container.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Only trigger if not clicking remove button
                if (!e.target.closest('.card-remove-btn')) {
                    const characterId = card.dataset.characterId;
                    this.handleCharacterReplace(characterId);
                }
            });
        });
    }
    
    handleCharacterRemove(characterId) {
        // Find the character selector and remove the character
        const characterSelector = UmaMusumeGuide.getCharacterSelector();
        if (characterSelector) {
            characterSelector.removeCharacter(characterId);
        }
        
        console.log(`Removed character from comparison: ${characterId}`);
    }
    
    handleCharacterReplace(characterId) {
        // For now, just log the action - replacement functionality can be enhanced later
        console.log(`Character replacement clicked for: ${characterId}`);
        
        // Could implement a modal or inline replacement selector here
        // For MVP, we'll just show a simple message
        const card = this.container.querySelector(`[data-character-id="${characterId}"]`);
        if (card) {
            const originalBorder = card.style.border;
            card.style.border = '3px solid var(--gold)';
            card.style.transform = 'scale(1.02)';
            
            setTimeout(() => {
                card.style.border = originalBorder;
                card.style.transform = '';
            }, 1000);
        }
    }
    
    // Public methods
    getCharacters() {
        return [...this.characters];
    }
    
    updateCharacter(characterId, newCharacterData) {
        const index = this.characters.findIndex(char => char.id === characterId);
        if (index !== -1) {
            this.characters[index] = newCharacterData;
            this.renderGrid(this.characters);
        }
    }
    
    removeCharacter(characterId) {
        this.characters = this.characters.filter(char => char.id !== characterId);
        this.renderGrid(this.characters);
    }
    
    clear() {
        this.characters = [];
        this.renderGrid([]);
    }
}

// Utility functions for future use
const UmaMusumeGuide = {
    // Initialize data loader
    dataLoader: new DataLoader(),
    
    // Image optimizer reference
    imageOptimizer: ImageOptimizer,
    
    // Data loading utilities
    loadCharacterData: async function() {
        return await this.dataLoader.loadCharacterData();
    },
    
    // Get specific character by ID
    getCharacterById: async function(characterId) {
        const data = await this.loadCharacterData();
        return data.characters.find(char => char.id === characterId);
    },
    
    // Get characters by type
    getCharactersByType: async function(type) {
        const data = await this.loadCharacterData();
        return data.characters.filter(char => char.type === type);
    },
    
    // Get characters by rarity
    getCharactersByRarity: async function(rarity) {
        const data = await this.loadCharacterData();
        return data.characters.filter(char => char.rarity === rarity);
    },
    
    // Search characters by name
    searchCharacters: async function(query) {
        const data = await this.loadCharacterData();
        const lowerQuery = query.toLowerCase();
        return data.characters.filter(char => 
            char.name.toLowerCase().includes(lowerQuery) ||
            char.nameJp.toLowerCase().includes(lowerQuery)
        );
    },
    
    // Filter characters by multiple criteria
    filterCharacters: async function(filters = {}) {
        const data = await this.loadCharacterData();
        let filtered = [...data.characters];
        
        if (filters.type) {
            filtered = filtered.filter(char => char.type === filters.type);
        }
        
        if (filters.rarity) {
            filtered = filtered.filter(char => char.rarity === filters.rarity);
        }
        
        if (filters.search) {
            const lowerQuery = filters.search.toLowerCase();
            filtered = filtered.filter(char => 
                char.name.toLowerCase().includes(lowerQuery) ||
                char.nameJp.toLowerCase().includes(lowerQuery)
            );
        }
        
        return filtered;
    },
    
    // Clear data cache
    clearDataCache: function() {
        this.dataLoader.clearCache();
    },
    
    // Get cache status
    getCacheStatus: function() {
        return this.dataLoader.getCacheStatus();
    },
    
    // Character selection utilities
    characterSelector: null,
    
    // Initialize character selector
    initializeCharacterSelector: function(containerId, characters) {
        this.characterSelector = new CharacterSelector(containerId, characters);
        return this.characterSelector.initialize();
    },
    
    // Get character selector instance
    getCharacterSelector: function() {
        return this.characterSelector;
    },
    
    // Character selection methods
    selectCharacter: function(characterId) {
        if (this.characterSelector) {
            this.characterSelector.handleCharacterSelect(characterId);
        }
    },
    
    getSelectedCharacters: function() {
        return this.characterSelector ? this.characterSelector.getSelectedCharacters() : [];
    },
    
    clearSelectedCharacters: function() {
        if (this.characterSelector) {
            this.characterSelector.clearAllSelected();
        }
    },
    
    // Callback for selection changes (can be overridden)
    onCharacterSelectionChange: function(selectedCharacters) {
        console.log('Character selection changed:', selectedCharacters.map(char => char.name));
    },
    
    // Comparison utilities
    comparisonGrid: null,
    
    // Initialize comparison grid
    initializeComparisonGrid: function(containerId) {
        this.comparisonGrid = new ComparisonGrid(containerId);
        return this.comparisonGrid;
    },
    
    // Get comparison grid instance
    getComparisonGrid: function() {
        return this.comparisonGrid;
    },
    
    // Compare characters
    compareCharacters: function(characters) {
        if (!this.comparisonGrid) {
            this.comparisonGrid = new ComparisonGrid('comparison-grid');
        }
        this.comparisonGrid.renderGrid(characters);
        console.log(`Comparing ${characters.length} characters:`, characters.map(char => char.name));
    },
    
    // Get character comparison data
    getComparisonData: function(characters) {
        if (!characters || characters.length === 0) {
            return null;
        }
        
        // Calculate comparison statistics
        const stats = ['speed', 'stamina', 'power', 'guts', 'wisdom'];
        const comparison = {
            characters: characters.map(char => ({
                id: char.id,
                name: char.name,
                stats: char.stats,
                totalStats: Object.values(char.stats).reduce((sum, stat) => sum + stat, 0),
                overallRating: Math.round((Object.values(char.stats).reduce((sum, stat) => sum + stat, 0) / 500) * 100)
            })),
            statComparison: {}
        };
        
        // Calculate stat rankings
        stats.forEach(statName => {
            const statValues = characters.map(char => ({
                id: char.id,
                name: char.name,
                value: char.stats[statName]
            })).sort((a, b) => b.value - a.value);
            
            comparison.statComparison[statName] = {
                highest: statValues[0],
                lowest: statValues[statValues.length - 1],
                average: Math.round(statValues.reduce((sum, char) => sum + char.value, 0) / statValues.length),
                rankings: statValues
            };
        });
        
        // Find overall best character
        comparison.overallBest = comparison.characters.reduce((best, char) => 
            char.totalStats > best.totalStats ? char : best
        );
        
        return comparison;
    }
};

// Debug utilities for development
const DebugUtils = {
    // Test data loading functionality
    testDataLoading: async function() {
        console.log('🧪 Testing data loading functionality...');
        
        try {
            const startTime = performance.now();
            const data = await UmaMusumeGuide.loadCharacterData();
            const loadTime = performance.now() - startTime;
            
            console.log('✅ Data loading test passed!');
            console.log(`📊 Loaded ${data.characters.length} characters in ${loadTime.toFixed(2)}ms`);
            console.log('📋 Cache status:', UmaMusumeGuide.getCacheStatus());
            console.log('🎯 Sample character:', data.characters[0]);
            
            return { success: true, data, loadTime };
        } catch (error) {
            console.error('❌ Data loading test failed:', error);
            return { success: false, error };
        }
    },
    
    // Test caching functionality
    testCaching: async function() {
        console.log('🧪 Testing caching functionality...');
        
        // Clear cache first
        UmaMusumeGuide.clearDataCache();
        console.log('🗑️ Cache cleared');
        
        // First load (should fetch from server)
        const firstLoad = await this.testDataLoading();
        if (!firstLoad.success) return firstLoad;
        
        // Second load (should load from cache)
        const secondLoad = await this.testDataLoading();
        if (!secondLoad.success) return secondLoad;
        
        console.log('✅ Caching test completed!');
        console.log(`⚡ Cache speedup: ${(firstLoad.loadTime / secondLoad.loadTime).toFixed(2)}x faster`);
        
        return { success: true, firstLoad, secondLoad };
    },
    
    // Test error handling
    testErrorHandling: async function() {
        console.log('🧪 Testing error handling...');
        
        // Temporarily break the data URL
        const originalUrl = UmaMusumeGuide.dataLoader.dataUrl;
        UmaMusumeGuide.dataLoader.dataUrl = '/invalid-url.json';
        
        try {
            await UmaMusumeGuide.loadCharacterData();
            console.log('❌ Error handling test failed - should have thrown error');
            return { success: false };
        } catch (error) {
            console.log('✅ Error handling test passed - correctly threw error');
            console.log('🔧 Error details:', error.message);
        } finally {
            // Restore original URL
            UmaMusumeGuide.dataLoader.dataUrl = originalUrl;
        }
        
        return { success: true };
    },
    
    // Test character selector functionality
    testCharacterSelector: async function() {
        console.log('🧪 Testing character selector functionality...');
        
        const selector = UmaMusumeGuide.getCharacterSelector();
        if (!selector) {
            console.error('❌ Character selector not initialized');
            return { success: false, error: 'Selector not found' };
        }
        
        try {
            // Test character selection
            const characters = selector.characters;
            if (characters.length === 0) {
                throw new Error('No characters available for testing');
            }
            
            // Test adding characters
            console.log('🔄 Testing character selection...');
            selector.addCharacter(characters[0]);
            selector.addCharacter(characters[1]);
            
            const selected = selector.getSelectedCharacters();
            if (selected.length !== 2) {
                throw new Error(`Expected 2 selected characters, got ${selected.length}`);
            }
            
            // Test search functionality
            console.log('🔍 Testing search functionality...');
            selector.handleSearch('Special');
            const filtered = selector.getFilteredCharacters();
            console.log(`Search results: ${filtered.length} characters found`);
            
            // Test clearing selection
            console.log('🗑️ Testing clear functionality...');
            selector.clearAllSelected();
            const clearedSelection = selector.getSelectedCharacters();
            if (clearedSelection.length !== 0) {
                throw new Error('Clear all failed');
            }
            
            // Reset search
            selector.handleSearch('');
            
            console.log('✅ Character selector test passed!');
            return { success: true, selector };
            
        } catch (error) {
            console.error('❌ Character selector test failed:', error);
            return { success: false, error };
        }
    },
    
    // Run all tests
    runAllTests: async function() {
        console.log('🚀 Running all tests...');
        
        const results = {
            dataLoading: await this.testDataLoading(),
            caching: await this.testCaching(),
            errorHandling: await this.testErrorHandling(),
            characterSelector: await this.testCharacterSelector()
        };
        
        const allPassed = Object.values(results).every(result => result.success);
        
        console.log(allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed');
        return results;
    }
};

// Make debug utilities available globally for console testing
window.DebugUtils = DebugUtils;
window.UmaMusumeGuide = UmaMusumeGuide;

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UmaMusumeGuide, DebugUtils };
}

// ========================================
// IMAGE PERFORMANCE TESTING UTILITIES
// ========================================

const ImagePerformanceMonitor = {
    // Performance metrics
    metrics: {
        totalImages: 0,
        loadedImages: 0,
        failedImages: 0,
        averageLoadTime: 0,
        loadTimes: []
    },
    
    // Start monitoring
    startMonitoring() {
        this.observeImageLoading();
        this.setupPerformanceObserver();
        console.log('Image performance monitoring started');
    },
    
    // Observe image loading
    observeImageLoading() {
        const images = document.querySelectorAll('img');
        this.metrics.totalImages = images.length;
        
        images.forEach(img => {
            const startTime = performance.now();
            
            const onLoad = () => {
                const loadTime = performance.now() - startTime;
                this.recordLoadTime(loadTime);
                this.metrics.loadedImages++;
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            };
            
            const onError = () => {
                this.metrics.failedImages++;
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            };
            
            if (img.complete) {
                if (img.naturalWidth > 0) {
                    this.metrics.loadedImages++;
                } else {
                    this.metrics.failedImages++;
                }
            } else {
                img.addEventListener('load', onLoad);
                img.addEventListener('error', onError);
            }
        });
    },
    
    // Record load time
    recordLoadTime(loadTime) {
        this.metrics.loadTimes.push(loadTime);
        this.metrics.averageLoadTime = 
            this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length;
    },
    
    // Setup Performance Observer for resource timing
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.initiatorType === 'img') {
                        console.log(`Image loaded: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    },
    
    // Get performance report
    getReport() {
        const report = {
            ...this.metrics,
            successRate: ((this.metrics.loadedImages / this.metrics.totalImages) * 100).toFixed(2) + '%',
            failureRate: ((this.metrics.failedImages / this.metrics.totalImages) * 100).toFixed(2) + '%'
        };
        
        console.table(report);
        return report;
    },
    
    // Test image optimization
    async testImageOptimization() {
        console.log('Testing image optimization...');
        
        const testImages = [
            'assets/images/characters/thumbnails/special_week_original_thumb.jpg',
            'assets/images/characters/portraits/silence_suzuka_original_portraits.jpg',
            'assets/images/placeholders/placeholder_character.svg'
        ];
        
        const results = [];
        
        for (const imageSrc of testImages) {
            const result = await this.testSingleImage(imageSrc);
            results.push(result);
        }
        
        console.table(results);
        return results;
    },
    
    // Test single image loading
    testSingleImage(src) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const img = new Image();
            
            img.onload = () => {
                const loadTime = performance.now() - startTime;
                resolve({
                    src: src.split('/').pop(),
                    status: 'success',
                    loadTime: loadTime.toFixed(2) + 'ms',
                    size: `${img.naturalWidth}x${img.naturalHeight}`
                });
            };
            
            img.onerror = () => {
                const loadTime = performance.now() - startTime;
                resolve({
                    src: src.split('/').pop(),
                    status: 'failed',
                    loadTime: loadTime.toFixed(2) + 'ms',
                    size: 'N/A'
                });
            };
            
            img.src = src;
        });
    }
};

// Add to global scope for testing
window.ImagePerformanceMonitor = ImagePerformanceMonitor;

// Auto-start monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => ImagePerformanceMonitor.startMonitoring(), 1000);
    });
}