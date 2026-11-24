import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { REGIONS, type KarnatakaRegion } from '../../data/heritageData';
import { useCulturalData } from '../../hooks/useCulturalData';
import { CulturalRecordCard } from '../culture/CulturalRecordCard';
import { UnavailableNotice } from '../culture/UnavailableNotice';
import { SectionHeader } from '../SectionHeader';

export function CulturalDiscovery() {
  const { status, categories, records } = useCulturalData();
  const [selectedRegion, setSelectedRegion] = useState<'All' | KarnatakaRegion>('All');

  const categoryTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.slug, c.title);
    }
    return map;
  }, [categories]);

  const filteredRecords = useMemo(() => {
    const list =
      selectedRegion === 'All'
        ? records
        : records.filter((item) => item.region === selectedRegion);
    return list.slice(0, 6);
  }, [records, selectedRegion]);

  return (
    <section
      aria-labelledby="discovery-heading"
      className="bg-[#FBF6E8] py-20 lg:py-28 border-b border-[#EADEC8]"
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <SectionHeader
          kicker="Verified Cultural Records"
          title="Cultural Discovery & Preservation"
          description="Filter source-verified cultural entries across Karnataka's four geographic zones, or explore all 31 districts inside the full Discovery archive."
          actionLabel="Open Full 31-District Archive"
          actionTo="/culture"
        />

        {/* Interactive Regional Filter Controls */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Filter cultural records by Karnataka region"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedRegion === 'All'}
              onClick={() => setSelectedRegion('All')}
              className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C92332] ${
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
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C92332] ${
                  selectedRegion === region
                    ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                    : 'bg-[#FFFFFF] text-[#77716B] border-[#EADEC8] hover:border-[#C92332] hover:text-[#292522]'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <Link
            to="/culture"
            className="text-xs font-semibold text-[#941D2A] hover:underline whitespace-nowrap shrink-0"
          >
            Browse by 31 Districts &amp; 7 Categories →
          </Link>
        </div>

        {/* Regional Cultural Record Cards */}
        {status === 'ready' && filteredRecords.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecords.map((item) => (
              <CulturalRecordCard
                key={item.id}
                record={item}
                categoryTitle={categoryTitleMap.get(item.categorySlug) ?? item.categorySlug}
              />
            ))}
          </div>
        )}

        {status === 'ready' && filteredRecords.length === 0 && (
          <div className="mt-8">
            <UnavailableNotice
              message={`No verified records are currently listed under ${selectedRegion}.`}
              onReset={() => setSelectedRegion('All')}
              resetLabel="Show All Regions"
            />
          </div>
        )}
      </div>
    </section>
  );
}
