import { h } from '../components/ui.js';
import { Icon } from '../components/icons.js';

export const NGOListView = (projects) => h(`
  <div class="row">
    <div class="col" style="flex: 3;">
      <div class="card">
        <h2>Your Projects</h2>
        ${(projects.results && projects.results.length > 0) ? `
          <div class="project-card-grid">
            ${projects.results.map(p => `
              <div class="project-card">
                <h3>${p.name}</h3>
                <p>${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}</p>
                <div class="project-card-footer">
                  <span class="status-badge status-${p.status.toLowerCase()}">${p.status}</span>
                  <button data-view-project="${p.id}" class="secondary">${Icon('view')} View</button>
                </div>
              </div>`).join('')}
          </div>` : `
          <div class="empty-state">
            <p>You haven't created any projects yet.</p>
            <p>Get started by creating one!</p>
          </div>
        `}
      </div>
    </div>
    <div class="col" style="flex: 1;">
      <div class="card">
        <h2>Create Project</h2>
        <form id="projForm">
          <label>Name<input name="name" required /></label>
          <label>Description<textarea name="description" required></textarea></label>
          <div>
            <label>Pick Location</label>
            <div id="map-picker" class="map-embed"></div>
            <div class="row" style="gap:.5rem;margin-top:.5rem; align-items: flex-end;">
              <div class="col"><label>Latitude<input name="location_lat" type="number" step="0.000001" required /></label></div>
              <div class="col"><label>Longitude<input name="location_lon" type="number" step="0.000001" required /></label></div>
              <div class="col" style="flex-grow: 0; margin-bottom: 0.75rem;">
                <button type="button" id="auto-location-btn" class="secondary" title="Use Current Location">${Icon('locate')} My Location</button>
              </div>
            </div>
            <small class="muted">Tip: Click on the map to set coordinates, or use the locate button. You can fine-tune numbers if needed.</small>
          </div>
          <label>Area (hectares)<input name="area_hectares" type="number" step="0.01" required /></label>
          <button type="submit">${Icon('create')} Create</button>
        </form>
      </div>
    </div>
  </div>
`);

export const ProjectDetailView = (project, updates) => h(`
  <div class="card">
    <h2>${project.name}</h2>
    <p>${project.description}</p>
    <div><b>Status:</b> <span class="status-badge status-${project.status.toLowerCase()}">${project.status}</span></div>
    <div><b>Area:</b> ${project.area_hectares} ha</div>
  <div><b>Total credits minted:</b> ${project.total_credits_minted ?? 0}</div>
    <div class="row" style="gap:1rem;align-items:flex-start;">
      <div class="col" style="flex:1;min-width:260px;"><div id="map-project" class="map-embed map-embed-lg"></div></div>
      <div class="col" style="flex:1;min-width:220px;">
        <div><b>Location:</b> ${project.location_lat}, ${project.location_lon}</div>
      </div>
    </div>
  </div>
  <div class="card">
    <h3>Submit Update</h3>
    <form id="updForm">
      <label>Notes<textarea name="notes" required></textarea></label>
      <label>Image<input name="image" type="file" accept="image/*" /></label>
      <div id="img-preview-container"></div>
      <button>${Icon('upload')} Upload</button>
    </form>
  </div>
  <div class="card">
    <h3>Updates</h3>
    ${(updates.results && updates.results.length > 0) ? `
      <div class="timeline">
        ${(updates.results || updates).map(u => `
          <div class="timeline-item">
            <div class="timeline-item-header">${new Date(u.created_at).toLocaleString()}</div>
            <div class="card">
              <p>${u.notes || ''}</p>
              ${u.image ? `<img src="${u.image}" style="max-width:100%;height:auto;border-radius:6px;" alt="update"/>` : ''}
            </div>
          </div>`).join('')}
      </div>` : `
      <div class="empty-state"><p>No updates submitted yet.</p></div>
    `}
  </div>
`);
