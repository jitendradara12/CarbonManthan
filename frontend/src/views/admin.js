import { h } from '../components/ui.js';

export const AdminListView = (projects) => h(`
  <div class="card">
    <h2>All Projects for Review</h2>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Project Name</th>
          <th>Owner</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${(projects.results||[]).map(p=>`
          <tr>
            <td>${p.name}</td>
            <td>${p.owner_username || p.owner}</td>
            <td><b>${p.status}</b></td>
            <td class="actions">
              <button data-admin-view="${p.id}">View</button>
              <button data-admin-approve="${p.id}">Approve</button>
              <button data-admin-reject="${p.id}">Reject</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>
`);

export const AdminDetailView = (project, updates) => h(`
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
    ${(updates.results||updates).map(u=>`
      <div class="card">
        <div>${new Date(u.created_at).toLocaleString()}</div>
        <div>${u.notes||''}</div>
        ${u.image?`<img src="${u.image}" style="max-width:100%;height:auto" alt="update"/>`:''}
      </div>`).join('')}
  </div>
`);
