import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogIn, Menu, Search, X } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { useI18n, type SupportedLanguage } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForRole } from './auth/ProtectedRoute';

const LANG_OPTIONS: Array<{ code: SupportedLanguage; label: string; aria: string }> = [
  { code: 'en', label: 'EN', aria: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ', aria: 'Kannada' },
  { code: 'hi', label: 'हिन्दी', aria: 'Hindi' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { lang, t } = useI18n();
  const { user, changeLanguageAndSync } = useAuth();

  const navItems = [
    { label: t('nav.home', 'Home'), to: '/' },
    { label: t('nav.explore', 'Explore Karnataka'), to: '/explore' },
    { label: t('nav.culture', 'Cultural Heritage'), to: '/culture' },
    { label: t('nav.about', 'About'), to: '/about' },
  ];

  const dashboardHref = user ? getDashboardPathForRole(user.role) : '/auth';
  const dashboardLabel = user
    ? user.role === 'ADMIN'
      ? t('nav.adminDashboard', 'Admin Console')
      : user.role === 'JOURNALIST'
        ? t('nav.journalistDashboard', 'Journalist Studio')
        : t('nav.userDashboard', 'Dashboard')
    : t('nav.signIn', 'Sign In');

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#EADEC8]">
        <div className="hh-karnataka-rule w-full" aria-hidden="true" />
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-serif text-xl font-semibold tracking-tight text-[#292522] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d="M4 20H20M6 20V10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V20"
                stroke="#C92332"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M12 4V20M9 11.5H15"
                stroke="#F8C928"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>HeritageHub</span>
          </Link>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-[#77716B]"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `editorial-link py-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C92332] ${
                    isActive
                      ? 'text-[#941D2A] font-semibold'
                      : 'text-[#77716B] hover:text-[#292522]'
                  }`
                }
                data-active={
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Language Switcher + Account + Global Search + Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label={t('nav.language', 'Language')}
              className="hidden sm:inline-flex items-center border border-[#EADEC8] bg-[#FFFFFF] rounded-md overflow-hidden"
            >
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => changeLanguageAndSync(opt.code)}
                  aria-label={opt.aria}
                  aria-pressed={lang === opt.code}
                  className={`px-2.5 py-1.5 min-h-[36px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border-r border-[#EADEC8] last:border-r-0 ${
                    lang === opt.code
                      ? 'bg-[#F8C928] text-[#201C1B]'
                      : 'text-[#77716B] hover:text-[#292522] hover:bg-[#FBF6E8]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Link
              to={dashboardHref}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-[#941D2A] border border-[#EADEC8] bg-[#FFFFFF] hover:border-[#C92332] hover:bg-[#FBF6E8] rounded-md whitespace-nowrap shrink-0 transition-colors"
            >
              {user ? (
                <LayoutDashboard className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-[#C92332]" aria-hidden="true" />
              )}
              <span>{dashboardLabel}</span>
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hh-btn-interactive inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[40px] text-xs font-semibold tracking-wide text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8C928]"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden lg:inline">{t('nav.search', 'Search')}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#292522] hover:text-[#C92332] transition-colors cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Responsive mobile drawer */}
        {mobileOpen && (
          <div
            id="mobile-navigation-drawer"
            className="md:hidden bg-[#FFFDF7] border-t border-[#EADEC8] px-5 py-5 space-y-4"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-3 text-base font-medium rounded-md border-b border-[#EADEC8]/60 last:border-b-0 transition-colors ${
                      isActive
                        ? 'text-[#941D2A] bg-[#FBF6E8] font-semibold'
                        : 'text-[#292522] hover:bg-[#FFFFFF]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to={dashboardHref}
                className="px-3 py-3 text-base font-semibold text-[#C92332] hover:bg-[#FBF6E8] rounded-md flex items-center gap-2"
              >
                {user ? (
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{dashboardLabel}</span>
              </Link>
            </nav>

            <div className="pt-3 border-t border-[#EADEC8] flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77716B]">
                {t('nav.language', 'Language')}
              </span>
              <div className="inline-flex items-center border border-[#EADEC8] bg-[#FFFFFF] rounded-md overflow-hidden">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => changeLanguageAndSync(opt.code)}
                    aria-pressed={lang === opt.code}
                    className={`px-3 py-2 text-xs font-semibold border-r border-[#EADEC8] last:border-r-0 cursor-pointer ${
                      lang === opt.code
                        ? 'bg-[#F8C928] text-[#201C1B]'
                        : 'text-[#77716B] hover:text-[#292522]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
