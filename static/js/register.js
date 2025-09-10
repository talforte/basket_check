// Register Page JavaScript Functions

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

// Password Strength Checker
function initializePasswordStrengthChecker() {
    const passwordField = document.getElementById('password');
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    passwordField.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        let text = '';
        
        // Check different criteria
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        
        // Reset classes
        strengthBar.className = 'progress-bar';
        
        // Set strength level
        switch(strength) {
            case 0:
            case 1:
                strengthBar.style.width = '20%';
                strengthBar.classList.add('weak');
                text = 'חלשה מאוד';
                break;
            case 2:
                strengthBar.style.width = '40%';
                strengthBar.classList.add('weak');
                text = 'חלשה';
                break;
            case 3:
                strengthBar.style.width = '60%';
                strengthBar.classList.add('medium');
                text = 'בינונית';
                break;
            case 4:
                strengthBar.style.width = '80%';
                strengthBar.classList.add('strong');
                text = 'חזקה';
                break;
            case 5:
                strengthBar.style.width = '100%';
                strengthBar.classList.add('strong');
                text = 'מעולה';
                break;
        }
        
        strengthText.textContent = text;
    });
}

// Real-time Field Validation
function initializeFieldValidation() {
    // Generic validation function
    function validateField(field, validationFn, errorMessage) {
        field.addEventListener('blur', function() {
            if (validationFn(this.value)) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
                if (errorMessage) {
                    updateErrorMessage(this, errorMessage);
                }
            }
        });
        
        // Also validate on input for immediate feedback
        field.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && validationFn(this.value)) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
    
    // First name validation
    validateField(
        document.getElementById('first_name'),
        value => value.trim().length >= 2,
        'שם פרטי חייב להכיל לפחות 2 תווים'
    );
    
    // Last name validation
    validateField(
        document.getElementById('last_name'),
        value => value.trim().length >= 2,
        'שם משפחה חייב להכיל לפחות 2 תווים'
    );
    
    // Username validation
    validateField(
        document.getElementById('username'),
        value => value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value),
        'שם המשתמש חייב להכיל לפחות 3 תווים (אותיות, מספרים ו- _ בלבד)'
    );
    
    // Email validation
    validateField(
        document.getElementById('email'),
        value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        'אנא הכנס כתובת אימייל תקינה'
    );
    
    // Password confirmation validation
    const confirmPasswordField = document.getElementById('confirm_password');
    confirmPasswordField.addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        
        if (password === confirmPassword && password.length > 0) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else if (confirmPassword.length > 0) {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        }
    });
}

// Update error message for field
function updateErrorMessage(field, message) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
    }
}

// Phone Number Formatting
function initializePhoneFormatting() {
    const phoneField = document.getElementById('phone');
    
    phoneField.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else {
                value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
        
        this.value = value;
        
        // Add visual formatting class
        if (value.length > 0) {
            this.classList.add('formatted');
        } else {
            this.classList.remove('formatted');
        }
    });
}

// Form Submission Validation
function initializeFormValidation() {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', function(e) {
        let isValid = true;
        const errors = [];
        
        // Check all required fields
        const requiredFields = this.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                errors.push(`${field.previousElementSibling.textContent} הוא שדה חובה`);
                isValid = false;
            }
        });
        
        // Check password requirements
        const password = document.getElementById('password').value;
        if (password.length < 6) {
            document.getElementById('password').classList.add('is-invalid');
            errors.push('הסיסמה חייבת להכיל לפחות 6 תווים');
            isValid = false;
        }
        
        // Check password match
        const confirmPassword = document.getElementById('confirm_password').value;
        if (password !== confirmPassword) {
            document.getElementById('confirm_password').classList.add('is-invalid');
            errors.push('הסיסמאות אינן תואמות');
            isValid = false;
        }
        
        // Check username format
        const username = document.getElementById('username').value;
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            document.getElementById('username').classList.add('is-invalid');
            errors.push('שם המשתמש יכול להכיל רק אותיות באנגלית, מספרים וקו תחתון');
            isValid = false;
        }
        
        // Check email format
        const email = document.getElementById('email').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('email').classList.add('is-invalid');
            errors.push('כתובת האימייל אינה תקינה');
            isValid = false;
        }
        
        // Check terms acceptance
        if (!document.getElementById('acceptTerms').checked) {
            errors.push('יש לאשר את תנאי השימוש ומדיניות הפרטיות');
            isValid = false;
        }
        
        if (!isValid) {
            e.preventDefault();
            showErrorSummary(errors);
        } else {
            showLoadingState();
        }
    });
}

// Show error summary
function showErrorSummary(errors) {
    alert('נמצאו שגיאות בטופס:\n\n' + errors.join('\n'));
}

// Show loading state on form submission
function showLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>יוצר חשבון...';
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
}

// Page Animations
function initializePageAnimations() {
    // Auto-focus on first field
    document.getElementById('first_name').focus();
    
    // Main card animation
    const mainCard = document.querySelector('.card');
    mainCard.style.opacity = '0';
    mainCard.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        mainCard.style.transition = 'all 0.6s ease';
        mainCard.style.opacity = '1';
        mainCard.style.transform = 'translateY(0)';
    }, 100);
    
    // Benefits card animation
    const benefitsCard = document.querySelectorAll('.card')[1];
    if (benefitsCard) {
        benefitsCard.style.opacity = '0';
        benefitsCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            benefitsCard.style.transition = 'all 0.6s ease';
            benefitsCard.style.opacity = '1';
            benefitsCard.style.transform = 'translateY(0)';
        }, 400);
    }
    
    // Benefits icons animation
    const benefitsIcons = document.querySelectorAll('.benefits-icon');
    benefitsIcons.forEach((icon, index) => {
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.5)';
        
        setTimeout(() => {
            icon.style.transition = 'all 0.5s ease';
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1)';
        }, 600 + index * 100);
    });
}

// Username Availability Check (simulated)
function initializeUsernameCheck() {
    const usernameField = document.getElementById('username');
    let checkTimeout;
    
    usernameField.addEventListener('input', function() {
        const username = this.value;
        
        // Clear previous timeout
        clearTimeout(checkTimeout);
        
        // Only check if username is valid format
        if (username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)) {
            checkTimeout = setTimeout(() => {
                checkUsernameAvailability(username);
            }, 500); // Wait 500ms after user stops typing
        }
    });
}

// Simulated username availability check
function checkUsernameAvailability(username) {
    const field = document.getElementById('username');
    
    // Simulate API call delay
    setTimeout(() => {
        // Simulate some usernames being taken
        const takenUsernames = ['admin', 'user', 'test', 'basketball', 'player'];
        
        if (takenUsernames.includes(username.toLowerCase())) {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            updateErrorMessage(field, 'שם המשתמש תפוס, נסה שם אחר');
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    }, 300);
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('registerForm').submit();
        }
        
        // Escape to clear current field
        if (e.key === 'Escape' && document.activeElement.tagName === 'INPUT') {
            document.activeElement.value = '';
            document.activeElement.classList.remove('is-valid', 'is-invalid');
        }
    });
}

// Main Initialization Function
document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggle();
    initializePasswordStrengthChecker();
    initializeFieldValidation();
    initializePhoneFormatting();
    initializeFormValidation();
    initializePageAnimations();
    initializeUsernameCheck();
    initializeKeyboardShortcuts();
    
    console.log('Register page initialized successfully');
});