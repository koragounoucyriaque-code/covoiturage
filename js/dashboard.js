function setRole(role, btn) {
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const isDriver = role === 'driver';
  document.getElementById('page-title').textContent = 'Tableau de bord — ' + (isDriver ? 'Conducteur' : 'Passager');
  document.getElementById('role-label').textContent = isDriver ? 'Conducteur actif' : 'Passager actif';
  document.getElementById('kpi1').textContent = isDriver ? '14' : '8';
  document.getElementById('kpi2').textContent = isDriver ? '182 €' : '96 €';
}
function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}
function openModal() {
  document.getElementById('modal').classList.add('open');
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('sb-publish').addEventListener('click', function(e) {
  e.preventDefault(); openModal();
});
