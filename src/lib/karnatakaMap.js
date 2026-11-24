/**
 * Framework-independent Vanilla JavaScript Leaflet map module for HeritageHub.
 * Renders real Karnataka GeoJSON district boundaries with Karnataka Red & Yellow
 * visual styling and zoom-aware, collision-free monument photo thumbnail markers
 * for all 31 districts.
 */

const DISTRICT_ALIASES = {
  bagalkot: 'bagalkot',
  bagalkote: 'bagalkot',
  ballari: 'ballari',
  bellary: 'ballari',
  vijayanagara: 'ballari', // 2021 geoBoundaries polygon shares Bellary geometry
  hampi: 'ballari',
  belagavi: 'belagavi',
  belgaum: 'belagavi',
  'bengaluru rural': 'bengaluru-rural',
  'bangalore rural': 'bengaluru-rural',
  'bengaluru urban': 'bengaluru-urban',
  bengaluru: 'bengaluru-urban',
  bangalore: 'bengaluru-urban',
  bidar: 'bidar',
  chamarajanagar: 'chamarajanagar',
  chamrajnagar: 'chamarajanagar',
  chikkaballapura: 'chikkaballapura',
  chikballapur: 'chikkaballapura',
  chikkamagaluru: 'chikkamagaluru',
  chikmagalur: 'chikkamagaluru',
  chitradurga: 'chitradurga',
  'dakshina kannada': 'dakshina-kannada',
  'dakshin kannad': 'dakshina-kannada',
  davanagere: 'davanagere',
  dharwad: 'dharwad',
  gadag: 'gadag',
  gulbarga: 'kalaburagi',
  kalaburagi: 'kalaburagi',
  hassan: 'hassan',
  haveri: 'haveri',
  kodagu: 'kodagu',
  coorg: 'kodagu',
  kolar: 'kolar',
  koppal: 'koppal',
  mandya: 'mandya',
  mysuru: 'mysuru',
  mysore: 'mysuru',
  raichur: 'raichur',
  ramanagara: 'ramanagara',
  ramanagaram: 'ramanagara',
  shivamogga: 'shivamogga',
  shimoga: 'shivamogga',
  tumakuru: 'tumakuru',
  tumkur: 'tumakuru',
  udupi: 'udupi',
  'uttara kannada': 'uttara-kannada',
  'uttar kannand': 'uttara-kannada',
  vijayapura: 'vijayapura',
  bijapur: 'vijayapura',
  yadgir: 'yadgir',
};

const PRIORITY_ANCHOR_ORDER = [
  'vijayanagara',
  'mysuru',
  'hassan',
  'bagalkot',
  'vijayapura',
  'uttara-kannada',
  'bidar',
  'chitradurga',
  'belagavi',
  'udupi',
  'bengaluru-urban',
  'kodagu',
  'kalaburagi',
  'raichur',
  'dharwad',
  'shivamogga',
  'dakshina-kannada',
  'chikkamagaluru',
  'ballari',
  'tumakuru',
  'kolar',
  'gadag',
  'koppal',
  'haveri',
  'davanagere',
  'mandya',
  'chamarajanagar',
  'yadgir',
  'ramanagara',
  'chikkaballapura',
  'bengaluru-rural',
];

export function normalizeDistrictId(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  const cleaned = rawName.trim().toLowerCase().replace(/\s+/g, ' ');
  if (DISTRICT_ALIASES[cleaned]) return DISTRICT_ALIASES[cleaned];
  return cleaned.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DEFAULT_STYLE = {
  color: '#941D2A',
  weight: 1.35,
  opacity: 0.9,
  fillColor: '#FFFFFF',
  fillOpacity: 0.88,
  className: '',
};

const HOVER_STYLE = {
  color: '#C92332',
  weight: 2.2,
  opacity: 1,
  fillColor: '#FFF2B8',
  fillOpacity: 0.95,
  className: '',
};

const SELECTED_STYLE = {
  color: '#C92332',
  weight: 2.8,
  opacity: 1,
  fillColor: '#F8C928',
  fillOpacity: 0.42,
  className: 'hh-district-selected-path',
};

/**
 * Initializes an interactive Karnataka district map with monument thumbnail markers.
 * @param {object} L Leaflet global or module export
 * @param {HTMLElement} containerEl Target DOM element
 * @param {object} options Callbacks, districts array, and GeoJSON URL
 */
export function createKarnatakaDistrictMap(L, containerEl, options = {}) {
  const {
    geojsonUrl = '/data/karnataka-districts.geojson',
    districtsUrl = '/data/districts.json',
    districts: initialDistricts = [],
    onSelectDistrict = () => {},
    onHoverDistrict = () => {},
    onLoadSuccess = () => {},
    onLoadError = () => {},
  } = options;

  let destroyed = false;
  let selectedPolygonId = null;
  let selectedDistrictId = null;
  let geoJsonLayer = null;
  let districtsData = Array.isArray(initialDistricts) ? [...initialDistricts] : [];

  const layerByPolygonId = new Map();
  const markerLayerGroup = L.layerGroup();

  containerEl.classList.add('hh-map-canvas');

  const map = L.map(containerEl, {
    center: [15.05, 76.2],
    zoom: 7,
    minZoom: 6,
    maxZoom: 11,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true,
  });

  markerLayerGroup.addTo(map);
  map.attributionControl.setPrefix('');
  map.attributionControl.addAttribution(
    'Boundaries: <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener noreferrer">geoBoundaries IND-ADM2 (2021)</a> · ODbL 1.0',
  );

  function applyBaseStyles() {
    if (!geoJsonLayer) return;
    geoJsonLayer.eachLayer((layer) => {
      const pid = layer.feature?.properties?.__districtId;
      if (pid && pid === selectedPolygonId) {
        layer.setStyle(SELECTED_STYLE);
        layer.bringToFront();
      } else {
        layer.setStyle(DEFAULT_STYLE);
      }
    });
  }

  function getSortedDistrictsForPlacement() {
    const rank = new Map(PRIORITY_ANCHOR_ORDER.map((id, idx) => [id, idx]));
    return [...districtsData]
      .filter(
        (d) =>
          typeof d.monumentLat === 'number' &&
          typeof d.monumentLng === 'number' &&
          Number.isFinite(d.monumentLat) &&
          Number.isFinite(d.monumentLng),
      )
      .sort((a, b) => {
        if (a.id === selectedDistrictId) return -1;
        if (b.id === selectedDistrictId) return 1;
        const ra = rank.has(a.id) ? rank.get(a.id) : 999;
        const rb = rank.has(b.id) ? rank.get(b.id) : 999;
        return ra - rb;
      });
  }

  function renderMonumentMarkers() {
    if (destroyed || !map || districtsData.length === 0) return;

    markerLayerGroup.clearLayers();

    const zoom = map.getZoom();
    const thumbSize = zoom <= 6 ? 30 : zoom === 7 ? 38 : zoom === 8 ? 44 : 50;
    const minSepPx = zoom >= 9 ? thumbSize + 6 : thumbSize + 10;

    const placedPoints = [];
    const orderedDistricts = getSortedDistrictsForPlacement();

    orderedDistricts.forEach((district, idx) => {
      const latlng = L.latLng(district.monumentLat, district.monumentLng);
      const pt = map.latLngToContainerPoint(latlng);

      const collides = placedPoints.some((existing) => {
        const dx = existing.x - pt.x;
        const dy = existing.y - pt.y;
        return Math.hypot(dx, dy) < minSepPx;
      });

      const isSelected = district.id === selectedDistrictId;
      const showThumb = isSelected || !collides;
      const imgUrl = `/images/${encodeURIComponent(district.monumentImageKey || 'hero-hampi')}.jpg`;
      const initial = escapeHtml((district.name || 'K').charAt(0).toUpperCase());
      const safeName = escapeHtml(district.name);
      const safeMonument = escapeHtml(district.monumentName || `${district.name} Heritage`);

      let icon;
      let zIndexOffset = isSelected ? 900 : 200;

      if (showThumb) {
        placedPoints.push(pt);
        const delayMs = (idx % 6) * 280;
        const html = `
          <div class="hh-thumb-marker ${isSelected ? 'is-selected' : ''}" style="animation-delay:${delayMs}ms" title="${safeMonument}">
            <img src="${imgUrl}" alt="${safeMonument}" loading="eager" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <span class="hh-thumb-fallback" style="display:none;">${initial}</span>
          </div>
        `;
        icon = L.divIcon({
          className: 'hh-thumb-icon-wrap',
          html,
          iconSize: [thumbSize, thumbSize],
          iconAnchor: [thumbSize / 2, thumbSize / 2],
        });
        zIndexOffset = isSelected ? 950 : 350;
      } else {
        const dotSize = 15;
        icon = L.divIcon({
          className: 'hh-thumb-icon-wrap',
          html: `<div class="hh-dot-marker ${isSelected ? 'is-selected' : ''}" title="${safeMonument}"></div>`,
          iconSize: [dotSize, dotSize],
          iconAnchor: [dotSize / 2, dotSize / 2],
        });
        zIndexOffset = 180;
      }

      const marker = L.marker(latlng, {
        icon,
        zIndexOffset,
        keyboard: true,
        title: `${district.name} — ${district.monumentName || ''}`,
      });

      const tooltipHtml = `
        <div class="hh-tooltip-card">
          <img src="${imgUrl}" alt="" onerror="this.style.display='none'" />
          <div>
            <div class="hh-tooltip-title">${safeName}</div>
            <div class="hh-tooltip-sub">${safeMonument}</div>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, showThumb ? -(thumbSize / 2 + 4) : -10],
        className: 'hh-district-tooltip',
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        selectDistrictById(district.id, { focusBounds: true, notify: true });
      });

      marker.on('mouseover', () => {
        onHoverDistrict({
          polygonId: district.id === 'vijayanagara' ? 'ballari' : district.id,
          districtName: `${district.name} · ${district.monumentName || ''}`,
        });
      });

      marker.on('mouseout', () => {
        onHoverDistrict(null);
      });

      markerLayerGroup.addLayer(marker);
    });
  }

  function selectDistrictById(rawId, { focusBounds = true, notify = true } = {}) {
    if (!rawId) return false;
    const rawLower = rawId.trim().toLowerCase();
    const normalizedPolygon = normalizeDistrictId(rawLower);
    const targetLayer = layerByPolygonId.get(normalizedPolygon);

    if (!targetLayer) {
      return false;
    }

    selectedPolygonId = normalizedPolygon;
    if (rawLower === 'vijayanagara' || rawLower === 'hampi') {
      selectedDistrictId = 'vijayanagara';
    } else if (rawLower === 'ballari' || rawLower === 'bellary') {
      selectedDistrictId = 'ballari';
    } else {
      selectedDistrictId = normalizedPolygon;
    }

    applyBaseStyles();

    if (focusBounds && targetLayer.getBounds) {
      map.fitBounds(targetLayer.getBounds(), {
        padding: [40, 40],
        maxZoom: 9,
        animate: true,
      });
    }

    renderMonumentMarkers();

    if (notify) {
      const props = targetLayer.feature?.properties || {};
      onSelectDistrict({
        requestedId: selectedDistrictId,
        polygonId: normalizedPolygon,
        districtName: props.districtName || props.shapeName || rawId,
        rawName: props.shapeName || rawId,
      });
    }

    return true;
  }

  function resetSelection() {
    selectedPolygonId = null;
    selectedDistrictId = null;
    applyBaseStyles();
    if (geoJsonLayer && geoJsonLayer.getBounds().isValid()) {
      map.fitBounds(geoJsonLayer.getBounds(), {
        padding: [20, 20],
        animate: true,
      });
    }
    renderMonumentMarkers();
  }

  function setDistricts(nextDistricts) {
    if (Array.isArray(nextDistricts) && nextDistricts.length > 0) {
      districtsData = [...nextDistricts];
      renderMonumentMarkers();
    }
  }

  map.on('zoomend viewreset', renderMonumentMarkers);

  const abortController = new AbortController();

  const districtsPromise =
    districtsData.length > 0
      ? Promise.resolve(districtsData)
      : fetch(districtsUrl, { signal: abortController.signal }).then((r) =>
          r.ok ? r.json() : [],
        );

  Promise.all([
    fetch(geojsonUrl, { signal: abortController.signal }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch Karnataka GeoJSON (${res.status}).`);
      }
      return res.json();
    }),
    districtsPromise.catch(() => []),
  ])
    .then(([geojson, loadedDistricts]) => {
      if (destroyed) return;
      if (
        !geojson ||
        geojson.type !== 'FeatureCollection' ||
        !Array.isArray(geojson.features) ||
        geojson.features.length === 0
      ) {
        throw new Error('Karnataka GeoJSON dataset is empty or malformed.');
      }

      if (districtsData.length === 0 && Array.isArray(loadedDistricts)) {
        districtsData = loadedDistricts;
      }

      geoJsonLayer = L.geoJSON(geojson, {
        style: () => DEFAULT_STYLE,
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {};
          const displayName = props.districtName || props.shapeName || 'Unknown District';
          const polygonId = normalizeDistrictId(props.districtId || displayName);
          props.__districtId = polygonId;
          layerByPolygonId.set(polygonId, layer);

          const tooltipText =
            polygonId === 'ballari' ? 'Ballari & Vijayanagara (Hampi)' : displayName;

          layer.bindTooltip(tooltipText, {
            sticky: true,
            direction: 'top',
            offset: [0, -8],
            className: 'hh-district-tooltip',
          });

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              if (polygonId !== selectedPolygonId) {
                target.setStyle(HOVER_STYLE);
              }
              target.bringToFront();
              if (selectedPolygonId && layerByPolygonId.has(selectedPolygonId)) {
                layerByPolygonId.get(selectedPolygonId).bringToFront();
              }
              onHoverDistrict({
                polygonId,
                districtName: displayName,
              });
            },
            mouseout: (e) => {
              const target = e.target;
              if (polygonId === selectedPolygonId) {
                target.setStyle(SELECTED_STYLE);
              } else {
                target.setStyle(DEFAULT_STYLE);
              }
              onHoverDistrict(null);
            },
            click: () => {
              selectDistrictById(polygonId, { focusBounds: true, notify: true });
            },
          });
        },
      }).addTo(map);

      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
        map.setMaxBounds(bounds.pad(0.35));
      }

      renderMonumentMarkers();

      onLoadSuccess({
        featureCount: geojson.features.length,
        dataset: 'geoBoundaries IND-ADM2-76128533 (2021)',
      });
    })
    .catch((err) => {
      if (destroyed || err?.name === 'AbortError') return;
      onLoadError(err instanceof Error ? err.message : 'Unable to load district boundaries.');
    });

  return {
    selectDistrictById,
    resetSelection,
    setDistricts,
    zoomIn: () => map.zoomIn(),
    zoomOut: () => map.zoomOut(),
    invalidateSize: () => {
      map.invalidateSize();
      renderMonumentMarkers();
    },
    destroy: () => {
      destroyed = true;
      abortController.abort();
      map.off('zoomend viewreset', renderMonumentMarkers);
      map.remove();
    },
  };
}
