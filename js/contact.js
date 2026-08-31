// NDTechHub Contact Form Handler & FAQ Accordion Interactions

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Logic
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const parent = question.closest('.faq-item');
      const isActive = parent.classList.contains('active');

      // Close all other FAQs to maintain clean Bento card sizes
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current FAQ
      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });

  // 2. Form Submission & Validation Simulation
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Reset states
      formStatus.className = 'form-status';
      formStatus.style.display = 'none';

      // Basic regex for email verification
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !subject || !message) {
        formStatus.textContent = 'Please fill in all fields before sending.';
        formStatus.classList.add('error');
        return;
      }

      if (!emailPattern.test(email)) {
        formStatus.textContent = 'Please enter a valid email address.';
        formStatus.classList.add('error');
        return;
      }

      // If validation passes, simulate sending
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Message... <i data-lucide="loader" class="spin"></i>';
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Add spin animation class to the loader icon dynamically
      const loaderIcon = submitBtn.querySelector('svg');
      if (loaderIcon) {
        loaderIcon.style.animation = 'pulse-glow 1s infinite linear';
      }

      setTimeout(() => {
        // Success status
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        formStatus.textContent = 'Thank you! Your message has been sent successfully. We will get back to you shortly.';
        formStatus.classList.add('success');
        
        // Reset form inputs
        contactForm.reset();
      }, 1500);
    });
  }
});
