const INSTALLERS_KEY = 'installers';

let installers = [];

async function loadInstallers() {
  const cached = sessionStorage.getItem(INSTALLERS_KEY);
  if (cached) {
    installers = JSON.parse(cached);
    renderInstallers();
    return;
  }

  try {
    const res = await fetch('installers/manifest.json');
    if (!res.ok) throw new Error('No manifest');
    installers = await res.json();
    sessionStorage.setItem(INSTALLERS_KEY, JSON.stringify(installers));
  } catch {
    installers = [];
  }

  renderInstallers();
}

function renderInstallers() {
  const query = (document.getElementById('searchInput').value || '').toLowerCase();
  const container = document.getElementById('installerList');

  const filtered = installers.filter(f => f.name.toLowerCase().includes(query));

  if (!filtered.length) {
    container.innerHTML = '<p class="empty">No installers found.</p>';
    return;
  }

  container.innerHTML = filtered.map(f => `
    <div class="installer-card">
      <h3>${escapeHtml(f.name)}</h3>
      <div class="meta">${formatSize(f.size)}</div>
      <div class="actions">
        <a href="${f.url}" class="btn btn-primary" download>Download</a>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatSize(bytes) {
  if (bytes == null) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

document.addEventListener('DOMContentLoaded', loadInstallers);
