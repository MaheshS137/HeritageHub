import heroHampiImg from '../assets/images/hero_hampi_chariot_1794747861538.jpg';
import destBelurImg from '../assets/images/dest_belur_hoysala_1794747863608.jpg';
import destMysoreImg from '../assets/images/dest_mysore_palace_1794747863190.jpg';
import destBadamiImg from '../assets/images/dest_badami_caves_1794747864012.jpg';
import cultureYakshaganaImg from '../assets/images/culture_yakshagana_art_1794747864409.jpg';
import cultureCraftsImg from '../assets/images/culture_karnataka_crafts_1794747865084.jpg';
import cultureMalnadImg from '../assets/images/culture_malnad_heritage_1794747865353.jpg';

export type KarnatakaRegion =
  | 'Deccan Plateau'
  | 'Old Mysore'
  | 'Malnad & Coast'
  | 'Kalyana & North';

export interface CulturalCategory {
  slug: string;
  indexNumber: string;
  title: string;
  subtitle: string;
  description: string;
  entryCount: number;
  regionHighlight: string;
  image: string;
  altText: string;
}

export interface Destination {
  slug: string;
  name: string;
  district: string;
  region: KarnatakaRegion;
  dynasty: string;
  era: string;
  unescoStatus: string;
  categorySlug: string;
  categoryLabel: string;
  summary: string;
  editorialIntro: string;
  architecturalNotes: string[];
  preservationStatus: string;
  conservationFocus: string;
  visitingSeason: string;
  visitingHours: string;
  etiquette: string;
  coordinatesLabel: string;
  image: string;
  altText: string;
  featured: boolean;
}

export interface CulturalSpotlight {
  id: string;
  title: string;
  region: KarnatakaRegion;
  district: string;
  traditionType: string;
  preservationNote: string;
  conservationLevel: 'Active Stewardship' | 'Protected Craft' | 'Needs Documentation';
  summary: string;
  linkedDestinationSlug: string;
  image: string;
  altText: string;
}

export interface ArchiveStat {
  value: string;
  label: string;
  detail: string;
}

export const HERO_MEDIA = {
  image: heroHampiImg,
  altText:
    'The carved granite stone chariot and pillared mandapa of Vittala Temple in Hampi, Karnataka bathed in golden sunrise light amid weathered boulders.',
  caption: 'Fig. 01 — Vittala Temple Complex, Hampi · Vijayanagara Empire, 15th Century CE',
};

export const ARCHIVE_STATS: ArchiveStat[] = [
  {
    value: '03',
    label: 'UNESCO World Heritage Ensembles',
    detail: 'Hampi, Pattadakal, and the Sacred Ensembles of the Hoysalas.',
  },
  {
    value: '31',
    label: 'Districts Under Survey',
    detail: 'Architectural, ecological, and living-craft documentation across Karnataka.',
  },
  {
    value: '1,400+',
    label: 'Years of Continuous Craft',
    detail: 'From 6th-century Badami sandstone caves to living handloom guilds.',
  },
];

export const CULTURAL_CATEGORIES: CulturalCategory[] = [
  {
    slug: 'sacred-architecture',
    indexNumber: '01',
    title: 'Sacred & Temple Architecture',
    subtitle: 'Soapstone friezes, rock-cut sanctuaries, and stepped tank geometry',
    description:
      'Spanning Chalukyan sandstone experimentation at Badami, star-planned Hoysala soapstone shrines at Belur and Halebidu, and monumental Vijayanagara temple towns along the Tungabhadra.',
    entryCount: 18,
    regionHighlight: 'Hassan, Ballari & Bagalkot',
    image: destBelurImg,
    altText:
      'Intricately carved chloritic schist walls and star-shaped plinth of Chennakesava Temple in Belur illuminated by morning sunlight.',
  },
  {
    slug: 'royal-palaces',
    indexNumber: '02',
    title: 'Royal Palaces & Hill Citadels',
    subtitle: 'Indo-Saracenic courts, hydraulic forts, and civic monuments',
    description:
      'From the Wadiyar ceremonial halls of Amba Vilas in Mysuru to Deccan basalt fortresses and Vijayanagara urban enclosures shaped by monsoon hydrology and royal patronage.',
    entryCount: 12,
    regionHighlight: 'Mysuru, Bidar & Chitradurga',
    image: destMysoreImg,
    altText:
      'Mysore Palace illuminated at twilight in warm amber light, showing arched colonnades, domes, and manicured courtyard palms.',
  },
  {
    slug: 'living-arts',
    indexNumber: '03',
    title: 'Living Performing Arts',
    subtitle: 'All-night coastal theatre, classical gharanas, and ritual percussion',
    description:
      'Oral epics kept alive through Yakshagana dusk-to-dawn performances in coastal Karnataka, alongside the twin classical streams of Carnatic and Hindustani music nurtured across Mysuru and Dharwad.',
    entryCount: 14,
    regionHighlight: 'Udupi, Dakshina Kannada & Dharwad',
    image: cultureYakshaganaImg,
    altText:
      'A coastal Karnataka Yakshagana artist backstage preparing in oil-lamp light, wearing a carved golden kirita crown and crimson silk costume.',
  },
  {
    slug: 'artisanal-crafts',
    indexNumber: '04',
    title: 'Artisanal Crafts & Sacred Groves',
    subtitle: 'Geographical-indication textiles, Bidriware metallurgy, and forest shrines',
    description:
      'Centuries-old material knowledge embodied in pure mulberry Mysore silk weaving, vegetable-dyed Channapatna lacquerware, Bidri silver inlay, and community-protected Malnad devarakadu forest groves.',
    entryCount: 16,
    regionHighlight: 'Ramanagara, Bidar & Western Ghats',
    image: cultureCraftsImg,
    altText:
      'Handloom Mysore silk sarees with gold zari borders beside wooden Channapatna lacquer toys and a silver-inlaid Bidriware vessel on a teak table.',
  },
];

export const DESTINATIONS: Destination[] = [
  {
    slug: 'hampi-vittala-ensemble',
    name: 'Hampi & Vittala Temple Ensemble',
    district: 'Vijayanagara',
    region: 'Deccan Plateau',
    dynasty: 'Vijayanagara Empire',
    era: '14th – 16th Century CE',
    unescoStatus: 'UNESCO World Heritage Site',
    categorySlug: 'sacred-architecture',
    categoryLabel: 'Sacred & Temple Architecture',
    summary:
      'Granite capital along the Tungabhadra river famed for its monolithic stone chariot, musical colonnades, and aqueduct-fed royal bazaar.',
    editorialIntro:
      'Spread across a surreal boulder-strewn basin carved by the Tungabhadra River, Hampi represents the urban and architectural zenith of medieval South India. Beyond its iconic temples, the site preserves an extraordinary network of subterranean aqueducts, stepped tanks, and fortified bazaars.',
    architecturalNotes: [
      'The Vittala Shrine Stone Chariot is crafted from interlocking granite blocks carved to resemble a processional temple ratha.',
      'Fifty-six slender monolithic pillars inside the Maha Mandapa produce distinct melodic resonances when gently tapped.',
      'The Royal Enclosure pairs Islamic-influenced vaulted arches in the Lotus Mahal with classical stepped stone pushkaranis.',
    ],
    preservationStatus: 'Active Conservation Zone · Foot-traffic & Acoustic Regulation',
    conservationFocus:
      'Visitors are asked to avoid touching or striking the musical pillars in the Vittala mandapa, as repeated vibration accelerates micro-fractures in aged granite.',
    visitingSeason: 'October to February (Cool Dry Season)',
    visitingHours: '06:00 – 18:00 IST Daily',
    etiquette: 'Remove footwear before entering consecrated temple pavilions; stay on flagged granite pathways.',
    coordinatesLabel: '15.3350° N, 76.4600° E',
    image: heroHampiImg,
    altText:
      'Sunrise view across the stone courtyard of Vittala Temple in Hampi showing the carved granite chariot and colonnades.',
    featured: true,
  },
  {
    slug: 'chennakesava-belur',
    name: 'Chennakesava Temple, Belur',
    district: 'Hassan',
    region: 'Old Mysore',
    dynasty: 'Hoysala Empire',
    era: '1117 CE',
    unescoStatus: 'UNESCO World Heritage Site',
    categorySlug: 'sacred-architecture',
    categoryLabel: 'Sacred & Temple Architecture',
    summary:
      'Twelve-century chloritic schist sanctuary celebrated for star-shaped platforms, lathe-turned pillars, and signed stone sculptures.',
    editorialIntro:
      'Commissioned by King Vishnuvardhana in 1117 CE and completed over a century by generations of master guild sculptors, Chennakesava Temple turns soft grey-green soapstone into lace-like narrative reliefs. Unlike anonymous medieval monuments, more than forty sculptures here bear the carved signatures of their artists.',
    architecturalNotes: [
      'Stellate (star-shaped) jagati platform creates rhythmic vertical shadows that shift continuously with daylight.',
      'Forty-eight interior pillars each carry distinct geometry, including the famed rotatable Narasimha pillar.',
      'Exterior madanika bracket figures depict musicians, dancers, and forest birds with miniature jewellery precision.',
    ],
    preservationStatus: 'Protected Living Monument · Controlled Cleaning Protocol',
    conservationFocus:
      'Soapstone is softer than granite and sensitive to moisture and oil residue; non-invasive micro-crystalline wax and mist cleaning preserve original chisel marks.',
    visitingSeason: 'September to March',
    visitingHours: '07:30 – 19:30 IST Daily',
    etiquette: 'Photography is restricted inside the inner sanctum; preserve silence during morning rituals.',
    coordinatesLabel: '13.1623° N, 75.8606° E',
    image: destBelurImg,
    altText:
      'Exterior view of Chennakesava Temple at Belur displaying carved Hoysala friezes, stepped platform, and stone shikara.',
    featured: true,
  },
  {
    slug: 'amba-vilas-mysore-palace',
    name: 'Amba Vilas (Mysore Palace)',
    district: 'Mysuru',
    region: 'Old Mysore',
    dynasty: 'Wadiyar Dynasty',
    era: '1897 – 1912 CE',
    unescoStatus: 'State Heritage Monument',
    categorySlug: 'royal-palaces',
    categoryLabel: 'Royal Palaces & Hill Citadels',
    summary:
      'Ceremonial seat of the Wadiyars blending Rajput domes, Hoysala brackets, stained-glass pavilions, and hand-cast cast-iron colonnades.',
    editorialIntro:
      'Rebuilt between 1897 and 1912 after fire destroyed the older wooden palace, Amba Vilas stands as a landmark of Indo-Saracenic synthesis. Designed in dialogue with Mysore court artisans, it unites Belgian stained glass, Glasgow ironwork, and regional rosewood carving around an open ceremonial courtyard.',
    architecturalNotes: [
      'The Kalyana Mantapa features an octagonal stained-glass peacock ceiling engineered to diffuse natural daylight.',
      'Carved rosewood doors inlaid with geometric motifs reflect traditional Mysuru guild craftsmanship.',
      'The Durbar Hall opens unobstructed onto the eastern parade grounds, framing royal Dasara processions.',
    ],
    preservationStatus: 'Maintained Heritage Trust · Timber & Gilding Care',
    conservationFocus:
      'Ongoing restoration focuses on humidity regulation for mineral-pigment murals depicting historical Mysuru royal processions and gold-leaf ceiling panels.',
    visitingSeason: 'October (Dasara) through February',
    visitingHours: '10:00 – 17:30 IST Daily',
    etiquette: 'Interior footwear must be deposited at courtyard lockers; tripods require prior curatorial permission.',
    coordinatesLabel: '12.3052° N, 76.6552° E',
    image: destMysoreImg,
    altText:
      'Dusk architectural photograph of Mysore Palace facade glowing with warm gold lights against deep blue sky and green trees.',
    featured: true,
  },
  {
    slug: 'badami-rock-cut-caves',
    name: 'Badami Cave Temples & Agastya Basin',
    district: 'Bagalkot',
    region: 'Kalyana & North',
    dynasty: 'Early Chalukyas',
    era: '6th – 8th Century CE',
    unescoStatus: 'ASI Protected National Monument',
    categorySlug: 'sacred-architecture',
    categoryLabel: 'Sacred & Temple Architecture',
    summary:
      'Four rock-cut sandstone sanctuaries hewn into dramatic red cliffs above a sacred medieval water tank in northern Karnataka.',
    editorialIntro:
      'Badami, ancient Vatapi, served as the crucible of Deccan temple architecture under the Early Chalukyas. Excavated directly into towering rust-red escarpments overlooking Agastya Lake, the four cave shrines trace the formative synthesis of Nagara and Dravida sculptural vocabularies.',
    architecturalNotes: [
      'Cave 3 houses a dated 578 CE inscription of Mangalesha alongside monumental reliefs of Trivikrama and Narasimha.',
      'Verandah brackets feature flying celestial couples carved from single continuous sandstone planes.',
      'Across the lake, the Bhutanatha temple group extends the sandstone skyline directly into the water.',
    ],
    preservationStatus: 'Cliff Stability Monitoring · Salt Efflorescence Mitigation',
    conservationFocus:
      'Sandstone cliffs face seasonal monsoon seepage; conservation engineers monitor rock fractures and clear mineral salt deposits from painted ceiling remnants.',
    visitingSeason: 'October to February',
    visitingHours: '09:00 – 17:30 IST Daily',
    etiquette: 'Ascend rock-cut stairways cautiously during wet weather; never touch fragile residual ceiling pigments.',
    coordinatesLabel: '15.9189° N, 75.6767° E',
    image: destBadamiImg,
    altText:
      'Red sandstone cliff face of Badami Cave Temples with colonnaded rock-cut verandahs overlooking Agastya Lake.',
    featured: true,
  },
  {
    slug: 'malnad-sacred-groves',
    name: 'Banavasi & Malnad Forest Shrines',
    district: 'Uttara Kannada & Shivamogga',
    region: 'Malnad & Coast',
    dynasty: 'Kadamba & Keladi Nayakas',
    era: '4th – 17th Century CE',
    unescoStatus: 'Ecological & Cultural Heritage Zone',
    categorySlug: 'artisanal-crafts',
    categoryLabel: 'Artisanal Crafts & Sacred Groves',
    summary:
      'Laterite and granite forest temples preserved within biodiversity-rich devarakadu sacred groves across the Western Ghats.',
    editorialIntro:
      'In the mist-draped valleys of the Malnad Western Ghats, architectural heritage is inseparable from ecological stewardship. Ancient Kadamba-era shrines and Keladi laterite sanctuaries survive inside community-protected sacred groves (devarakadus) where traditional taboo against logging has shielded old-growth Dipterocarpus canopies for centuries.',
    architecturalNotes: [
      'Madhukeshwara Temple at Banavasi preserves an exquisitely carved stone cot and Kadamba lotus motifs.',
      'Sloped terracotta-tiled outer roofs evolved specifically to shed heavy Western Ghats monsoon rainfall.',
      'Surrounding sacred groves preserve endemic medicinal flora and perennial forest springs.',
    ],
    preservationStatus: 'Community Stewardship · Canopy & Moss Conservation',
    conservationFocus:
      'Balancing gentle ecological cleaning of moss-covered granite with strict protection of surrounding sacred grove watersheds from road widening.',
    visitingSeason: 'November to March (Post-Monsoon Mist)',
    visitingHours: '06:30 – 18:30 IST Daily',
    etiquette: 'Stay strictly on established forest footpaths; do not disturb native flora or stream ecosystems.',
    coordinatesLabel: '14.5342° N, 75.0169° E',
    image: cultureMalnadImg,
    altText:
      'Moss-covered granite temple gateway surrounded by misty Western Ghats rainforest and fern undergrowth in Malnad.',
    featured: false,
  },
  {
    slug: 'channapatna-artisan-guild',
    name: 'Channapatna & Mysuru Craft Corridor',
    district: 'Ramanagara & Mysuru',
    region: 'Old Mysore',
    dynasty: 'Tipu Sultan & Wadiyar Patronage',
    era: '18th Century CE – Present',
    unescoStatus: 'Geographical Indication (GI) Living Craft',
    categorySlug: 'artisanal-crafts',
    categoryLabel: 'Artisanal Crafts & Sacred Groves',
    summary:
      'Living workshops turning ivory-wood (Aale Mara) toys with natural botanical lac alongside pure mulberry silk zari weaving.',
    editorialIntro:
      'Along the historic corridor linking Bengaluru and Mysuru, generations of artisan households uphold two of Karnataka’s most recognizable Geographical Indication traditions: vegetable-dyed Channapatna lacquerware and pure silk kasavu-zari weaving.',
    architecturalNotes: [
      'Aale Mara (Wrightia tinctoria) timber is seasoned for months before hand-turning on horizontal lathes.',
      'Pigments are compounded exclusively from natural turmeric, indigo, kumkum, and shellac resin.',
      'Nearby Mysuru handloom clusters still weave 100% pure mulberry silk with real silver-gold zari.',
    ],
    preservationStatus: 'Protected Living Guild · Direct Artisan Fair-Trade Support',
    conservationFocus:
      'Safeguarding sustainable Aale Mara timber replanting and supporting apprenticeship stipends so younger artisans remain in craft guilds.',
    visitingSeason: 'Year-round (Morning Workshop Hours)',
    visitingHours: '09:30 – 17:00 IST (Monday – Saturday)',
    etiquette: 'Ask artisans before photographing active lathe or loom work; support certified GI cooperative studios.',
    coordinatesLabel: '12.6518° N, 77.2067° E',
    image: cultureCraftsImg,
    altText:
      'Artisan workbench displaying folded Mysore silk sarees, hand-turned Channapatna lacquer toys, and a silver-inlaid Bidriware vessel.',
    featured: false,
  },
];

export const CULTURAL_SPOTLIGHTS: CulturalSpotlight[] = [
  {
    id: 'yakshagana-bayalata',
    title: 'Yakshagana Bayalata',
    region: 'Malnad & Coast',
    district: 'Udupi & Dakshina Kannada',
    traditionType: 'Classical Folk Theatre',
    preservationNote:
      'Over 400 palm-leaf prasanga manuscripts are currently being digitized alongside elder bhagavata vocal recordings.',
    conservationLevel: 'Active Stewardship',
    summary:
      'Dusk-to-dawn musical dance-drama combining rhythmic chande percussion, improvised Kannada/Tulu dialogue, and hand-carved kirita crowns.',
    linkedDestinationSlug: 'malnad-sacred-groves',
    image: cultureYakshaganaImg,
    altText:
      'Yakshagana performer adjusting his intricate antique gold crown in a warm backstage greenroom.',
  },
  {
    id: 'channapatna-mysore-silk',
    title: 'Channapatna Lacquer & Zari Looms',
    region: 'Old Mysore',
    district: 'Ramanagara & Mysuru',
    traditionType: 'GI Material Craft',
    preservationNote:
      'Native Wrightia tinctoria groves are replanted regionally to keep natural wood-turning zero-toxic and self-sustaining.',
    conservationLevel: 'Protected Craft',
    summary:
      'Botanical lac-dyed wooden crafts and pure mulberry silk weaves nurtured through family cooperatives across southern Karnataka.',
    linkedDestinationSlug: 'channapatna-artisan-guild',
    image: cultureCraftsImg,
    altText:
      'Folded Mysore silk sarees, turned lacquer toys, and Bidriware vessel arranged on a wooden craft table.',
  },
  {
    id: 'vijayanagara-hydrology',
    title: 'Vijayanagara Stone Aqueducts',
    region: 'Deccan Plateau',
    district: 'Vijayanagara (Hampi)',
    traditionType: 'Civic Water Engineering',
    preservationNote:
      'Hydrological surveys map 15th-century stone channels and stepped tanks to protect drainage lines from seasonal flooding.',
    conservationLevel: 'Active Stewardship',
    summary:
      'Gravity-fed granite channels and terraced pushkaranis that once sustained an arid capital of half a million residents.',
    linkedDestinationSlug: 'hampi-vittala-ensemble',
    image: heroHampiImg,
    altText:
      'Granite courtyard and carved stone chariot of Vittala Temple in Hampi under warm sunrise light.',
  },
  {
    id: 'chalukyan-rock-carving',
    title: 'Vatapi Sandstone Guilds',
    region: 'Kalyana & North',
    district: 'Bagalkot (Badami & Aihole)',
    traditionType: 'Early Deccan Stonecraft',
    preservationNote:
      'Micro-climate cliff sensors monitor monsoon seepage and protect traces of 6th-century mineral ceiling frescoes.',
    conservationLevel: 'Needs Documentation',
    summary:
      'Experimental temple workshops across Badami, Aihole, and Pattadakal where North and South Indian architectural forms first converged.',
    linkedDestinationSlug: 'badami-rock-cut-caves',
    image: destBadamiImg,
    altText:
      'Rock-cut Badami Cave sanctuaries carved into towering red sandstone cliffs above Agastya Lake.',
  },
  {
    id: 'devarakadu-sacred-groves',
    title: 'Devarakadu Sacred Groves',
    region: 'Malnad & Coast',
    district: 'Kodagu & Uttara Kannada',
    traditionType: 'Biocultural Sanctuary',
    preservationNote:
      'Community forest committees map boundary markers and endangered tree species across 1,200+ traditional sacred groves.',
    conservationLevel: 'Needs Documentation',
    summary:
      'Living forest sanctuaries guarded by ancestral village customs that protect Western Ghats watersheds and stone shrines together.',
    linkedDestinationSlug: 'malnad-sacred-groves',
    image: cultureMalnadImg,
    altText:
      'Ancient moss-covered stone temple portal nestled inside a misty Western Ghats sacred grove.',
  },
  {
    id: 'hoysala-signature-guilds',
    title: 'Signed Hoysala Sculptor Guilds',
    region: 'Old Mysore',
    district: 'Hassan (Belur & Halebidu)',
    traditionType: 'Soapstone Sculpture',
    preservationNote:
      'High-resolution photogrammetry archives 12th-century Kannada epigraphs and individual sculptor signatures on temple friezes.',
    conservationLevel: 'Active Stewardship',
    summary:
      'Master craftsmen such as Dasoja and Chavana left signed inscriptions beneath intricate chloritic schist friezes.',
    linkedDestinationSlug: 'chennakesava-belur',
    image: destBelurImg,
    altText:
      'Detailed stone carvings and lathe-turned columns of Chennakesava Temple in Belur.',
  },
];

export const REGIONS: KarnatakaRegion[] = [
  'Deccan Plateau',
  'Old Mysore',
  'Malnad & Coast',
  'Kalyana & North',
];
