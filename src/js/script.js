// Custom JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Website Auto1 geladen');

    // Beispiel: Form Handling
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formular abgesendet');
            // Hier kann weitere Logik hinzugefügt werden
        });
    }
});

// Beispiel Utility Funktionen
function showAlert(message) {
    alert(message);
}
