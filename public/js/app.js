import attendance from './attendance.js';
import deleteComment from './deleteComment';

const lat = document.querySelector('#lat').value || -32.890459;
const lng = document.querySelector('#lng').value || -68.844889;
const address = document.querySelector('#address').value || '';
const map = L.map('map').setView([lat, lng], ( (lat && lng) ? 15 : 12));
let marker;

// User provider and Geocoder
const geocodeService = L.esri.Geocoding.geocodeService();

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
});

// The pin
marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true
}).addTo(map).bindPopup(address);

// Detect pin movement
marker.on('moveend', function(e) {

    marker = e.target;
    const position = marker.getLatLng();
    map.panTo(new L.LatLng(position.lat, position.lng));

    // Reverse geocoding, when the user relocates the pin
    geocodeService.reverse().latlng(position, 15).run(function(error, result) {
        // Assing the values to popup
        marker.bindPopup(result.address.LongLabel).openPopup();

        fillInputs(result);
    });
});

function fillInputs(info) {
    document.querySelector('#address').value = info.address.Address || '';
    document.querySelector('#city').value = info.address.City || '';
    document.querySelector('#state').value = info.address.Region || '';
    document.querySelector('#country').value = info.address.CountryCode || '';
    document.querySelector('#lat').value = info.latlng.lat || '';
    document.querySelector('#lng').value = info.latlng.lng || '';
}