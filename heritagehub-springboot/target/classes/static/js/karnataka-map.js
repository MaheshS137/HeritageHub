(function (global) {
  'use strict';

  var DISTRICT_ALIASES = {
    bagalkot: 'bagalkot',
    bagalkote: 'bagalkot',
    ballari: 'ballari',
    bellary: 'ballari',
    vijayanagara: 'ballari',
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
    chikkamagaluru: 'chikkamagaluru',
    chikmagalur: 'chikkamagaluru',
    chitradurga: 'chitradurga',
    'dakshina kannada': 'dakshina-kannada',
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
    shivamogga: 'shivamogga',
    shimoga: 'shivamogga',
    tumakuru: 'tumakuru',
    tumkur: 'tumakuru',
    udupi: 'udupi',
    'uttara kannada': 'uttara-kannada',
    vijayapura: 'vijayapura',
    bijapur: 'vijayapura',
    yadgir: 'yadgir'
  };

  var PRIORITY_ANCHORS = [
    'vijayanagara', 'mysuru', 'hassan', 'bagalkot', 'vijayapura',
    'uttara-kannada', 'bidar', 'chitradurga', 'belagavi', 'udupi',
    'bengaluru-urban', 'kodagu', 'kalaburagi', 'raichur', 'dharwad',
    'shivamogga', 'dakshina-kannada', 'chikkamagaluru', 'ballari',
    'tumakuru', 'kolar', 'gadag', 'koppal', 'haveri', 'davanagere',
    'mandya', 'chamarajanagar', 'yadgir', 'ramanagara', 'chikkaballapura',
    'bengaluru-rural'
  ];

  function normalizeDistrictId(rawName) {
    if (!rawName || typeof rawName !== 'string') return '';
    var cleaned = rawName.trim().toLowerCase().replace(/\s+/g, ' ');
    if (DISTRICT_ALIASES[cleaned]) return DISTRICT_ALIASES[cleaned];
    return cleaned.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var DEFAULT_STYLE = { color: '#941D2A', weight: 1.35, opacity: 0.9, fillColor: '#FFFFFF', fillOpacity: 0.88 };
  var HOVER_STYLE = { color: '#C92332', weight: 2.2, opacity: 1, fillColor: '#FFF2B8', fillOpacity: 0.95 };
  var SELECTED_STYLE = { color: '#C92332', weight: 2.8, opacity: 1, fillColor: '#F8C928', fillOpacity: 0.42 };

  function initKarnatakaMap(options) {
    var mapEl = document.getElementById(options.mapElementId);
    if (!mapEl || typeof L === 'undefined') return null;

    var selectedPolygonId = null;
    var selectedDistrictId = null;
    var geoLayer = null;
    var layersById = new Map();
    var districtsById = new Map();
    var allDistricts = [];
    var markerGroup = L.layerGroup();

    var map = L.map(mapEl, {
      center: [15.05, 76.2],
      zoom: 7,
      minZoom: 6,
      maxZoom: 11,
      scrollWheelZoom: false
    });

    markerGroup.addTo(map);
    map.attributionControl.setPrefix('');
    map.attributionControl.addAttribution('geoBoundaries IND-ADM2 (2021) · ODbL 1.0');

    function renderMarkers() {
      if (!allDistricts.length) return;
      markerGroup.clearLayers();

      var zoom = map.getZoom();
      var thumbSize = zoom <= 6 ? 30 : zoom === 7 ? 38 : zoom === 8 ? 44 : 50;
      var minSep = zoom >= 9 ? thumbSize + 6 : thumbSize + 10;
      var placed = [];

      var rank = {};
      PRIORITY_ANCHORS.forEach(function (id, i) { rank[id] = i; });

      var sorted = allDistricts.filter(function (d) {
        return typeof d.monumentLat === 'number' && typeof d.monumentLng === 'number';
      }).sort(function (a, b) {
        if (a.id === selectedDistrictId) return -1;
        if (b.id === selectedDistrictId) return 1;
        return (rank[a.id] !== undefined ? rank[a.id] : 999) - (rank[b.id] !== undefined ? rank[b.id] : 999);
      });

      sorted.forEach(function (d, idx) {
        var ll = L.latLng(d.monumentLat, d.monumentLng);
        var pt = map.latLngToContainerPoint(ll);
        var collides = placed.some(function (p) {
          return Math.hypot(p.x - pt.x, p.y - pt.y) < minSep;
        });

        var isSelected = d.id === selectedDistrictId;
        var showThumb = isSelected || !collides;
        var imgUrl = '/images/' + encodeURIComponent(d.monumentImageKey || 'hero-hampi') + '.jpg';
        var initial = escapeHtml((d.name || 'K').charAt(0).toUpperCase());
        var safeName = escapeHtml(d.name);
        var safeMonument = escapeHtml(d.monumentName || d.name);

        var icon;
        var zOffset = isSelected ? 950 : 300;
        if (showThumb) {
          placed.push(pt);
          icon = L.divIcon({
            className: 'hh-thumb-icon-wrap',
            html: '<div class="hh-thumb-marker ' + (isSelected ? 'is-selected' : '') + '" style="animation-delay:' + ((idx % 6) * 280) + 'ms">' +
              '<img src="' + imgUrl + '" alt="' + safeMonument + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';"/>' +
              '<span class="hh-thumb-fallback" style="display:none;">' + initial + '</span></div>',
            iconSize: [thumbSize, thumbSize],
            iconAnchor: [thumbSize / 2, thumbSize / 2]
          });
        } else {
          zOffset = 180;
          icon = L.divIcon({
            className: 'hh-thumb-icon-wrap',
            html: '<div class="hh-dot-marker ' + (isSelected ? 'is-selected' : '') + '"></div>',
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5]
          });
        }

        var marker = L.marker(ll, { icon: icon, zIndexOffset: zOffset });
        marker.bindTooltip(
          '<div class="hh-tooltip-card"><img src="' + imgUrl + '" alt="" onerror="this.style.display=\'none\'"/><div>' +
          '<div class="hh-tooltip-title">' + safeName + '</div>' +
          '<div class="hh-tooltip-sub">' + safeMonument + '</div></div></div>',
          { direction: 'top', offset: [0, showThumb ? -(thumbSize / 2 + 4) : -10], className: 'hh-district-tooltip' }
        );
        marker.on('click', function (e) {
          L.DomEvent.stopPropagation(e);
          selectDistrict(d.id);
        });
        markerGroup.addLayer(marker);
      });
    }

    function updatePanel(district) {
      var panelEl = document.getElementById(options.panelElementId);
      if (!panelEl) return;

      if (!district) {
        panelEl.innerHTML =
          '<p class="hh-kicker">Interactive District Atlas</p>' +
          '<h3 style="font-size:1.5rem;margin-bottom:10px;">Select Any District in Karnataka</h3>' +
          '<p class="hh-muted" style="font-size:0.9rem;">Click any monument photo thumbnail or district boundary to view famous monuments, historical background, cultural significance, and gallery photos.</p>';
        return;
      }

      var imgKey = district.monumentImageKey || (district.images && district.images[0]) || 'hero-hampi';
      var gallery = Array.isArray(district.galleryImages) ? district.galleryImages : [];
      var galleryHtml = gallery.length > 0
        ? '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;">' +
          gallery.slice(0, 3).map(function (g) {
            return '<img src="/images/' + encodeURIComponent(g) + '.jpg" alt="' + escapeHtml(district.name) + ' gallery" style="width:100%;height:62px;object-fit:cover;border-radius:6px;border:1px solid #EADEC8;"/>';
          }).join('') + '</div>'
        : '';

      var noteHtml = (district.id === 'ballari' || district.id === 'vijayanagara')
        ? '<div style="padding:10px;background:#FBF6E8;border:1px solid #EADEC8;border-radius:6px;font-size:0.78rem;color:#77716B;margin-bottom:12px;">' +
          '<div style="margin-bottom:8px;">' + escapeHtml(district.geoBoundaryNote || '') + '</div>' +
          '<div style="display:flex;gap:8px;">' +
          '<button type="button" data-hh-pick="ballari" class="hh-btn ' + (district.id === 'ballari' ? 'hh-btn-primary' : 'hh-btn-outline') + '" style="padding:6px 12px;font-size:0.75rem;">Ballari</button>' +
          '<button type="button" data-hh-pick="vijayanagara" class="hh-btn ' + (district.id === 'vijayanagara' ? 'hh-btn-primary' : 'hh-btn-outline') + '" style="padding:6px 12px;font-size:0.75rem;">Vijayanagara (Hampi)</button>' +
          '</div></div>'
        : '';

      panelEl.innerHTML =
        '<p class="hh-kicker">' + escapeHtml(district.region || '') + ' · ' + escapeHtml(district.division || '') + ' Division</p>' +
        '<h3 style="font-size:1.75rem;margin-bottom:12px;">' + escapeHtml(district.name) + '</h3>' +
        '<div style="border-radius:10px;overflow:hidden;border:1px solid #EADEC8;margin-bottom:14px;">' +
          '<img src="/images/' + encodeURIComponent(imgKey) + '.jpg" alt="' + escapeHtml(district.monumentName || district.name) + '" style="width:100%;height:175px;object-fit:cover;"/>' +
          '<div style="padding:10px 12px;background:#FBF6E8;border-top:1px solid #EADEC8;">' +
            '<div style="font-family:var(--hh-font-serif);font-weight:600;font-size:0.95rem;color:#292522;">' + escapeHtml(district.monumentName || '') + '</div>' +
            '<div style="font-size:0.75rem;color:#941D2A;">' + escapeHtml(district.monumentLocation || '') + '</div>' +
          '</div>' +
        '</div>' +
        noteHtml +
        '<p style="font-size:0.875rem;color:#292522;margin-bottom:10px;">' + escapeHtml(district.monumentDescription || district.description || '') + '</p>' +
        '<p style="font-size:0.82rem;color:#77716B;padding:10px;background:#FFFDF7;border:1px solid #EADEC8;border-radius:6px;">' +
          '<strong style="color:#941D2A;">Cultural Significance:</strong> ' + escapeHtml(district.culturalSignificance || '') +
        '</p>' +
        galleryHtml +
        '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
          '<a class="hh-btn hh-btn-primary" href="/district/' + encodeURIComponent(district.id) + '">Explore District →</a>' +
          '<a class="hh-btn hh-btn-outline" href="/culture?district=' + encodeURIComponent(district.name) + '">Cultural Archive</a>' +
        '</div>';

      panelEl.classList.remove('hh-panel-crossfade');
      void panelEl.offsetWidth;
      panelEl.classList.add('hh-panel-crossfade');

      panelEl.querySelectorAll('[data-hh-pick]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectDistrict(btn.getAttribute('data-hh-pick'));
        });
      });
    }

    function selectDistrict(id) {
      var rawLower = (id || '').trim().toLowerCase();
      var normalized = normalizeDistrictId(rawLower);
      var polyId = (rawLower === 'vijayanagara' || rawLower === 'hampi') ? 'ballari' : normalized;
      var layer = layersById.get(polyId);
      if (!layer) return;

      selectedPolygonId = polyId;
      selectedDistrictId = (rawLower === 'vijayanagara' || rawLower === 'hampi')
        ? 'vijayanagara'
        : (rawLower === 'ballari' ? 'ballari' : normalized);

      geoLayer.eachLayer(function (l) {
        l.setStyle(l === layer ? SELECTED_STYLE : DEFAULT_STYLE);
      });
      layer.bringToFront();
      map.fitBounds(layer.getBounds(), { padding: [36, 36], maxZoom: 9 });
      renderMarkers();

      var district = districtsById.get(selectedDistrictId) || districtsById.get(normalized) || districtsById.get(polyId);
      updatePanel(district);
    }

    function resetMap() {
      selectedPolygonId = null;
      selectedDistrictId = null;
      if (geoLayer) {
        geoLayer.eachLayer(function (l) { l.setStyle(DEFAULT_STYLE); });
        map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
      }
      renderMarkers();
      updatePanel(null);
    }

    map.on('zoomend viewreset', renderMarkers);

    Promise.all([
      fetch('/data/districts.json').then(function (r) { return r.json(); }),
      fetch('/data/karnataka-districts.geojson').then(function (r) { return r.json(); })
    ]).then(function (results) {
      allDistricts = results[0];
      var geojson = results[1];
      allDistricts.forEach(function (d) { districtsById.set(d.id, d); });

      geoLayer = L.geoJSON(geojson, {
        style: function () { return DEFAULT_STYLE; },
        onEachFeature: function (feature, layer) {
          var props = feature.properties || {};
          var name = props.districtName || props.shapeName || 'District';
          var pid = normalizeDistrictId(props.districtId || name);
          layersById.set(pid, layer);

          layer.bindTooltip(pid === 'ballari' ? 'Ballari & Vijayanagara (Hampi)' : name, {
            sticky: true,
            direction: 'top',
            className: 'hh-district-tooltip'
          });

          layer.on('mouseover', function () {
            if (pid !== selectedPolygonId) layer.setStyle(HOVER_STYLE);
            layer.bringToFront();
          });
          layer.on('mouseout', function () {
            layer.setStyle(pid === selectedPolygonId ? SELECTED_STYLE : DEFAULT_STYLE);
          });
          layer.on('click', function () {
            selectDistrict(pid);
          });
        }
      }).addTo(map);

      map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
      renderMarkers();

      var params = new URLSearchParams(window.location.search);
      var initialDistrict = params.get('district');
      if (initialDistrict) {
        selectDistrict(initialDistrict);
      }

      var searchInput = document.getElementById(options.searchInputId);
      if (searchInput) {
        var handleSearch = function () {
          var raw = searchInput.value.trim().toLowerCase();
          if (!raw) return;
          if (raw === 'hampi' || raw === 'vijayanagara') {
            selectDistrict('vijayanagara');
            return;
          }
          var norm = normalizeDistrictId(raw);
          var match = allDistricts.find(function (d) {
            return d.id === norm || d.name.toLowerCase() === raw || d.name.toLowerCase().indexOf(raw) !== -1;
          });
          if (match) selectDistrict(match.id);
        };
        searchInput.addEventListener('change', handleSearch);
        searchInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        });
      }

      var resetBtn = document.getElementById(options.resetButtonId);
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (searchInput) searchInput.value = '';
          resetMap();
        });
      }

      var zoomInBtn = options.zoomInButtonId && document.getElementById(options.zoomInButtonId);
      if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function () {
          map.zoomIn();
        });
      }

      var zoomOutBtn = options.zoomOutButtonId && document.getElementById(options.zoomOutButtonId);
      if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function () {
          map.zoomOut();
        });
      }
    }).catch(function () {
      var panelEl = document.getElementById(options.panelElementId);
      if (panelEl) {
        panelEl.innerHTML = '<p style="color:#941D2A;font-weight:600;">Unable to load Karnataka district boundaries.</p>';
      }
    });

    return { selectDistrict: selectDistrict, resetMap: resetMap };
  }

  global.HeritageHubMap = { initKarnatakaMap: initKarnatakaMap };
})(window);
