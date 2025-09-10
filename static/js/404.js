class Error404Page {
    constructor() {
        this.clickCount = 0;
        this.konamiCode = [];
        this.konamiSequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
            'KeyB', 'KeyA'
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initAnimations();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('errorPageSearch');
        const searchBtn = document.querySelector('.search-section .btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        // Basketball click interaction
        const basketball = document.querySelector('.basketball');
        if (basketball) {
            basketball.addEventListener('click', () => this.handleBasketballClick());
        }
        
        // Konami code
        document.addEventListener('keydown', (e) => this.handleKonamiCode(e));
        
        // Stats animation on scroll
        this.setupStatsObserver();
    }
    
    performSearch() {
        const searchInput = document.getElementById('errorPageSearch');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        if (searchTerm) {
            // You can customize this URL based on your routes
            window.location.href = `/games?search=${encodeURIComponent(searchTerm)}`;
        }
    }
    
    handleBasketballClick() {
        this.clickCount++;
        const basketball = document.querySelector('.basketball');
        
        // Reset animation
        basketball.style.animation = 'none';
        setTimeout(() => {
            basketball.style.animation = 'bounce 1s infinite ease-in-out';
        }, 10);
        
        if (this.clickCount === 5) {
            alert('🏀 נחמד! גילית את הכדורסל הסודי! 🏀');
            this.clickCount = 0;
        }
    }
    
    handleKonamiCode(e) {
        this.konamiCode.push(e.code);
        
        if (this.konamiCode.length > this.konamiSequence.length) {
            this.konamiCode.shift();
        }
        
        if (this.konamiCode.length === this.konamiSequence.length && 
            this.konamiCode.every((code, index) => code === this.konamiSequence[index])) {
            
            this.activateKonamiCode();
            this.konamiCode = [];
        }
    }
    
    activateKonamiCode() {
        document.body.style.filter = 'hue-rotate(180deg)';
        alert('🎮 קוד קונאמי מופעל! הצבעים השתנו! 🎮');
        
        setTimeout(() => {
            document.body.style.filter = '';
        }, 5000);
    }
    
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
    
    setupStatsObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numbers = entry.target.querySelectorAll('.stat-number');
                    numbers.forEach(num => {
                        const target = parseInt(num.textContent.replace(/,/g, ''));
                        num.textContent = '0';
                        this.animateCounter(num, target);
                    });
                    observer.unobserve(entry.target);
                }
            });
        });
        
        const funStatsCard = document.querySelector('.card.border-warning');
        if (funStatsCard) {
            observer.observe(funStatsCard);
        }
    }
    
    initAnimations() {
        // Animate error code
        const errorCode = document.querySelector('.error-code');
        if (errorCode) {
            errorCode.style.opacity = '0';
            errorCode.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                errorCode.style.transition = 'all 0.8s ease';
                errorCode.style.opacity = '1';
                errorCode.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Animate content
        const errorContent = document.querySelector('.error-content');
        if (errorContent) {
            errorContent.style.opacity = '0';
            errorContent.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                errorContent.style.transition = 'all 0.8s ease';
                errorContent.style.opacity = '1';
                errorContent.style.transform = 'translateY(0)';
            }, 600);
        }
        
        // Animate link items
        const linkItems = document.querySelectorAll('.link-item');
        linkItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 1000 + index * 100);
        });
        
        // Focus on search input after animations
        setTimeout(() => {
            const searchInput = document.getElementById('errorPageSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }, 1500);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new Error404Page();
});