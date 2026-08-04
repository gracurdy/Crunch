const CESIUM_VERSION = '1.126.0';
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;

let loadPromise = null;
let viewer = null;
let onTripSelect = null;
let clickHandler = null;
let hasFramed = false;

function loadCesium() {
  if (window.Cesium) return Promise.resolve(window.Cesium);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    window.CESIUM_BASE_URL = CESIUM_BASE;

    if (!document.querySelector('link[data-cesium-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${CESIUM_BASE}Widgets/widgets.css`;
      link.dataset.cesiumCss = '1';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = `${CESIUM_BASE}Cesium.js`;
    script.async = true;
    script.onload = () => (window.Cesium ? resolve(window.Cesium) : reject(new Error('Cesium failed to load')));
    script.onerror = () => reject(new Error('Could not load Cesium'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

function tripPosition(Cesium, trip) {
  const lat = Number(trip.lat);
  const lng = Number(trip.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return Cesium.Cartesian3.fromDegrees(lng, lat);
}

function createViewer(Cesium, container, ionToken) {
  if (ionToken) {
    Cesium.Ion.defaultAccessToken = ionToken;
  }

  const imageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maximumLevel: 19,
    credit: 'Tiles © Esri'
  });

  const next = new Cesium.Viewer(container, {
    animation: false,
    timeline: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    vrButton: false,
    infoBox: false,
    selectionIndicator: true,
    baseLayer: new Cesium.ImageryLayer(imageryProvider),
    terrainProvider: new Cesium.EllipsoidTerrainProvider()
  });

  next.scene.globe.enableLighting = false;
  next.scene.fog.enabled = false;
  if (next.scene.globe.dynamicAtmosphereLighting !== undefined) {
    next.scene.globe.dynamicAtmosphereLighting = false;
  }
  if (next.scene.skyAtmosphere) {
    next.scene.skyAtmosphere.show = true;
  }
  next.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  return next;
}

function syncEntities(trips) {
  if (!viewer || !window.Cesium) return;
  const Cesium = window.Cesium;
  viewer.entities.removeAll();

  trips.forEach(trip => {
    const position = tripPosition(Cesium, trip);
    if (!position) return;
    viewer.entities.add({
      id: trip.id,
      name: trip.title,
      position,
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString('#f4d64e'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: trip.title,
        font: '600 13px DM Sans, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#171818'),
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#171818cc'),
        backgroundPadding: new Cesium.Cartesian2(8, 5)
      }
    });
  });
}

export async function attachGlobe({ stage, trips, ionToken, selectedTripId, onSelect }) {
  onTripSelect = onSelect;
  const root = document.querySelector('#cesium-root');
  if (!stage || !root) return;

  stage.prepend(root);
  root.hidden = false;
  root.classList.add('cesium-root-active');

  try {
    const Cesium = await loadCesium();
    if (!viewer) {
      viewer = createViewer(Cesium, root, ionToken);
      clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      clickHandler.setInputAction(movement => {
        const picked = viewer.scene.pick(movement.position);
        if (Cesium.defined(picked) && picked.id && typeof onTripSelect === 'function') {
          onTripSelect(picked.id.id);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    syncEntities(trips);
    viewer.resize();

    if (selectedTripId) {
      const entity = viewer.entities.getById(selectedTripId);
      if (entity) {
        viewer.selectedEntity = entity;
        viewer.flyTo(entity, {
          duration: hasFramed ? 1.1 : 0,
          offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), 1200000)
        });
        hasFramed = true;
        return;
      }
    }

    if (!hasFramed) {
      await flyHome(trips, false);
      hasFramed = true;
    }
  } catch (err) {
    root.innerHTML = `<div class="cesium-fallback"><p>Could not load the 3D map.</p><p class="note">${err.message || 'Try refreshing the page.'}</p></div>`;
  }
}

export function parkGlobe() {
  const root = document.querySelector('#cesium-root');
  if (!root) return;
  root.hidden = true;
  root.classList.remove('cesium-root-active');
  document.body.appendChild(root);
}

export async function flyHome(trips, animate = true) {
  if (!viewer || !window.Cesium) return;
  const Cesium = window.Cesium;
  const positions = (trips || [])
    .map(trip => tripPosition(Cesium, trip))
    .filter(Boolean);

  if (!positions.length) {
    viewer.camera.flyHome(animate ? 1.2 : 0);
    return;
  }

  if (positions.length === 1) {
    const only = (trips || []).find(trip => tripPosition(Cesium, trip));
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(Number(only.lng), Number(only.lat), 1800000),
      duration: animate ? 1.2 : 0
    });
    return;
  }

  const sphere = Cesium.BoundingSphere.fromPoints(positions);
  viewer.camera.flyToBoundingSphere(sphere, {
    duration: animate ? 1.4 : 0,
    offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-40), sphere.radius * 3.2)
  });
}

export function zoomGlobe(direction) {
  if (!viewer || !window.Cesium) return;
  const controller = viewer.camera;
  const amount = Math.max(viewer.camera.positionCartographic.height * 0.25, 50000);
  if (direction > 0) controller.zoomIn(amount);
  else controller.zoomOut(amount);
}
