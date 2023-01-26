import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const deleteForms = document.querySelectorAll('.delete-comment');

    // Check if the forms exist
    if(deleteForms.length > 0) {
        deleteForms.forEach( form => {
            form.addEventListener('submit', deleteComment);
        });
    }
});

function deleteComment(e) {
    e.preventDefault();

    Swal.fire({
        title: 'Delete Comment?',
        text: "A deleted comment cannot be recovered",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'

    }).then((result) => {
        if (result.isConfirmed) {

            // Take commentId
            const commentId = this.children[0].value;

            // Run axios and pass data
            axios.post(this.action, {commentId}).then(response => {
                Swal.fire('Deleted!', response.data, 'success');

                // Remove from DOM
                this.parentElement.parentElement.remove();

            }).catch(error => {
                if(error.response.status === 403 || error.response.status === 404) {
                    Swal.fire('Error', error.response.data, 'error');
                };
            });

        }
    })
};

