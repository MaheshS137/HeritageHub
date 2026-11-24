import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RevealSection, StaggerGrid, StaggerItem } from '../components/motion/MotionPrimitives';

const CHARTER_PILLARS = [
  {
    numeral: '01',
    title: 'Non-Invasive Architectural Documentation',
    body: 'Every site monograph records structural materials—whether chloritic schist soapstone, Badami sandstone, or Vijayanagara granite—pairing architectural notes with climate and foot-traffic sensitivities.',
  },
  {
    numeral: '02',
    title: 'Living Guild & Oral Tradition Continuity',
    body: 'Monuments cannot be separated from the hands that sustained them. HeritageHub documents palm-leaf Yakshagana manuscripts, natural dye supply chains, and regional handloom lineages alongside built sites.',
  },
  {
    numeral: '03',
    title: 'Biocultural Watershed & Grove Protection',
    body: 'Across Malnad and Kodagu, sacred devarakadu forest groves protect both ancient granite shrines and endemic Western Ghats headwaters through centuries-old community stewardship.',
  },
];

const VISITOR_GUIDELINES = [
  'Respect active worship spaces and remove footwear at consecrated thresholds.',
  'Never lean on, climb, or touch fragile carved reliefs, ceiling murals, or musical pillars.',
  'Support Geographical Indication (GI) artisan cooperatives directly rather than mass-produced imitations.',
  'Carry out all waste and remain on flagged stone paths inside protected ecological sanctuaries.',
];

export function PreservationPage() {
  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      <section className="border-b border-[#EADEC8] bg-[#FFFFFF] py-16 lg:py-24">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
            <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
            <span>HeritageHub Charter</span>
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-3xl">
            Preserving Stone, Craft &amp; Living Memory
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#77716B] leading-relaxed max-w-[64ch]">
            Discovery carries responsibility. Our preservation charter guides how monuments are
            documented, how living crafts are contextualized, and how travelers engage respectfully
            with Karnataka&apos;s cultural landscape.
          </p>
        </div>
      </section>

      <RevealSection id="methodology" className="py-16 lg:py-24 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
              Field Methodology
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#292522]">
              Three Pillars of Cultural Stewardship
            </h2>
          </div>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {CHARTER_PILLARS.map((pillar) => (
              <StaggerItem key={pillar.numeral}>
                <div className="border-t-2 border-[#C92332] pt-6 space-y-3">
                  <p className="font-serif text-2xl font-semibold text-[#C92332] tabular-nums">
                    {pillar.numeral}
                  </p>
                  <h3 className="font-serif text-xl font-medium text-[#292522]">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#77716B] leading-relaxed">{pillar.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </RevealSection>

      <RevealSection id="etiquette" className="py-16 lg:py-24 bg-[#FBF6E8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
                Field Etiquette
              </p>
              <h2 className="font-serif text-3xl font-medium text-[#292522]">
                A Traveler&apos;s Covenant at Heritage Sites
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#77716B] leading-relaxed">
                Small physical habits across thousands of annual visitors determine whether
                soft soapstone carvings and painted sandstone ceilings endure for future
                generations.
              </p>
            </div>

            <div className="lg:col-span-7 border border-[#EADEC8] bg-[#FFFFFF] rounded-xl p-7 sm:p-10">
              <ol className="space-y-5">
                {VISITOR_GUIDELINES.map((rule, idx) => (
                  <li
                    key={rule}
                    className="flex items-start gap-4 pb-5 border-b border-[#EADEC8] last:border-b-0 last:pb-0 text-sm sm:text-base text-[#292522] leading-relaxed"
                  >
                    <span className="font-serif text-base font-semibold text-[#C92332] tabular-nums shrink-0">
                      0{idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 pt-6 border-t border-[#EADEC8] flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#77716B]">
                  Ready to explore documented sites across Karnataka?
                </span>
                <Link
                  to="/explore"
                  className="hh-btn-interactive inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] text-xs font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md transition-colors"
                >
                  <span>Explore Karnataka Atlas</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
