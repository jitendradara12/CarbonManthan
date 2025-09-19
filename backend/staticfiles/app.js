(() => {
  const API = () => window.API_BASE || '/api';
  const state = {
    token: localStorage.getItem('token') || '',
    user: null,
  };

  // Helpers
  const h = (html) => html;
  const el = (id) => document.getElementById(id);
  const flash = (msg, ok=false) => {
    const f = el('flash');
    f.className = `flash ${ok ? 'ok' : 'error'}`;
    f.textContent = msg;
    f.hidden = false;
    setTimeout(() => f.hidden = true, 4000);
  }
  const headers = () => state.token ? { 'Authorization': `Bearer ${state.token}` } : {};
  const json = async (resp) => {
    const text = await resp.text();
    try { return JSON.parse(text); } catch { return text; }
  }

  // API calls
  const getMe = async () => fetch(`${API()}/auth/me/`, { headers: { ...headers() } });
  const login = async (username, password) => fetch(`${API()}/auth/token/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const register = async (payload) => fetch(`${API()}/auth/register/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const listMyProjects = async () => fetch(`${API()}/projects/`, { headers: { ...headers() } });
  const createProject = async (payload) => fetch(`${API()}/projects/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers() },
    body: JSON.stringify(payload)
  });
  const getProject = async (id) => fetch(`${API()}/projects/${id}/`, { headers: { ...headers() } });
  const createUpdate = async (id, notes, file) => {
    const fd = new FormData(); fd.append('notes', notes); if (file) fd.append('image', file);
    return fetch(`${API()}/projects/${id}/updates/`, { method: 'POST', headers: { ...headers() }, body: fd });
  }
  const listUpdates = async (id) => fetch(`${API()}/projects/${id}/updates/list/`, { headers: { ...headers() } });
  const adminList = async () => fetch(`${API()}/admin/projects/`, { headers: { ...headers() } });
  const adminGet = async (id) => fetch(`${API()}/admin/projects/${id}/`, { headers: { ...headers() } });
  const adminUpdates = async (id) => fetch(`${API()}/admin/projects/${id}/updates/`, { headers: { ...headers() } });
  const adminPatch = async (id, status) => fetch(`${API()}/admin/projects/${id}/`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers() },
    body: JSON.stringify({ status })
  });

  // Views
  const renderNav = () => {
    const nav = el('nav');
    if (!state.user) {
      nav.innerHTML = h(`<a class="navlink" href="#/login">Login</a><a class="navlink" href="#/register">Register</a>`);
    } else {
      nav.innerHTML = h(`<span>${state.user.username} (${state.user.role})</span> <a class="navlink" href="#/logout">Logout</a>`);
    }
  };

  const LoginView = () => h(`
    <div class="card">
      <h2>Login</h2>
      <form id="loginForm">
        <label>Username<input name="username" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <button>Login</button>
      </form>
    </div>
  `);

  const RegisterView = () => h(`
    <div class="card">
      <h2>Register</h2>
      <form id="regForm">
        <label>Username<input name="username" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <label>Role
          <select name="role" required>
            <option value="NGO">NGO/Community</option>
            <option value="ADMIN">NCCR Admin</option>
            <option value="BUYER">Corporate/Buyer</option>
          </select>
        </label>
        <button>Create account</button>
      </form>
    </div>
  `);

  const NGOListView = (projects) => h(`
    <div class="row">
      <div class="col">
        <div class="card">
          <h2>Your Projects</h2>
          ${(projects.results || []).map(p => `
            <div class="card">
              <strong>${p.name}</strong>
              <div>Status: <b>${p.status}</b></div>
              <button data-view-project="${p.id}">Open</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="col">
        <div class="card">
          <h2>Create Project</h2>
          <form id="projForm">
            <label>Name<input name="name" required /></label>
            <label>Description<textarea name="description" required></textarea></label>
            <label>Latitude<input name="location_lat" type="number" step="0.000001" required /></label>
            <label>Longitude<input name="location_lon" type="number" step="0.000001" required /></label>
            <label>Area (hectares)<input name="area_hectares" type="number" step="0.01" required /></label>
            <button>Create</button>
          </form>
        </div>
      </div>
    </div>
  `);

  const ProjectDetailView = (project, updates) => h(`
    <div class="card">
      <h2>${project.name}</h2>
      <div>Status: <b>${project.status}</b></div>
      <div>Area: ${project.area_hectares} ha</div>
      <div>Location: ${project.location_lat}, ${project.location_lon}</div>
    </div>
    <div class="card">
      <h3>Submit Update</h3>
      <form id="updForm">
        <label>Notes<textarea name="notes" required></textarea></label>
        <label>Image<input name="image" type="file" accept="image/*" required /></label>
        <button>Upload</button>
      </form>
    </div>
    <div class="card">
      <h3>Updates</h3>
      ${(updates.results || updates).map(u => `
        <div class="card">
          <div>${new Date(u.created_at).toLocaleString()}</div>
          <div>${u.notes || ''}</div>
          ${u.image ? `<img src="${u.image}" alt="update" style="max-width:100%;height:auto"/>` : ''}
        </div>
      `).join('')}
    </div>
  `);

  const AdminListView = (projects) => h(`
    <div class="card">
      <h2>All Projects</h2>
      ${(projects.results || []).map(p => `
        <div class="card">
          <strong>${p.name}</strong> by ${p.owner} — Status: <b>${p.status}</b>
          <div>
            <button data-admin-view="${p.id}">View</button>
            <button data-admin-approve="${p.id}">Approve</button>
            <button data-admin-reject="${p.id}">Reject</button>
          </div>
        </div>
      `).join('')}
    </div>
  `);

  const AdminDetailView = (project, updates) => h(`
    <div class="card">
      <h2>${project.name}</h2>
      <div><b>Status:</b> ${project.status}</div>
      <div><b>Owner ID:</b> ${project.owner}</div>
      <div><b>Area:</b> ${project.area_hectares} ha</div>
      <div><b>Location:</b> ${project.location_lat}, ${project.location_lon}</div>
      <div>
        <button data-admin-approve="${project.id}">Approve</button>
        <button data-admin-reject="${project.id}">Reject</button>
      </div>
    </div>
    <div class="card">
      <h3>Updates</h3>
      ${(updates.results || updates).map(u => `
        <div class="card">
          <div>${new Date(u.created_at).toLocaleString()}</div>
          <div>${u.notes || ''}</div>
          ${u.image ? `<img src="${u.image}" alt="update" style="max-width:100%;height:auto"/>` : ''}
        </div>
      `).join('')}
    </div>
  `);

  // Router
  async function router() {
    renderNav();
    const v = el('view');
    const route = location.hash || '#/';
    if (!state.user && route !== '#/login' && route !== '#/register') {
      location.hash = '#/login';
      return;
    }

    try {
      if (route === '#/' && state.user?.role === 'NGO') {
        const resp = await listMyProjects();
        v.innerHTML = NGOListView(await resp.json());
      } else if (route.startsWith('#/project/')) {
        const id = route.split('/')[2];
        const [pr, up] = await Promise.all([getProject(id), listUpdates(id)]);
        v.innerHTML = ProjectDetailView(await pr.json(), await up.json());
      } else if (route === '#/' && state.user?.role === 'ADMIN') {
        const resp = await adminList(); v.innerHTML = AdminListView(await resp.json());
      } else if (route.startsWith('#/admin/project/')) {
        const id = route.split('/')[3];
        const [pr, up] = await Promise.all([adminGet(id), adminUpdates(id)]);
        v.innerHTML = AdminDetailView(await pr.json(), await up.json());
      } else if (route === '#/login') {
        v.innerHTML = LoginView();
      } else if (route === '#/register') {
        v.innerHTML = RegisterView();
      } else if (route === '#/logout') {
        state.token = ''; state.user = null; localStorage.removeItem('token');
        renderNav(); location.hash = '#/login'; return;
      } else {
        v.innerHTML = `<div class="card">Not found</div>`;
      }
    } catch (e) {
      flash('Failed to load');
    }

    bindEvents();
  }

  // Event binding
  function bindEvents() {
    const v = el('view');
    const lf = v.querySelector('#loginForm');
    if (lf) lf.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(lf);
      const resp = await login(f.get('username'), f.get('password'));
      const data = await json(resp);
      if (!resp.ok) return flash(data?.detail || 'Login failed');
      state.token = data.access; localStorage.setItem('token', state.token);
      await hydrateUser();
      location.hash = '#/';
    }

    const rf = v.querySelector('#regForm');
    if (rf) rf.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(rf);
      const payload = Object.fromEntries(f.entries());
      const resp = await register(payload);
      const data = await json(resp);
      if (!resp.ok) return flash('Register failed');
      flash('Account created. Please login.', true);
      location.hash = '#/login';
    }

    const pf = v.querySelector('#projForm');
    if (pf) pf.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(pf);
      const payload = Object.fromEntries(f.entries());
      const resp = await createProject(payload);
      const data = await json(resp);
      if (!resp.ok) return flash('Create project failed');
      flash('Project created', true); location.hash = `#/project/${data.id}`;
    }

    const upd = v.querySelector('#updForm');
    if (upd) upd.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(upd);
      const notes = f.get('notes'); const file = upd.querySelector('input[name=image]').files[0];
      const id = location.hash.split('/')[2];
      const resp = await createUpdate(id, notes, file);
      if (!resp.ok) return flash('Upload failed');
      flash('Update uploaded', true); router();
    }

    v.querySelectorAll('[data-view-project]').forEach(btn => btn.onclick = () => {
      location.hash = `#/project/${btn.getAttribute('data-view-project')}`;
    });
    v.querySelectorAll('[data-admin-view]').forEach(btn => btn.onclick = () => {
      location.hash = `#/admin/project/${btn.getAttribute('data-admin-view')}`;
    });
    v.querySelectorAll('[data-admin-approve]').forEach(btn => btn.onclick = async () => {
      const id = btn.getAttribute('data-admin-approve');
      const r = await adminPatch(id, 'Approved'); if (r.ok) { flash('Approved', true); router(); } else flash('Action failed');
    });
    v.querySelectorAll('[data-admin-reject]').forEach(btn => btn.onclick = async () => {
      const id = btn.getAttribute('data-admin-reject');
      const r = await adminPatch(id, 'Rejected'); if (r.ok) { flash('Rejected', true); router(); } else flash('Action failed');
    });
  }

  async function hydrateUser() {
    if (!state.token) return;
    const resp = await getMe();
    if (!resp.ok) { state.token = ''; localStorage.removeItem('token'); return; }
    state.user = await resp.json();
    renderNav();
  }

  window.addEventListener('hashchange', router);
  (async function init() {
    await hydrateUser();
    router();
  })();
})();
