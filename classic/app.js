import { CONFIG } from './config.js';
import { unsealSecret } from './auth.js';
import { commitFiles, loadTripsFromRepo, verifyWriteAccess } from './persist.js';
import { attachGlobe, flyHome, parkGlobe, zoomGlobe } from './map-globe.js';

const SESSION_KEY = 'our-atlas-session';
const AUTH_KEY = 'our-atlas-authed';

const TRIP_CATEGORIES = [
  { id: 'together', label: 'Together' },
  { id: 'grace-solo', label: 'Grace Solo Trip' },
  { id: 'sean-solo', label: 'Sean Solo Trip' }
];

function categoryLabel(id) {
  return TRIP_CATEGORIES.find(c => c.id === id)?.label || 'Together';
}

function emptyDraft() {
  return {
    title: '',
    country: '',
    city: '',
    category: 'together',
    featured: 'false',
    startDate: '',
    endDate: '',
    lat: '',
    lng: '',
    summary: '',
    notes: '',
    cover: ''
  };
}

const state = {
  view: location.hash.replace('#', '') || 'home',
  trips: [],
  selectedTrip: null,
  query: '',
  date: '',
  category: 'all',
  authed: sessionStorage.getItem(AUTH_KEY) === '1' && !!sessionStorage.getItem(SESSION_KEY),
  status: '',
  statusType: '',
  busy: false,
  loginError: '',
  editingId: null,
  draft: emptyDraft()
};

let pendingPhotos = []; // { base64, ext, preview }

function getSessionSecret() {
  return sessionStorage.getItem(SESSION_KEY) || '';
}

function setStatus(message, type = 'info') {
  state.status = message;
  state.statusType = type;
}

function clearStatus() {
  state.status = '';
  state.statusType = '';
}

function escAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function captureDraftFromForm(form = document.querySelector('#trip-form')) {
  if (!form) return;
  const fd = new FormData(form);
  state.draft = {
    title: String(fd.get('title') || ''),
    country: String(fd.get('country') || ''),
    city: String(fd.get('city') || ''),
    category: String(fd.get('category') || 'together'),
    featured: String(fd.get('featured') || 'false'),
    startDate: String(fd.get('startDate') || ''),
    endDate: String(fd.get('endDate') || ''),
    lat: String(fd.get('lat') || ''),
    lng: String(fd.get('lng') || ''),
    summary: String(fd.get('summary') || ''),
    notes: String(fd.get('notes') || ''),
    cover: String(fd.get('cover') || '')
  };
}

function resetEditor() {
  state.editingId = null;
  state.draft = emptyDraft();
  pendingPhotos.forEach(p => URL.revokeObjectURL(p.preview));
  pendingPhotos = [];
}

function startEditing(trip) {
  state.editingId = trip.id;
  state.draft = {
    title: trip.title || '',
    country: trip.country || '',
    city: trip.city || '',
    category: trip.category || 'together',
    featured: trip.featured ? 'true' : 'false',
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    lat: trip.lat === 0 || trip.lat ? String(trip.lat) : '',
    lng: trip.lng === 0 || trip.lng ? String(trip.lng) : '',
    summary: trip.summary || '',
    notes: trip.notes || '',
    cover: trip.cover || ''
  };
  pendingPhotos.forEach(p => URL.revokeObjectURL(p.preview));
  pendingPhotos = [];
  clearStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fmtDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value + 'T12:00:00')
  );
}

function duration(t) {
  const a = new Date(t.startDate);
  const b = new Date(t.endDate || t.startDate);
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

function filteredTrips() {
  return state.trips.filter(t => {
    const hay = `${t.title} ${t.country} ${t.city} ${t.summary} ${categoryLabel(t.category)}`.toLowerCase();
    const q = !state.query || hay.includes(state.query.toLowerCase());
    const d = !state.date || (t.startDate <= state.date && (t.endDate || t.startDate) >= state.date);
    const c = state.category === 'all' || (t.category || 'together') === state.category;
    return q && d && c;
  });
}

function route(view) {
  if (view === 'admin' && !state.authed) view = 'login';
  if (view === 'login' && state.authed) view = 'admin';
  state.view = view;
  location.hash = view;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', () => {
  let view = location.hash.replace('#', '') || 'home';
  if (view === 'admin' && !state.authed) view = 'login';
  if (view === 'login' && state.authed) view = 'admin';
  state.view = view;
  render();
});

function nav() {
  if (state.view === 'login') return '';
  const items = [
    ['home', '⌂', 'Trips'],
    ['map', '◎', 'Map'],
    ['photos', '▦', 'Photos'],
    [state.authed ? 'admin' : 'login', '＋', 'Add']
  ];
  return `<nav class="bottom-nav">${items
    .map(
      ([v, i, l]) =>
        `<button class="nav-btn ${state.view === v ? 'active' : ''}" data-route="${v}"><span>${i}</span><span>${l}</span></button>`
    )
    .join('')}</nav>`;
}

function topbar(sub = 'Side quests & soft plans') {
  const action = state.authed
    ? `<button class="icon-btn" data-route="admin" aria-label="Open admin">＋</button>`
    : `<button class="icon-btn" data-route="login" aria-label="Log in">＋</button>`;
  return `<header class="topbar"><div class="brand"><div class="brand-mark">PA</div><div>Project Atlas<small>${sub}</small></div></div>${action}</header>`;
}

function statusBanner() {
  if (!state.status) return '';
  return `<div class="status-banner ${state.statusType}" role="status">${state.status}</div>`;
}

function tripCard(t, index) {
  return `<article class="trip-card ${t.featured || index === 0 ? 'featured' : ''}" data-trip="${t.id}">
    <img src="${t.cover}" alt="${t.title}" loading="lazy" />
    <div class="trip-overlay"><div class="trip-meta"><span class="pill">${categoryLabel(t.category)}</span><span class="pill">${t.country}</span><span class="pill">${duration(t)} days</span><span class="pill">${fmtDate(t.startDate)}</span></div><h3>${t.title}</h3><p>${t.summary}</p></div>
  </article>`;
}

function categoryFilters() {
  const items = [{ id: 'all', label: 'All trips' }, ...TRIP_CATEGORIES];
  return `<div class="category-filters" role="tablist" aria-label="Trip categories">${items
    .map(
      c =>
        `<button type="button" class="category-chip ${state.category === c.id ? 'active' : ''}" data-category="${c.id}">${c.label}</button>`
    )
    .join('')}</div>`;
}

function homeView() {
  const trips = filteredTrips();
  const photos = state.trips.reduce((n, t) => n + (t.photos?.length || 0), 0);
  return `<main class="page">${topbar()}${statusBanner()}
    <section class="hero"><div class="hero-content"><div class="eyebrow">Side quests & soft plans</div><h1>Travel without limits.</h1><p>A home for the detours worth keeping — side quests logged, memories saved, and game plans guided by the vibe.</p><div class="hero-actions"><button class="primary-btn" data-route="map">Explore the map</button><button class="soft-btn" data-route="photos">View memories</button></div></div></section>
    <section class="search-panel"><div class="field"><label>Search trips</label><input id="search-input" value="${state.query}" placeholder="Scotland, London, hiking…" /></div><div class="field"><label>Find by date</label><input id="date-input" type="date" value="${state.date}" /></div><button class="primary-btn" id="clear-search">Clear</button></section>
    <section class="stats"><div class="stat"><strong>${state.trips.length}</strong><span>Trips saved</span></div><div class="stat"><strong>${new Set(state.trips.map(t => t.country)).size}</strong><span>Countries</span></div><div class="stat"><strong>${photos}</strong><span>Photos collected</span></div></section>
    <section class="section"><div class="section-head"><div><h2>Our trips</h2><p>Tap any trip to open its story.</p></div></div>${categoryFilters()}<div class="trip-grid">${trips.length ? trips.map(tripCard).join('') : '<div class="empty">No trips match that search.</div>'}</div></section>
  </main>`;
}

function mapView() {
  const preview = state.selectedTrip || state.trips.find(t => Number(t.lat) || Number(t.lng)) || state.trips[0];
  const mappable = state.trips.filter(t => {
    const lat = Number(t.lat);
    const lng = Number(t.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  }).length;
  return `<main class="page">${topbar('Tap a pin to open a trip')}${statusBanner()}
    <section class="section"><div class="section-head"><div><h2>Places we’ve been</h2><p>Spin the globe, zoom in, and tap a pin to open a memory.</p></div></div>
    <div class="map-shell"><div class="map-toolbar"><span>${mappable} mapped location${mappable === 1 ? '' : 's'}</span><button class="soft-btn" id="reset-map">Reset view</button></div><div class="map-stage" id="map-stage">
      ${preview ? `<button class="map-card" data-trip="${preview.id}"><h3>${escAttr(preview.title)}</h3><p>${escAttr(preview.city)}, ${escAttr(preview.country)} · ${fmtDate(preview.startDate)}</p></button>` : ''}
      <div class="map-controls"><button type="button" id="zoom-in" aria-label="Zoom in">＋</button><button type="button" id="zoom-out" aria-label="Zoom out">−</button></div>
    </div></div></section></main>`;
}

function photosView() {
  const all = state.trips.flatMap(t => (t.photos || []).map((src, i) => ({ src, trip: t, index: i })));
  return `<main class="page">${topbar('Every trip, all together')}${statusBanner()}
    <section class="section"><div class="section-head"><div><h2>Photo map</h2><p>Browse memories by trip.</p></div><button class="primary-btn" data-route="${state.authed ? 'admin' : 'login'}">Upload photos</button></div>
    <div class="photo-grid">${all.length ? all.map(p => `<button class="photo-tile" data-trip="${p.trip.id}"><img src="${p.src}" alt="${p.trip.title} photo" loading="lazy"><span>${p.trip.city}</span></button>`).join('') : '<div class="empty">No photos yet.</div>'}</div></section></main>`;
}

function loginView() {
  return `<main class="login-screen">
    <form class="login-card" id="login-form">
      <div class="login-brand"><div class="brand-mark">PA</div><div><strong>Project Atlas</strong><span>Sign in</span></div></div>
      <label class="login-field"><span>Password</span><input name="password" type="password" required autocomplete="current-password" autofocus></label>
      ${state.loginError ? `<p class="form-error">${state.loginError}</p>` : ''}
      <button class="primary-btn login-submit" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Signing in…' : 'Sign in'}</button>
      <button type="button" class="text-link" data-route="home">Back to trips</button>
    </form>
  </main>`;
}

function adminView() {
  const d = state.draft;
  const editing = !!state.editingId;
  const existing = editing ? state.trips.find(t => t.id === state.editingId) : null;
  const existingCount = existing?.photos?.length || 0;
  const previews = pendingPhotos
    .map(p => `<img class="upload-thumb" src="${p.preview}" alt="Selected photo preview">`)
    .join('');
  return `<main class="page">${topbar('Private editing area')}${statusBanner()}
    <section class="section"><div class="section-head"><div><h2>${editing ? 'Edit trip' : 'Add a memory'}</h2><p>${editing ? 'Update the details, then save. New photos are added to the ones already saved.' : 'New trips and photos appear on the site after you save.'}</p></div>
      <button class="soft-btn" id="logout-btn">Log out</button></div>
    <div class="admin-layout"><form class="panel form-grid" id="trip-form">
      <div class="form-grid two"><div class="admin-field"><label>Trip title</label><input name="title" required placeholder="Scotland road trip" value="${escAttr(d.title)}"></div><div class="admin-field"><label>Country</label><input name="country" required placeholder="Scotland" value="${escAttr(d.country)}"></div></div>
      <div class="form-grid two"><div class="admin-field"><label>City / region</label><input name="city" placeholder="Glencoe" value="${escAttr(d.city)}"></div><div class="admin-field"><label>Category</label><select name="category">${TRIP_CATEGORIES.map(c => `<option value="${c.id}" ${d.category === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}</select></div></div>
      <div class="form-grid two"><div class="admin-field"><label>Featured trip</label><select name="featured"><option value="false" ${d.featured !== 'true' ? 'selected' : ''}>No</option><option value="true" ${d.featured === 'true' ? 'selected' : ''}>Yes</option></select></div><div class="admin-field"><label class="optional">Optional</label><p class="note" style="margin:0;padding-top:10px">Mark one trip featured to spotlight it on home.</p></div></div>
      <div class="form-grid two"><div class="admin-field"><label>Start date</label><input name="startDate" type="date" required value="${escAttr(d.startDate)}"></div><div class="admin-field"><label>End date</label><input name="endDate" type="date" value="${escAttr(d.endDate)}"></div></div>
      <div class="form-grid two"><div class="admin-field"><label>Latitude</label><input name="lat" type="number" step="any" placeholder="56.68" value="${escAttr(d.lat)}"></div><div class="admin-field"><label>Longitude</label><input name="lng" type="number" step="any" placeholder="-5.10" value="${escAttr(d.lng)}"></div></div>
      <div class="admin-field"><label>Short summary</label><textarea name="summary" placeholder="The description family sees on the trip card.">${escAttr(d.summary)}</textarea></div>
      <div class="admin-field"><label>Trip notes</label><textarea name="notes" placeholder="Favorite meals, funny moments, lodging, itinerary, links, costs…">${escAttr(d.notes)}</textarea></div>
      <div class="admin-field"><label>Cover photo URL <span class="optional">(optional if you upload photos)</span></label><input name="cover" placeholder="Paste an image URL, or upload photos below" value="${escAttr(d.cover)}"></div>
      <div class="upload-box" id="upload-box"><div><strong>Tap to choose photos</strong><p class="note">${editing && existingCount ? `${existingCount} photo${existingCount === 1 ? '' : 's'} already saved. New uploads will be added.` : 'Photos are resized before saving.'}</p><span id="upload-count">${pendingPhotos.length ? `${pendingPhotos.length} new photo${pendingPhotos.length === 1 ? '' : 's'} ready` : 'No new photos selected'}</span></div>
        ${previews ? `<div class="upload-previews">${previews}</div>` : ''}
      </div>
      <div class="form-actions">
        <button class="primary-btn" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Saving…' : editing ? 'Save changes' : 'Save trip'}</button>
        ${editing ? `<button type="button" class="soft-btn" id="cancel-edit" ${state.busy ? 'disabled' : ''}>Cancel edit</button>` : ''}
      </div>
    </form>
    <aside class="panel"><h3>Saved trips</h3><p class="note">Edit a trip to change details or add more photos.</p><div class="admin-list">${state.trips
      .map(
        t =>
          `<div class="admin-item"><img src="${t.cover}" alt=""><div><strong>${escAttr(t.title)}</strong><p>${escAttr(categoryLabel(t.category))} · ${escAttr(t.city)}, ${escAttr(t.country)} · ${fmtDate(t.startDate)} · ${(t.photos || []).length} photos</p></div><div class="admin-item-actions"><button class="soft-btn edit-btn" data-edit="${t.id}" ${state.busy ? 'disabled' : ''}>Edit</button><button class="danger" data-delete="${t.id}" ${state.busy ? 'disabled' : ''}>Delete</button></div></div>`
      )
      .join('')}</div></aside></div></section></main>`;
}

function tripModal(t) {
  if (!t) return '';
  return `<div class="modal-backdrop" id="modal-backdrop"><article class="modal"><div class="close-row"><div><span class="eyebrow">${categoryLabel(t.category)} · ${t.country}</span><h2>${t.title}</h2></div><button class="icon-btn" id="close-modal">✕</button></div><div class="modal-hero"><img src="${t.cover}" alt="${t.title}"></div><div class="trip-meta"><span class="pill" style="background:#e5ebef;color:#222">${fmtDate(t.startDate)} – ${fmtDate(t.endDate || t.startDate)}</span><span class="pill" style="background:#e5ebef;color:#222">${duration(t)} days</span><span class="pill" style="background:#e5ebef;color:#222">${t.city}</span></div><h3>About this trip</h3><p>${t.summary}</p><h3>Notes</h3><p>${t.notes || 'No notes added yet.'}</p>${
    (t.photos || []).length
      ? `<div class="photo-grid">${t.photos.map(src => `<div class="photo-tile"><img src="${src}" alt="${t.title}"></div>`).join('')}</div>`
      : ''
  }</article></div>`;
}

function render() {
  const app = document.querySelector('#app');
  const views = { home: homeView, map: mapView, photos: photosView, admin: adminView, login: loginView };
  const shellClass = state.view === 'login' ? 'app-shell login-shell' : 'app-shell';
  app.innerHTML = `<div class="${shellClass}">${(views[state.view] || homeView)()}${nav()}${tripModal(state.selectedTrip)}</div>`;
  bind();
  if (state.view === 'map') {
    attachGlobe({
      stage: document.querySelector('#map-stage'),
      trips: state.trips,
      ionToken: CONFIG.cesiumIonToken || '',
      selectedTripId: state.selectedTrip?.id || null,
      onSelect: tripId => {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return;
        state.selectedTrip = trip;
        render();
      }
    });
  } else {
    parkGlobe();
  }
}

async function fileToCompressedJpeg(file) {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not compress image'))), 'image/jpeg', 0.85);
  });
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const preview = URL.createObjectURL(blob);
  return { base64, ext: 'jpg', preview };
}

async function persistTrips(nextTrips, files, message) {
  const secret = getSessionSecret();
  if (!secret) throw new Error('You are logged out. Please sign in again.');

  const payload = [
    {
      path: CONFIG.tripsPath,
      content: JSON.stringify(nextTrips, null, 2) + '\n',
      encoding: 'utf-8'
    },
    ...files
  ];

  await commitFiles(secret, message, payload);
  state.trips = nextTrips;
}

function bind() {
  document.querySelectorAll('[data-route]').forEach(el =>
    el.addEventListener('click', () => route(el.dataset.route))
  );
  document.querySelectorAll('[data-trip]').forEach(el =>
    el.addEventListener('click', e => {
      e.stopPropagation();
      state.selectedTrip = state.trips.find(t => t.id === el.dataset.trip);
      render();
    })
  );
  document.querySelector('#close-modal')?.addEventListener('click', () => {
    state.selectedTrip = null;
    render();
  });
  document.querySelector('#modal-backdrop')?.addEventListener('click', e => {
    if (e.target.id === 'modal-backdrop') {
      state.selectedTrip = null;
      render();
    }
  });
  document.querySelector('#search-input')?.addEventListener('input', e => {
    state.query = e.target.value;
    render();
    document.querySelector('#search-input')?.focus();
  });
  document.querySelector('#date-input')?.addEventListener('change', e => {
    state.date = e.target.value;
    render();
  });
  document.querySelector('#clear-search')?.addEventListener('click', () => {
    state.query = '';
    state.date = '';
    state.category = 'all';
    render();
  });
  document.querySelectorAll('[data-category]').forEach(el =>
    el.addEventListener('click', () => {
      state.category = el.dataset.category || 'all';
      render();
    })
  );
  document.querySelector('#zoom-in')?.addEventListener('click', () => zoomGlobe(1));
  document.querySelector('#zoom-out')?.addEventListener('click', () => zoomGlobe(-1));
  document.querySelector('#reset-map')?.addEventListener('click', () => flyHome(state.trips, true));

  document.querySelector('#logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    state.authed = false;
    resetEditor();
    clearStatus();
    route('home');
  });

  document.querySelector('#login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password') || '');
    state.busy = true;
    state.loginError = '';
    render();
    try {
      if (!CONFIG.sealedSecret || !CONFIG.authSalt || !CONFIG.authIv) {
        throw new Error('Sign-in is not set up yet. Ask the site owner to finish setup.');
      }
      const secret = await unsealSecret(password, CONFIG);
      await verifyWriteAccess(secret);
      sessionStorage.setItem(SESSION_KEY, secret);
      sessionStorage.setItem(AUTH_KEY, '1');
      state.authed = true;
      state.busy = false;
      clearStatus();
      route('admin');
    } catch (err) {
      const msg = String(err?.message || '');
      if (msg.includes('not set up')) state.loginError = msg;
      else state.loginError = 'Wrong password.';
      state.busy = false;
      render();
    }
  });

  const tripForm = document.querySelector('#trip-form');
  tripForm?.addEventListener('input', () => captureDraftFromForm(tripForm));
  tripForm?.addEventListener('change', () => captureDraftFromForm(tripForm));

  document.querySelector('#cancel-edit')?.addEventListener('click', () => {
    resetEditor();
    clearStatus();
    render();
  });

  document.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => {
      if (state.busy) return;
      const trip = state.trips.find(t => t.id === btn.dataset.edit);
      if (!trip) return;
      startEditing(trip);
      render();
    })
  );

  document.querySelector('#upload-box')?.addEventListener('click', e => {
    if (e.target.closest('img')) return;
    document.querySelector('#photo-picker').click();
  });

  const picker = document.querySelector('#photo-picker');
  if (picker && picker.dataset.bound !== '1') {
    picker.dataset.bound = '1';
    picker.addEventListener('change', async e => {
      const files = [...e.target.files];
      if (!files.length) return;
      captureDraftFromForm();
      setStatus(`Preparing ${files.length} photo${files.length === 1 ? '' : 's'}…`, 'info');
      state.busy = true;
      render();
      try {
        const prepared = [];
        for (const file of files) {
          if (!file.type.startsWith('image/')) continue;
          prepared.push(await fileToCompressedJpeg(file));
        }
        pendingPhotos = prepared;
        if (!prepared.length) throw new Error('No image files were selected.');
        setStatus(`${prepared.length} photo${prepared.length === 1 ? '' : 's'} ready to save with the trip.`, 'success');
      } catch (err) {
        setStatus(err.message || 'Could not prepare photos.', 'error');
      }
      state.busy = false;
      e.target.value = '';
      render();
    });
  }

  document.querySelector('#trip-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.busy) return;
    captureDraftFromForm(e.currentTarget);
    const data = { ...state.draft };
    const editing = !!state.editingId;
    const existing = editing ? state.trips.find(t => t.id === state.editingId) : null;
    if (editing && !existing) {
      setStatus('That trip could not be found.', 'error');
      resetEditor();
      render();
      return;
    }

    const tripId = editing ? existing.id : crypto.randomUUID();
    const photoFiles = [];
    const newPhotoPaths = [];
    const startIndex = editing ? existing.photos?.length || 0 : 0;

    pendingPhotos.forEach((photo, index) => {
      const path = `${CONFIG.photosDir}/${tripId}/${String(startIndex + index + 1).padStart(2, '0')}.${photo.ext}`;
      photoFiles.push({ path, content: photo.base64, encoding: 'base64' });
      newPhotoPaths.push(path);
    });

    const existingPhotos = editing ? existing.photos || [] : [];
    const photos = [...existingPhotos, ...newPhotoPaths];
    const cover = data.cover || newPhotoPaths[0] || existing?.cover || '';
    if (!cover && !photos.length) {
      setStatus('Add a cover URL or upload at least one photo.', 'error');
      render();
      return;
    }

    const trip = {
      id: tripId,
      title: data.title,
      country: data.country,
      city: data.city,
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      lat: Number(data.lat) || 0,
      lng: Number(data.lng) || 0,
      summary: data.summary || '',
      notes: data.notes || '',
      cover: cover || photos[0] || '',
      photos: photos.length ? photos : cover ? [cover] : [],
      category: TRIP_CATEGORIES.some(c => c.id === data.category) ? data.category : 'together',
      featured: data.featured === 'true'
    };

    const nextTrips = editing
      ? state.trips.map(t => (t.id === tripId ? trip : t))
      : [trip, ...state.trips];

    state.busy = true;
    setStatus('Saving…', 'info');
    render();
    try {
      await persistTrips(nextTrips, photoFiles, `${editing ? 'Update' : 'Add'} trip: ${trip.title}`);
      resetEditor();
      setStatus(
        editing
          ? 'Changes saved. Refresh in a minute if updates are not visible yet.'
          : 'Saved. Refresh in a minute if the new trip is not visible yet.',
        'success'
      );
      if (!editing) {
        state.view = 'home';
        location.hash = 'home';
      }
    } catch (err) {
      setStatus(err.message || 'Save failed.', 'error');
    }
    state.busy = false;
    render();
  });

  document.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (state.busy) return;
      if (!confirm('Delete this trip?')) return;
      const id = btn.dataset.delete;
      const nextTrips = state.trips.filter(t => t.id !== id);
      const title = state.trips.find(t => t.id === id)?.title || 'trip';
      state.busy = true;
      setStatus('Deleting…', 'info');
      render();
      try {
        await persistTrips(nextTrips, [], `Delete trip: ${title}`);
        if (state.selectedTrip?.id === id) state.selectedTrip = null;
        if (state.editingId === id) resetEditor();
        setStatus('Trip deleted.', 'success');
      } catch (err) {
        setStatus(err.message || 'Delete failed.', 'error');
      }
      state.busy = false;
      render();
    })
  );
}

async function init() {
  try {
    state.trips = await loadTripsFromRepo();
  } catch {
    setStatus('Could not load trips yet.', 'error');
    state.trips = [];
  }

  let view = location.hash.replace('#', '') || 'home';
  if (view === 'admin' && !state.authed) view = 'login';
  if (view === 'login' && state.authed) view = 'admin';
  state.view = view;
  render();
}

init();
