import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { CulturalRecord } from '../../types/culture';
import { resolveHeritageImage } from '../../data/imageAssets';
import { HeritageImage } from '../HeritageImage';
import { useI18n } from '../../i18n/I18nContext';

interface CulturalRecordCardProps {
  record: CulturalRecord;
  categoryTitle: string;
}

export function CulturalRecordCard({ record, categoryTitle }: CulturalRecordCardProps) {
  const { lang, t, translateRecord, translateDistrict } = useI18n();
  const imageSrc = resolveHeritageImage(record.imageKey);
  const tr = translateRecord(record);
  const distSlug = record.district.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const distTr = translateDistrict({
    id: distSlug,
    name: record.district,
    monumentName: record.title,
  });

  return (
    <Link
      to={`/culture/${record.slug}`}
      className="group flex flex-col bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(32,28,27,0.04)] hover:shadow-[0_12px_26px_rgba(148,29,42,0.1)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
    >
      <HeritageImage
        src={imageSrc}
        alt={record.altText}
        zoomOnHover
        containerClassName="aspect-[4/3] w-full"
      />

      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div>
          <p className="text-xs text-[#77716B]">
            {distTr.name} · {categoryTitle}
          </p>

          <h3 className="mt-2 font-serif text-xl font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors leading-snug">
            {tr.title}
          </h3>

          <p className="mt-1 text-xs font-semibold text-[#941D2A] tabular-nums">
            {record.recognitionOrEra}
          </p>

          <p className="mt-3 text-sm text-[#77716B] leading-relaxed">{tr.summary}</p>

          {lang !== 'en' && !tr.isTranslated && (
            <p className="mt-2 text-[11px] font-medium text-[#941D2A]">
              {t('culture.englishFallbackNote')}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-[#EADEC8] flex items-center justify-between gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#77716B] tabular-nums">
            <BookOpen className="w-3.5 h-3.5 text-[#C92332] shrink-0" aria-hidden="true" />
            <span>
              {record.sources.length}{' '}
              {record.sources.length === 1 ? 'Verified Source' : 'Verified Sources'}
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 font-semibold text-[#C92332] whitespace-nowrap shrink-0">
            <span>Inspect Record</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
