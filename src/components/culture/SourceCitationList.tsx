import { ExternalLink } from 'lucide-react';
import type { CulturalSourceReference } from '../../types/culture';

interface SourceCitationListProps {
  sources: CulturalSourceReference[];
}

export function SourceCitationList({ sources }: SourceCitationListProps) {
  if (sources.length === 0) {
    return (
      <div className="border border-[#EADEC8] bg-[#FBF6E8] rounded-xl p-6 text-sm text-[#77716B]">
        Source citation metadata for this entry is currently awaiting archival verification.
      </div>
    );
  }

  return (
    <div className="border border-[#EADEC8] bg-[#FBF6E8] rounded-xl p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
        Primary Attribution
      </p>
      <h2 className="font-serif text-2xl font-medium text-[#292522] mb-6">
        Source References &amp; Institutional Citations
      </h2>

      <ol className="divide-y divide-[#EADEC8]">
        {sources.map((source, idx) => (
          <li
            key={`${source.referenceId}-${source.title}`}
            className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <span className="font-serif text-sm font-semibold text-[#C92332] tabular-nums pt-0.5 shrink-0">
                [{String(idx + 1).padStart(2, '0')}]
              </span>
              <div>
                <p className="text-sm font-medium text-[#292522]">{source.title}</p>
                <p className="mt-0.5 text-xs text-[#77716B]">
                  {source.organization} · Ref:{' '}
                  <span className="text-[#292522] font-medium">{source.referenceId}</span>
                </p>
              </div>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C92332] hover:text-[#941D2A] underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              <span>Consult Source</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
