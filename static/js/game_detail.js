// Game Detail JavaScript Functions

// פונקציות שיתוף
function shareWhatsApp() {
    const text = `הי! הצטרף אלינו למשחק כדורסל 5 נגד 5: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareLink() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        alert('הקישור הועתק ללוח!');
    });
}

function shareEmail() {
    const subject = 'הזמנה למשחק כדורסל 5 נגד 5';
    const body = `הי!\n\nאני מזמין אותך להצטרף למשחק כדורסל 5 נגד 5.\n\nפרטי המשחק: ${window.location.href}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
}

// אינטראקציה עם מפת המגרש
document.addEventListener('DOMContentLoaded', function() {
    const positions = document.querySelectorAll('.position-spot');
    
    positions.forEach(position => {
        position.addEventListener('click', function() {
            const positionTitle = this.dataset.title;
            
            if (this.classList.contains('available')) {
                if (confirm(`האם ברצונך להירשם לתפקיד: ${positionTitle}?`)) {
                    // מחפש את האופציה המתאימה ב-select לפי שם הפוזיציה
                    const selectElement = document.getElementById('position_id');
                    if (selectElement) {
                        const options = selectElement.options;
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].text.includes(positionTitle)) {
                                selectElement.value = options[i].value;
                                // הדגשה ויזואלית שהפוזיציה נבחרה
                                selectElement.style.backgroundColor = '#d4edda';
                                setTimeout(() => {
                                    selectElement.style.backgroundColor = '';
                                }, 2000);
                                break;
                            }
                        }
                    }
                }
            }
        });
    });
    
    // אפקט אנימציה ליצירת המגרש
    const court = document.getElementById('basketballCourt');
    if (court) {
        court.style.opacity = '0';
        court.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            court.style.transition = 'all 0.8s ease';
            court.style.opacity = '1';
            court.style.transform = 'scale(1)';
        }, 200);
        
        // אנימציה לעמדות השחקנים
        positions.forEach((position, index) => {
            position.style.opacity = '0';
            position.style.transform = 'scale(0)';
            
            setTimeout(() => {
                position.style.transition = 'all 0.5s ease';
                position.style.opacity = '1';
                position.style.transform = 'scale(1)';
            }, 800 + index * 100);
        });
    }
    
    // Debug form submission
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const positionSelect = document.getElementById('position_id');
            console.log('Form submitted with position_id:', positionSelect.value);
            
            if (!positionSelect.value) {
                e.preventDefault();
                alert('חובה לבחור תפקיד!');
                return false;
            }
        });
    }
});

// עדכון דינמי של המשתתפים
function refreshParticipants() {
    // בהנחה שיש נתיב API זמין
    const gameId = window.location.pathname.split('/').pop();
    fetch(`/api/game/${gameId}/registrations`)
        .then(response => response.json())
        .then(data => {
            console.log('Participants updated:', data);
            // כאן אפשר לעדכן את רשימת המשתתפים דינמית
        })
        .catch(error => {
            console.log('Error refreshing participants:', error);
        });
}

// עדכון כל 30 שניות
setInterval(refreshParticipants, 30000);

// פונקציות עזר נוספות
function highlightSelectedPosition(positionId) {
    // הדגשת הפוזיציה שנבחרה במפת המגרש
    const spots = document.querySelectorAll('.position-spot');
    spots.forEach(spot => {
        spot.classList.remove('selected');
    });
    
    const selectedSpot = document.querySelector(`[data-position="${positionId}"]`);
    if (selectedSpot) {
        selectedSpot.classList.add('selected');
    }
}

// אירוע לשינוי בחירת הפוזיציה
document.addEventListener('DOMContentLoaded', function() {
    const positionSelect = document.getElementById('position_id');
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                highlightSelectedPosition(selectedOption.text);
            }
        });
    }
});