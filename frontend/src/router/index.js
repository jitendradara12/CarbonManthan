import { el, flash, Loader } from '../components/ui.js';
import { authState, hydrate, logout, loginAction } from '../state/auth.js';
import { api } from '../api/client.js';
import { LoginView, RegisterView } from '../views/auth.js';
import { NGOListView, ProjectDetailView } from '../views/ngo.js';
import { AdminListView, AdminDetailView } from '../views/admin.js';
import { BuyerDashboardView } from '../views/buyer.js';

function renderNav(){
  const nav = el('nav');
  if(!authState.user){
    nav.innerHTML = `<a class="navlink" href="#/login">Login</a><a class="navlink" href="#/register">Register</a>`;
  } else {
    nav.innerHTML = `<span>${authState.user.username} (${authState.user.role})</span> <a class="navlink" href="#/logout">Logout</a>`;
  }
}

async function route(){
  renderNav();
  const v = el('view');
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
    } else if(hash.startsWith('#/project/')){
      const id = hash.split('/')[2];
      const [pr, updates] = await Promise.all([api.project(id), api.updates(id)]);
      v.innerHTML = ProjectDetailView(pr, updates);
      focusEl = v.querySelector('h2');
    } else if(hash === '#/' && authState.user?.role === 'ADMIN'){
      v.innerHTML = AdminListView(await api.adminProjects());
      focusEl = v.querySelector('h2');
    } else if(hash.startsWith('#/admin/project/')){
      const id = hash.split('/')[3];
      const [pr, up] = await Promise.all([api.adminProject(id), api.adminUpdates(id)]);
      v.innerHTML = AdminDetailView(pr, up);
      focusEl = v.querySelector('h2');
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
}

function bind(v){
  const disableSubmit = (form, flag) => {
    const btn = form.querySelector('button');
    if(btn) btn.disabled = flag;
  };

  const lf = v.querySelector('#loginForm');
  if(lf) lf.onsubmit = async e => { e.preventDefault(); const f=new FormData(lf); disableSubmit(lf, true); try{ await loginAction(f.get('username'), f.get('password')); location.hash='#/'; }catch(err){ flash(err.data?.detail || 'Login failed'); disableSubmit(lf, false); } };

  const rf = v.querySelector('#regForm');
  if(rf) rf.onsubmit = async e => { e.preventDefault(); const f=new FormData(rf); const payload=Object.fromEntries(f.entries()); disableSubmit(rf, true); try{ await api.register(payload); flash('Account created', true); location.hash='#/login'; }catch(err){ flash(Object.values(err.data).join(' ') || 'Register failed'); disableSubmit(rf, false); } };

  const pf = v.querySelector('#projForm');
  if(pf) pf.onsubmit = async e => { e.preventDefault(); const f=new FormData(pf); disableSubmit(pf, true); try{ const data = await api.createProject(Object.fromEntries(f.entries())); flash('Project created', true); location.hash = `#/project/${data.id}`; }catch(err){ flash('Create failed'); disableSubmit(pf, false); } };

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
    upd.onsubmit = async e => { e.preventDefault(); const f=new FormData(upd); const id=location.hash.split('/')[2]; disableSubmit(upd, true); try{ await api.createUpdate(id, f.get('notes'), imgInput.files[0]); flash('Update uploaded', true); route(); }catch(err){ flash('Upload failed'); disableSubmit(upd, false); } };
  }

  v.querySelectorAll('[data-view-project]').forEach(btn=> btn.onclick = ()=> location.hash = `#/project/${btn.getAttribute('data-view-project')}`);
  v.querySelectorAll('[data-admin-view]').forEach(btn=> btn.onclick = ()=> location.hash = `#/admin/project/${btn.getAttribute('data-admin-view')}`);
  v.querySelectorAll('[data-admin-approve]').forEach(btn=> btn.onclick = async ()=> { const id=btn.getAttribute('data-admin-approve'); try{ await api.adminPatch(id,'Approved'); flash('Approved', true); route(); }catch{ flash('Action failed'); } });
  v.querySelectorAll('[data-admin-reject]').forEach(btn=> btn.onclick = async ()=> { const id=btn.getAttribute('data-admin-reject'); try{ await api.adminPatch(id,'Rejected'); flash('Rejected', true); route(); }catch{ flash('Action failed'); } });

  v.querySelectorAll('[data-page-url]').forEach(btn => btn.onclick = async () => {
    const url = btn.dataset.pageUrl;
    if(!url) return;
    const page = await api.request(url.replace(API_BASE, ''));
    v.innerHTML = AdminListView(page);
    bind(v);
  });
}

export async function initApp(){ await hydrate(); await route(); window.addEventListener('hashchange', route); }
