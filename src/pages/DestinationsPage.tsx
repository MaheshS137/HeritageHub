import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import {
  DESTINATIONS,
  REGIONS,
  CULTURAL_CATEGORIES,
  type KarnatakaRegion,
} from '../data/heritageData';
import { HeritageImage } from '../components/HeritageImage';

export function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRegion = (searchParams.get('region') as KarnatakaRegion | null) || 'All';
  const initialCategory = searchParams.get('category') || 'All';

  const [selectedRegion, setSelectedRegion] = useState<'All' | KarnatakaRegion>(
    REGIONS.includes(initialRegion as KarnatakaRegion)
      ? (initialRegion as KarnatakaRegion)
      : 'All',
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const regionParam = searchParams.get('region');
    if (regionParam && REGIONS.includes(regionParam as KarnatakaRegion)) {
      setSelectedRegion(regionParam as KarnatakaRegion);
    } else if (!regionParam) {
      setSelectedRegion('All');
    }
    const catParam = searchParams.get('category');
    setSelectedCategory(catParam || 'All');
  }, [searchParams]);

  const handleRegionChange = (region: 'All' | KarnatakaRegion) => {
    setSelectedRegion(region);
    const next = new URLSearchParams(searchParams);
    if (region === 'All') {
      next.delete('region');
    } else {
      next.set('region', region);
    }
    setSearchParams(next, { replace: true });
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const next = new URLSearchParams(searchParams);
    if (categorySlug === 'All') {
      next.delete('category');
    } else {
      next.set('category', categorySlug);
    }
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSelectedRegion('All');
    setSelectedCategory('All');
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  const filteredDestinations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return DESTINATIONS.filter((dest) => {
      const matchesRegion = selectedRegion === 'All' || dest.region === selectedRegion;
      const matchesCategory =
        selectedCategory === 'All' || dest.categorySlug === selectedCategory;
      const matchesQuery =
        !normalized ||
        dest.name.toLowerCase().includes(normalized) ||
        dest.district.toLowerCase().includes(normalized) ||
        dest.dynasty.toLowerCase().includes(normalized) ||
        dest.summary.toLowerCase().includes(normalized);
      return matchesRegion && matchesCategory && matchesQuery;
    });
  }, [selectedRegion, selectedCategory, query]);

  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      {/* Editorial Catalog Header */}
      <section className="border-b border-[#EADEC8] py-16 lg:py-20 bg-[#FFFFFF]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
            <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
            <span>Karnataka Heritage Directory</span>
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-3xl">
            Architectural &amp; Living Heritage Destinations
          </h1>
          <p className="mt-4 text-base text-[#77716B] leading-relaxed max-w-[64ch]">
            Browse curated architectural ensembles, cave sanctuaries, royal courts, and living
            artisan corridors across Karnataka. Select any entry to inspect its full monograph and
            conservation guidance.
          </p>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="border-b border-[#EADEC8] bg-[#FBF6E8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Regional Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter destinations by region"
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedRegion === 'All'}
                onClick={() => handleRegionChange('All')}
                className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedRegion === 'All'
                    ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                    : 'bg-[#FFFFFF] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                }`}
              >
                All Regions
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  role="tab"
                  aria-selected={selectedRegion === region}
                  onClick={() => handleRegionChange(region)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedRegion === region
                      ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                      : 'bg-[#FFFFFF] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Search & Category Select */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#941D2A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search site, district, dynasty..."
                  aria-label="Search heritage destinations"
                  className="w-full sm:w-64 pl-9 pr-8 py-2 min-h-[40px] text-sm bg-[#FFFFFF] border border-[#EADEC8] focus:border-[#C92332] focus:outline-none rounded-md text-[#292522] placeholder:text-[#77716B]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#292522]"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                aria-label="Filter by cultural category"
                className="px-3.5 py-2 min-h-[40px] text-sm bg-[#FFFFFF] border border-[#EADEC8] focus:border-[#C92332] focus:outline-none rounded-md text-[#292522]"
              >
                <option value="All">All Categories</option>
                {CULTURAL_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#77716B]">
            <span className="tabular-nums">
              Showing <strong className="text-[#292522]">{filteredDestinations.length}</strong> of{' '}
              {DESTINATIONS.length} documented destinations
            </span>
            {(selectedRegion !== 'All' || selectedCategory !== 'All' || query) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#C92332] hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          {filteredDestinations.length === 0 ? (
            <div className="border border-[#EADEC8] bg-[#FBF6E8] rounded-xl p-12 text-center max-w-xl mx-auto">
              <h2 className="font-serif text-2xl font-medium text-[#292522]">
                No matching destinations found
              </h2>
              <p className="mt-3 text-sm text-[#77716B]">
                Try clearing your search keyword or switching to all Karnataka regions to inspect
                every cataloged site.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 px-5 py-2.5 min-h-[40px] text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md transition-colors cursor-pointer"
              >
                Show All Destinations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((dest) => (
                <Link
                  key={dest.slug}
                  to={`/destinations/${dest.slug}`}
                  className="group flex flex-col bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_26px_rgba(148,29,42,0.1)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
                >
                  <HeritageImage
                    src={dest.image}
                    alt={dest.altText}
                    zoomOnHover
                    containerClassName="aspect-[4/3] w-full"
                  />

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div>
                      <p className="text-xs text-[#77716B] tabular-nums">
                        {dest.region} · {dest.district}
                      </p>
                      <h2 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-snug">
                        {dest.name}
                      </h2>
                      <p className="mt-1 text-xs font-semibold text-[#941D2A]">
                        {dest.dynasty} · {dest.era}
                      </p>
                      <p className="mt-3 text-sm text-[#77716B] leading-relaxed">{dest.summary}</p>
                    </div>

                    <div className="pt-4 border-t border-[#EADEC8] flex items-center justify-between text-xs font-semibold text-[#C92332]">
                      <span className="truncate pr-3 text-[#77716B] font-normal">
                        {dest.unescoStatus}
                      </span>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                        <span>Read Monograph</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
