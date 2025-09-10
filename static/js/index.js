// Index Page JavaScript Functions

// Quick Registration Function
function quickRegister(gameId) {
    // פונקציה להרשמה מהירה - ניתן להרחיב לmodal עם בחירת תפקיד
    if (confirm('האם אתה בטוח שברצונך להירשם למשחק זה?')) {
        window.location.href = `/game/${gameId}`;
    }
}

// Game Cards Animation
function initializeCardAnimations() {
    const gameCards = document.querySelectorAll('.game-card-hover');
    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150 + 300);
    });
}

// Statistics Cards Animation
function initializeStatsAnimation() {
    const statsCards = document.querySelectorAll('.stats-card');
    statsCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 100);
    });
}

// Features Section Animation
function initializeFeaturesAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const icon = entry.target.querySelector('i');
                if (icon) {
                    icon.style.animation = 'bounceIn 0.8s ease';
                }
            }
        });
    });
    
    const featureCards = document.querySelectorAll('.col-md-4');
    featureCards.forEach(card => {
        observer.observe(card);
    });
}

// Auto Refresh Function
function initializeAutoRefresh() {
    // עדכון אוטומטי של הדף כל 5 דקות
    setTimeout(function() {
        if (document.visibilityState === 'visible') {
            location.reload();
        }
    }, 300000); // 5 minutes
}

// Progress Bar Animation
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.style.width;
                progressBar.style.width = '0%';
                progressBar.style.transition = 'width 1.5s ease-in-out';
                
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 100);
            }
        });
    });
    
    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stats-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent);
                
                if (!isNaN(target)) {
                    let current = 0;
                    const increment = target / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            counter.textContent = target;
                            clearInterval(timer);
                        } else {
                            counter.textContent = Math.floor(current);
                        }
                    }, 20);
                }
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Smooth Scroll for Navigation
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + G to go to games list
        if (e.altKey && e.key === 'g') {
            e.preventDefault();
            window.location.href = '/games';
        }
        
        // Alt + L to go to login (if not logged in)
        if (e.altKey && e.key === 'l') {
            e.preventDefault();
            const loginLink = document.querySelector('a[href*="login"]');
            if (loginLink) {
                window.location.href = loginLink.href;
            }
        }
    });
}

// Add CSS Animation Keyframes
function addAnimationKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% {
                transform: scale(0.3);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Main Initialization Function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    addAnimationKeyframes();
    initializeStatsAnimation();
    initializeCardAnimations();
    initializeFeaturesAnimation();
    animateProgressBars();
    animateCounters();
    initializeSmoothScroll();
    initializeKeyboardShortcuts();
    initializeAutoRefresh();
    
    console.log('Index page initialized successfully');
});