import { h } from '../components/ui.js';

export const AdminListView = (projects) => {
  const hasProjects = projects.results && projects.results.length > 0;
  return h(`
  <div class="card">
    <h2>All Projects for Review</h2>
    ${hasProjects ? `
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
        ${projects.results.map(p=>`
          <tr>
            <td>${p.name}</td>
            <td>${p.owner_username || p.owner}</td>
            <td><span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span></td>
            <td class="actions">
              <button data-admin-view="${p.id}" class="secondary">View</button>
              <button data-admin-approve="${p.id}" ${p.status !== 'Pending' ? 'disabled' : ''}>Approve</button>
              <button data-admin-reject="${p.id}" ${p.status !== 'Pending' ? 'disabled' : ''}>Reject</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="pagination">
      <button data-page-url="${projects.previous}" ${!projects.previous ? 'disabled' : ''}>Previous</button>
      <span>Page ${Math.floor((projects.results[0]?.id - 1) / (projects.results.length || 1)) + 1} of ${Math.ceil(projects.count / (projects.results.length || 1))}</span>
      <button data-page-url="${projects.next}" ${!projects.next ? 'disabled' : ''}>Next</button>
    </div>
    ` : `
    <div class="empty-state">
      <p>No projects are currently awaiting review.</p>
    </div>
    `}
  </div>
`);
}

export const AdminDetailView = (project, updates) => h(`
  <div class="card">
    <h2>${project.name}</h2>
    <div><b>Status:</b> <span class="status-badge status-${project.status.toLowerCase()}">${project.status}</span></div>
    <div><b>Owner ID:</b> ${project.owner}</div>
    <div><b>Area:</b> ${project.area_hectares} ha</div>
    <div><b>Location:</b> ${project.location_lat}, ${project.location_lon}</div>
    <div class="actions" style="margin-top: 1rem;">
      <button data-admin-approve="${project.id}" ${project.status !== 'Pending' ? 'disabled' : ''}>Approve</button>
      <button data-admin-reject="${project.id}" ${project.status !== 'Pending' ? 'disabled' : ''}>Reject</button>
    </div>
  </div>
  <div class="card">
    <h3>Updates</h3>
    ${(updates.results && updates.results.length > 0) ? (updates.results||updates).map(u=>`
      <div class="card">
        <div>${new Date(u.created_at).toLocaleString()}</div>
        <div>${u.notes||''}</div>
        ${u.image?`<img src="${u.image}" style="max-width:100%;height:auto" alt="update"/>`:''}
      </div>`).join('') : `
      <div class="empty-state"><p>No updates for this project yet.</p></div>
    `}
  </div>
`);
