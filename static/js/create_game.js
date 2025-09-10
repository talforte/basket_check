/**
 * Create Game Page functionality
 */

class CreateGameForm {
    constructor() {
        this.initElements();
        this.setupEventListeners();
        this.initializeForm();
    }
    
    initElements() {
        // Form inputs
        this.titleInput = document.getElementById('title');
        this.dateInput = document.getElementById('game_date');
        this.timeInput = document.getElementById('game_time');
        this.locationInput = document.getElementById('location');
        this.descriptionInput = document.getElementById('description');
        this.maxPlayersInput = document.getElementById('max_players');
        
        // Preview elements
        this.previewTitle = document.querySelector('.preview-title');
        this.previewDate = document.querySelector('.preview-date');
        this.previewTime = document.querySelector('.preview-time');
        this.previewLocation = document.querySelector('.preview-location');
        this.previewDescription = document.querySelector('.preview-description');
        this.previewMaxPlayers = document.querySelector('.preview-max-players');
        
        // Buttons
        this.timeBtns = document.querySelectorAll('.time-btn');
        this.locationBtns = document.querySelectorAll('.location-btn');
        this.submitBtn = document.getElementById('submitBtn');
        this.form = document.getElementById('createGameForm');
        
        // Other elements
        this.requiredFields = document.querySelectorAll('[required]');
    }
    
    setupEventListeners() {
        // Real-time preview updates
        const inputElements = [
            this.titleInput, 
            this.dateInput, 
            this.timeInput, 
            this.locationInput, 
            this.descriptionInput, 
            this.maxPlayersInput
        ];
        
        inputElements.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            }
        });
        
        // Quick time buttons
        this.timeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTimeButtonClick(e));
        });
        
        // Quick location buttons
        this.locationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLocationButtonClick(e));
        });
        
        // Real-time validation
        this.requiredFields.forEach(field => {
            field.addEventListener('input', () => this.handleFieldInput(field));
            field.addEventListener('blur', () => this.validateField(field));
        });
        
        // Date validation
        if (this.dateInput) {
            this.dateInput.addEventListener('change', () => this.validateDate());
        }
        
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    initializeForm() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        if (this.dateInput) {
            this.dateInput.setAttribute('min', today);
            
            // Set default date to tomorrow if no value
            if (!this.dateInput.value) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.dateInput.value = tomorrow.toISOString().split('T')[0];
            }
        }
        
        // Initial preview update
        this.updatePreview();
        
        // Animate form sections
        this.animateFormSections();
        
        // Focus on title field
        if (this.titleInput) {
            this.titleInput.focus();
        }
    }
    
    updatePreview() {
        if (this.previewTitle) {
            this.previewTitle.textContent = this.titleInput?.value || 'כותרת המשחק תופיע כאן';
        }
        
        if (this.previewDate) {
            this.previewDate.textContent = this.dateInput?.value ? 
                this.formatDate(this.dateInput.value) : 'תאריך יופיע כאן';
        }
        
        if (this.previewTime) {
            this.previewTime.textContent = this.timeInput?.value ? 
                this.formatTime(this.timeInput.value) : 'שעה תופיע כאן';
        }
        
        if (this.previewLocation) {
            this.previewLocation.textContent = this.locationInput?.value || 'מיקום יופיע כאן';
        }
        
        if (this.previewDescription) {
            this.previewDescription.textContent = this.descriptionInput?.value || 'תיאור המשחק יופיע כאן...';
        }
        
        if (this.previewMaxPlayers) {
            this.previewMaxPlayers.textContent = this.maxPlayersInput?.value || '10';
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    formatTime(timeString) {
        return timeString;
    }
    
    handleTimeButtonClick(e) {
        const btn = e.target;
        const time = btn.dataset.time;
        
        if (this.timeInput && time) {
            this.timeInput.value = time;
            this.updatePreview();
            this.validateField(this.timeInput);
            
            // Visual feedback
            this.timeBtns.forEach(b => b.classList.remove('btn-primary'));
            btn.classList.add('btn-primary');
        }
    }
    
    handleLocationButtonClick(e) {
        const btn = e.target;
        const location = btn.dataset.location;
        
        if (this.locationInput && location) {
            this.locationInput.value = location;
            this.updatePreview();
            this.validateField(this.locationInput);
            
            // Visual feedback
            this.locationBtns.forEach(b => b.classList.remove('btn-info'));
            btn.classList.add('btn-info');
        }
    }
    
    handleFieldInput(field) {
        if (field.value.trim()) {
            this.validateField(field);
        }
    }
    
    validateField(field) {
        if (!field) return false;
        
        if (field.checkValidity()) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            return true;
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    validateDate() {
        if (!this.dateInput) return true;
        
        const selectedDate = new Date(this.dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.dateInput.setCustomValidity('התאריך חייב להיות בעתיד');
            this.validateField(this.dateInput);
            return false;
        } else {
            this.dateInput.setCustomValidity('');
            this.validateField(this.dateInput);
            return true;
        }
    }
    
    handleFormSubmit(e) {
        let isValid = true;
        
        // Validate all required fields
        this.requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Custom validation for date
        if (!this.validateDate()) {
            isValid = false;
        }
        
        if (!isValid) {
            e.preventDefault();
            alert('אנא תקן את השגיאות בטופס');
            this.scrollToFirstError();
        } else {
            this.showLoadingState();
        }
    }
    
    scrollToFirstError() {
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstError.focus();
        }
    }
    
    showLoadingState() {
        if (this.submitBtn) {
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>יוצר משחק...';
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('btn-loading');
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.form) {
                    this.form.requestSubmit();
                }
            }
            
            // Escape to clear current field
            if (e.key === 'Escape' && document.activeElement) {
                const activeElement = document.activeElement;
                if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                    activeElement.value = '';
                    this.updatePreview();
                }
            }
        });
    }
    
    animateFormSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            section.classList.add('section-animate');
            
            setTimeout(() => {
                section.classList.add('visible');
            }, index * 200 + 300);
        });
    }
    
    // Utility methods
    resetForm() {
        if (this.form) {
            this.form.reset();
            this.updatePreview();
            
            // Remove validation classes
            this.requiredFields.forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
            });
            
            // Reset button states
            this.timeBtns.forEach(btn => btn.classList.remove('btn-primary'));
            this.locationBtns.forEach(btn => btn.classList.remove('btn-info'));
        }
    }
    
    populateFromTemplate(template) {
        if (template.title && this.titleInput) {
            this.titleInput.value = template.title;
        }
        if (template.location && this.locationInput) {
            this.locationInput.value = template.location;
        }
        if (template.description && this.descriptionInput) {
            this.descriptionInput.value = template.description;
        }
        if (template.time && this.timeInput) {
            this.timeInput.value = template.time;
        }
        
        this.updatePreview();
    }
    
    getFormData() {
        return {
            title: this.titleInput?.value || '',
            date: this.dateInput?.value || '',
            time: this.timeInput?.value || '',
            location: this.locationInput?.value || '',
            description: this.descriptionInput?.value || '',
            maxPlayers: this.maxPlayersInput?.value || '10'
        };
    }
    
    validateAll() {
        let isValid = true;
        
        this.requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!this.validateDate()) {
            isValid = false;
        }
        
        return isValid;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.createGameForm = new CreateGameForm();
    
    // Add any additional initialization here
    console.log('Create Game form initialized');
});

// Export for potential use in other scripts
window.CreateGameForm = CreateGameForm;