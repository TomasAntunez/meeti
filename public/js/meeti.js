
document.addEventListener('DOMContentLoaded', () => {
    if(document.querySelector('#meeti-location')) {
        showMap();
    }
});

function showMap() {

    // Get values
    const lat = document.querySelector('#lat').value,
          lng = document.querySelector('#lng').value
    ;

    var map = L.map('meeti-location').setView([lat, lng], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, lng]).addTo(map);
};