import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ExternalLink,
  Globe,
  Landmark,
  MapPin,
  PenTool,
} from 'lucide-react';
import { useDistrictArchive } from '../hooks/useDistrictArchive';
import { resolveHeritageImage } from '../data/imageAssets';
import { HeritageImage } from '../components/HeritageImage';
import { CulturalRecordCard } from '../components/culture/CulturalRecordCard';
import { UnavailableNotice } from '../components/culture/UnavailableNotice';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

interface DbMonument {
  id: string;
  name: string;
  location: string;
  era_or_dynasty: string;
  description: string;
  cultural_significance: string;
  image_url: string;
}

interface PublishedArticle {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category_title: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
}

function DistrictListCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="border border-[#EADEC8] bg-[#FFFFFF] rounded-xl p-6 shadow-[0_4px_14px_rgba(32,28,27,0.03)]">
      <h3 className="font-serif text-xl font-medium text-[#292522] pb-3 border-b border-[#EADEC8]">
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2.5 text-sm text-[#292522]">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-[#C92332] font-serif mt-0.5" aria-hidden="true">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#77716B] italic">{emptyText}</p>
      )}
    </div>
  );
}

export function DistrictDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { status, districts, categories, records, errorMessage, retry } = useDistrictArchive();
  const {
    user,
    favoriteDistrictIds,
    favoriteMonumentIds,
    toggleFavoriteDistrict,
    toggleFavoriteMonument,
    recordRecentView,
  } = useAuth();
  const { lang, t, translateDistrict, translateRegion, translateCategory } = useI18n();

  const [extraMonuments, setExtraMonuments] = useState<DbMonument[]>([]);
  const [districtArticles, setDistrictArticles] = useState<PublishedArticle[]>([]);

  const district = districts.find((d) => d.id === id);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([
      fetch(`/api/heritage/monuments?districtId=${encodeURIComponent(id)}`).then((r) =>
        r.ok ? r.json() : { monuments: [] },
      ),
      fetch(`/api/heritage/articles?district=${encodeURIComponent(id)}`).then((r) =>
        r.ok ? r.json() : { articles: [] },
      ),
    ])
      .then(([mData, aData]) => {
        if (!active) return;
        setExtraMonuments(mData.monuments || []);
        setDistrictArticles(aData.articles || []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!district) return;
    recordRecentView({
      itemType: 'district',
      itemId: district.id,
      itemTitle: `${district.name} — ${district.monumentName}`,
      districtId: district.id,
      imageUrl: district.monumentImageKey,
      routePath: `/district/${district.id}`,
    });
  }, [district, recordRecentView]);

  if (status === 'loading') {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8" aria-busy="true">
        <div className="max-w-[1240px] mx-auto space-y-6">
          <div className="h-12 w-1/2 bg-[#EADEC8] animate-pulse rounded-md" />
          <div className="h-80 bg-[#EADEC8] animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8">
        <UnavailableNotice
          title="Unable to Load District Profile"
          message={errorMessage ?? 'District archive data failed to load.'}
          onReset={retry}
          resetLabel="Retry Loading District"
        />
      </div>
    );
  }

  if (!district) {
    return (
      <div className="bg-[#FFFDF7] py-20 px-5 sm:px-8">
        <UnavailableNotice
          title="District Not Found"
          message="The requested Karnataka district identifier was not recognized."
          detail="Use the Interactive Karnataka Map to select any of the 31 official districts."
        />
        <div className="mt-6 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Open Explore Karnataka Map</span>
          </Link>
        </div>
      </div>
    );
  }

  const trDistrict = translateDistrict(district);
  const districtRecords = records.filter(
    (r) => r.district.toLowerCase() === district.name.toLowerCase(),
  );
  const categoryMap = new Map(categories.map((c) => [c.slug, translateCategory(c).title]));
  const relatedDistricts = districts
    .filter((d) => d.id !== district.id && (d.region === district.region || d.documented))
    .slice(0, 4);

  const galleryKeys = Array.from(
    new Set([
      ...(district.monumentImageKey ? [district.monumentImageKey] : []),
      ...(district.galleryImages ?? []),
      ...(district.images ?? []),
    ]),
  );

  const isDistrictSaved = favoriteDistrictIds.has(district.id);
  const isMonumentSaved = favoriteMonumentIds.has(district.id);

  const additionalDbMonuments = extraMonuments.filter(
    (m) => m.name.toLowerCase() !== district.monumentName.toLowerCase(),
  );

  return (
    <article className="bg-[#FFFDF7] min-h-screen">
      {/* Header */}
      <header className="border-b border-[#EADEC8] bg-[#FFFFFF] py-12 lg:py-16">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#941D2A] hover:text-[#C92332]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Interactive Karnataka Map</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!user) {
                    navigate('/auth');
                    return;
                  }
                  await toggleFavoriteDistrict({
                    districtId: district.id,
                    districtName: district.name,
                    region: district.region,
                    imageUrl: district.monumentImageKey,
                  });
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  isDistrictSaved
                    ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                    : 'bg-[#FFFDF7] text-[#941D2A] border-[#EADEC8] hover:border-[#C92332]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isDistrictSaved ? t('map.savedFavorite') : 'Save District'}</span>
              </button>

              <Link
                to={`/explore?district=${encodeURIComponent(district.id)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#941D2A] hover:text-[#C92332]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
                <span>Locate Monument on Map</span>
              </Link>
            </div>
          </div>

          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
            <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
            <span>
              {translateRegion(district.region)} · {district.division} Administrative Division
            </span>
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-medium text-[#292522] leading-[1.1]">
            {trDistrict.name}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#77716B] leading-relaxed max-w-[66ch]">
            {district.description}
          </p>

          {lang !== 'en' && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#EADEC8] bg-[#FBF6E8] px-3.5 py-2 text-xs font-medium text-[#941D2A]">
              <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('culture.englishFallbackNote')}</span>
            </div>
          )}

          {district.geoBoundaryNote && (
            <p className="mt-4 text-xs text-[#77716B] border border-[#EADEC8] bg-[#FBF6E8] rounded-md px-4 py-2.5 max-w-2xl">
              <strong className="text-[#292522]">Boundary Note:</strong> {district.geoBoundaryNote}
            </p>
          )}
        </div>
      </header>

      {/* Flagship Monument Showcase & Heritage Gallery (Available for All 31 Districts) */}
      <section className="py-12 lg:py-16 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <HeritageImage
                src={resolveHeritageImage(district.monumentImageKey)}
                alt={`${district.monumentName} in ${district.name} District`}
                priority
                containerClassName="aspect-[16/10] w-full rounded-xl border border-[#EADEC8] shadow-sm"
              />
              <p className="mt-3 font-serif italic text-xs text-[#77716B]">
                {trDistrict.monumentName} · {district.monumentLocation} (
                {district.monumentLat.toFixed(4)}° N, {district.monumentLng.toFixed(4)}° E)
              </p>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="border border-[#EADEC8] bg-[#FFFFFF] rounded-xl p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
                    <Landmark className="w-4 h-4 text-[#C92332]" aria-hidden="true" />
                    <span>Signature Monument</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) {
                        navigate('/auth');
                        return;
                      }
                      await toggleFavoriteMonument({
                        monumentId: district.id,
                        monumentName: district.monumentName,
                        districtId: district.id,
                        districtName: district.name,
                        imageUrl: district.monumentImageKey,
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                      isMonumentSaved
                        ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                        : 'bg-[#FFFDF7] text-[#941D2A] border-[#EADEC8] hover:border-[#C92332]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isMonumentSaved ? t('map.savedFavorite') : t('map.saveFavorite')}</span>
                  </button>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                  {trDistrict.monumentName}
                </h2>
                <p className="text-sm text-[#292522] leading-relaxed">
                  {district.monumentDescription}
                </p>

                <div className="p-4 rounded-lg bg-[#FBF6E8] border border-[#EADEC8]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#941D2A] mb-1">
                    {t('map.culturalSignificance')}
                  </p>
                  <p className="text-sm text-[#77716B] leading-relaxed">
                    {district.culturalSignificance}
                  </p>
                </div>

                {district.monumentAttribution && (
                  <p className="text-xs text-[#77716B]">
                    Documentation:{' '}
                    <strong className="font-medium text-[#292522]">
                      {district.monumentAttribution}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Admin-Cataloged Monuments */}
          {additionalDbMonuments.length > 0 && (
            <div className="pt-8 border-t border-[#EADEC8]">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A] mb-2">
                Cataloged Landmarks
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#292522] mb-6">
                Additional Monuments in {district.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {additionalDbMonuments.map((m) => {
                  const isSavedExtra = favoriteMonumentIds.has(m.id);
                  return (
                    <div
                      key={m.id}
                      className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl overflow-hidden flex flex-col justify-between"
                    >
                      <HeritageImage
                        src={resolveHeritageImage(m.image_url)}
                        alt={m.name}
                        containerClassName="aspect-[4/3] w-full"
                      />
                      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-[#941D2A]">
                            {m.era_or_dynasty || district.name}
                          </p>
                          <h3 className="mt-1 font-serif text-lg font-medium text-[#292522]">
                            {m.name}
                          </h3>
                          {m.location && (
                            <p className="text-xs text-[#77716B] mt-0.5">{m.location}</p>
                          )}
                          <p className="mt-2 text-sm text-[#77716B] leading-relaxed">
                            {m.description}
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
                              monumentId: m.id,
                              monumentName: m.name,
                              districtId: district.id,
                              districtName: district.name,
                              imageUrl: m.image_url,
                            });
                          }}
                          className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                            isSavedExtra
                              ? 'bg-[#C92332] text-[#FFFFFF] border-[#C92332]'
                              : 'bg-[#FFFDF7] text-[#941D2A] border-[#EADEC8] hover:border-[#C92332]'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{isSavedExtra ? t('map.savedFavorite') : t('map.saveFavorite')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historical Overview & Photo Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-8 border-t border-[#EADEC8]">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
                Historical Background &amp; Context
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                Chronicle &amp; Regional Heritage
              </h2>
              <p className="text-base text-[#77716B] leading-[1.8]">
                {district.history || 'Historical overview currently awaiting expanded citations.'}
              </p>
            </div>

            <div className="lg:col-span-6">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#941D2A] mb-3">
                Heritage Photo Gallery
              </p>
              <div
                className={`grid gap-4 ${
                  galleryKeys.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {galleryKeys.map((imgKey, idx) => (
                  <HeritageImage
                    key={`${imgKey}-${idx}`}
                    src={resolveHeritageImage(imgKey)}
                    alt={`${district.name} District cultural heritage photograph ${idx + 1}`}
                    zoomOnHover
                    containerClassName="aspect-[4/3] w-full rounded-xl border border-[#EADEC8]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cultural Pillars */}
          {district.documented ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <DistrictListCard
                title="Major Festivals"
                items={district.festivals}
                emptyText="No verified festival records added for this district yet."
              />
              <DistrictListCard
                title="Traditional Arts & Folk Forms"
                items={district.arts}
                emptyText="No verified traditional arts records added for this district yet."
              />
              <DistrictListCard
                title="Local Cuisine"
                items={district.cuisine}
                emptyText="No verified culinary records added for this district yet."
              />
              <DistrictListCard
                title="Customs & Traditions"
                items={district.traditions}
                emptyText="No verified custom records added for this district yet."
              />
              <DistrictListCard
                title="Historical Places & Monuments"
                items={district.heritageSites}
                emptyText="No verified monument records added for this district yet."
              />

              {/* Source References Card */}
              <div className="border border-[#EADEC8] bg-[#FFFFFF] rounded-xl p-6 shadow-[0_4px_14px_rgba(32,28,27,0.03)]">
                <h3 className="font-serif text-xl font-medium text-[#292522] pb-3 border-b border-[#EADEC8]">
                  Source References
                </h3>
                {district.sources.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm">
                    {district.sources.map((src) => (
                      <li key={src.title} className="space-y-0.5">
                        <p className="font-medium text-[#292522]">{src.title}</p>
                        <p className="text-xs text-[#77716B]">{src.organization}</p>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#C92332] hover:underline"
                        >
                          <span>View Primary Source</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-[#77716B] italic">
                    Citations awaiting verification.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DistrictListCard
                  title="Historical Places & Monuments"
                  items={district.heritageSites}
                  emptyText="No verified monument records added yet."
                />
                <div className="border border-[#EADEC8] bg-[#FFFFFF] rounded-xl p-6">
                  <h3 className="font-serif text-xl font-medium text-[#292522] pb-3 border-b border-[#EADEC8]">
                    Source References
                  </h3>
                  {district.sources.length > 0 ? (
                    <ul className="mt-4 space-y-3 text-sm">
                      {district.sources.map((src) => (
                        <li key={src.title} className="space-y-0.5">
                          <p className="font-medium text-[#292522]">{src.title}</p>
                          <p className="text-xs text-[#77716B]">{src.organization}</p>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#C92332] hover:underline"
                          >
                            <span>View Primary Source</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <UnavailableNotice
                title={`Expanded Festival, Arts & Culinary Monographs Pending for ${district.name}`}
                message={`While ${district.monumentName} and key historical monuments are cataloged above, full festival, craft, and culinary dossiers for ${district.name} District are currently under archival verification.`}
                detail="To uphold historical integrity, HeritageHub publishes only records backed by verified institutional sources."
              />
            </div>
          )}
        </div>
      </section>

      {/* Published Journalist Articles for This District */}
      {districtArticles.length > 0 && (
        <section className="py-14 lg:py-16 border-b border-[#EADEC8] bg-[#FBF6E8]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
              Community Dispatch
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522] mb-8">
              {t('culture.communityArticlesTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {districtArticles.map((art) => (
                <Link
                  key={art.id}
                  to={`/article/${art.slug}`}
                  className="group bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  {art.cover_image_url && (
                    <HeritageImage
                      src={resolveHeritageImage(art.cover_image_url)}
                      alt={art.title}
                      zoomOnHover
                      containerClassName="aspect-[16/10] w-full"
                    />
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#941D2A]">{art.category_title}</p>
                      <h3 className="mt-1.5 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A]">
                        {art.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#77716B] line-clamp-3">
                        {art.short_description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#EADEC8] flex items-center justify-between text-xs text-[#77716B]">
                      <span className="inline-flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
                        {art.author_name}
                      </span>
                      <span className="font-semibold text-[#C92332]">Read Feature →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verified Cultural Records for This District */}
      {districtRecords.length > 0 && (
        <section className="py-14 lg:py-16 border-b border-[#EADEC8] bg-[#FFFFFF]">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between gap-4 pb-6 border-b border-[#EADEC8]">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                  Detailed Citations
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                  Verified Cultural Records in {trDistrict.name}
                </h2>
              </div>
              <Link
                to={`/culture?district=${encodeURIComponent(district.name)}`}
                className="editorial-link text-sm font-semibold text-[#C92332] whitespace-nowrap shrink-0"
              >
                Filter in Cultural Archive →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {districtRecords.map((rec) => (
                <CulturalRecordCard
                  key={rec.id}
                  record={rec}
                  categoryTitle={categoryMap.get(rec.categorySlug) ?? rec.categorySlug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Districts */}
      <section className="py-14 lg:py-16 bg-[#FBF6E8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4 pb-6 border-b border-[#EADEC8]">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                Continue Exploring Karnataka
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#292522]">
                Related &amp; Regional Districts
              </h2>
            </div>
            <Link
              to="/explore"
              className="editorial-link text-sm font-semibold text-[#C92332] whitespace-nowrap shrink-0"
            >
              View All 31 Districts →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedDistricts.map((rel) => {
              const trRel = translateDistrict(rel);
              return (
                <Link
                  key={rel.id}
                  to={`/district/${rel.id}`}
                  className="group p-5 bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <p className="text-xs text-[#77716B]">{translateRegion(rel.region)}</p>
                    <h3 className="mt-1 font-serif text-lg font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                      {trRel.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#941D2A] truncate">
                      {trRel.monumentName}
                    </p>
                    <p className="mt-2 text-xs text-[#77716B] line-clamp-2">{rel.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C92332]">
                    <span>{t('map.exploreDistrict')}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </article>
  );
}
