// Manage Games JavaScript Functions

// Global variables
let currentGameId = null;
const participantsModal = new bootstrap.Modal(document.getElementById('participantsModal'));
const cancelGameModal = new bootstrap.Modal(document.getElementById('cancelGameModal'));

// Filter and Search Elements
const searchInput = document.getElementById('searchGames');
const statusFilter = document.getElementById('statusFilter');
const dateRangeFilter = document.getElementById('dateRangeFilter');
const sortBy = document.getElementById('sortBy');
const clearFilters = document.getElementById('clearFilters');

// View Mode Elements
const viewModeInputs = document.querySelectorAll('input[name="viewMode"]');
const tableViewContainer = document.getElementById('tableViewContainer');
const cardViewContainer = document.getElementById('cardViewContainer');

// Filter and Sort Functionality
function filterAndSortGames() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const dateRangeValue = dateRangeFilter.value;
    const sortValue = sortBy.value;
    
    const gameRows = document.querySelectorAll('.game-row');
    const gameCards = document.querySelectorAll('.game-card-item');
    
    // Filter games
    [...gameRows, ...gameCards].forEach(item => {
        let show = true;
        
        // Search filter
        if (searchTerm) {
            const title = item.dataset.title;
            const location = item.dataset.location;
            if (!title.includes(searchTerm) && !location.includes(searchTerm)) {
                show = false;
            }
        }
        
        // Status filter
        if (statusValue && item.dataset.status !== statusValue) {
            show = false;
        }
        
        // Date range filter
        if (dateRangeValue && show) {
            const gameDate = new Date(item.dataset.date);
            const today = new Date();
            
            switch(dateRangeValue) {
                case 'today':
                    if (gameDate.toDateString() !== today.toDateString()) show = false;
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
                case 'future':
                    if (gameDate <= today) show = false;
                    break;
                case 'past':
                    if (gameDate > today) show = false;
                    break;
            }
        }
        
        if (show) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Initialize Filter Event Listeners
function initializeFilters() {
    searchInput.addEventListener('input', filterAndSortGames);
    statusFilter.addEventListener('change', filterAndSortGames);
    dateRangeFilter.addEventListener('change', filterAndSortGames);
    sortBy.addEventListener('change', filterAndSortGames);
    
    // Clear filters
    clearFilters.addEventListener('click', function() {
        searchInput.value = '';
        statusFilter.value = '';
        dateRangeFilter.value = '';
        sortBy.value = 'date_desc';
        filterAndSortGames();
    });
}

// View Mode Toggle
function initializeViewModeToggle() {
    viewModeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.id === 'tableView') {
                tableViewContainer.classList.remove('d-none');
                cardViewContainer.classList.add('d-none');
            } else {
                tableViewContainer.classList.add('d-none');
                cardViewContainer.classList.remove('d-none');
            }
        });
    });
}

// Participants Modal Functions
function initializeParticipantsModal() {
    const participantsBtns = document.querySelectorAll('.participants-btn');
    participantsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentGameId = this.dataset.gameId;
            const gameTitle = this.dataset.gameTitle;
            
            document.getElementById('modalGameTitle').textContent = gameTitle;
            loadParticipants(currentGameId);
            participantsModal.show();
        });
    });
    
    // Export participants
    document.getElementById('exportParticipants').addEventListener('click', function() {
        if (currentGameId) {
            fetch(`/api/game/${currentGameId}/registrations`)
                .then(response => response.json())
                .then(data => {
                    exportToCSV(data);
                })
                .catch(error => {
                    console.error('Error exporting participants:', error);
                    alert('שגיאה בייצוא הרשימה');
                });
        }
    });
}

// Load Participants Data
function loadParticipants(gameId) {
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> טוען...</div>';
    
    fetch(`/api/game/${gameId}/registrations`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                participantsList.innerHTML = '<p class="text-muted text-center">עדיין אין משתתפים במשחק זה</p>';
                return;
            }
            
            let html = '<div class="participants-list">';
            data.forEach(participant => {
                html += `
                    <div class="participant-item">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h6 class="mb-1">${participant.first_name} ${participant.last_name}</h6>
                                <small class="text-muted">@${participant.username}</small>
                            </div>
                            <div class="col-md-4">
                                <span class="badge ${participant.position_name.startsWith('Team A') ? 'bg-danger' : 'bg-info'}">
                                    ${participant.position_name}
                                </span>
                            </div>
                            <div class="col-md-2 text-end">
                                <small class="text-muted">
                                    ${new Date(participant.registration_time).toLocaleDateString('he-IL')}
                                </small>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            participantsList.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading participants:', error);
            participantsList.innerHTML = 
                '<p class="text-danger text-center">שגיאה בטעינת רשימת המשתתפים</p>';
        });
}

// Export to CSV Function
function exportToCSV(participants) {
    const csvContent = [
        ['שם פרטי', 'שם משפחה', 'שם משתמש', 'תפקיד', 'תאריך הרשמה'],
        ...participants.map(p => [
            p.first_name,
            p.last_name,
            p.username,
            p.position_name,
            new Date(p.registration_time).toLocaleDateString('he-IL')
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_game_${currentGameId}.csv`;
    link.click();
}

// Cancel Game Functions
function initializeCancelGameModal() {
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentGameId = this.dataset.gameId;
            const gameTitle = this.dataset.gameTitle;
            
            document.getElementById('cancelGameTitle').textContent = gameTitle;
            cancelGameModal.show();
        });
    });
    
    document.getElementById('confirmCancelGame').addEventListener('click', function() {
        if (currentGameId) {
            cancelGame(currentGameId);
        }
    });
}

// Cancel Game API Call
function cancelGame(gameId) {
    fetch(`/api/game/${gameId}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('המשחק בוטל בהצלחה');
            location.reload();
        } else {
            alert('שגיאה בביטול המשחק: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error canceling game:', error);
        alert('שגיאה בביטול המשחק');
    })
    .finally(() => {
        cancelGameModal.hide();
    });
}

// Edit Game Functions
function initializeEditGameButtons() {
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const gameId = this.dataset.gameId;
            window.location.href = `/manage/game/${gameId}/edit`;
        });
    });
}

// Close Registration Functions
function initializeCloseRegistrationButtons() {
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const gameId = this.dataset.gameId;
            const gameTitle = this.dataset.gameTitle;
            
            if (confirm(`האם אתה בטוח שברצונך לסגור את ההרשמות למשחק "${gameTitle}"?`)) {
                closeRegistrations(gameId);
            }
        });
    });
}

// Close Registrations API Call
function closeRegistrations(gameId) {
    fetch(`/api/game/${gameId}/close`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('ההרשמות נסגרו בהצלחה');
            location.reload();
        } else {
            alert('שגיאה בסגירת ההרשמות: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error closing registrations:', error);
        alert('שגיאה בסגירת ההרשמות');
    });
}

// Page Animations
function initializePageAnimations() {
    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 200);
    });
    
    // Animate table rows
    const tableRows = document.querySelectorAll('.game-row');
    tableRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 100 + 600);
    });
    
    // Animate card view items
    const cardItems = document.querySelectorAll('.game-card-item');
    cardItems.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 600);
    });
}

// Auto Refresh for Real-time Updates
function initializeAutoRefresh() {
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            console.log('Checking for game updates...');
            // You can implement real-time updates here
            // For example, check for new registrations or status changes
        }
    }, 60000); // Every minute
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.blur();
            filterAndSortGames();
        }
        
        // Ctrl/Cmd + N for new game
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            window.location.href = '/create-game';
        }
    });
}

// Statistics Update Function
function updateStatistics() {
    // This function can be called to update statistics without full page reload
    fetch('/api/manager/statistics')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.stat-card.bg-primary .stat-number').textContent = data.total_games;
            document.querySelector('.stat-card.bg-success .stat-number').textContent = data.active_games;
            document.querySelector('.stat-card.bg-warning .stat-number').textContent = data.total_registrations;
            document.querySelector('.stat-card.bg-info .stat-number').textContent = data.avg_fill_rate + '%';
        })
        .catch(error => {
            console.error('Error updating statistics:', error);
        });
}

// Main Initialization Function
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeViewModeToggle();
    initializeParticipantsModal();
    initializeCancelGameModal();
    initializeEditGameButtons();
    initializeCloseRegistrationButtons();
    initializePageAnimations();
    initializeAutoRefresh();
    initializeKeyboardShortcuts();
    
    console.log('Manage games page initialized successfully');
});