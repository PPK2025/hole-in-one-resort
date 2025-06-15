// Enquiry Form Submission (send message to server)
const enquiryForm = document.getElementById('enquiryForm');
if (enquiryForm) {
    enquiryForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(this);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            message: formData.get('message'),
            status: 'Pending Reply'
        };

        // Send data to the server as JSON
        fetch(`${config.apiUrl}/inquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(data => {
            showEnquiryNotification();
            enquiryForm.reset();
        })
        .catch(error => console.error('Error:', error)); // Handle any errors
    });
}

// Booking Form Confirmation (send booking data to server)
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });

        // Send data to the server as JSON
        fetch(`${config.apiUrl}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(data => {
            if (typeof showBookingConfirmationMessage === 'function') {
                showBookingConfirmationMessage();
            }
        })
        .catch(error => console.error('Error:', error)); // Handle any errors
    });
}

// Book Now buttons (to scroll to booking section)
document.querySelectorAll('.cta-btn').forEach(button => {
    button.addEventListener('click', function() {
        window.location.href = '#booking-form';  // Scroll or jump to the booking section
    });
});

// Add notification function for booking confirmation
function showBookingNotification() {
    // Remove existing notification if present
    const oldNotif = document.getElementById('booking-notification');
    if (oldNotif) oldNotif.remove();

    const notif = document.createElement('div');
    notif.id = 'booking-notification';
    notif.style.position = 'fixed';
    notif.style.left = '50%';
    notif.style.bottom = '40px';
    notif.style.transform = 'translateX(-50%)';
    notif.style.background = '#222';
    notif.style.color = '#fff';
    notif.style.padding = '18px 32px 18px 32px';
    notif.style.borderRadius = '12px';
    notif.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
    notif.style.display = 'flex';
    notif.style.alignItems = 'center';
    notif.style.gap = '24px';
    notif.style.zIndex = '9999';
    notif.style.fontSize = '1rem';
    notif.innerHTML = `
        <span>Thank you for booking with Hole in One Golf Resort. Your reservation has been confirmed. We will contact you shortly.</span>
        <button id="close-booking-notif" style="background:#b3c6f7;color:#222;font-size:1rem;font-family:'Arial',sans-serif;border-radius:20px;padding:6px 22px;border:none;cursor:pointer;">OK</button>
    `;
    document.body.appendChild(notif);
    document.getElementById('close-booking-notif').onclick = () => notif.remove();
    setTimeout(() => { if (notif.parentNode) notif.remove(); }, 6000);
}

// Add notification function for enquiry confirmation
function showEnquiryNotification() {
    // Remove existing notification if present
    const oldNotif = document.getElementById('enquiry-notification');
    if (oldNotif) oldNotif.remove();

    const notif = document.createElement('div');
    notif.id = 'enquiry-notification';
    notif.style.position = 'fixed';
    notif.style.left = '50%';
    notif.style.bottom = '40px';
    notif.style.transform = 'translateX(-50%)';
    notif.style.background = '#222';
    notif.style.color = '#fff';
    notif.style.padding = '18px 32px 18px 32px';
    notif.style.borderRadius = '12px';
    notif.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
    notif.style.display = 'flex';
    notif.style.alignItems = 'center';
    notif.style.gap = '24px';
    notif.style.zIndex = '9999';
    notif.style.fontSize = '1rem';
    notif.innerHTML = `
        <span>Your enquiry has been submitted. We will get back to you shortly.</span>
        <button id="close-enquiry-notif" style="background:#b3c6f7;color:#222;font-size:1rem;font-family:'Arial',sans-serif;border-radius:20px;padding:6px 22px;border:none;cursor:pointer;">OK</button>
    `;
    document.body.appendChild(notif);
    document.getElementById('close-enquiry-notif').onclick = () => notif.remove();
    setTimeout(() => { if (notif.parentNode) notif.remove(); }, 6000);
}
