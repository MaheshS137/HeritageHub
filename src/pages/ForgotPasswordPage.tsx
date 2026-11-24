import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { PasswordField } from '../components/auth/PasswordField';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [notice, setNotice] = useState('');
  const [answer, setAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFetchQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/recovery/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to process recovery request.');
        return;
      }
      setQuestion(data.question);
      setNotice(data.notice || '');
      setStep(2);
    } catch {
      setErrorMsg('Network error while connecting to recovery service.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Verification failed.');
        return;
      }
      setResetToken(data.resetToken);
      setStep(3);
    } catch {
      setErrorMsg('Network error while verifying security answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not reset password.');
        return;
      }
      setSuccessMsg(data.message || 'Password updated successfully.');
      setStep(4);
    } catch {
      setErrorMsg('Network error while saving new password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] min-h-[78vh] py-14">
      <div className="max-w-lg mx-auto px-5 sm:px-8">
        <div className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 sm:p-8 shadow-sm hh-hero-enter">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#FBF6E8] border border-[#EADEC8] text-[#941D2A]">
              <KeyRound className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#941D2A]">
                {t('recovery.kicker', 'Account Security Recovery')}
              </p>
              <h1 className="font-serif text-2xl text-[#292522]">
                {t('recovery.title', 'Reset Password via Security Question')}
              </h1>
            </div>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2 text-xs text-[#77716B] pb-5 mb-6 border-b border-[#EADEC8] tabular-nums">
            <span className={step === 1 ? 'font-semibold text-[#C92332]' : ''}>1. Email</span>
            <span aria-hidden="true">·</span>
            <span className={step === 2 ? 'font-semibold text-[#C92332]' : ''}>2. Security Question</span>
            <span aria-hidden="true">·</span>
            <span className={step >= 3 ? 'font-semibold text-[#C92332]' : ''}>3. New Password</span>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-[#C92332]/10 border border-[#C92332]/40 rounded-md flex items-start gap-2.5 text-xs sm:text-sm text-[#941D2A]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleFetchQuestion} className="space-y-4">
              <p className="text-sm text-[#77716B]">
                {t('recovery.step1Desc', 'Enter your registered email address to retrieve your security question.')}
              </p>
              <div>
                <label htmlFor="rec-email" className="block text-xs font-semibold text-[#292522] mb-1.5">
                  {t('auth.email', 'Email Address')}
                </label>
                <input
                  id="rec-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{t('recovery.continueBtn', 'Continue')}</span>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAnswer} className="space-y-4">
              <p className="text-xs text-[#77716B]">{notice}</p>
              <div className="p-4 bg-[#FBF6E8] border border-[#EADEC8] rounded-md">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#941D2A] mb-1">
                  {t('auth.securityQuestion', 'Security Question')}
                </p>
                <p className="font-serif text-base text-[#292522]">{question}</p>
              </div>
              <div>
                <label htmlFor="rec-answer" className="block text-xs font-semibold text-[#292522] mb-1.5">
                  {t('auth.securityAnswer', 'Security Answer')}
                </label>
                <input
                  id="rec-answer"
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md focus:outline-none focus:border-[#C92332]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold border border-[#EADEC8] rounded-md text-[#77716B] hover:text-[#292522] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('recovery.verifyBtn', 'Verify Security Answer')}</span>
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-[#77716B]">
                {t('recovery.step3Desc', 'Create a strong new password. All existing active sessions will be invalidated.')}
              </p>
              <PasswordField
                id="rec-new-pw"
                label={t('recovery.newPassword', 'New Password')}
                value={newPassword}
                onChange={setNewPassword}
                showStrength
                autoComplete="new-password"
              />
              <PasswordField
                id="rec-confirm-pw"
                label={t('auth.confirmPassword', 'Confirm Password')}
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{t('recovery.resetBtn', 'Save New Password')}</span>
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h2 className="font-serif text-xl text-[#292522]">
                {t('recovery.successTitle', 'Password Updated Securely')}
              </h2>
              <p className="text-sm text-[#77716B]">{successMsg}</p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold bg-[#C92332] hover:bg-[#941D2A] text-[#FFFFFF] rounded-md"
              >
                {t('recovery.backToLogin', 'Back to Sign In')}
              </Link>
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 pt-4 border-t border-[#EADEC8] text-center">
              <Link to="/auth" className="text-xs font-semibold text-[#941D2A] hover:underline">
                {t('recovery.backToLogin', 'Back to Sign In')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
