import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, ShieldCheck } from 'lucide-react';
import type {
  CulturalCategoryResource,
  CulturalRecord,
  KarnatakaDistrictResource,
} from '../../types/culture';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { PhotoCredit } from '../PhotoCredit';
import { RevealSection } from '../motion/MotionPrimitives';
import { SourceCitationList } from './SourceCitationList';
import { useI18n } from '../../i18n/I18nContext';

interface CulturalDetailViewProps {
  record: CulturalRecord;
  category?: CulturalCategoryResource;
  districtInfo?: KarnatakaDistrictResource;
}

export function CulturalDetailView({
  record,
  category,
  districtInfo,
}: CulturalDetailViewProps) {
  const { lang, t, translateRecord, translateCategory, translateRegion, translateDistrict } =
    useI18n();
  const imageSrc = resolveHeritageImage(record.imageKey);

  const districtId = record.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const tr = translateRecord(record);
  const catTitle = category ? translateCategory(category).title : record.categorySlug;
  const distTr = translateDistrict({
    id: districtId,
    name: record.district,
    monumentName: record.title,
  });

  return (
    <article className="bg-[#FFFDF7]">
      {/* Breadcrumb & Title Header */}
      <header className="border-b border-[#EADEC8] bg-[#FFFFFF] py-12 lg:py-16">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <Link
            to="/culture"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#941D2A] hover:text-[#C92332] mb-7"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Cultural Heritage Archive</span>
          </Link>

          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
            {catTitle} · {distTr.name}
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-4xl">
            {tr.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#77716B] tabular-nums">
            {record.recognitionOrEra} · {translateRegion(record.region)}
            {districtInfo ? ` (${districtInfo.division} Division)` : ''}
          </p>

          {lang !== 'en' && !tr.isTranslated && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#EADEC8] bg-[#FBF6E8] px-3.5 py-2 text-xs font-medium text-[#941D2A]">
              <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('culture.englishFallbackNote')}</span>
            </div>
          )}
        </div>
      </header>

      {/* Primary Visual Plate & Provenance Record */}
      <section className="py-12 lg:py-16 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-7">
              <HeritageImage
                src={imageSrc}
                alt={record.altText}
                priority
                containerClassName="aspect-[4/3] w-full rounded-xl border border-[#EADEC8] shadow-sm"
              />
              <p className="mt-3 font-serif italic text-xs text-[#77716B]">
                Archive Plate — {tr.title}, {distTr.name}, Karnataka
              </p>
              <PhotoCredit imageKey={record.imageKey} className="mt-1" />
            </div>

            <aside className="lg:col-span-5 rounded-xl border border-[#EADEC8] bg-[#FFFFFF] p-6 sm:p-7 shadow-xs">
              <h2 className="font-serif text-lg font-medium text-[#292522] pb-4 border-b border-[#EADEC8]">
                Cultural Record Metadata
              </h2>
              <dl className="divide-y divide-[#EADEC8] text-sm">
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">Category</dt>
                  <dd className="mt-1 font-medium text-[#292522]">{catTitle}</dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    District &amp; Division
                  </dt>
                  <dd className="mt-1 font-medium text-[#292522]">
                    <Link
                      to={`/district/${districtId}`}
                      className="text-[#C92332] hover:underline font-semibold"
                    >
                      {distTr.name}
                    </Link>
                    {districtInfo ? ` · ${districtInfo.division} Division` : ''}
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Cultural Region
                  </dt>
                  <dd className="mt-1 font-medium text-[#292522]">
                    {translateRegion(record.region)}
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Official Recognition / Period
                  </dt>
                  <dd className="mt-1 font-semibold text-[#941D2A] tabular-nums">
                    {record.recognitionOrEra}
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Source Verification
                  </dt>
                  <dd className="mt-1 text-[#292522] tabular-nums">
                    {record.sources.length}{' '}
                    {record.sources.length === 1
                      ? 'Institutional Reference Cited'
                      : 'Institutional References Cited'}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* Verified Narrative, Key Facts & Citations */}
      <RevealSection className="py-14 lg:py-20 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522] mb-5">
                  Documented Overview
                </h2>
                <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:text-[#C92332] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.88] first-letter:pt-1 text-base text-[#77716B] leading-[1.8]">
                  {tr.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#EADEC8]">
                <h3 className="font-serif text-xl font-medium text-[#292522] mb-4">
                  Verified Record Highlights
                </h3>
                <ul className="space-y-4">
                  {record.verifiedFacts.map((fact, idx) => (
                    <li
                      key={fact}
                      className="flex items-start gap-4 text-sm sm:text-base text-[#77716B] leading-relaxed"
                    >
                      <span className="font-serif text-sm font-semibold text-[#C92332] tabular-nums pt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[#EADEC8] bg-[#FBF6E8] p-7 space-y-4">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#941D2A]">
                  <ShieldCheck className="w-5 h-5 text-[#C92332] shrink-0" aria-hidden="true" />
                  <h3>Preservation &amp; Stewardship Note</h3>
                </div>
                <p className="text-sm text-[#292522] leading-relaxed">{record.preservationNote}</p>
              </div>
            </div>
          </div>

          <SourceCitationList sources={record.sources} />
        </div>
      </RevealSection>
    </article>
  );
}
