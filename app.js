const starterTrips = [
  {
    id: crypto.randomUUID(),
    title: "Highlands Road Trip",
    country: "Scotland",
    city: "Glencoe",
    startDate: "2026-10-04",
    endDate: "2026-10-09",
    lat: 56.6826,
    lng: -5.1023,
    summary: "Rainy mountain roads, tiny cafés, and our favorite views of the trip.",
    notes: "Add the real story here later — favorite meals, funny moments, lodging, and a daily timeline.",
    cover: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=1200&q=85"
    ],
    featured: true
  },
  {
    id: crypto.randomUUID(),
    title: "London Weekend",
    country: "England",
    city: "London",
    startDate: "2026-09-18",
    endDate: "2026-09-20",
    lat: 51.5072,
    lng: -0.1276,
    summary: "Markets, museums, late trains, and learning our way around the city.",
    notes: "Add restaurant links, tickets, neighborhood notes, and favorite photos.",
    cover: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85"],
    featured: false
  },
  {
    id: crypto.randomUUID(),
    title: "Arizona Goodbye Tour",
    country: "United States",
    city: "Sedona",
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    lat: 34.8697,
    lng: -111.761,
    summary: "A final desert weekend before the move — red rocks, sunsets, and favorite stops.",
    notes: "A sample trip you can replace in the admin page.",
    cover: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85"],
    featured: false
  }
];

const state = {
  view: location.hash.replace('#','') || 'home',
  trips: loadTrips(),
  selectedTrip: null,
  query: '',
  date: '',
  mapZoom: 1
};

function loadTrips(){
  const saved = localStorage.getItem('our-atlas-trips');
  if(saved) return JSON.parse(saved);
  localStorage.setItem('our-atlas-trips', JSON.stringify(starterTrips));
  return starterTrips;
}
function saveTrips(){ localStorage.setItem('our-atlas-trips', JSON.stringify(state.trips)); }
function fmtDate(value){
  if(!value) return '';
  return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(value+'T12:00:00'));
}
function duration(t){
  const a = new Date(t.startDate), b = new Date(t.endDate || t.startDate);
  return Math.max(1, Math.round((b-a)/86400000)+1);
}
function filteredTrips(){
  return state.trips.filter(t => {
    const hay = `${t.title} ${t.country} ${t.city} ${t.summary}`.toLowerCase();
    const q = !state.query || hay.includes(state.query.toLowerCase());
    const d = !state.date || (t.startDate <= state.date && (t.endDate || t.startDate) >= state.date);
    return q && d;
  });
}
function route(view){ state.view=view; location.hash=view; render(); window.scrollTo({top:0,behavior:'smooth'}); }
window.addEventListener('hashchange',()=>{ state.view=location.hash.replace('#','')||'home'; render(); });

function nav(){
  const items=[['home','⌂','Trips'],['map','◎','Map'],['photos','▦','Photos'],['admin','＋','Add']];
  return `<nav class="bottom-nav">${items.map(([v,i,l])=>`<button class="nav-btn ${state.view===v?'active':''}" data-route="${v}"><span>${i}</span><span>${l}</span></button>`).join('')}</nav>`;
}
function topbar(sub='Our travels, in one place'){
  return `<header class="topbar"><div class="brand"><div class="brand-mark">OA</div><div>Our Atlas<small>${sub}</small></div></div><button class="icon-btn" data-route="admin" aria-label="Open admin">＋</button></header>`;
}
function tripCard(t,index){
  return `<article class="trip-card ${(t.featured||index===0)?'featured':''}" data-trip="${t.id}">
    <img src="${t.cover}" alt="${t.title}" loading="lazy" />
    <div class="trip-overlay"><div class="trip-meta"><span class="pill">${t.country}</span><span class="pill">${duration(t)} days</span><span class="pill">${fmtDate(t.startDate)}</span></div><h3>${t.title}</h3><p>${t.summary}</p></div>
  </article>`;
}

function homeView(){
  const trips=filteredTrips();
  const photos=state.trips.reduce((n,t)=>n+(t.photos?.length||0),0);
  return `<main class="page">${topbar()}
    <section class="hero"><div class="hero-content"><div class="eyebrow">Grace + our favorite person</div><h1>Travel without limits.</h1><p>A private, shareable home for the places we go, the photos we take, and the little details we never want to forget.</p><div class="hero-actions"><button class="primary-btn" data-route="map">Explore the map</button><button class="soft-btn" data-route="photos">View memories</button></div></div></section>
    <section class="search-panel"><div class="field"><label>Search trips</label><input id="search-input" value="${state.query}" placeholder="Scotland, London, hiking…" /></div><div class="field"><label>Find by date</label><input id="date-input" type="date" value="${state.date}" /></div><button class="primary-btn" id="clear-search">Clear</button></section>
    <section class="stats"><div class="stat"><strong>${state.trips.length}</strong><span>Trips saved</span></div><div class="stat"><strong>${new Set(state.trips.map(t=>t.country)).size}</strong><span>Countries</span></div><div class="stat"><strong>${photos}</strong><span>Photos collected</span></div></section>
    <section class="section"><div class="section-head"><div><h2>Our trips</h2><p>Tap any trip to open its story.</p></div></div><div class="trip-grid">${trips.length?trips.map(tripCard).join(''):'<div class="empty">No trips match that search.</div>'}</div></section>
  </main>`;
}

function mapView(){
  const pins=state.trips.map(t=>{
    const x=((Number(t.lng)+180)/360)*1000;
    const y=((90-Number(t.lat))/180)*500;
    return `<g class="pin" data-trip="${t.id}"><circle cx="${x}" cy="${y}" r="11" fill="#f4d64e" stroke="#fff" stroke-width="5"/><circle cx="${x}" cy="${y}" r="3" fill="#2b2b2b"/></g>`;
  }).join('');
  const preview=state.selectedTrip||state.trips[0];
  return `<main class="page">${topbar('Tap a pin to open a trip')}
    <section class="section"><div class="section-head"><div><h2>Places we’ve been</h2><p>Zoom from the world view into individual memories.</p></div></div>
    <div class="map-shell"><div class="map-toolbar"><span>${state.trips.length} saved locations</span><button class="soft-btn" id="reset-map">Reset view</button></div><div class="map-stage">
      <svg class="world-map" id="world-map" viewBox="0 0 1000 500" style="transform:scale(${state.mapZoom})" aria-label="Interactive travel map">
        <rect width="1000" height="500" fill="transparent"/>
        <path class="visited" d="M80 118L145 73l91 18 64 54-26 48-72 25-23 70-59-28-35-64z"/>
        <path d="M286 318l55-34 45 27 20 74-22 77-44 20-25-53z"/>
        <path class="visited" d="M468 90l52-22 83 18 42 35-28 27-58-10-20 42-50-18-20-35z"/>
        <path d="M525 181l75-27 66 43-5 74-36 66-44-19-13-71-46-20z"/>
        <path d="M638 92l116-21 127 43 56 54-39 65-102-3-66 31-48-50-67-22z"/>
        <path d="M786 341l67-30 70 18 20 53-47 52-80-14-38-43z"/>
        ${pins}
      </svg>
      ${preview?`<button class="map-card" data-trip="${preview.id}"><h3>${preview.title}</h3><p>${preview.city}, ${preview.country} · ${fmtDate(preview.startDate)}</p></button>`:''}
      <div class="map-controls"><button id="zoom-in">＋</button><button id="zoom-out">−</button></div>
    </div></div></section></main>`;
}

function photosView(){
  const all=state.trips.flatMap(t=>(t.photos||[]).map((src,i)=>({src,trip:t,index:i})));
  return `<main class="page">${topbar('Every trip, all together')}
    <section class="section"><div class="section-head"><div><h2>Photo map</h2><p>Browse memories by trip now; geographic clustering can be connected later.</p></div><button class="primary-btn" data-route="admin">Upload photos</button></div>
    <div class="photo-grid">${all.length?all.map(p=>`<button class="photo-tile" data-trip="${p.trip.id}"><img src="${p.src}" alt="${p.trip.title} photo" loading="lazy"><span>${p.trip.city}</span></button>`).join(''):'<div class="empty">No photos yet.</div>'}</div></section></main>`;
}

function adminView(){
  return `<main class="page">${topbar('Private editing area')}
    <section class="section"><div class="section-head"><div><h2>Add a memory</h2><p>This prototype saves to this browser. Replace localStorage with Supabase before sharing edits across devices.</p></div></div>
    <div class="admin-layout"><form class="panel form-grid" id="trip-form">
      <div class="form-grid two"><div class="admin-field"><label>Trip title</label><input name="title" required placeholder="Scotland road trip"></div><div class="admin-field"><label>Country</label><input name="country" required placeholder="Scotland"></div></div>
      <div class="form-grid two"><div class="admin-field"><label>City / region</label><input name="city" placeholder="Glencoe"></div><div class="admin-field"><label>Featured trip</label><select name="featured"><option value="false">No</option><option value="true">Yes</option></select></div></div>
      <div class="form-grid two"><div class="admin-field"><label>Start date</label><input name="startDate" type="date" required></div><div class="admin-field"><label>End date</label><input name="endDate" type="date"></div></div>
      <div class="form-grid two"><div class="admin-field"><label>Latitude</label><input name="lat" type="number" step="any" placeholder="56.68"></div><div class="admin-field"><label>Longitude</label><input name="lng" type="number" step="any" placeholder="-5.10"></div></div>
      <div class="admin-field"><label>Short summary</label><textarea name="summary" placeholder="The description family sees on the trip card."></textarea></div>
      <div class="admin-field"><label>Trip notes</label><textarea name="notes" placeholder="Favorite meals, funny moments, lodging, itinerary, links, costs…"></textarea></div>
      <div class="admin-field"><label>Cover photo URL</label><input name="cover" placeholder="Paste an image URL, or use the upload area below"></div>
      <div class="upload-box" id="upload-box"><div><strong>Tap to choose photos</strong><p class="note">Photos are stored in this browser for the prototype. Large files may fill browser storage.</p><span id="upload-count">No photos selected</span></div></div>
      <button class="primary-btn" type="submit">Save trip</button>
    </form>
    <aside class="panel"><h3>Saved trips</h3><p class="note">Delete the sample trips when you are ready to replace them.</p><div class="admin-list">${state.trips.map(t=>`<div class="admin-item"><img src="${t.cover}" alt=""><div><strong>${t.title}</strong><p>${t.city}, ${t.country} · ${fmtDate(t.startDate)}</p></div><button class="danger" data-delete="${t.id}">Delete</button></div>`).join('')}</div></aside></div></section></main>`;
}

function tripModal(t){
  if(!t) return '';
  return `<div class="modal-backdrop" id="modal-backdrop"><article class="modal"><div class="close-row"><div><span class="eyebrow">${t.country}</span><h2>${t.title}</h2></div><button class="icon-btn" id="close-modal">✕</button></div><div class="modal-hero"><img src="${t.cover}" alt="${t.title}"></div><div class="trip-meta"><span class="pill" style="background:#e5ebef;color:#222">${fmtDate(t.startDate)} – ${fmtDate(t.endDate||t.startDate)}</span><span class="pill" style="background:#e5ebef;color:#222">${duration(t)} days</span><span class="pill" style="background:#e5ebef;color:#222">${t.city}</span></div><h3>About this trip</h3><p>${t.summary}</p><h3>Notes</h3><p>${t.notes||'No notes added yet.'}</p>${(t.photos||[]).length?`<div class="photo-grid">${t.photos.map(src=>`<div class="photo-tile"><img src="${src}" alt="${t.title}"></div>`).join('')}</div>`:''}</article></div>`;
}

function render(){
  const app=document.querySelector('#app');
  const views={home:homeView,map:mapView,photos:photosView,admin:adminView};
  app.innerHTML=`<div class="app-shell">${(views[state.view]||homeView)()}${nav()}${tripModal(state.selectedTrip)}</div>`;
  bind();
}

let pendingPhotos=[];
function bind(){
  document.querySelectorAll('[data-route]').forEach(el=>el.addEventListener('click',()=>route(el.dataset.route)));
  document.querySelectorAll('[data-trip]').forEach(el=>el.addEventListener('click',(e)=>{e.stopPropagation();state.selectedTrip=state.trips.find(t=>t.id===el.dataset.trip);render();}));
  document.querySelector('#close-modal')?.addEventListener('click',()=>{state.selectedTrip=null;render();});
  document.querySelector('#modal-backdrop')?.addEventListener('click',e=>{if(e.target.id==='modal-backdrop'){state.selectedTrip=null;render();}});
  document.querySelector('#search-input')?.addEventListener('input',e=>{state.query=e.target.value;render();document.querySelector('#search-input')?.focus();});
  document.querySelector('#date-input')?.addEventListener('change',e=>{state.date=e.target.value;render();});
  document.querySelector('#clear-search')?.addEventListener('click',()=>{state.query='';state.date='';render();});
  document.querySelector('#zoom-in')?.addEventListener('click',()=>{state.mapZoom=Math.min(3,state.mapZoom+.35);render();});
  document.querySelector('#zoom-out')?.addEventListener('click',()=>{state.mapZoom=Math.max(1,state.mapZoom-.35);render();});
  document.querySelector('#reset-map')?.addEventListener('click',()=>{state.mapZoom=1;render();});
  document.querySelector('#upload-box')?.addEventListener('click',()=>document.querySelector('#photo-picker').click());
  document.querySelector('#photo-picker')?.addEventListener('change',async e=>{
    pendingPhotos=await Promise.all([...e.target.files].map(file=>fileToDataUrl(file)));
    const count=document.querySelector('#upload-count'); if(count) count.textContent=`${pendingPhotos.length} photo${pendingPhotos.length===1?'':'s'} selected`;
  });
  document.querySelector('#trip-form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget); const data=Object.fromEntries(fd.entries());
    const trip={id:crypto.randomUUID(),title:data.title,country:data.country,city:data.city,startDate:data.startDate,endDate:data.endDate||data.startDate,lat:Number(data.lat)||0,lng:Number(data.lng)||0,summary:data.summary||'',notes:data.notes||'',cover:data.cover||pendingPhotos[0]||'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',photos:pendingPhotos,featured:data.featured==='true'};
    state.trips.unshift(trip); saveTrips(); pendingPhotos=[]; state.view='home'; location.hash='home'; render();
  });
  document.querySelectorAll('[data-delete]').forEach(btn=>btn.addEventListener('click',()=>{
    if(confirm('Delete this trip?')){state.trips=state.trips.filter(t=>t.id!==btn.dataset.delete);saveTrips();render();}
  }));
}
function fileToDataUrl(file){ return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);}); }
render();
