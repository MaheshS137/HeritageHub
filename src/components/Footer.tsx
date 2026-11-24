import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export function Footer() {
  const { t } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#201C1B] text-[#FFFDF7] border-t-4 border-[#C92332]">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#FFFDF7]/15">
          {/* Brand Summary */}
          <div className="md:col-span-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 font-serif text-2xl font-semibold tracking-tight text-[#FFFDF7]"
            >
              <span
                className="inline-block w-2.5 h-6 rounded-xs bg-gradient-to-b from-[#F8C928] via-[#F8C928] to-[#C92332]"
                aria-hidden="true"
              />
              <span>HeritageHub</span>
            </Link>
            <p className="mt-4 text-sm text-[#FFFDF7]/80 leading-relaxed max-w-[46ch]">
              {t('footer.tagline')}
            </p>
            <p className="mt-6 text-xs font-medium tracking-[0.14em] uppercase text-[#F8C928]">
              {t('footer.edition')}
            </p>
          </div>

          {/* Primary Pages */}
          <div className="md:col-span-2">
            <h3 className="font-sans text-xs font-semibold tracking-[0.16em] uppercase text-[#F8C928] mb-4">
              {t('footer.exploreCol', 'Explore')}
            </h3>
            <ul className="space-y-3 text-sm text-[#FFFDF7]/85">
              <li>
                <Link to="/" className="hover:text-[#F8C928] transition-colors">
                  {t('nav.home', 'Home')}
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#F8C928] transition-colors">
                  {t('nav.explore', 'Explore Karnataka')}
                </Link>
              </li>
              <li>
                <Link to="/culture" className="hover:text-[#F8C928] transition-colors">
                  {t('nav.culture', 'Cultural Heritage')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F8C928] transition-colors">
                  {t('nav.about', 'About')}
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[#F8C928] transition-colors">
                  {t('nav.signIn', 'Sign In')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Featured Districts */}
          <div className="md:col-span-3">
            <h3 className="font-sans text-xs font-semibold tracking-[0.16em] uppercase text-[#F8C928] mb-4">
              {t('footer.districtsCol', 'Featured Districts')}
            </h3>
            <ul className="space-y-3 text-sm text-[#FFFDF7]/85">
              <li>
                <Link to="/district/mysuru" className="hover:text-[#F8C928] transition-colors">
                  Mysuru District
                </Link>
              </li>
              <li>
                <Link to="/district/vijayanagara" className="hover:text-[#F8C928] transition-colors">
                  Vijayanagara (Hampi)
                </Link>
              </li>
              <li>
                <Link to="/district/hassan" className="hover:text-[#F8C928] transition-colors">
                  Hassan (Belur &amp; Halebidu)
                </Link>
              </li>
              <li>
                <Link to="/district/vijayapura" className="hover:text-[#F8C928] transition-colors">
                  Vijayapura (Gol Gumbaz)
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2">
            <h3 className="font-sans text-xs font-semibold tracking-[0.16em] uppercase text-[#F8C928] mb-4">
              {t('footer.categoriesCol', 'Categories')}
            </h3>
            <ul className="space-y-3 text-sm text-[#FFFDF7]/85">
              <li>
                <Link
                  to="/culture?category=festivals-celebrations"
                  className="hover:text-[#F8C928] transition-colors"
                >
                  Festivals
                </Link>
              </li>
              <li>
                <Link
                  to="/culture?category=traditional-arts"
                  className="hover:text-[#F8C928] transition-colors"
                >
                  Traditional Arts
                </Link>
              </li>
              <li>
                <Link
                  to="/culture?category=historical-monuments"
                  className="hover:text-[#F8C928] transition-colors"
                >
                  Monuments
                </Link>
              </li>
              <li>
                <Link
                  to="/culture?category=food-cuisine"
                  className="hover:text-[#F8C928] transition-colors"
                >
                  Cuisine
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Back-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FFFDF7]/75">
          <p>
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F8C928] hover:text-[#FFFDF7] transition-colors cursor-pointer"
          >
            <span>{t('footer.backToTop', 'Back to top')}</span>
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
