import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export function evaluatePasswordStrength(password: string): {
  score: number;
  checks: { length: boolean; upper: boolean; lower: boolean; number: boolean; special: boolean };
} {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  showStrength = false,
  required = true,
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();
  const strength = evaluatePasswordStrength(value);

  const strengthLabel =
    strength.score <= 2
      ? t('auth.strengthWeak', 'Weak')
      : strength.score === 3
        ? t('auth.strengthFair', 'Fair')
        : strength.score === 4
          ? t('auth.strengthGood', 'Good')
          : t('auth.strengthStrong', 'Strong');

  const barColor =
    strength.score <= 2
      ? 'bg-[#C92332]'
      : strength.score === 3
        ? 'bg-[#D97706]'
        : strength.score === 4
          ? 'bg-[#F8C928]'
          : 'bg-emerald-700';

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#292522] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full px-3.5 py-2.5 pr-11 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#77716B] hover:text-[#941D2A] cursor-pointer"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#77716B]">Password strength</span>
            <span className="font-semibold text-[#292522]">{strengthLabel}</span>
          </div>
          <div className="h-1.5 w-full bg-[#EADEC8] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${barColor}`}
              style={{ width: `${Math.max(15, (strength.score / 5) * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#77716B]">
            <span className={strength.checks.length ? 'text-emerald-800 font-medium' : ''}>8+ chars</span>
            <span className={strength.checks.upper ? 'text-emerald-800 font-medium' : ''}>Uppercase</span>
            <span className={strength.checks.lower ? 'text-emerald-800 font-medium' : ''}>Lowercase</span>
            <span className={strength.checks.number ? 'text-emerald-800 font-medium' : ''}>Number</span>
            <span className={strength.checks.special ? 'text-emerald-800 font-medium' : ''}>Symbol</span>
          </div>
        </div>
      )}
    </div>
  );
}
