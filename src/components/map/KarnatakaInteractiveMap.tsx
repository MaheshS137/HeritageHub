import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import L from 'leaflet';
import {
  ArrowRight,
  Bookmark,
  MapPin,
  RotateCcw,
  Search,
  X,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Camera,
} from 'lucide-react';
import { createKarnatakaDistrictMap, normalizeDistrictId } from '../../lib/karnatakaMap';
import type { DistrictRecord } from '../../hooks/useDistrictArchive';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { PhotoCredit } from '../PhotoCredit';
import { HERITAGE_EASE } from '../motion/MotionPrimitives';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';

interface KarnatakaInteractiveMapProps {
  districts: DistrictRecord[];
  initialDistrictId?: string | null;
  variant?: 'homepage' | 'explore';
}

export function KarnatakaInteractiveMap({
  districts,
  initialDistrictId = null,
  variant = 'homepage',
}: KarnatakaInteractiveMapProps) {
  const navigate = useNavigate();
  const { t, translateDistrict, translateRegion } = useI18n();
  const { user, favoriteMonumentIds, toggleFavoriteMonument } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapControllerRef = useRef<ReturnType<typeof createKarnatakaDistrictMap> | null>(null);

  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(initialDistrictId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const districtMap = useMemo(() => {
    const map = new Map<string, DistrictRecord>();
    for (const d of districts) {
      map.set(d.id, d);
    }
    return map;
  }, [districts]);

  const selectedDistrict = selectedDistrictId ? districtMap.get(selectedDistrictId) ?? null : null;

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return districts
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.monumentName.toLowerCase().includes(q) ||
          (d.id === 'vijayanagara' && 'hampi'.includes(q)) ||
          (d.id === 'kodagu' && 'coorg'.includes(q)) ||
          (d.id === 'mysuru' && 'mysore'.includes(q)) ||
          (d.id === 'bengaluru-urban' && 'bangalore'.includes(q)) ||
          (d.id === 'belagavi' && 'belgaum'.includes(q)) ||
          (d.id === 'kalaburagi' && 'gulbarga'.includes(q)) ||
          (d.id === 'vijayapura' && 'bijapur'.includes(q)),
      )
      .slice(0, 7);
  }, [districts, searchQuery]);

  const featuredQuickDistricts = useMemo(
    () =>
      [
        'vijayanagara',
        'mysuru',
        'hassan',
        'bagalkot',
        'vijayapura',
        'uttara-kannada',
        'bidar',
        'chitradurga',
        'udupi',
      ]
        .map((id) => districtMap.get(id))
        .filter((d): d is DistrictRecord => Boolean(d)),
    [districtMap],
  );

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    setMapStatus('loading');
    setMapError(null);

    const controller = createKarnatakaDistrictMap(L, el, {
      geojsonUrl: '/data/karnataka-districts.geojson',
      districts,
      onLoadSuccess: () => {
        setMapStatus('ready');
        if (initialDistrictId) {
          const lower = initialDistrictId.trim().toLowerCase();
          const targetId =
            lower === 'hampi' || lower === 'vijayanagara'
              ? 'vijayanagara'
              : normalizeDistrictId(initialDistrictId);
          controller.selectDistrictById(targetId, { focusBounds: true, notify: false });
          setSelectedDistrictId(targetId);
        }
      },
      onLoadError: (msg: string) => {
        setMapStatus('error');
        setMapError(msg);
      },
      onHoverDistrict: (info: { districtName: string } | null) => {
        setHoveredName(info ? info.districtName : null);
      },
      onSelectDistrict: (info: { polygonId: string; requestedId: string }) => {
        const chosen =
          info.requestedId === 'vijayanagara' || info.requestedId === 'hampi'
            ? 'vijayanagara'
            : info.requestedId || info.polygonId;
        setSelectedDistrictId(chosen);
      },
    });

    mapControllerRef.current = controller;

    return () => {
      controller.destroy();
      mapControllerRef.current = null;
    };
  }, [initialDistrictId]);

  useEffect(() => {
    if (districts.length > 0) {
      mapControllerRef.current?.setDistricts(districts);
    }
  }, [districts]);

  const handleSelectDistrict = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setShowSuggestions(false);
    const district = districtMap.get(districtId);
    if (district) {
      setSearchQuery(district.name);
    }
    mapControllerRef.current?.selectDistrictById(districtId, {
      focusBounds: true,
      notify: false,
    });
  };

  const handleReset = () => {
    setSelectedDistrictId(null);
    setSearchQuery('');
    setShowSuggestions(false);
    mapControllerRef.current?.resetSelection();
  };

  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const mapHeightClass =
    variant === 'explore'
      ? 'h-[460px] sm:h-[560px] lg:h-[660px]'
      : 'h-[430px] sm:h-[510px] lg:h-[590px]';

  const galleryList = useMemo(() => {
    if (!selectedDistrict) return [];
    const merged = new Set<string>([
      ...(selectedDistrict.galleryImages ?? []),
      ...(selectedDistrict.images ?? []),
    ]);
    if (selectedDistrict.monumentImageKey) {
      merged.delete(selectedDistrict.monumentImageKey);
    }
    return Array.from(merged).slice(0, 3);
  }, [selectedDistrict]);

  return (
    <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl overflow-hidden shadow-[0_12px_36px_rgba(32,28,27,0.06)]">
      {/* Top Map Toolbar: Search + Status + Zoom + Reset */}
      <div className="p-4 sm:p-5 border-b border-[#EADEC8] bg-[#FBF6E8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div ref={searchBoxRef} className="relative flex-1 max-w-md">
          <label htmlFor={`district-map-search-${variant}`} className="sr-only">
            Search Karnataka districts or monuments
          </label>
          <Search
            className="w-4 h-4 text-[#941D2A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id={`district-map-search-${variant}`}
            type="text"
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSuggestions(false);
              } else if (e.key === 'Enter' && searchSuggestions.length > 0) {
                e.preventDefault();
                handleSelectDistrict(searchSuggestions[0].id);
              }
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder={t('map.searchPlaceholder')}
            className="w-full pl-10 pr-9 py-2.5 min-h-[42px] text-sm bg-[#FFFFFF] border border-[#EADEC8] focus:border-[#C92332] focus:outline-none rounded-md text-[#292522] placeholder:text-[#77716B]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              aria-label="Clear district search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#292522] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* District Search Suggestions */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-[500] bg-[#FFFFFF] border border-[#EADEC8] rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {searchSuggestions.length > 0 ? (
                <ul>
                  {searchSuggestions.map((d) => {
                    const trD = translateDistrict(d);
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectDistrict(d.id)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#FBF6E8] border-b border-[#EADEC8]/60 last:border-b-0 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-[#292522] block truncate">
                              {trD.name}
                            </span>
                            <span className="text-xs text-[#941D2A] block truncate">
                              {trD.monumentName}
                            </span>
                          </div>
                          <span className="text-xs text-[#77716B] shrink-0">
                            {translateRegion(d.region)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-4 py-3 text-xs text-[#77716B]">
                  No Karnataka district matches &ldquo;{searchQuery}&rdquo;.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
          <p className="text-xs text-[#77716B] mr-1">
            {hoveredName ? (
              <span>
                Hover: <strong className="text-[#941D2A] font-semibold">{hoveredName}</strong>
              </span>
            ) : selectedDistrict ? (
              <span>
                Selected:{' '}
                <strong className="text-[#941D2A] font-semibold">
                  {translateDistrict(selectedDistrict).name}
                </strong>
              </span>
            ) : (
              <span>Click any monument photo or district border</span>
            )}
          </p>

          <div className="inline-flex items-center border border-[#EADEC8] rounded-md bg-[#FFFFFF] overflow-hidden">
            <button
              type="button"
              onClick={() => mapControllerRef.current?.zoomIn()}
              aria-label={t('map.zoomIn')}
              className="px-2.5 py-2 text-[#941D2A] hover:bg-[#F8C928] hover:text-[#201C1B] transition-colors cursor-pointer border-r border-[#EADEC8]"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => mapControllerRef.current?.zoomOut()}
              aria-label={t('map.zoomOut')}
              className="px-2.5 py-2 text-[#941D2A] hover:bg-[#F8C928] hover:text-[#201C1B] transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={!selectedDistrictId && !searchQuery}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-semibold border border-[#EADEC8] bg-[#FFFFFF] text-[#941D2A] hover:border-[#C92332] hover:bg-[#FFFDF7] disabled:opacity-45 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('map.resetMap')}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Leaflet GeoJSON + Monument Map & District Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Leaflet Map Viewport */}
        <div
          className={`lg:col-span-7 relative border-b lg:border-b-0 lg:border-r border-[#EADEC8] ${mapHeightClass}`}
        >
          <div
            ref={mapContainerRef}
            aria-label="Interactive Karnataka District Monument Map"
            className="w-full h-full z-10"
          />

          {/* Compact Cartographic Legend Pill Overlay (Bottom Left) */}
          <div className="hidden sm:flex items-center gap-3 absolute bottom-3 left-3 z-[400] bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#EADEC8] rounded-md px-3 py-1.5 text-[11px] text-[#292522] shadow-xs pointer-events-none">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8C928] border border-[#C92332]" />
              <span>Selected / Monument Anchor</span>
            </span>
            <span className="text-[#EADEC8]">|</span>
            <span className="text-[#77716B]">Zoom in to reveal all 31 photo thumbnails</span>
          </div>

          {mapStatus === 'loading' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FAF4E4]/92 text-center px-6">
              <div className="w-9 h-9 border-2 border-[#C92332] border-t-[#F8C928] rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-[#292522]">
                Loading Karnataka District Boundaries &amp; Monuments…
              </p>
              <p className="text-xs text-[#77716B] mt-1">
                Dataset: geoBoundaries IND-ADM2 (2021) · 31 District Monuments
              </p>
            </div>
          )}

          {mapStatus === 'error' && (
            <div
              role="alert"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FFFDF7] text-center px-6"
            >
              <AlertCircle className="w-8 h-8 text-[#C92332] mb-3" aria-hidden="true" />
              <h3 className="font-serif text-xl font-medium text-[#292522]">
                District Boundary Dataset Unavailable
              </h3>
              <p className="mt-2 text-sm text-[#77716B] max-w-md">
                {mapError ?? 'Could not load /data/karnataka-districts.geojson.'}
              </p>
              <p className="mt-2 text-xs text-[#77716B]">
                Required file:{' '}
                <code className="text-[#292522]">/data/karnataka-districts.geojson</code>
              </p>
            </div>
          )}
        </div>

        {/* District Information Side Panel */}
        <aside
          aria-live="polite"
          className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-[#FFFFFF]"
        >
          <AnimatePresence mode="wait">
            {selectedDistrict ? (
              (() => {
                const trSelected = translateDistrict(selectedDistrict);
                const isFavMonument = favoriteMonumentIds.has(selectedDistrict.id);
                return (
                  <motion.div
                    key={selectedDistrict.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: HERITAGE_EASE }}
                    className="space-y-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
                          {translateRegion(selectedDistrict.region)} · {selectedDistrict.division}{' '}
                          Division
                        </span>
                        <span className="text-[#77716B] tabular-nums">
                          {selectedDistrict.monumentLat.toFixed(2)}° N,{' '}
                          {selectedDistrict.monumentLng.toFixed(2)}° E
                        </span>
                      </div>

                      <h3 className="mt-1.5 font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                        {trSelected.name}
                      </h3>
                    </div>

                    {/* Famous Monument Hero Card */}
                    <div className="space-y-1.5">
                      <div className="rounded-lg border border-[#EADEC8] overflow-hidden bg-[#FFFDF7]">
                        <HeritageImage
                          src={resolveHeritageImage(selectedDistrict.monumentImageKey)}
                          alt={`${selectedDistrict.monumentName} in ${selectedDistrict.name} District`}
                          containerClassName="aspect-[16/9] w-full"
                        />
                        <div className="px-4 py-3 bg-[#FBF6E8] border-t border-[#EADEC8] flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-serif text-base font-semibold text-[#292522] truncate">
                              {trSelected.monumentName}
                            </p>
                            <p className="text-xs font-medium text-[#941D2A] mt-0.5 truncate">
                              {selectedDistrict.monumentLocation}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user) {
                                navigate('/auth');
                                return;
                              }
                              await toggleFavoriteMonument({
                                monumentId: selectedDistrict.id,
                                monumentName: selectedDistrict.monumentName,
                                districtId: selectedDistrict.id,
                                districtName: selectedDistrict.name,
                                imageUrl: selectedDistrict.monumentImageKey,
                              });
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-md border transition-colors cursor-pointer shrink-0 ${
                              isFavMonument
                                ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                                : 'bg-[#FFFFFF] text-[#941D2A] border-[#EADEC8] hover:border-[#C92332]'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{isFavMonument ? t('map.savedFavorite') : t('map.saveFavorite')}</span>
                          </button>
                        </div>
                      </div>
                      <PhotoCredit imageKey={selectedDistrict.monumentImageKey} />
                    </div>

                  {/* Clarify 2021 Ballari/Vijayanagara shared boundary polygon */}
                  {(selectedDistrict.id === 'ballari' ||
                    selectedDistrict.id === 'vijayanagara') && (
                    <div className="p-3 bg-[#FBF6E8] border border-[#EADEC8] rounded-md text-xs text-[#77716B] space-y-2">
                      <p>{selectedDistrict.geoBoundaryNote}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectDistrict('ballari')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                            selectedDistrict.id === 'ballari'
                              ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                              : 'bg-[#FFFFFF] text-[#292522] border-[#EADEC8] hover:border-[#C92332]'
                          }`}
                        >
                          Ballari Fort
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectDistrict('vijayanagara')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                            selectedDistrict.id === 'vijayanagara'
                              ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                              : 'bg-[#FFFFFF] text-[#292522] border-[#EADEC8] hover:border-[#C92332]'
                          }`}
                        >
                          Vijayanagara (Hampi)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Short Historical Description & Cultural Significance */}
                  <div className="space-y-3">
                    <p className="text-sm text-[#292522] leading-relaxed">
                      {selectedDistrict.monumentDescription || selectedDistrict.description}
                    </p>

                    <div className="p-3.5 rounded-md bg-[#FFFDF7] border border-[#EADEC8]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#941D2A] mb-1">
                        {t('map.culturalSignificance')}
                      </p>
                      <p className="text-xs sm:text-sm text-[#77716B] leading-relaxed">
                        {selectedDistrict.culturalSignificance}
                      </p>
                    </div>
                  </div>

                  {/* Additional Heritage Photos Strip */}
                  {galleryList.length > 0 && (
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#77716B] mb-2">
                        <Camera className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
                        <span>Additional Heritage Photos</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {galleryList.map((imgKey) => (
                          <HeritageImage
                            key={imgKey}
                            src={resolveHeritageImage(imgKey)}
                            alt={`${selectedDistrict.name} heritage highlight`}
                            containerClassName="aspect-[4/3] rounded-md border border-[#EADEC8]"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Explore District Action */}
                  <div className="pt-2 border-t border-[#EADEC8] flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={`/district/${selectedDistrict.id}`}
                      className="hh-btn-interactive inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md"
                    >
                      <span>{t('map.exploreDistrict')}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>

                    <Link
                      to={`/culture?district=${encodeURIComponent(selectedDistrict.name)}`}
                      className="editorial-link text-xs font-semibold text-[#941D2A]"
                    >
                      {t('map.culturalArchive')} →
                    </Link>
                  </div>
                </motion.div>
              );
            })()
          ) : (
            <motion.div
              key="empty-district-panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: HERITAGE_EASE }}
              className="space-y-6 flex flex-col justify-between h-full"
            >
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
                  <MapPin className="w-4 h-4 text-[#C92332]" aria-hidden="true" />
                  <span>Interactive Monument Atlas</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                  {t('map.selectPromptTitle')}
                </h3>
                <p className="mt-3 text-sm text-[#77716B] leading-relaxed">
                  {t('map.selectPromptBody')}
                </p>

                {/* Preview Showcase Mini-Grid */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {featuredQuickDistricts.slice(0, 3).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDistrict(d.id)}
                      className="group text-left rounded-md overflow-hidden border border-[#EADEC8] hover:border-[#C92332] transition-colors cursor-pointer bg-[#FFFDF7]"
                    >
                      <HeritageImage
                        src={resolveHeritageImage(d.monumentImageKey)}
                        alt={d.monumentName}
                        zoomOnHover
                        containerClassName="aspect-[4/3] w-full"
                      />
                      <div className="px-2 py-1.5">
                        <p className="text-[11px] font-semibold text-[#292522] truncate group-hover:text-[#941D2A]">
                          {d.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADEC8]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#292522] mb-3">
                  Quick Jump · Iconic Monument Highlights
                </p>
                <div className="flex flex-wrap gap-2">
                  {featuredQuickDistricts.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDistrict(d.id)}
                      className="px-3 py-1.5 min-h-[34px] text-xs font-medium border border-[#EADEC8] bg-[#FBF6E8] hover:bg-[#F8C928] hover:border-[#C92332] hover:text-[#201C1B] text-[#292522] rounded-md transition-colors cursor-pointer"
                    >
                      {d.id === 'vijayanagara' ? 'Vijayanagara (Hampi)' : d.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADEC8] text-xs text-[#77716B] leading-relaxed">
                Boundary geometry:{' '}
                <strong className="text-[#292522]">geoBoundaries IND-ADM2 (2021)</strong> (ODbL 1.0)
                · Zoom-aware monument thumbnails anchor all 31 Karnataka districts without overlap.
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
