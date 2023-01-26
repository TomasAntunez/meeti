import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const attendance = document.querySelector('#confirm-attendance');
    if(attendance) {
        attendance.addEventListener('submit', confirmAttendance);
    }
});

function confirmAttendance(e) {
    e.preventDefault();

    const btn = document.querySelector('#confirm-attendance input[type="submit"]');
    let act = document.querySelector('#act').value;
    const message = document.querySelector('#message');

    // Clear the previous response
    while(message.firstChild) {
        message.removeChild(message.firstChild);
    }

    axios.post(this.action, {act})
        .then(response => {
            if(act === 'confirm') {
                // Modify the button elements
                document.querySelector('#act').value = 'cancel';
                btn.value = 'Cancel';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');

            } else {
                document.querySelector('#act').value = 'confirm';
                btn.value = 'Yes';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
            }

            // Show message
            message.appendChild(document.createTextNode(response.data));
        })
    ;
}