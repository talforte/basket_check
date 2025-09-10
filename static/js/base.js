/**
 * Base JavaScript for Basket Check Application
 * Contains common functionality used across all pages
 */

class BasketCheckApp {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initAnimations();
        this.initBasketballCourt();
    }
    
    setupEventListeners() {
        // Button hover effects
        this.initButtonEffects();
        
        // Card animations on scroll
        this.setupScrollAnimations();
        
        // Auto-dismiss alerts after 5 seconds
        this.setupAutoAlerts();
    }
    
    initButtonEffects() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
    
    initAnimations() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    initBasketballCourt() {
        const court = document.querySelector('.basketball-court');
        if (court) {
            this.createCourtLines(court);
        }
    }
    
    createCourtLines(court) {
        // Center line
        const centerLine = document.createElement('div');
        centerLine.className = 'court-line';
        centerLine.style.cssText = `
            width: 2px;
            height: 100%;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
        `;
        court.appendChild(centerLine);
        
        // Center circle
        const centerCircle = document.createElement('div');
        centerCircle.className = 'court-line';
        centerCircle.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;
        court.appendChild(centerCircle);
        
        // Three-point lines (simplified)
        this.createThreePointLines(court);
    }
    
    createThreePointLines(court) {
        // Left three-point arc
        const leftArc = document.createElement('div');
        leftArc.className = 'court-line';
        leftArc.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            left: 10%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;
        court.appendChild(leftArc);
        
        // Right three-point arc
        const rightArc = document.createElement('div');
        rightArc.className = 'court-line';
        rightArc.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            right: 10%;
            top: 50%;
            transform: translate(50%, -50%);
        `;
        court.appendChild(rightArc);
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe all cards and content elements
        document.querySelectorAll('.card, .content-wrapper, .game-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupAutoAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            // Only auto-dismiss success and info alerts
            if (alert.classList.contains('alert-success') || 
                alert.classList.contains('alert-info')) {
                
                setTimeout(() => {
                    const closeBtn = alert.querySelector('.btn-close');
                    if (closeBtn && alert.parentNode) {
                        alert.style.transition = 'opacity 0.3s ease';
                        alert.style.opacity = '0';
                        setTimeout(() => {
                            if (alert.parentNode) {
                                alert.remove();
                            }
                        }, 300);
                    }
                }, 5000);
            }
        });
    }
    
    // Utility functions for other pages to use
    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = `
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            min-width: 300px;
        `;
        
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }
    
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    static formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }
    
    // Loading spinner utility
    static showLoading(element) {
        const originalContent = element.innerHTML;
        element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>טוען...';
        element.disabled = true;
        
        return () => {
            element.innerHTML = originalContent;
            element.disabled = false;
        };
    }
    
    // Confirmation dialog utility
    static confirm(message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    }
}

// CSS for scroll animations
const animationStyles = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Add animation styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BasketCheckApp();
});

// Export for use in other modules
window.BasketCheckApp = BasketCheckApp;