import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, Calendar } from 'lucide-react';
import { DESTINATIONS } from '../data/heritageData';
import { HeritageImage } from '../components/HeritageImage';

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const destination = DESTINATIONS.find((d) => d.slug === slug);

  if (!destination) {
    return (
      <div className="bg-[#FFFDF7] py-24 px-5 sm:px-8">
        <div className="max-w-xl mx-auto border border-[#EADEC8] bg-[#FBF6E8] rounded-xl p-10 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
            Archive Entry Missing
          </p>
          <h1 className="font-serif text-3xl font-medium text-[#292522]">
            Heritage Site Not Found
          </h1>
          <p className="mt-3 text-sm text-[#77716B]">
            The requested destination monograph could not be located in the current archive edition.
          </p>
          <Link
            to="/destinations"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Return to Destinations Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const relatedDestinations = DESTINATIONS.filter((d) => d.slug !== destination.slug).slice(
    0,
    3,
  );

  return (
    <article className="bg-[#FFFDF7]">
      {/* Top Breadcrumb & Monograph Header */}
      <header className="border-b border-[#EADEC8] bg-[#FFFFFF] py-12 lg:py-16">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#941D2A] hover:text-[#C92332] mb-8"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to All Destinations</span>
          </Link>

          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
            {destination.categoryLabel} · {destination.region}
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-4xl">
            {destination.name}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#77716B] tabular-nums">
            {destination.district} District · {destination.dynasty} · {destination.era} ·{' '}
            {destination.unescoStatus}
          </p>
        </div>
      </header>

      {/* Main Architectural Visual & Accession Grid */}
      <section className="py-12 lg:py-16 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <HeritageImage
                src={destination.image}
                alt={destination.altText}
                priority
                containerClassName="aspect-[16/10] w-full rounded-xl border border-[#EADEC8] shadow-sm"
              />
              <p className="mt-3 font-serif italic text-xs text-[#77716B]">
                Archive Plate — {destination.name}, {destination.district} ({destination.coordinatesLabel})
              </p>
            </div>

            {/* Museum Accession Metadata Definition List */}
            <aside className="lg:col-span-4 rounded-xl border border-[#EADEC8] bg-[#FFFFFF] p-6 sm:p-7 shadow-xs">
              <h2 className="font-serif text-lg font-medium text-[#292522] pb-4 border-b border-[#EADEC8]">
                Site Record &amp; Provenance
              </h2>
              <dl className="divide-y divide-[#EADEC8] text-sm">
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Region &amp; District
                  </dt>
                  <dd className="mt-1 font-medium text-[#292522]">
                    {destination.region} · {destination.district}
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Dynasty &amp; Period
                  </dt>
                  <dd className="mt-1 font-medium text-[#292522] tabular-nums">
                    {destination.dynasty} ({destination.era})
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Designation
                  </dt>
                  <dd className="mt-1 font-semibold text-[#941D2A]">{destination.unescoStatus}</dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Coordinates
                  </dt>
                  <dd className="mt-1 font-medium text-[#292522] tabular-nums">
                    {destination.coordinatesLabel}
                  </dd>
                </div>
                <div className="py-3.5">
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#77716B]">
                    Conservation Status
                  </dt>
                  <dd className="mt-1 text-[#292522]">{destination.preservationStatus}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* Long-form Monograph & Preservation Guidance */}
      <section className="py-14 lg:py-20 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Editorial Narrative */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522] mb-5">
                  Architectural &amp; Historical Overview
                </h2>
                <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-semibold first-letter:text-[#C92332] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.88] first-letter:pt-1 text-base text-[#77716B] leading-[1.8]">
                  {destination.editorialIntro}
                </p>
              </div>

              <div className="pt-6 border-t border-[#EADEC8]">
                <h3 className="font-serif text-xl font-medium text-[#292522] mb-4">
                  Defining Architectural Elements
                </h3>
                <ul className="space-y-4">
                  {destination.architecturalNotes.map((note, idx) => (
                    <li
                      key={note}
                      className="flex items-start gap-4 text-sm sm:text-base text-[#77716B] leading-relaxed"
                    >
                      <span className="font-serif text-sm font-semibold text-[#C92332] tabular-nums pt-0.5 shrink-0">
                        0{idx + 1}.
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conservation & Visiting Protocol Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-[#EADEC8] bg-[#FBF6E8] p-7 space-y-4">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#941D2A]">
                  <ShieldCheck className="w-5 h-5 text-[#C92332] shrink-0" aria-hidden="true" />
                  <h3>Preservation &amp; Field Note</h3>
                </div>
                <p className="text-sm text-[#292522] leading-relaxed">
                  {destination.conservationFocus}
                </p>
              </div>

              <div className="rounded-xl border border-[#EADEC8] bg-[#FFFFFF] p-7 space-y-5">
                <h3 className="font-serif text-xl font-medium text-[#292522]">
                  Responsible Visiting Guide
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-[#C92332] mt-1 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-[#292522]">Recommended Season</p>
                      <p className="text-[#77716B]">{destination.visitingSeason}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#C92332] mt-1 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-[#292522]">Visiting Hours</p>
                      <p className="text-[#77716B] tabular-nums">{destination.visitingHours}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EADEC8]">
                    <p className="font-medium text-[#292522] mb-1">Site Etiquette</p>
                    <p className="text-[#77716B] leading-relaxed">{destination.etiquette}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Destinations */}
      <section className="py-16 lg:py-20 bg-[#FBF6E8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4 pb-6 border-b border-[#EADEC8]">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                Continue Exploring
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#292522]">
                More Heritage Sites Across Karnataka
              </h2>
            </div>
            <Link
              to="/destinations"
              className="editorial-link text-sm font-semibold text-[#C92332] whitespace-nowrap shrink-0"
            >
              All Destinations →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedDestinations.map((rel) => (
              <Link
                key={rel.slug}
                to={`/destinations/${rel.slug}`}
                className="group bg-[#FFFFFF] border border-[#EADEC8] hover:border-[#C92332] rounded-xl overflow-hidden transition-all"
              >
                <HeritageImage
                  src={rel.image}
                  alt={rel.altText}
                  zoomOnHover
                  containerClassName="aspect-[4/3] w-full"
                />
                <div className="p-5">
                  <p className="text-xs text-[#77716B]">
                    {rel.district} · {rel.dynasty}
                  </p>
                  <h3 className="mt-1.5 font-serif text-lg font-medium text-[#292522] group-hover:text-[#941D2A] transition-colors">
                    {rel.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C92332]">
                    <span>Inspect Site</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
