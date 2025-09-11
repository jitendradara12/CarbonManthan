import { h } from '../components/ui.js';
import { Icon } from '../components/icons.js';

export const LoginView = () => h(`
  <div class="auth-container">
    <div class="card auth-card">
      <h2>Welcome Back</h2>
      <p style="color: var(--muted); margin-top: -0.5rem; margin-bottom: 1.5rem;">Login to access your dashboard.</p>
      <form id="loginForm">
        <label>Username<input name="username" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <button>${Icon('login')} Login</button>
      </form>
    </div>
  </div>
`);

export const RegisterView = () => h(`
  <div class="auth-container">
    <div class="card auth-card">
      <h2>Create Account</h2>
      <p style="color: var(--muted); margin-top: -0.5rem; margin-bottom: 1.5rem;">Join the platform to manage or verify projects.</p>
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
        <button>${Icon('user-plus')} Create Account</button>
      </form>
    </div>
  </div>
`);
