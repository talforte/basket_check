// Login Page JavaScript Functions

// Password Toggle Functionality
function initializePasswordToggle() {
    const toggleButton = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    toggleButton.addEventListener('click', function() {
        const icon = this.querySelector('i');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            this.setAttribute('aria-label', 'הסתר סיסמה');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            this.setAttribute('aria-label', 'הצג סיסמה');
        }
    });
}

// Form Validation
function initializeFormValidation() {
    const loginForm = document.getElementById('loginForm');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    loginForm.addEventListener('submit', function(e) {
        let isValid = true;
        
        // Reset previous validation states
        usernameField.classList.remove('is-invalid', 'is-valid');
        passwordField.classList.remove('is-invalid', 'is-valid');
        
        // Validate username
        const username = usernameField.value.trim();
        if (!username) {
            usernameField.classList.add('is-invalid');
            showFieldError(usernameField, 'שם משתמש הוא שדה חובה');
            isValid = false;
        } else if (username.length < 2) {
            usernameField.classList.add('is-invalid');
            showFieldError(usernameField, 'שם משתמש חייב להכיל לפחות 2 תווים');
            isValid = false;
        } else {
            usernameField.classList.add('is-valid');
        }
        
        // Validate password
        const password = passwordField.value;
        if (!password) {
            passwordField.classList.add('is-invalid');
            showFieldError(passwordField, 'סיסמה היא שדה חובה');
            isValid = false;
        } else if (password.length < 3) {
            passwordField.classList.add('is-invalid');
            showFieldError(passwordField, 'הסיסמה חייבת להכיל לפחות 3 תווים');
            isValid = false;
        } else {
            passwordField.classList.add('is-valid');
        }
        
        if (!isValid) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        showLoadingState();
    });
}

// Show field error message
function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Show loading state on form submission
function showLoadingState() {
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.classList.add('btn-loading');
    submitButton.disabled = true;
}

// Remember Me Functionality
function initializeRememberMe() {
    const rememberCheckbox = document.getElementById('rememberMe');
    const usernameField = document.getElementById('username');
    const loginForm = document.getElementById('loginForm');
    
    // Load saved username if exists
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        usernameField.value = rememberedUsername;
        rememberCheckbox.checked = true;
    }
    
    // Save username on form submit if remember me is checked
    loginForm.addEventListener('submit', function() {
        if (rememberCheckbox.checked) {
            localStorage.setItem('rememberedUsername', usernameField.value.trim());
        } else {
            localStorage.removeItem('rememberedUsername');
        }
    });
}

// Auto-focus and Card Animation
function initializePageAnimations() {
    // Auto-focus on username field
    const usernameField = document.getElementById('username');
    usernameField.focus();
    
    // Animation for main card
    const card = document.querySelector('.card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
    
    // Animation for demo card
    const demoCard = document.querySelectorAll('.card')[1];
    if (demoCard) {
        demoCard.style.opacity = '0';
        demoCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            demoCard.style.transition = 'all 0.6s ease';
            demoCard.style.opacity = '1';
            demoCard.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Enter key to submit form (already works by default, but adding for completeness)
        if (e.key === 'Enter' && (e.target.id === 'username' || e.target.id === 'password')) {
            const form = document.getElementById('loginForm');
            if (form.checkValidity()) {
                form.submit();
            }
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            clearForm();
        }
    });
}

// Clear form function
function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('rememberMe').checked = false;
    
    // Remove validation classes
    const fields = document.querySelectorAll('.form-control');
    fields.forEach(field => {
        field.classList.remove('is-invalid', 'is-valid');
    });
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(msg => msg.remove());
    
    // Focus on username
    document.getElementById('username').focus();
}

// Demo Account Quick Fill
function initializeDemoAccountFill() {
    const demoCard = document.querySelector('.border-warning');
    if (demoCard) {
        demoCard.addEventListener('click', function(e) {
            if (e.target.closest('.col-6:first-child')) {
                // Admin account clicked
                document.getElementById('username').value = 'admin';
                document.getElementById('password').value = 'admin123';
                document.getElementById('username').focus();
            }
        });
        
        // Add cursor pointer to indicate clickability
        demoCard.style.cursor = 'pointer';
        demoCard.querySelector('.col-6:first-child').style.cursor = 'pointer';
    }
}

// Real-time validation feedback
function initializeRealTimeValidation() {
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    usernameField.addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length >= 2) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else if (value.length > 0) {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid', 'is-valid');
        }
    });
    
    passwordField.addEventListener('input', function() {
        const value = this.value;
        if (value.length >= 3) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else if (value.length > 0) {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid', 'is-valid');
        }
    });
}

// Main Initialization Function
document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggle();
    initializeFormValidation();
    initializeRememberMe();
    initializePageAnimations();
    initializeKeyboardShortcuts();
    initializeDemoAccountFill();
    initializeRealTimeValidation();
    
    console.log('Login page initialized successfully');
});