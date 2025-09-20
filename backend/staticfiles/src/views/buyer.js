import { h } from '../components/ui.js';

export const BuyerDashboardView = () => h(`
  <div class="card">
    <h2>Buy & Burn Credits (MVP)</h2>
    <p class="muted">Choose a project to purchase or burn credits.</p>
    <form id="buyerActions">
      <div class="row" style="gap:.75rem;">
        <div class="col" style="min-width:260px;">
          <label>Project
            <select name="projectId" id="buyerProject" required>
              <option value="">Loading projects…</option>
            </select>
          </label>
          <div id="buyerProjectInfo" class="muted" style="font-size:12px;margin-top:4px;">&nbsp;</div>
        </div>
        <div class="col" style="max-width:160px;"><label>Credits<input name="credits" type="number" min="1" step="1" required /></label></div>
        <div class="col" style="max-width:160px;"><label>Price/credit (₹)<input name="price" type="number" step="0.01" /></label></div>
        <div class="col" style="flex:0 0 auto; display:flex; gap:.5rem; align-items:flex-end;">
          <button type="button" id="btnPurchase">Purchase</button>
          <button type="button" id="btnBurn">Burn</button>
        </div>
      </div>
    </form>
  </div>
  <div class="card" id="buyerPurchases">
    <h3>My Purchases</h3>
    <div class="muted">Loading…</div>
  </div>
`);
