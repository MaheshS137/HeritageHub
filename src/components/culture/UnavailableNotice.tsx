import { Info } from 'lucide-react';

interface UnavailableNoticeProps {
  title?: string;
  message: string;
  detail?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function UnavailableNotice({
  title = 'Verified Information Currently Unavailable',
  message,
  detail,
  onReset,
  resetLabel = 'View All Verified Records',
}: UnavailableNoticeProps) {
  return (
    <div
      role="status"
      className="border border-[#EADEC8] bg-[#FBF6E8] rounded-xl p-8 sm:p-12 max-w-2xl mx-auto text-center"
    >
      <div className="w-11 h-11 rounded-full bg-[#C92332] text-[#F8C928] flex items-center justify-center mx-auto mb-4">
        <Info className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
        Archive Status Notice
      </p>
      <h2 className="font-serif text-2xl font-medium text-[#292522]">{title}</h2>
      <p className="mt-3 text-sm sm:text-base text-[#77716B] leading-relaxed">{message}</p>
      {detail && (
        <p className="mt-2 text-xs text-[#77716B] leading-relaxed max-w-[52ch] mx-auto">
          {detail}
        </p>
      )}
      {onReset && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onReset}
            className="hh-btn-interactive px-5 py-2.5 min-h-[40px] text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md transition-colors cursor-pointer"
          >
            {resetLabel}
          </button>
        </div>
      )}
    </div>
  );
}
