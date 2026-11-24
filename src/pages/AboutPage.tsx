import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RevealSection, StaggerGrid, StaggerItem } from '../components/motion/MotionPrimitives';

const OBJECTIVES = [
  {
    num: '01',
    title: 'Geographic Clarity Across Karnataka',
    body: 'Render authentic district boundaries using open-licensed GeoJSON geometry and verified monument coordinates so every tradition and site is anchored to its real administrative geography.',
  },
  {
    num: '02',
    title: 'Source-Verified Cultural Records',
    body: 'Attach primary citations from UNESCO, the Archaeological Survey of India, IP India Geographical Indications Registry, and Sangeet Natak Akademi to every record.',
  },
  {
    num: '03',
    title: 'Honest Archival Boundaries',
    body: 'Explicitly distinguish verified cultural monographs from districts awaiting expanded festival and craft citations instead of inventing unverified histories.',
  },
];

const SOURCES = [
  {
    name: 'geoBoundaries (IND-ADM2-76128533, 2021)',
    scope: 'Karnataka district polygon boundaries sourced from Pathways Data Pvt. Ltd. / lgdirectory.gov.in.',
    license: 'Open Data Commons Open Database License 1.0 (ODbL 1.0)',
  },
  {
    name: 'UNESCO World Heritage Centre',
    scope: 'Official property dossiers for Group of Monuments at Hampi (Ref. 241), Pattadakal (Ref. 239), and Sacred Ensembles of the Hoysalas (Ref. 1670).',
    license: 'Public Institutional Record',
  },
  {
    name: 'Office of the Controller General of Patents, Designs & Trade Marks (IP India)',
    scope: 'Geographical Indications Registry records for Mysore Silk (No. 22), Bidriware (No. 21), Channapatna Toys (No. 23), Mysore Traditional Paintings (No. 32), and Dharwad Peda (No. 80).',
    license: 'Government of India Public Registry',
  },
  {
    name: 'Archaeological Survey of India, Sangeet Natak Akademi, KSTDC & Karnataka Forest Dept.',
    scope: 'Protected monument records across all 31 districts plus intangible cultural heritage documentation for Yakshagana, Dollu Kunitha, Mysuru Dasara, and Kodagu Devarakadu groves.',
    license: 'Public Cultural & Ecological Publications',
  },
];

export function AboutPage() {
  return (
    <div className="bg-[#FFFDF7] min-h-screen">
      {/* Intro Header */}
      <section className="border-b border-[#EADEC8] bg-[#FFFFFF] py-16 lg:py-24">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-3">
            <span className="inline-block w-4 h-[2px] bg-[#F8C928]" aria-hidden="true" />
            <span>About HeritageHub</span>
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#292522] leading-[1.12] max-w-3xl">
            Preserving Karnataka&apos;s Cultural Memory Through Open Cartography &amp; Verified Records
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#77716B] leading-relaxed max-w-[66ch]">
            HeritageHub is a digital cultural archive designed for students, researchers, travelers,
            and preservationists to discover Karnataka&apos;s monuments, festivals, traditional arts,
            folk traditions, cuisine, crafts, and customs across all 31 districts.
          </p>
        </div>
      </section>

      {/* Objectives & Importance */}
      <RevealSection className="py-16 lg:py-20 border-b border-[#EADEC8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
              Project Objectives
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#292522]">
              Why Cultural Preservation Matters
            </h2>
          </div>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {OBJECTIVES.map((obj) => (
              <StaggerItem key={obj.num}>
                <div className="h-full bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-7 space-y-3 shadow-[0_4px_14px_rgba(32,28,27,0.03)]">
                  <p className="font-serif text-2xl font-semibold text-[#C92332] tabular-nums">
                    {obj.num}
                  </p>
                  <h3 className="font-serif text-xl font-medium text-[#292522]">{obj.title}</h3>
                  <p className="text-sm text-[#77716B] leading-relaxed">{obj.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </RevealSection>

      {/* Platform Features & Future Scope */}
      <RevealSection className="py-16 lg:py-20 border-b border-[#EADEC8] bg-[#FFFFFF]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
              Platform Architecture
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#292522]">
              Built with React, Express, SQLite &amp; Leaflet GeoJSON
            </h2>
            <p className="text-sm sm:text-base text-[#77716B] leading-relaxed">
              HeritageHub combines a TypeScript React frontend and Tailwind design system with an
              Express + SQLite archive API, role-based editorial workflows, and reusable Leaflet
              GeoJSON district cartography anchored across all 31 Karnataka districts.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A]">
              Future Scope
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#292522]">
              Expanding All 31 District Archives
            </h2>
            <p className="text-sm sm:text-base text-[#77716B] leading-relaxed">
              Ongoing archival work aims to expand festival, culinary, and craft monographs across
              all 31 districts, integrate dedicated post-2021 Vijayanagara polygon geometry once
              published under open ODbL/CC-BY licenses, and add bilingual Kannada-English oral
              history transcripts.
            </p>
          </div>
        </div>
      </RevealSection>

      {/* Information Sources & Licenses */}
      <RevealSection className="py-16 lg:py-20 bg-[#FBF6E8]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#941D2A] mb-2">
              Citations &amp; Licensing
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#292522]">
              Information &amp; Geospatial Sources
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SOURCES.map((src) => (
              <div
                key={src.name}
                className="bg-[#FFFFFF] border border-[#EADEC8] rounded-xl p-6 space-y-2"
              >
                <h3 className="font-serif text-lg font-medium text-[#292522]">{src.name}</h3>
                <p className="text-sm text-[#77716B] leading-relaxed">{src.scope}</p>
                <p className="text-xs font-semibold text-[#941D2A] pt-1">License: {src.license}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/explore"
              className="hh-btn-interactive inline-flex items-center gap-2 px-6 py-3 min-h-[44px] text-sm font-semibold text-[#FFFFFF] bg-[#C92332] hover:bg-[#941D2A] rounded-md transition-colors"
            >
              <span>Open Explore Karnataka Map</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/culture"
              className="hh-btn-interactive inline-flex items-center gap-2 px-6 py-3 min-h-[44px] text-sm font-semibold text-[#201C1B] bg-[#F8C928] hover:bg-[#eab915] rounded-md transition-colors"
            >
              <span>Browse Cultural Heritage</span>
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
