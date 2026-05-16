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
  // We will call initDashboard at the end of the script to avoid hoisting issues with window.setRole
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
    const driverView = document.getElementById('driver-view');
    const passengerView = document.getElementById('passenger-view');
    
    if (driverView && passengerView) {
      driverView.style.display = isDriver ? 'block' : 'none';
      passengerView.style.display = isDriver ? 'none' : 'block';
      
      if(isDriver) driverView.style.animation = 'fadeIn 0.5s ease forwards';
      else passengerView.style.animation = 'fadeIn 0.5s ease forwards';
    } else {
      // Fallback for pages that don't have the dual view (like search.html)
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
    }

    // Update Sidebar Navigation
    const sbNav = document.querySelector('.sb-nav');
    if (sbNav) {
      const activePage = window.location.pathname.split('/').pop() || 'dashboard.html';
      
      const driverNav = `
        <div class="sb-section">Principal</div>
        <a class="sb-item ${activePage === 'dashboard.html' ? 'active' : ''}" href="dashboard.html"><span class="ico">📊</span> Tableau de bord</a>
        <a class="sb-item ${activePage === 'trips.html' ? 'active' : ''}" href="trips.html"><span class="ico">🗺️</span> Mes trajets</a>
        <a class="sb-item" href="#" id="sb-publish"><span class="ico">➕</span> Publier un trajet</a>

        <div class="sb-section">Activité</div>
        <a class="sb-item ${activePage === 'messages.html' ? 'active' : ''}" href="messages.html"><span class="ico">💬</span> Messages <span class="badge" style="display:${state.notifications > 0 ? 'inline-block' : 'none'}">${state.notifications}</span></a>
        <a class="sb-item ${activePage === 'passengers.html' ? 'active' : ''}" href="passengers.html"><span class="ico">👥</span> Mes Passagers</a>
        <a class="sb-item ${activePage === 'reviews.html' ? 'active' : ''}" href="reviews.html"><span class="ico">⭐</span> Mes Avis</a>

        <div class="sb-section">Compte</div>
        <a class="sb-item ${activePage === 'profile.html' ? 'active' : ''}" href="profile.html"><span class="ico">👤</span> Mon profil</a>
        <a class="sb-item ${activePage === 'payments.html' ? 'active' : ''}" href="payments.html"><span class="ico">💰</span> Gains & Virements</a>
        <a class="sb-item ${activePage === 'settings.html' ? 'active' : ''}" href="settings.html"><span class="ico">⚙️</span> Paramètres</a>
        <a class="sb-item" href="index.html"><span class="ico">🏠</span> Accueil</a>
      `;

      const passengerNav = `
        <div class="sb-section">Principal</div>
        <a class="sb-item ${activePage === 'dashboard.html' ? 'active' : ''}" href="dashboard.html"><span class="ico">📊</span> Tableau de bord</a>
        <a class="sb-item ${activePage === 'search.html' ? 'active' : ''}" href="search.html"><span class="ico">🔍</span> Rechercher un trajet</a>
        <a class="sb-item ${activePage === 'trips.html' ? 'active' : ''}" href="trips.html"><span class="ico">🗺️</span> Mes réservations</a>

        <div class="sb-section">Activité</div>
        <a class="sb-item ${activePage === 'messages.html' ? 'active' : ''}" href="messages.html"><span class="ico">💬</span> Messages <span class="badge" style="display:${state.notifications > 0 ? 'inline-block' : 'none'}">${state.notifications}</span></a>
        <a class="sb-item ${activePage === 'passengers.html' ? 'active' : ''}" href="passengers.html"><span class="ico">🚗</span> Mes Conducteurs</a>
        <a class="sb-item ${activePage === 'reviews.html' ? 'active' : ''}" href="reviews.html"><span class="ico">⭐</span> Mes Avis</a>

        <div class="sb-section">Compte</div>
        <a class="sb-item ${activePage === 'profile.html' ? 'active' : ''}" href="profile.html"><span class="ico">👤</span> Mon profil</a>
        <a class="sb-item ${activePage === 'payments.html' ? 'active' : ''}" href="payments.html"><span class="ico">💳</span> Moyens de paiement</a>
        <a class="sb-item ${activePage === 'settings.html' ? 'active' : ''}" href="settings.html"><span class="ico">⚙️</span> Paramètres</a>
        <a class="sb-item" href="index.html"><span class="ico">🏠</span> Accueil</a>
      `;

      sbNav.innerHTML = isDriver ? driverNav : passengerNav;

      // Reattach event listener for sb-publish if it exists
      const sbPublish = document.getElementById('sb-publish');
      if (sbPublish) {
        sbPublish.addEventListener('click', function(e) {
          e.preventDefault();
          openModal();
        });
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

  // Modal sb-publish listener is now attached dynamically inside setRole

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

  // --- 10. Generic Button Handlers for Prototype ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .see-all, button');
    if (!btn) return;

    // Ignore buttons with specific logic already
    if (btn.classList.contains('role-tab') || 
        btn.classList.contains('tab') || 
        btn.classList.contains('btn-cancel') || 
        btn.classList.contains('btn-accept') || 
        btn.classList.contains('btn-decline') || 
        (btn.closest('.pub-form') && btn.classList.contains('btn-primary')) || 
        (btn.closest('.modal') && btn.classList.contains('btn-primary'))) return;

    if (btn.tagName === 'BUTTON' || btn.getAttribute('role') === 'button' || btn.tagName === 'A') {
      // Don't prevent default on real links
      if(btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') {
          return;
      }
      e.preventDefault();
      
      const text = btn.textContent.trim().toLowerCase();
      
      if (text.includes('retirer')) {
        showToast('Demande de retrait effectuée. Traitement sous 48h.', 'success');
      } else if (text.includes('envoyer')) {
        const input = btn.previousElementSibling;
        if (input && input.tagName === 'INPUT' && input.value) {
           showToast('Message envoyé !', 'success');
           input.value = '';
        } else {
           showToast('Veuillez écrire un message.', 'warning');
        }
      } else if (text.includes('voir tout')) {
        showToast('Chargement des autres éléments...', 'info');
      } else if (text.includes('déconnexion')) {
        showToast('Déconnexion en cours...', 'info');
        setTimeout(() => window.location.href = 'index.html', 800);
      } else {
        showToast('Action effectuée avec succès (Simulation).', 'success');
      }
    }
  });

  // Initialize everything now that all functions are defined
  initDashboard();

});
