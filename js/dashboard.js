/**
 * Professional Dashboard Logic for CoVoitGo
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. State Management ---
  const state = {
    role: localStorage.getItem('covoitRole') || 'driver', // 'driver' or 'passenger'
    activeTab: 'upcoming',
    notifications: 2,
  };

  // --- 2. Initialize Dashboard ---
  initDashboard();

  function initDashboard() {
    // Check if we arrived from search
    const searchData = localStorage.getItem('covoitSearchData');
    if (searchData) {
      const parsed = JSON.parse(searchData);
      showToast(`Recherche pour ${parsed.departure} ➔ ${parsed.arrival} appliquée.`, 'info');
      localStorage.removeItem('covoitSearchData'); // Clear after use
      setRole('passenger', document.querySelectorAll('.role-tab')[1]);
    } else {
      // Set initial role based on state
      const initialTabBtn = state.role === 'driver' 
        ? document.querySelectorAll('.role-tab')[0] 
        : document.querySelectorAll('.role-tab')[1];
      if (initialTabBtn) {
        setRole(state.role, initialTabBtn, false);
      }
    }

    // Attach event listeners to Accept/Decline buttons
    attachRequestActions();
    
    // Attach form submission for new trip
    attachPublishForm();
  }

  // --- 3. Role Management ---
  window.setRole = function(role, btn, notify = true) {
    state.role = role;
    localStorage.setItem('covoitRole', role);

    // Update buttons
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const isDriver = role === 'driver';

    // Update Texts
    document.getElementById('page-title').textContent = 'Tableau de bord — ' + (isDriver ? 'Conducteur' : 'Passager');
    document.getElementById('role-label').textContent = isDriver ? 'Conducteur actif' : 'Passager régulier';
    
    // Update KPIs with animation
    animateValue('kpi1', 0, isDriver ? 14 : 8, 1000);
    animateValue('kpi2', 0, isDriver ? 182 : 96, 1000, ' €');

    // Toggle Specific Sections
    const requestsCard = document.querySelector('.grid-2 .card:nth-child(2)');
    const publishCard = document.querySelector('.grid-3 .card:nth-child(2)');
    
    if (requestsCard && publishCard) {
      if (isDriver) {
        requestsCard.style.display = 'block';
        publishCard.style.display = 'block';
        requestsCard.style.animation = 'fadeIn 0.5s ease forwards';
        publishCard.style.animation = 'fadeIn 0.5s ease forwards';
      } else {
        requestsCard.style.display = 'none';
        publishCard.style.display = 'none';
      }
    }

    if (notify) {
      showToast(`Mode ${isDriver ? 'Conducteur' : 'Passager'} activé`, 'success');
    }
  };

  // --- 4. Tab Management ---
  window.switchTab = function(tab, el) {
    state.activeTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    const tripsContainer = document.querySelector('.grid-2 .card:nth-child(1) .card-body');
    const trips = tripsContainer.querySelectorAll('.trip-item');

    trips.forEach(trip => {
      const statusBadge = trip.querySelector('.status-badge');
      const isDone = statusBadge && statusBadge.classList.contains('done');

      if (tab === 'upcoming') {
        trip.style.display = isDone ? 'none' : 'flex';
      } else if (tab === 'past') {
        trip.style.display = isDone ? 'flex' : 'none';
      } else {
        // Stats tab - hide all and show a message (simplified for demo)
        trip.style.display = 'none';
      }
    });

    if (tab === 'stats') {
      if (!document.getElementById('stats-msg')) {
        const msg = document.createElement('p');
        msg.id = 'stats-msg';
        msg.style.color = 'var(--muted)';
        msg.style.textAlign = 'center';
        msg.style.padding = '2rem 0';
        msg.textContent = 'Vos statistiques détaillées apparaîtront ici.';
        tripsContainer.appendChild(msg);
      } else {
        document.getElementById('stats-msg').style.display = 'block';
      }
    } else {
      const msg = document.getElementById('stats-msg');
      if (msg) msg.style.display = 'none';
    }
  };

  // --- 5. Modal Management ---
  window.openModal = function() {
    const modal = document.getElementById('modal');
    modal.classList.add('open');
    // small scale animation
    const modalContent = modal.querySelector('.modal');
    modalContent.style.transform = 'scale(0.95) translateY(20px)';
    requestAnimationFrame(() => {
      modalContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      modalContent.style.transform = 'scale(1) translateY(0)';
    });
  };

  window.closeModal = function() {
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal');
    modalContent.style.transform = 'scale(0.95) translateY(20px)';
    setTimeout(() => {
      modal.classList.remove('open');
      modalContent.style.transform = '';
    }, 200);
  };

  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.getElementById('sb-publish').addEventListener('click', function(e) {
    e.preventDefault(); 
    if(state.role !== 'driver') {
      showToast('Vous devez être en mode conducteur pour publier.', 'warning');
      setRole('driver', document.querySelectorAll('.role-tab')[0]);
    }
    openModal();
  });

  // --- 6. Publish Trip Form ---
  function attachPublishForm() {
    // For both the quick form and the modal form
    const forms = document.querySelectorAll('.pub-form');
    forms.forEach(form => {
      const btn = form.querySelector('button.btn-primary, .modal-actions .btn-primary');
      if(btn) {
        // Find parent to handle correctly if button is outside form div
        let clickable = btn;
        if(form.nextElementSibling && form.nextElementSibling.classList.contains('modal-actions')){
            clickable = form.nextElementSibling.querySelector('.btn-primary');
        }

        clickable.addEventListener('click', (e) => {
          e.preventDefault();
          const inputs = form.querySelectorAll('input');
          let isValid = true;
          
          inputs.forEach(input => {
            if (input.type !== 'text' && input.type !== 'date' && input.type !== 'time' && input.type !== 'number') return;
            if (!input.value && !input.placeholder.includes('optionnel')) {
              isValid = false;
              input.style.border = '1px solid var(--danger)';
            } else {
              input.style.border = '1px solid var(--border)';
            }
          });

          if (!isValid) {
            showToast('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
          }

          // Simulate API call
          const originalText = clickable.textContent;
          clickable.textContent = 'Publication...';
          clickable.disabled = true;

          setTimeout(() => {
            closeModal();
            showToast('Trajet publié avec succès !', 'success');
            clickable.textContent = originalText;
            clickable.disabled = false;
            inputs.forEach(i => i.value = ''); // reset
            
            // Increment KPI
            if(state.role === 'driver') {
               const kpi1 = document.getElementById('kpi1');
               kpi1.textContent = parseInt(kpi1.textContent) + 1;
            }
          }, 800);
        });
      }
    });
  }

  // --- 7. Request Actions ---
  function attachRequestActions() {
    const reqItems = document.querySelectorAll('.req-item');
    reqItems.forEach(item => {
      const acceptBtn = item.querySelector('.btn-accept');
      const declineBtn = item.querySelector('.btn-decline');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => handleRequest(item, 'accepted'));
      }
      if (declineBtn) {
        declineBtn.addEventListener('click', () => handleRequest(item, 'declined'));
      }
    });
  }

  function handleRequest(element, action) {
    // Animate out
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'translateX(20px)';

    setTimeout(() => {
      element.remove();
      updateNotificationsCount();
      
      if (action === 'accepted') {
        showToast('Passager accepté. Un email lui a été envoyé.', 'success');
      } else {
        showToast('Demande refusée.', 'info');
      }
    }, 300);
  }

  function updateNotificationsCount() {
    state.notifications = Math.max(0, state.notifications - 1);
    const badges = document.querySelectorAll('.badge');
    badges.forEach(b => {
      if(state.notifications === 0) {
        b.style.display = 'none';
      } else {
        b.textContent = state.notifications;
      }
    });
    
    // Update red pill in header
    const reqHeaderSpan = document.querySelector('.card-head span');
    if(reqHeaderSpan && reqHeaderSpan.textContent.includes('nouvelles')) {
      if(state.notifications === 0) {
        reqHeaderSpan.style.display = 'none';
      } else {
        reqHeaderSpan.textContent = state.notifications + ' nouvelles';
      }
    }
  }

  // --- 8. Utility: Toast Notification ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
      success: { bg: '#2ea043', icon: '✓' },
      error: { bg: '#f85149', icon: '✕' },
      info: { bg: '#58a6ff', icon: 'ℹ' },
      warning: { bg: '#d29922', icon: '⚠' }
    };

    const cfg = colors[type] || colors.success;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 20px',
      background: cfg.bg,
      color: '#fff',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      zIndex: '9999',
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    toast.innerHTML = `<span style="font-size:1.1rem">${cfg.icon}</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- 9. Utility: Animate Numbers ---
  function animateValue(id, start, end, duration, suffix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.floor(easeProgress * (end - start) + start);
      obj.textContent = currentVal + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = end + suffix;
      }
    };
    window.requestAnimationFrame(step);
  }

});
