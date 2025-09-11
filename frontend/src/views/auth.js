import { h } from '../components/ui.js';

export const LoginView = () => h(`
  <div class="card">
    <h2>Login</h2>
    <form id="loginForm">
      <label>Username<input name="username" required /></label>
      <label>Password<input name="password" type="password" required /></label>
      <button>Login</button>
    </form>
  </div>
`);

export const RegisterView = () => h(`
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
