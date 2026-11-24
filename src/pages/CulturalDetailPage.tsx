import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCulturalData } from '../hooks/useCulturalData';
import { CulturalDetailView } from '../components/culture/CulturalDetailView';
import { CulturalRecordCard } from '../components/culture/CulturalRecordCard';
import { UnavailableNotice } from '../components/culture/UnavailableNotice';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

export function CulturalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { status, categories, districts, records, errorMessage, retry } = useCulturalData();
  const { recordRecentView } = useAuth();
  const { translateCategory } = useI18n();

  const record = records.find((r) => r.slug === slug);

  useEffect(() => {
    if (!record) return;
    const distId = record.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    recordRecentView({
      itemType: 'culture',
      itemId: record.id,
      itemTitle: record.title,
      districtId: distId,
      imageUrl: record.imageKey,
      routePath: `/culture/${record.slug}`,
    });
  }, [record, recordRecentView]);

  if (status === 'loading') {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8" aria-busy="true">
        <div className="max-w-[1240px] mx-auto space-y-6">
          <div className="h-12 w-2/3 bg-[#EADEC8] animate-pulse rounded-md" />
          <div className="h-96 bg-[#EADEC8] animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8">
        <UnavailableNotice
          title="Unable to Load Cultural Record"
          message={errorMessage ?? 'The external cultural records resource could not be loaded.'}
          onReset={retry}
          resetLabel="Retry Loading Record"
        />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8">
        <UnavailableNotice
          title="Cultural Record Not Found"
          message="The requested entry is not available in the verified Cultural Information System archive."
          detail="Return to the Cultural Heritage directory to browse documented records across Karnataka's 7 cultural categories."
        />
        <div className="mt-6 text-center">
          <Link
            to="/culture"
            className="inline-flex items-center justify-center px-5 py-2.5 min-h-[40px] text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md transition-colors"
          >
            Return to Cultural Heritage
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === record.categorySlug);
  const districtInfo = districts.find((d) => d.name === record.district);

  const categoryMap = new Map(categories.map((c) => [c.slug, translateCategory(c).title]));
  const related = records
    .filter(
      (r) =>
        r.slug !== record.slug &&
        (r.categorySlug === record.categorySlug || r.district === record.district),
    )
    .slice(0, 3);

  return (
    <>
      <CulturalDetailView
        record={record}
        category={category}
        districtInfo={districtInfo}
      />

      {related.length > 0 && (
        <section className="py-16 lg:py-20 bg-[#FFFFFF] border-t border-[#EADEC8]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between gap-4 pb-6 border-b border-[#EADEC8]">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                  Related Archive Records
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                  Connected Traditions &amp; Sites
                </h2>
              </div>
              <Link
                to="/culture"
                className="editorial-link text-sm font-semibold text-[#C92332] whitespace-nowrap shrink-0"
              >
                All Verified Records →
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => (
                <CulturalRecordCard
                  key={item.id}
                  record={item}
                  categoryTitle={categoryMap.get(item.categorySlug) ?? item.categorySlug}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
