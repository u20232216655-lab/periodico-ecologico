'use strict';
const STORAGE_KEY = 'raeeTrackDevices_v2';
const LEGACY_KEY = 'raeeTrackDevices';
const $ = (id) => document.getElementById(id);
let devices = loadDevices();
let pendingDeleteId = null;
let conditionChart = null;
let categoryChart = null;
let toastTimer = null;

function loadDevices() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const legacy = current === null ? localStorage.getItem(LEGACY_KEY) : null;
    const parsed = JSON.parse(current ?? legacy ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, index) => ({
      id: String(item.id ?? `legacy-${Date.now()}-${index}`),
      device: String(item.device ?? 'Dispositivo sin nombre'),
      category: String(item.category ?? inferCategory(item.device)),
      condition: normalizeCondition(item.condition),
      quantity: Math.max(1, Number(item.quantity) || 1),
      date: String(item.date ?? new Date().toISOString().slice(0, 10)),
      location: String(item.location ?? ''),
      notes: String(item.notes ?? '')
    }));
  } catch (error) {
    console.warn('No fue posible leer el inventario local:', error);
    return [];
  }
}
function normalizeCondition(value) {
  if (value === 'Funciona' || value === 'Reparable' || value === 'Dañado') return value;
  return 'Dañado';
}
function inferCategory(device = '') {
  const value = String(device).toLowerCase();
  if (/monitor|pantalla|televisor/.test(value)) return 'Pantallas';
  if (/portátil|escritorio|computador|teclado|mouse|router|módem|tableta/.test(value)) return 'Pequeños equipos informáticos';
  if (/nevera|refrigerador|aire/.test(value)) return 'Intercambio de temperatura';
  if (/lámpara|bombillo/.test(value)) return 'Lámparas';
  if (/lavadora|secadora|horno/.test(value)) return 'Equipos grandes';
  return 'Equipos pequeños';
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    renderAll();
    return true;
  } catch (error) {
    console.error('No fue posible guardar el inventario:', error);
    showToast('No se pudo guardar. Revisa el almacenamiento del navegador.');
    return false;
  }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function sumByCondition(condition) {
  return devices.filter((item) => item.condition === condition).reduce((sum, item) => sum + item.quantity, 0);
}
function totalUnits() { return devices.reduce((sum, item) => sum + item.quantity, 0); }
function showToast(message) {
  const toast = $('toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function showView(name) {
  const valid = ['inicio', 'registrar', 'inventario', 'reportes', 'guia'];
  const view = valid.includes(name) ? name : 'inicio';
  document.querySelectorAll('.view').forEach((section) => section.classList.toggle('active', section.id === `view-${view}`));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  $('mainNav').classList.remove('open'); $('menuToggle').setAttribute('aria-expanded', 'false');
  if (view === 'reportes') renderCharts();
  if (view === 'inventario') renderInventory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderStats() {
  $('statTotal').textContent = totalUnits();
  $('statRepair').textContent = sumByCondition('Reparable');
  $('statReuse').textContent = sumByCondition('Funciona');
  $('statRecycle').textContent = sumByCondition('Dañado');
  $('reportTotal').textContent = totalUnits();
  $('reportCategories').textContent = new Set(devices.map((item) => item.category)).size;
  $('reportEntries').textContent = devices.length;
}
function renderRecent() {
  const container = $('recentList');
  if (!devices.length) { container.className = 'empty-state'; container.textContent = 'Aún no hay dispositivos. Registra el primero para comenzar.'; return; }
  container.className = '';
  container.innerHTML = [...devices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((item) => `<div class="recent-row"><div><strong>${escapeHtml(item.device)}</strong><small>${escapeHtml(item.category)} · ${escapeHtml(item.date)}</small></div><span class="status-pill ${item.condition === 'Reparable' ? 'repair' : item.condition === 'Dañado' ? 'damaged' : ''}">${escapeHtml(item.condition)}</span></div>`).join('');
}
function renderInventory() {
  const search = $('searchInput').value.trim().toLowerCase();
  const category = $('filterCategory').value;
  const condition = $('filterCondition').value;
  const filtered = devices.filter((item) => {
    const haystack = `${item.device} ${item.category} ${item.location} ${item.notes}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!category || item.category === category) && (!condition || item.condition === condition);
  }).sort((a, b) => b.date.localeCompare(a.date));
  $('inventoryBody').innerHTML = filtered.map((item) => `<tr><td><span class="device-name">${escapeHtml(item.device)}</span><span class="device-sub">${escapeHtml(item.location || 'Sin ubicación')}</span></td><td>${escapeHtml(item.category)}</td><td><span class="status-pill ${item.condition === 'Reparable' ? 'repair' : item.condition === 'Dañado' ? 'damaged' : ''}">${escapeHtml(item.condition)}</span></td><td>${item.quantity}</td><td>${escapeHtml(item.date)}</td><td><button class="action-btn" data-edit="${escapeHtml(item.id)}">Editar</button><button class="action-btn delete" data-delete="${escapeHtml(item.id)}">Eliminar</button></td></tr>`).join('');
  $('inventoryEmpty').style.display = filtered.length ? 'none' : 'block';
  $('inventoryCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'} · ${filtered.reduce((sum, item) => sum + item.quantity, 0)} unidades`;
}
function chartOptions() {
  return { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#c6d5c9', usePointStyle: true, padding: 18, font: { family: 'Nunito' } } } } };
}
function renderCharts() {
  if (typeof Chart === 'undefined') {
    $('conditionFallback').textContent = 'No se pudo cargar Chart.js. Comprueba tu conexión a Internet.';
    $('categoryFallback').textContent = 'No se pudo cargar Chart.js. Comprueba tu conexión a Internet.'; return;
  }
  const conditions = ['Funciona', 'Reparable', 'Dañado'];
  const conditionValues = conditions.map((name) => sumByCondition(name));
  const categoryMap = new Map(); devices.forEach((item) => categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + item.quantity));
  const colors = ['#c5f36a', '#e5bd64', '#e47777', '#70b84b', '#72b8a0', '#a4a0dc', '#d59a66'];
  $('conditionFallback').style.display = devices.length ? 'none' : 'block';
  $('categoryFallback').style.display = devices.length ? 'none' : 'block';
  if (conditionChart) conditionChart.destroy(); if (categoryChart) categoryChart.destroy();
  conditionChart = new Chart($('conditionChart'), { type: 'doughnut', data: { labels: conditions, datasets: [{ data: conditionValues, backgroundColor: colors.slice(0, 3), borderColor: '#10251b', borderWidth: 4 }] }, options: { ...chartOptions(), cutout: '65%' } });
  categoryChart = new Chart($('categoryChart'), { type: 'bar', data: { labels: [...categoryMap.keys()], datasets: [{ label: 'Unidades', data: [...categoryMap.values()], backgroundColor: colors, borderRadius: 6 }] }, options: { ...chartOptions(), indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#a5b8aa', precision: 0 }, grid: { color: '#294636' } }, y: { ticks: { color: '#c6d5c9' }, grid: { display: false } } } } });
}
function renderAll() { renderStats(); renderRecent(); renderInventory(); if ($('view-reportes').classList.contains('active')) renderCharts(); }
function resetForm() { $('deviceForm').reset(); $('editId').value = ''; $('quantity').value = 1; $('date').value = new Date().toISOString().slice(0, 10); $('saveButton').innerHTML = 'Guardar registro <span>→</span>'; $('formMessage').textContent = ''; }
function editDevice(id) {
  const item = devices.find((device) => device.id === id); if (!item) return;
  $('editId').value = item.id; $('device').value = item.device; $('category').value = item.category; $('condition').value = item.condition; $('quantity').value = item.quantity; $('date').value = item.date; $('location').value = item.location; $('notes').value = item.notes;
  $('saveButton').innerHTML = 'Actualizar registro <span>→</span>'; $('formMessage').textContent = 'Estás editando un registro existente.'; showView('registrar');
}
function deleteDevice(id) {
  devices = devices.filter((item) => item.id !== id); pendingDeleteId = null; persist();
  if (window.UIkit) UIkit.modal('#confirmModal').hide(); showToast('Registro eliminado del inventario.');
}
function exportCsv() {
  if (!devices.length) { showToast('No hay registros para exportar.'); return; }
  const columns = ['Dispositivo', 'Categoría', 'Estado', 'Cantidad', 'Fecha', 'Ubicación', 'Observaciones'];
  const rows = devices.map((item) => [item.device, item.category, item.condition, item.quantity, item.date, item.location, item.notes]);
  const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'inventario-raee-track.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); showToast('Archivo CSV preparado.');
}

document.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) { event.preventDefault(); const view = viewLink.dataset.view; history.replaceState(null, '', `#${view}`); showView(view); }
  const editButton = event.target.closest('[data-edit]'); if (editButton) editDevice(editButton.dataset.edit);
  const deleteButton = event.target.closest('[data-delete]');
  if (deleteButton) { pendingDeleteId = deleteButton.dataset.delete; if (window.UIkit) UIkit.modal('#confirmModal').show(); else if (confirm('¿Eliminar este registro?')) deleteDevice(pendingDeleteId); }
});
$('menuToggle').addEventListener('click', () => { const open = $('mainNav').classList.toggle('open'); $('menuToggle').setAttribute('aria-expanded', String(open)); });
$('deviceForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const item = { id: $('editId').value || (crypto.randomUUID ? crypto.randomUUID() : `raee-${Date.now()}`), device: $('device').value, category: $('category').value, condition: $('condition').value, quantity: Number($('quantity').value), date: $('date').value, location: $('location').value.trim(), notes: $('notes').value.trim() };
  if (!item.device || !item.category || !item.condition || !item.date || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 9999) { $('formMessage').textContent = 'Revisa los campos obligatorios y la cantidad (entre 1 y 9999).'; return; }
  const existing = devices.findIndex((device) => device.id === item.id);
  if (existing >= 0) devices[existing] = item; else devices.push(item);
  if (persist()) { resetForm(); showToast(existing >= 0 ? 'Registro actualizado correctamente.' : 'Dispositivo registrado correctamente.'); history.replaceState(null, '', '#inventario'); showView('inventario'); }
});
$('resetForm').addEventListener('click', resetForm);
$('searchInput').addEventListener('input', renderInventory); $('filterCategory').addEventListener('change', renderInventory); $('filterCondition').addEventListener('change', renderInventory);
$('exportCsv').addEventListener('click', exportCsv); $('exportCsvReport').addEventListener('click', exportCsv);
$('confirmDelete').addEventListener('click', () => { if (pendingDeleteId) deleteDevice(pendingDeleteId); });
window.addEventListener('hashchange', () => showView(location.hash.slice(1)));
$('date').value = new Date().toISOString().slice(0, 10);
const initialView = location.hash.replace('#', '') || 'inicio'; showView(initialView); renderAll();
