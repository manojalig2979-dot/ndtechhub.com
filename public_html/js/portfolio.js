// NDTechHub Portfolio Filtering Script

document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterButtons.length > 0 && portfolioItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 1. Update Active Filter Button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 2. Filter Portfolio Items
        const filterValue = button.getAttribute('data-filter');

        portfolioItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');

          if (filterValue === 'all' || itemCategory === filterValue) {
            item.classList.remove('hidden');
            // Retrigger scale animation
            item.style.animation = 'none';
            item.offsetHeight; // Trigger reflow
            item.style.animation = 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both';
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }
});
