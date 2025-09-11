import { h } from '../components/ui.js';

export const NGOListView = (projects) => h(`
  <div class="row">
    <div class="col">
      <div class="card">
        <h2>Your Projects</h2>
        ${(projects.results && projects.results.length > 0) ? projects.results.map(p => `
          <div class="card">
            <strong>${p.name}</strong>
            <div>Status: <b>${p.status}</b></div>
            <button data-view-project="${p.id}">Open</button>
          </div>`).join('') : `
          <div class="empty-state">
            <p>You haven't created any projects yet.</p>
            <p>Get started by creating one!</p>
          </div>
        `}
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

export const ProjectDetailView = (project, updates) => h(`
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
      <label>Image<input name="image" type="file" accept="image/*" /></label>
      <div id="img-preview-container"></div>
      <button>Upload</button>
    </form>
  </div>
  <div class="card">
    <h3>Updates</h3>
    ${(updates.results && updates.results.length > 0) ? (updates.results || updates).map(u => `
      <div class="card">
        <div>${new Date(u.created_at).toLocaleString()}</div>
        <div>${u.notes || ''}</div>
        ${u.image ? `<img src="${u.image}" style="max-width:100%;height:auto" alt="update"/>` : ''}
      </div>`).join('') : `
      <div class="empty-state"><p>No updates submitted yet.</p></div>
    `}
  </div>
`);
