import { el, flash, Loader } from '../components/ui.js';
import { authState, hydrate, logout, loginAction } from '../state/auth.js';
import { api, API_BASE, request as rawRequest } from '../api/client.js';
import { LoginView, RegisterView } from '../views/auth.js';
import { NGOListView, ProjectDetailView } from '../views/ngo.js';
import { AdminListView, AdminDetailView } from '../views/admin.js';
import { BuyerDashboardView } from '../views/buyer.js';

function renderNav(){
  const nav = el('nav');
  if(!authState.user){
    nav.innerHTML = `<a class="navlink" href="#/login">Login</a><a class="navlink" href="#/register">Register</a>`;
  } else {
    nav.innerHTML = `<span>Welcome, <strong>${authState.user.username}</strong> (${authState.user.role})</span> <a class="navlink logout-btn" href="#/logout">Logout</a>`;
  }
}

async function route(){
  renderNav();
  const v = el('view');
  v.className = 'fadeIn';
  v.innerHTML = Loader();
  const hash = location.hash || '#/';
  if(!authState.user && !['#/login','#/register'].includes(hash)) {
    location.hash = '#/login'; return;
  }
  try {
    let focusEl = null;
    if(hash === '#/' && authState.user?.role === 'NGO'){
      v.innerHTML = NGOListView(await api.myProjects());
      focusEl = v.querySelector('h2');
      // Init map picker for create form (guard errors)
      try {
        const mapDiv = v.querySelector('#map-picker');
        if (mapDiv && window.L) {
          const latInput = v.querySelector('input[name=location_lat]');
          const lonInput = v.querySelector('input[name=location_lon]');
          const map = L.map(mapDiv).setView([20.5937, 78.9629], 5);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap'}).addTo(map);
          let marker = null;
          const setPoint = (lat, lon) => {
            latInput.value = Number(lat).toFixed(6);
            lonInput.value = Number(lon).toFixed(6);
            if (marker) {
              marker.setLatLng([lat, lon]);
            } else {
              marker = L.marker([lat, lon], {draggable:true}).addTo(map);
              marker.on('dragend', () => { const c = marker.getLatLng(); latInput.value = c.lat.toFixed(6); lonInput.value = c.lng.toFixed(6); });
            }
            map.setView([lat, lon], 13);
          };
          map.on('click', (e) => setPoint(e.latlng.lat, e.latlng.lng));
          // Expose setPoint for the button handler
          mapDiv.setPoint = setPoint;
          if (latInput.value && lonInput.value) {
            setPoint(parseFloat(latInput.value), parseFloat(lonInput.value));
            map.setView([parseFloat(latInput.value), parseFloat(lonInput.value)], 10);
          }
        }
      } catch (e) { console.error('Map init (NGO create) failed', e); }
    } else if(hash.startsWith('#/project/')){
      const id = hash.split('/')[2];
      const [pr, updates] = await Promise.all([api.project(id), api.updates(id)]);
      v.innerHTML = ProjectDetailView(pr, updates);
      focusEl = v.querySelector('h2');
      // Init read-only map for project details (guard errors)
      try {
        const mapDiv = v.querySelector('#map-project');
        if (mapDiv && window.L) {
          const map = L.map(mapDiv, { zoomControl: true, scrollWheelZoom: false });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap'}).addTo(map);
          const lat = parseFloat(pr.location_lat), lon = parseFloat(pr.location_lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            map.setView([lat, lon], 11);
            L.marker([lat, lon]).addTo(map);
          } else {
            map.setView([20.5937, 78.9629], 5);
          }
        }
      } catch (e) { console.error('Map init (project detail) failed', e); }
    } else if(hash === '#/' && authState.user?.role === 'ADMIN'){
      v.innerHTML = AdminListView(await api.adminProjects());
      focusEl = v.querySelector('h2');
    } else if(hash.startsWith('#/admin/project/')){
      const id = hash.split('/')[3];
      const [pr, up] = await Promise.all([api.adminProject(id), api.adminUpdates(id)]);
      v.innerHTML = AdminDetailView(pr, up);
      focusEl = v.querySelector('h2');
      // Admin detail map (guard errors)
      try {
        const mapDiv = v.querySelector('#map-project');
        if (mapDiv && window.L) {
          const map = L.map(mapDiv, { zoomControl: true, scrollWheelZoom: false });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap'}).addTo(map);
          const lat = parseFloat(pr.location_lat), lon = parseFloat(pr.location_lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            map.setView([lat, lon], 11);
            L.marker([lat, lon]).addTo(map);
          } else {
            map.setView([20.5937, 78.9629], 5);
          }
        }
      } catch (e) { console.error('Map init (admin detail) failed', e); }
    } else if (hash === '#/' && authState.user?.role === 'BUYER') {
      v.innerHTML = BuyerDashboardView();
      focusEl = v.querySelector('h2');
    } else if(hash === '#/login'){
      v.innerHTML = LoginView();
      focusEl = v.querySelector('input[name=username]');
    } else if(hash === '#/register'){
      v.innerHTML = RegisterView();
      focusEl = v.querySelector('input[name=username]');
    } else if(hash === '#/logout'){
      logout(); renderNav(); location.hash = '#/login'; return;
    } else {
      v.innerHTML = `<div class="card"><h2>Page Not Found</h2><p>The requested page does not exist.</p></div>`;
      focusEl = v.querySelector('h2');
    }
    if(focusEl) focusEl.focus();
  } catch(e){
    flash(e.data?.detail || 'Failed to load');
    v.innerHTML = `<div class="card"><h2>Error</h2><p>Could not load page content.</p></div>`;
  }
  bind(v);
  // After bind, if buyer dashboard, fetch purchases
  if ((location.hash || '#/') === '#/' && authState.user?.role === 'BUYER') {
    try {
      const pane = v.querySelector('#buyerPurchases');
      if (pane) {
        const data = await api.purchases();
        if (!data.results || data.results.length === 0) {
          pane.innerHTML = '<h3>My Purchases</h3><div class="empty-state"><p>No purchases yet.</p></div>';
        } else {
          pane.innerHTML = '<h3>My Purchases</h3>' +
            '<table class="admin-table"><thead><tr><th>ID</th><th>Project</th><th>Credits</th><th>Price/credit</th><th>Date</th></tr></thead><tbody>' +
            data.results.map(p=>`<tr><td>${p.id}</td><td>${p.project}</td><td>${p.credits}</td><td>${p.price_per_credit}</td><td>${new Date(p.created_at).toLocaleString()}</td></tr>`).join('') +
            '</tbody></table>';
        }
      }
    } catch (e) {
      // ignore render error
    }
  }
}

function bind(v){
  const setFormSubmitting = (form, isSubmitting) => {
    const btn = form.querySelector('button[type="submit"], button:not([type])');
    if (!btn) return;

    if (isSubmitting) {
      btn.disabled = true;
      if (!btn.dataset.originalContent) {
        btn.dataset.originalContent = btn.innerHTML;
      }
      btn.innerHTML = 'Submitting...';
    } else {
      btn.disabled = false;
      if (btn.dataset.originalContent) {
        btn.innerHTML = btn.dataset.originalContent;
      }
    }
  };

  const lf = v.querySelector('#loginForm');
  if(lf) lf.onsubmit = async e => { e.preventDefault(); const f=new FormData(lf); setFormSubmitting(lf, true); try{ await loginAction(f.get('username'), f.get('password')); location.hash='#/'; }catch(err){ flash(err.data?.detail || 'Login failed'); setFormSubmitting(lf, false); } };

  const rf = v.querySelector('#regForm');
  if(rf) rf.onsubmit = async e => { e.preventDefault(); const f=new FormData(rf); const payload=Object.fromEntries(f.entries()); setFormSubmitting(rf, true); try{ await api.register(payload); flash('Account created', true); location.hash='#/login'; }catch(err){ flash(Object.values(err.data).join(' ') || 'Register failed'); setFormSubmitting(rf, false); } };

  const pf = v.querySelector('#projForm');
  if(pf) pf.onsubmit = async e => {
    e.preventDefault();
    const f=new FormData(pf);
    setFormSubmitting(pf, true);
    try{
      const payload = Object.fromEntries(f.entries());
      // Coerce numeric fields
      payload.location_lat = parseFloat(payload.location_lat);
      payload.location_lon = parseFloat(payload.location_lon);
      payload.area_hectares = parseFloat(payload.area_hectares);
      if ([payload.location_lat, payload.location_lon, payload.area_hectares].some(v => Number.isNaN(v))) {
        throw { data: { detail: 'Please set a valid location on the map and enter a valid area.' } };
      }
      const data = await api.createProject(payload);
      flash('Project created', true);
      location.hash = `#/project/${data.id}`;
    }catch(err){
      const detail = (err?.data && typeof err.data === 'object') ? Object.values(err.data).flat().join(' ') : (err?.data?.detail || 'Create failed');
      flash(detail);
      setFormSubmitting(pf, false);
    }
  };

  const upd = v.querySelector('#updForm');
  if(upd) {
    const imgInput = upd.querySelector('input[name=image]');
    const preview = el('img-preview-container');
    if(imgInput && preview) {
      imgInput.onchange = () => {
        const file = imgInput.files[0];
        if(file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" class="image-preview" alt="Image preview"/>`;
          };
          reader.readAsDataURL(file);
        } else {
          preview.innerHTML = '';
        }
      };
    }
    upd.onsubmit = async e => { e.preventDefault(); const f=new FormData(upd); const id=location.hash.split('/')[2]; setFormSubmitting(upd, true); try{ await api.createUpdate(id, f.get('notes'), imgInput.files[0]); flash('Update uploaded', true); route(); }catch(err){ flash('Upload failed'); setFormSubmitting(upd, false); } };
  }

  const locationBtn = v.querySelector('#auto-location-btn');
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      const latInput = v.querySelector('input[name=location_lat]');
      const lonInput = v.querySelector('input[name=location_lon]');
      const mapDiv = v.querySelector('#map-picker');

      if (navigator.geolocation) {
        locationBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            latInput.value = latitude.toFixed(6);
            lonInput.value = longitude.toFixed(6);
            flash('Location fetched successfully!', 'ok');
            
            if (mapDiv.setPoint) {
              mapDiv.setPoint(latitude, longitude);
            }
            locationBtn.disabled = false;
          },
          (error) => {
            flash(`Error: ${error.message}`, 'error');
            locationBtn.disabled = false;
          }
        );
      } else {
        flash('Geolocation is not supported by this browser.', 'error');
      }
    });
  }

  v.querySelectorAll('[data-view-project]').forEach(btn=> btn.onclick = ()=> location.hash = `#/project/${btn.getAttribute('data-view-project')}`);
  v.querySelectorAll('[data-admin-view]').forEach(btn=> btn.onclick = ()=> location.hash = `#/admin/project/${btn.getAttribute('data-admin-view')}`);
  v.querySelectorAll('[data-admin-approve]').forEach(btn=> btn.onclick = async ()=> { const id=btn.getAttribute('data-admin-approve'); try{ await api.adminPatch(id,'Approved'); flash('Approved', true); route(); }catch{ flash('Action failed'); } });
  v.querySelectorAll('[data-admin-reject]').forEach(btn=> btn.onclick = async ()=> { const id=btn.getAttribute('data-admin-reject'); try{ await api.adminPatch(id,'Rejected'); flash('Rejected', true); route(); }catch{ flash('Action failed'); } });
  // Admin enhanced handlers and buyer actions below

  const mintBtn = v.querySelector('[data-admin-mint]');
  if (mintBtn) mintBtn.onclick = async () => {
    const id = mintBtn.getAttribute('data-admin-mint');
    const input = document.getElementById('mint-credits');
    const n = parseInt((input?.value || '0'), 10);
    if (!n) return flash('Enter credits');
    const resEl = document.getElementById('mint-result');
    const old = mintBtn.innerHTML; mintBtn.disabled = true; mintBtn.innerHTML = 'Minting…';
    try { const r = await api.mint(id, n); if(resEl) resEl.textContent = `Result: tx=${r.tx_hash||'simulated'}, total=${r.total_credits_minted}`; flash('Minted (dry-run)', true); route(); } catch(e) { if(resEl) resEl.textContent = ''; flash(e?.data?.detail || 'Mint failed'); } finally { mintBtn.disabled = false; mintBtn.innerHTML = old; };
  };

  const qaBtn = v.querySelector('[data-admin-quickapprove]');
  if (qaBtn) qaBtn.onclick = async ()=>{
    const id = qaBtn.getAttribute('data-admin-quickapprove');
    const old = qaBtn.innerHTML; qaBtn.disabled = true; qaBtn.innerHTML = 'Approving…';
    try { await api.adminPatch(id,'Approved'); try{ await api.mint(id, 100); }catch{} flash('Approved + minted 100', true); route(); } catch { flash('Quick approve failed'); } finally { qaBtn.disabled = false; qaBtn.innerHTML = old; }
  };

  const purchaseBtn = v.querySelector('#btnPurchase');
  if (purchaseBtn) purchaseBtn.onclick = async ()=>{
    const form = v.querySelector('#buyerActions');
    const fd = new FormData(form);
    const pid = fd.get('projectId');
    const credits = parseInt(fd.get('credits')||'0', 10);
    const price = fd.get('price');
    if (!pid || !credits) return flash('Enter Project ID and credits');
    const old = purchaseBtn.innerHTML; purchaseBtn.disabled = true; purchaseBtn.innerHTML = 'Purchasing…';
    try { const r = await api.purchase(pid, credits, price); flash(`Purchased (id ${r.purchase_id})`, true); } catch(e) { flash(e?.data?.detail || 'Purchase failed'); } finally { purchaseBtn.disabled = false; purchaseBtn.innerHTML = old; }
  };

  const burnBtn = v.querySelector('#btnBurn');
  if (burnBtn) burnBtn.onclick = async ()=>{
    const form = v.querySelector('#buyerActions');
    const fd = new FormData(form);
    const pid = fd.get('projectId');
    const credits = parseInt(fd.get('credits')||'0', 10);
    if (!pid || !credits) return flash('Enter Project ID and credits');
    const old = burnBtn.innerHTML; burnBtn.disabled = true; burnBtn.innerHTML = 'Burning…';
    try { const r = await api.burn(pid, credits); flash(`Burned (tx ${r.tx_hash||'simulated'})`, true); } catch(e) { flash(e?.data?.detail || 'Burn failed'); } finally { burnBtn.disabled = false; burnBtn.innerHTML = old; }
  };

  v.querySelectorAll('[data-page-url]').forEach(btn => btn.onclick = async () => {
    const url = btn.dataset.pageUrl;
    if(!url) return;
    const page = await rawRequest(url.replace(API_BASE, ''));
    v.innerHTML = AdminListView(page);
    bind(v);
  });
}

export async function initApp(){ await hydrate(); await route(); window.addEventListener('hashchange', route); }
