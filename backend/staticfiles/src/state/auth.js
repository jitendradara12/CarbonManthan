import { api, setToken, getToken } from '../api/client.js';

export const authState = { user: null, token: getToken() };

export async function hydrate(){
  if(!authState.token) return;
  try { authState.user = await api.me(); } catch { logout(); }
}

export async function loginAction(username,password){
  const data = await api.login(username,password);
  authState.token = data.access; setToken(data.access, data.refresh);
  await hydrate();
}

export function logout(){ authState.token=''; setToken(''); authState.user=null; }
