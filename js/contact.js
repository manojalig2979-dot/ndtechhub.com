// contact.js
window.addEventListener('DOMContentLoaded', () => {
    // Check if there are URL parameters to prefill the scope
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    if (subject) {
        const scopeInput = document.getElementById('contact-scope');
        if (scopeInput) {
            scopeInput.value = subject;
        }
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const feedback = document.getElementById('form-feedback');
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Transmitting to NDTechHub...</span>`;

    // Simulating seamless asynchronous transmission
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>Sent Successfully</span>`;
        
        feedback.className = "p-3 rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 block";
        feedback.innerHTML = `Thank you <strong>${name}</strong>! Your inquiry has been received. The NDTechHub engineering leadership team will reply to <strong>${email}</strong> within 12 hours.`;
        
        document.getElementById('contact-form').reset();
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }, 1200);
}
