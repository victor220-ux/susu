// ./dashboard.js

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_ANON_KEY = 'your-public-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State tracking variables
let localRequestsState = [];
let targetRequestId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Route Shielding Check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = './index.html'; 
    return;
  }
  document.getElementById('userEmail').textContent = session.user.email;

  // DOM node extraction markers
  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const detailModal = document.getElementById('detailModal');
  const saveStatusBtn = document.getElementById('saveStatusBtn');
  const modalStatusSelect = document.getElementById('modalStatusSelect');

  // Trigger base database read
  await fetchRequestsData();

  // Event Register Handlers
  searchInput.addEventListener('input', renderFilteredView);
  statusFilter.addEventListener('change', renderFilteredView);
  
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    detailModal.classList.add('hidden');
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = './index.html';
  });

  // 2. Update Status Handler (Matches SQL check constraints)
  saveStatusBtn.addEventListener('click', async () => {
    const updatedStatus = modalStatusSelect.value;
    if (!targetRequestId) return;

    // Database update pointing to the correct 'project_requests' table
    const { error } = await supabase
      .from('project_requests')
      .update({ status: updatedStatus })
      .eq('id', targetRequestId);

    if (!error) {
      // Local mutation mapping to preserve UI responsiveness
      localRequestsState = localRequestsState.map(item => 
        item.id === targetRequestId ? { ...item, status: updatedStatus } : item
      );
      renderFilteredView();
      detailModal.classList.add('hidden');
      triggerToastAlert();
    } else {
      console.error('Supabase Update Error:', error);
      alert('Error updating request state: ' + error.message);
    }
  });

  // 3. Fetch from 'project_requests' table
  async function fetchRequestsData() {
    try {
      const { data, error } = await supabase
        .from('project_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      localRequestsState = data || [];
      renderFilteredView();
    } catch (error) {
      console.error('Fetch Error:', error);
      tableBody.innerHTML = `<div class="empty">Failed loading data payload. Check your console.</div>`;
    }
  }

  // 4. Parse fields accurately according to database changes
  function renderFilteredView() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const currentFilter = statusFilter.value;

    const filtered = localRequestsState.filter(item => {
      const matchesSearch = 
        (item.name && item.name.toLowerCase().includes(searchQuery)) ||
        (item.company && item.company.toLowerCase().includes(searchQuery)) ||
        (item.email && item.email.toLowerCase().includes(searchQuery)) ||
        (item.service && item.service.toLowerCase().includes(searchQuery));
        
      const matchesStatus = currentFilter === 'ALL' || item.status === currentFilter;
      return matchesSearch && matchesStatus;
    });

    calculateAggregateAnalytics(localRequestsState);

    if (filtered.length === 0) {
      tableBody.innerHTML = `<div class="empty">No project requests found matching selection inputs.</div>`;
      return;
    }

    tableBody.innerHTML = filtered.map(item => `
      <div class="row click" data-id="${item.id}">
        <div style="font-weight: 600;">${escapeMarkup(item.name)}</div>
        <div>${escapeMarkup(item.company || '—')}</div>
        <div class="muted">${escapeMarkup(item.email)}</div>
        <div>${escapeMarkup(item.budget || '—')}</div>
        <div class="muted">${new Date(item.created_at).toLocaleDateString()}</div>
        <div><span class="badge status-${item.status}">${escapeMarkup(item.status)}</span></div>
      </div>
    `).join('');

    // Attach explicit click listener hooks to rows
    document.querySelectorAll('#tableBody .row.click').forEach(element => {
      element.addEventListener('click', () => {
        openInspectionModal(element.getAttribute('data-id'));
      });
    });
  }

  // 5. KPI Totals matching database status fields
  function calculateAggregateAnalytics(dataset) {
    document.getElementById('statTotal').textContent = dataset.length;
    document.getElementById('statPending').textContent = dataset.filter(i => i.status === 'new').length;
    document.getElementById('statActive').textContent = dataset.filter(i => i.status === 'contacted' || i.status === 'qualified').length;
    document.getElementById('statConverted').textContent = dataset.filter(i => i.status === 'closed').length;
  }

  // 6. Modal content filler mapped to 'message' instead of 'brief'
  function openInspectionModal(id) {
    const entry = localRequestsState.find(item => item.id == id);
    if (!entry) return;

    targetRequestId = entry.id;
    document.getElementById('modalClientName').textContent = entry.name;
    document.getElementById('modalCompany').textContent = `${entry.company || '—'} (${entry.service})`;
    document.getElementById('modalEmail').textContent = entry.email + (entry.phone ? ` / ${entry.phone}` : '');
    document.getElementById('modalBudget').textContent = entry.budget || '—';
    document.getElementById('modalDate').textContent = new Date(entry.created_at).toLocaleString();
    
    // Corrected column name mapping here: entry.message
    document.getElementById('modalBrief').textContent = entry.message || 'No description provided.';
    modalStatusSelect.value = entry.status || 'new';

    detailModal.classList.remove('hidden');
  }

  function triggerToastAlert() {
    const toast = document.getElementById('toastNotification');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }

  function escapeMarkup(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
