/**
 * Main application logic for CoVoitGo Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Navbar Scroll Effect ---
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
      } else {
        nav.style.background = 'rgba(255, 255, 255, 0.9)';
        nav.style.boxShadow = 'none';
      }
    });
  }

  // --- 2. Smooth Scrolling for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- 3. Search Form Handling ---
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get inputs inside the search card
      const inputs = document.querySelectorAll('.search-card input');
      let departure = inputs[0].value.trim();
      let arrival = inputs[1].value.trim();
      let date = inputs[2].value;

      if (!departure || !arrival) {
        showToast('Veuillez renseigner la ville de départ et d\'arrivée.', 'error');
        return;
      }

      // Save search params to localStorage for the dashboard to use
      const searchData = { departure, arrival, date };
      localStorage.setItem('covoitSearchData', JSON.stringify(searchData));
      localStorage.setItem('covoitRole', 'passenger'); // default role for searching

      // Show loader or just redirect
      const originalText = searchBtn.textContent;
      searchBtn.textContent = 'Recherche en cours...';
      searchBtn.style.opacity = '0.8';
      searchBtn.disabled = true;

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    });
  }

  // --- 4. Simple Toast Notification System ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.background = type === 'error' ? '#f85149' : '#2ea043';
    toast.style.color = '#fff';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = "'DM Sans', sans-serif";
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Animate out
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
