export const API_BASE = window.API_BASE || '/api';

const tokenKey = 'token';
const refreshKey = 'refresh';

export function getToken(){ return localStorage.getItem(tokenKey) || ''; }
export function getRefreshToken(){ return localStorage.getItem(refreshKey) || ''; }
export function setToken(access, refresh){
  if(access) localStorage.setItem(tokenKey, access); else localStorage.removeItem(tokenKey);
  if(refresh) localStorage.setItem(refreshKey, refresh); else localStorage.removeItem(refreshKey);
}

function authHeaders(){ const t=getToken(); return t?{Authorization:`Bearer ${t}`}:{}; }

async function parse(resp){ const text=await resp.text(); try{return JSON.parse(text);}catch{return text;} }

let isRefreshing = false;
let refreshPromise = null;

async function refreshToken(){
  if(!isRefreshing) {
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const refresh = getRefreshToken();
        if(!refresh) throw new Error('No refresh token');
        const data = await api.refresh(refresh);
        setToken(data.access);
        return data.access;
      } catch (e) {
        setToken(); // Clear tokens
        throw e;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function request(path, opts={}){
  let resp = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...(opts.headers||{}), ...authHeaders() }});

  if(resp.status === 401 && getRefreshToken()){
    try {
      await refreshToken();
      resp = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...(opts.headers||{}), ...authHeaders() }});
    } catch (e) {
      // if refresh fails, we will proceed with the original failed response
      console.error("Token refresh failed", e);
      window.location.hash = '#/logout'; // Force logout
    }
  }

  const data = await parse(resp);
  if(!resp.ok) throw { status: resp.status, data };
  return data;
}

// Auth
export const api = {
  login: (username,password)=> request('/auth/token/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) }),
  refresh: (refresh)=> request('/auth/token/refresh/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ refresh }) }),
  register: (payload)=> request('/auth/register/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }),
  me: ()=> request('/auth/me/'),
  // NGO projects
  myProjects: ()=> request('/projects/'),
  createProject: (payload)=> request('/projects/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }),
  project: (id)=> request(`/projects/${id}/`),
  updates: (id)=> request(`/projects/${id}/updates/list/`),
  createUpdate: (id, notes, file)=> {
    const fd = new FormData(); fd.append('notes', notes); if(file) fd.append('image', file);
    return request(`/projects/${id}/updates/`, { method:'POST', body: fd });
  },
  // Admin
  adminProjects: ()=> request('/admin/projects/'),
  adminProject: (id)=> request(`/admin/projects/${id}/`),
  adminUpdates: (id)=> request(`/admin/projects/${id}/updates/`),
  adminPatch: (id,status)=> request(`/admin/projects/${id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) }),
  // Tokens
  mint: (projectId, credits)=> request(`/tokens/admin/projects/${projectId}/mint/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ credits }) }),
  purchase: (projectId, credits, price_per_credit)=> request(`/tokens/buyer/projects/${projectId}/purchase/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ credits, price_per_credit }) }),
  burn: (projectId, credits)=> request(`/tokens/buyer/projects/${projectId}/burn/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ credits }) }),
  purchases: ()=> request(`/tokens/buyer/purchases/`),
};
