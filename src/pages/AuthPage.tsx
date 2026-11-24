import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Feather, Loader2, ShieldCheck, User } from 'lucide-react';
import { useAuth, type AccountRole } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { PasswordField } from '../components/auth/PasswordField';
import { getDashboardPathForRole } from '../components/auth/ProtectedRoute';

const PRESET_QUESTIONS = [
  'What was the name of your first school?',
  'What is the name of your hometown?',
  'What was your childhood nickname?',
  'What is the name of your favorite Karnataka monument or town?',
  'Custom security question',
];

export function AuthPage() {
  const { user, needsInitialAdmin, setAuthenticatedUser } = useAuth();
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRoleParam = (searchParams.get('role') || 'USER').toUpperCase();
  const initialRole: AccountRole =
    initialRoleParam === 'ADMIN' || initialRoleParam === 'JOURNALIST' ? initialRoleParam : 'USER';

  const [selectedRole, setSelectedRole] = useState<AccountRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login',
  );
  const [setupAdminOpen, setSetupAdminOpen] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bioIntro, setBioIntro] = useState('');
  const [questionSelect, setQuestionSelect] = useState(PRESET_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate(getDashboardPathForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleSelectRole = (role: AccountRole) => {
    setSelectedRole(role);
    setSetupAdminOpen(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === 'ADMIN') {
      setMode('login');
    }
  };

  const resolvedQuestion =
    questionSelect === 'Custom security question' ? customQuestion.trim() : questionSelect;

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to sign in.');
        return;
      }
      setAuthenticatedUser(data.user);
      navigate(getDashboardPathForRole(data.user.role), { replace: true });
    } catch {
      setErrorMsg('Network error while connecting to authentication server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Password and confirm password do not match.');
      setSubmitting(false);
      return;
    }

    const endpoint = setupAdminOpen
      ? '/api/auth/setup-admin'
      : selectedRole === 'JOURNALIST'
        ? '/api/auth/register/journalist'
        : '/api/auth/register/user';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          bioIntro,
          securityQuestion: resolvedQuestion,
          securityAnswer,
          preferredLanguage: lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
        return;
      }
      setSuccessMsg(data.message || 'Account created successfully.');
      setAuthenticatedUser(data.user);
      navigate(getDashboardPathForRole(data.user.role), { replace: true });
    } catch {
      setErrorMsg('Network error while submitting registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    {
      role: 'USER' as AccountRole,
      title: t('auth.roleUserTitle', 'Community Explorer'),
      desc: t('auth.roleUserDesc', 'Save favorite monuments & districts and sync preferences.'),
      icon: User,
      accent: 'border-[#F8C928]',
    },
    {
      role: 'JOURNALIST' as AccountRole,
      title: t('auth.roleJournalistTitle', 'Heritage Journalist'),
      desc: t('auth.roleJournalistDesc', 'Draft, photograph, and submit heritage articles for editorial review.'),
      icon: Feather,
      accent: 'border-[#C92332]',
    },
    {
      role: 'ADMIN' as AccountRole,
      title: t('auth.roleAdminTitle', 'Archive Administrator'),
      desc: t('auth.roleAdminDesc', 'Moderate accounts, review submissions, and manage heritage data.'),
      icon: ShieldCheck,
      accent: 'border-[#941D2A]',
    },
  ];

  return (
    <div className="bg-[#FFFDF7] min-h-[82vh] py-12 lg:py-16">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
        <header className="max-w-2xl mb-10 hh-hero-enter">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
            {t('auth.portalKicker', 'Role-Based Archive Access')}
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-[#292522]">
            {t('auth.portalTitle', 'HeritageHub Account Portal')}
          </h1>
          <p className="mt-3 text-sm text-[#77716B] leading-relaxed">
            {t(
              'auth.portalSubtitle',
              'Select your role to sign in or create an account. Personal email addresses (Gmail, Outlook, Yahoo) are welcome.',
            )}
          </p>
        </header>

        {/* One-time Initial Admin Bootstrap Banner when zero admins exist */}
        {needsInitialAdmin && (
          <div className="mb-8 bg-[#FBF6E8] border border-[#F8C928] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg text-[#292522]">
                {t('auth.initialAdminTitle', 'Initial Administrator Setup Required')}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#77716B]">
                {t(
                  'auth.initialAdminDesc',
                  'No administrator account exists yet in the local database. Complete this one-time setup to provision the founding HeritageHub administrator.',
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSetupAdminOpen(true);
                setSelectedRole('ADMIN');
                setMode('register');
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 text-xs font-semibold bg-[#F8C928] text-[#201C1B] hover:bg-[#eab915] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('auth.setupAdminButton', 'Create Initial Administrator')}
            </button>
          </div>
        )}

        {/* Three Interactive Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {roles.map((item) => {
            const Icon = item.icon;
            const active = selectedRole === item.role && !setupAdminOpen;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => handleSelectRole(item.role)}
                className={`text-left p-6 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#FFFFFF] border-[#C92332] ring-2 ring-[#F8C928]/60 shadow-sm'
                    : 'bg-[#FBF6E8]/70 border-[#EADEC8] hover:border-[#C92332]/60 hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                      active ? 'bg-[#C92332] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#941D2A] border border-[#EADEC8]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#941D2A]">
                    {item.role}
                  </span>
                </div>
                <h2 className="font-serif text-xl text-[#292522]">{item.title}</h2>
                <p className="mt-1.5 text-xs text-[#77716B] leading-relaxed">{item.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Auth Form Panel */}
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 sm:p-8 shadow-sm">
          {setupAdminOpen ? (
            <div className="mb-6 pb-4 border-b border-[#EADEC8] flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#941D2A]">
                  Initial Setup · ADMIN
                </p>
                <h3 className="font-serif text-2xl text-[#292522]">
                  {t('auth.setupAdminButton', 'Create Initial Administrator')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSetupAdminOpen(false);
                  setMode('login');
                }}
                className="text-xs font-semibold text-[#77716B] hover:text-[#292522] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[#EADEC8]">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#941D2A]">
                  {selectedRole} Portal
                </p>
                <h3 className="font-serif text-2xl text-[#292522]">
                  {roles.find((r) => r.role === selectedRole)?.title}
                </h3>
              </div>

              {selectedRole !== 'ADMIN' && (
                <div className="inline-flex p-1 bg-[#FBF6E8] border border-[#EADEC8] rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                      mode === 'login' ? 'bg-[#C92332] text-[#FFFFFF]' : 'text-[#77716B] hover:text-[#292522]'
                    }`}
                  >
                    {t('auth.loginTab', 'Sign In')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                      mode === 'register' ? 'bg-[#C92332] text-[#FFFFFF]' : 'text-[#77716B] hover:text-[#292522]'
                    }`}
                  >
                    {t('auth.registerTab', 'Register')}
                  </button>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-[#C92332]/10 border border-[#C92332]/40 rounded-md flex items-start gap-2.5 text-xs sm:text-sm text-[#941D2A]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-md flex items-start gap-2.5 text-xs sm:text-sm text-emerald-900">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          {!setupAdminOpen && mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-[#292522] mb-1.5">
                  {t('auth.email', 'Email Address')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                />
              </div>

              <PasswordField
                id="login-password"
                label={t('auth.password', 'Password')}
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#941D2A] hover:underline"
                >
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </Link>
              </div>

              {selectedRole === 'ADMIN' && (
                <p className="text-xs text-[#77716B] bg-[#FBF6E8] border border-[#EADEC8] rounded-md p-3">
                  {t(
                    'auth.adminControlledNote',
                    'New administrator accounts are provisioned exclusively by an authenticated administrator after initial setup.',
                  )}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold bg-[#C92332] hover:bg-[#941D2A] disabled:opacity-60 text-[#FFFFFF] rounded-md cursor-pointer transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{t('auth.signInButton', 'Sign In')}</span>
              </button>
            </form>
          )}

          {/* Registration Form (User, Journalist, or Initial Admin Setup) */}
          {(setupAdminOpen || (mode === 'register' && selectedRole !== 'ADMIN')) && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-semibold text-[#292522] mb-1.5">
                    {t('auth.fullName', 'Full Name')}
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ananya Rao"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-[#292522] mb-1.5">
                    {t('auth.email', 'Email Address')}
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordField
                  id="reg-password"
                  label={t('auth.password', 'Password')}
                  value={password}
                  onChange={setPassword}
                  showStrength
                  autoComplete="new-password"
                />
                <PasswordField
                  id="reg-confirm"
                  label={t('auth.confirmPassword', 'Confirm Password')}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />
              </div>

              {selectedRole === 'JOURNALIST' && !setupAdminOpen && (
                <div>
                  <label htmlFor="reg-bio" className="block text-xs font-semibold text-[#292522] mb-1.5">
                    {t('auth.bioIntro', 'Short Professional Introduction')}
                  </label>
                  <textarea
                    id="reg-bio"
                    rows={3}
                    required
                    value={bioIntro}
                    onChange={(e) => setBioIntro(e.target.value)}
                    placeholder={t(
                      'auth.bioPlaceholder',
                      'Describe your cultural journalism, research, or regional heritage focus...',
                    )}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-[#EADEC8] space-y-3">
                <div>
                  <label htmlFor="reg-question" className="block text-xs font-semibold text-[#292522] mb-1.5">
                    {t('auth.securityQuestion', 'Security Question')}
                  </label>
                  <select
                    id="reg-question"
                    value={questionSelect}
                    onChange={(e) => setQuestionSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                  >
                    {PRESET_QUESTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {questionSelect === 'Custom security question' && (
                  <div>
                    <input
                      type="text"
                      required
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder={t('auth.customQuestionPlaceholder', 'Or type your own custom security question...')}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="reg-answer" className="block text-xs font-semibold text-[#292522] mb-1.5">
                    {t('auth.securityAnswer', 'Security Answer')}
                  </label>
                  <input
                    id="reg-answer"
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Stored normalized & BCrypt-hashed"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#EADEC8] rounded-md text-[#292522] focus:outline-none focus:border-[#C92332]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold bg-[#C92332] hover:bg-[#941D2A] disabled:opacity-60 text-[#FFFFFF] rounded-md cursor-pointer transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {setupAdminOpen
                    ? t('auth.setupAdminButton', 'Create Initial Administrator')
                    : selectedRole === 'JOURNALIST'
                      ? t('auth.registerJournalistButton', 'Register Journalist Account')
                      : t('auth.registerUserButton', 'Register User Account')}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
