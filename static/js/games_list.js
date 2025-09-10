// Games List JavaScript Functions

// Filter and Search Variables
const searchFilter = document.getElementById('searchFilter');
const dateFilter = document.getElementById('dateFilter');
const availabilityFilter = document.getElementById('availabilityFilter');
const clearFilters = document.getElementById('clearFilters');
const gameItems = document.querySelectorAll('.game-item');
const noResults = document.getElementById('noResults');

// Quick Register Modal Variables
let selectedGameId = null;
const quickRegisterModal = new bootstrap.Modal(document.getElementById('quickRegisterModal'));
const gameTitle = document.getElementById('gameTitle');
const confirmQuickRegister = document.getElementById('confirmQuickRegister');

// Main Filter Function
function filterGames() {
    const searchTerm = searchFilter.value.toLowerCase();
    const dateValue = dateFilter.value;
    const availabilityValue = availabilityFilter.value;
    
    let visibleCount = 0;
    
    gameItems.forEach(item => {
        let show = true;
        
        // Search filter
        if (searchTerm) {
            const title = item.dataset.title;
            const location = item.dataset.location;
            if (!title.includes(searchTerm) && !location.includes(searchTerm)) {
                show = false;
            }
        }
        
        // Date filter
        if (dateValue && show) {
            const gameDate = new Date(item.dataset.date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            switch(dateValue) {
                case 'today':
                    if (gameDate.toDateString() !== today.toDateString()) show = false;
                    break;
                case 'tomorrow':
                    if (gameDate.toDateString() !== tomorrow.toDateString()) show = false;
                    break;
                case 'week':
                    const weekFromNow = new Date(today);
                    weekFromNow.setDate(today.getDate() + 7);
                    if (gameDate < today || gameDate > weekFromNow) show = false;
                    break;
                case 'month':
                    const monthFromNow = new Date(today);
                    monthFromNow.setMonth(today.getMonth() + 1);
                    if (gameDate < today || gameDate > monthFromNow) show = false;
                    break;
            }
        }
        
        // Availability filter
        if (availabilityValue && show) {
            const hasAvailableSpots = item.dataset.available === 'true';
            if (availabilityValue === 'available' && !hasAvailableSpots) show = false;
            if (availabilityValue === 'full' && hasAvailableSpots) show = false;
        }
        
        if (show) {
            item.classList.remove('hidden');
            visibleCount++;
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Show/hide no results message
    if (visibleCount === 0 && gameItems.length > 0) {
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');
    }
}

// Event Listeners for Filters
function initializeFilters() {
    searchFilter.addEventListener('input', filterGames);
    dateFilter.addEventListener('change', filterGames);
    availabilityFilter.addEventListener('change', filterGames);
    
    // Clear filters
    clearFilters.addEventListener('click', function() {
        searchFilter.value = '';
        dateFilter.value = '';
        availabilityFilter.value = '';
        filterGames();
    });
}

// Quick Register Functionality
function initializeQuickRegister() {
    const quickRegisterBtns = document.querySelectorAll('.quick-register');
    
    quickRegisterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedGameId = this.dataset.gameId;
            gameTitle.textContent = this.dataset.gameTitle;
            quickRegisterModal.show();
        });
    });
    
    confirmQuickRegister.addEventListener('click', function() {
        if (selectedGameId) {
            window.location.href = `/game/${selectedGameId}`;
        }
    });
}

// Game Links Validation
function validateGameLinks() {
    const gameLinks = document.querySelectorAll('a[href*="/game/"]');
    
    gameLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            console.log('Clicking game link:', href);
            
            // בדיקה אם הקישור תקין
            if (href.includes('/game/undefined') || href.includes('/game/null')) {
                e.preventDefault();
                alert('שגיאה: לא ניתן לטעון את פרטי המשחק');
                return false;
            }
        });
    });
}

// Quick Register Button Validation
function validateQuickRegisterButtons() {
    const quickRegisterBtns = document.querySelectorAll('.quick-register');
    quickRegisterBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const gameId = this.dataset.gameId;
            console.log('Quick register for game:', gameId);
            
            if (!gameId || gameId === 'undefined') {
                e.preventDefault();
                alert('שגיאה: לא ניתן לזהות את המשחק');
                return false;
            }
        });
    });
}

// Page Animations
function initializeAnimations() {
    // Animate cards on load
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 200);
    });
}

// Auto Refresh
function initializeAutoRefresh() {
    // Auto-refresh every 2 minutes
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            location.reload();
        }
    }, 120000);
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchFilter.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === searchFilter) {
            searchFilter.value = '';
            searchFilter.blur();
            filterGames();
        }
    });
}

// Initialize All Functions
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeQuickRegister();
    validateGameLinks();
    validateQuickRegisterButtons();
    initializeAnimations();
    initializeAutoRefresh();
    initializeKeyboardShortcuts();
    
    console.log('Games list initialized successfully');
});