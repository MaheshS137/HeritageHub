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
  imageKey: string;
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
  imageKey: string;
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
  imageKey: string;
  altText: string;
}

export interface ArchiveStat {
  value: string;
  label: string;
  detail: string;
}

export const HERO_MEDIA = {
  image: '/images/hero-hampi.jpg',
  imageKey: 'hero-hampi',
  altText:
    'The carved granite Garuda Stone Chariot and pillared mandapa of Vijaya Vittala Temple at Hampi in Vijayanagara district, Karnataka.',
  caption: 'Fig. 01 — Vijaya Vittala Temple Complex, Hampi · Vijayanagara Empire, 15th–16th Century CE',
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
    regionHighlight: 'Hassan, Vijayanagara & Bagalkot',
    image: '/images/belur-hoysala.jpg',
    imageKey: 'belur-hoysala',
    altText:
      'Illuminated exterior of Chennakesava Temple in Belur showing its stellate Hoysala plinth and carved chloritic schist superstructure.',
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
    image: '/images/mysore-palace.jpg',
    imageKey: 'mysore-palace',
    altText:
      'Amba Vilas (Mysore Palace) illuminated at dusk with arched colonnades, domes, and courtyard lawns.',
  },
  {
    slug: 'living-arts',
    indexNumber: '03',
    title: 'Living Performing Arts',
    subtitle: 'All-night coastal theatre, classical gharanas, and ritual percussion',
    description:
      'Oral epics kept alive through Yakshagana dusk-to-dawn performances in coastal Karnataka, alongside classical music lineages and folk drum traditions across Mysuru and Dharwad.',
    entryCount: 14,
    regionHighlight: 'Udupi, Dakshina Kannada & Dharwad',
    image: '/images/yakshagana.jpg',
    imageKey: 'yakshagana',
    altText:
      'Yakshagana performer in traditional ornate crown and costume during a live stage performance in Karnataka.',
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
    image: '/images/channapatna-toys.jpg',
    imageKey: 'channapatna-toys',
    altText:
      'Channapatna wooden toy artisans turning ivory-wood crafts in Ramanagara district, Karnataka.',
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
      'Slender monolithic pillars inside the Maha Mandapa are celebrated for acoustic tonal variation when gently tapped.',
      'The Royal Enclosure pairs Islamic-influenced vaulted arches in the Lotus Mahal with classical stepped stone pushkaranis.',
    ],
    preservationStatus: 'Active Conservation Zone · Foot-traffic & Acoustic Regulation',
    conservationFocus:
      'Visitors are asked to avoid touching or striking the musical pillars in the Vittala mandapa, as repeated vibration accelerates micro-fractures in aged granite.',
    visitingSeason: 'October to February (Cool Dry Season)',
    visitingHours: '06:00 – 18:00 IST Daily',
    etiquette: 'Remove footwear before entering consecrated temple pavilions; stay on flagged granite pathways.',
    coordinatesLabel: '15.3350° N, 76.4600° E',
    image: '/images/hero-hampi.jpg',
    imageKey: 'hero-hampi',
    altText:
      'The Garuda Stone Chariot inside the courtyard of Vijaya Vittala Temple at Hampi, Karnataka.',
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
      'Twelfth-century chloritic schist sanctuary celebrated for star-shaped platforms, lathe-turned pillars, and signed stone sculptures.',
    editorialIntro:
      'Commissioned by King Vishnuvardhana in 1117 CE and completed over generations by master guild sculptors, Chennakesava Temple turns soft grey-green soapstone into intricate narrative reliefs. Numerous sculptures here preserve the carved inscriptions and signatures of their medieval artists.',
    architecturalNotes: [
      'Stellate (star-shaped) jagati platform creates rhythmic vertical shadows that shift continuously with daylight.',
      'Interior lathe-turned soapstone pillars display distinct geometric bands and figurative carvings.',
      'Exterior madanika bracket figures depict musicians, dancers, and forest birds with miniature jewellery precision.',
    ],
    preservationStatus: 'Protected Living Monument · Controlled Cleaning Protocol',
    conservationFocus:
      'Soapstone is softer than granite and sensitive to moisture and oil residue; non-invasive micro-crystalline conservation protects original chisel marks.',
    visitingSeason: 'September to March',
    visitingHours: '07:30 – 19:30 IST Daily',
    etiquette: 'Photography is restricted inside the inner sanctum; preserve silence during morning rituals.',
    coordinatesLabel: '13.1623° N, 75.8606° E',
    image: '/images/belur-hoysala.jpg',
    imageKey: 'belur-hoysala',
    altText:
      'Illuminated exterior view of Chennakesava Temple at Belur showing carved Hoysala friezes and star-shaped base.',
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
      'Ceremonial seat of the Wadiyars blending Rajput domes, Hoysala brackets, stained-glass pavilions, and cast-iron colonnades.',
    editorialIntro:
      'Rebuilt between 1897 and 1912 after fire destroyed the older wooden palace, Amba Vilas stands as a landmark of Indo-Saracenic synthesis. Designed by Henry Irwin in dialogue with Mysuru court artisans, it unites stained glass, cast ironwork, and regional rosewood carving around an open ceremonial courtyard.',
    architecturalNotes: [
      'The Kalyana Mantapa features an octagonal stained-glass peacock ceiling engineered to diffuse natural daylight.',
      'Carved rosewood doors and silver pavilions reflect traditional Mysuru guild craftsmanship.',
      'The Durbar Hall opens onto the eastern parade grounds, framing annual Mysuru Dasara processions.',
    ],
    preservationStatus: 'Maintained Heritage Trust · Timber & Gilding Care',
    conservationFocus:
      'Ongoing restoration focuses on humidity regulation for mineral-pigment murals depicting historical Mysuru royal processions and gilded ceiling panels.',
    visitingSeason: 'October (Dasara) through February',
    visitingHours: '10:00 – 17:30 IST Daily',
    etiquette: 'Interior footwear must be deposited at courtyard lockers; tripods require prior curatorial permission.',
    coordinatesLabel: '12.3052° N, 76.6552° E',
    image: '/images/mysore-palace.jpg',
    imageKey: 'mysore-palace',
    altText:
      'Amba Vilas (Mysore Palace) illuminated facade with domes and arched colonnades in Mysuru.',
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
      'Four rock-cut sandstone sanctuaries hewn into red cliffs above a sacred medieval water tank in northern Karnataka.',
    editorialIntro:
      'Badami, ancient Vatapi, served as the crucible of Deccan temple architecture under the Early Chalukyas. Excavated directly into towering rust-red escarpments overlooking Agastya Lake, the four cave shrines trace the formative synthesis of Nagara and Dravida sculptural vocabularies.',
    architecturalNotes: [
      'Cave 3 houses a dated 578 CE inscription of Mangalesha alongside monumental reliefs of Trivikrama and Narasimha.',
      'Verandah brackets feature flying celestial figures carved from continuous sandstone planes.',
      'Across the lake, the Bhutanatha temple group extends the sandstone skyline directly into the water.',
    ],
    preservationStatus: 'Cliff Stability Monitoring · Salt Efflorescence Mitigation',
    conservationFocus:
      'Sandstone cliffs face seasonal monsoon seepage; conservation engineers monitor rock fractures and protect residual ceiling pigment traces.',
    visitingSeason: 'October to February',
    visitingHours: '09:00 – 17:30 IST Daily',
    etiquette: 'Ascend rock-cut stairways cautiously during wet weather; never touch fragile residual ceiling pigments.',
    coordinatesLabel: '15.9189° N, 75.6767° E',
    image: '/images/badami-caves.jpg',
    imageKey: 'badami-caves',
    altText:
      'Rock-cut Badami Cave Temples carved into red sandstone cliffs in Bagalkot district, Karnataka.',
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
      'Kadamba and Keladi stone shrines preserved alongside biodiversity-rich Western Ghats watersheds and sacred devarakadu groves.',
    editorialIntro:
      'In the mist-draped valleys of Malnad and the Western Ghats, architectural heritage is inseparable from ecological stewardship. Ancient Kadamba-era shrines at Banavasi and Keladi stone sanctuaries stand amidst watersheds shielded by community-protected sacred groves (devarakadus).',
    architecturalNotes: [
      'Madhukeshwara Temple at Banavasi preserves an exquisitely carved stone cot and early Kadamba architectural strata.',
      'Keladi and Ikkeri temples combine Vijayanagara mandapas with sloped roofs suited to heavy Western Ghats monsoons.',
      'Surrounding sacred groves preserve endemic medicinal flora and perennial forest springs.',
    ],
    preservationStatus: 'Community Stewardship · Canopy & Stone Conservation',
    conservationFocus:
      'Balancing careful moss management on humid stone shrines with strict protection of surrounding sacred grove watersheds.',
    visitingSeason: 'November to March (Post-Monsoon Mist)',
    visitingHours: '06:30 – 18:30 IST Daily',
    etiquette: 'Stay on established forest footpaths and respect active temple and sacred grove customs.',
    coordinatesLabel: '14.5342° N, 75.0169° E',
    image: '/images/banavasi-temple.jpg',
    imageKey: 'banavasi-temple',
    altText:
      'Madhukeshwara Temple complex at Banavasi in Uttara Kannada district, ancient Kadamba capital of Karnataka.',
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
      'Along the historic corridor linking Bengaluru and Mysuru, generations of artisan households uphold two of Karnataka’s most recognizable Geographical Indication traditions: vegetable-dyed Channapatna lacquerware and pure mulberry Mysore silk weaving.',
    architecturalNotes: [
      'Aale Mara (Wrightia tinctoria) timber is seasoned before hand-turning on lathes.',
      'Traditional pigments use natural turmeric, indigo, kumkum, and shellac resin.',
      'Nearby Mysuru handloom clusters weave 100% pure mulberry silk with authentic gold-silver zari.',
    ],
    preservationStatus: 'Protected Living Guild · Direct Artisan Support',
    conservationFocus:
      'Safeguarding sustainable Aale Mara timber replanting and supporting apprenticeship stipends so younger artisans remain in craft guilds.',
    visitingSeason: 'Year-round (Morning Workshop Hours)',
    visitingHours: '09:30 – 17:00 IST (Monday – Saturday)',
    etiquette: 'Ask artisans before photographing active lathe or loom work; support certified GI cooperative studios.',
    coordinatesLabel: '12.6518° N, 77.2067° E',
    image: '/images/channapatna-toys.jpg',
    imageKey: 'channapatna-toys',
    altText:
      'Channapatna artisans hand-turning ivory-wood toys finished with natural lac dyes in Ramanagara district.',
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
      'Palm-leaf prasanga manuscripts and elder bhagavata vocal recordings are archived by regional academies.',
    conservationLevel: 'Active Stewardship',
    summary:
      'Dusk-to-dawn musical dance-drama combining rhythmic chande percussion, improvised Kannada/Tulu dialogue, and hand-carved kirita crowns.',
    linkedDestinationSlug: 'malnad-sacred-groves',
    image: '/images/yakshagana.jpg',
    imageKey: 'yakshagana',
    altText: 'Yakshagana artist performing in traditional costume and headgear in Karnataka.',
  },
  {
    id: 'channapatna-mysore-silk',
    title: 'Channapatna Lacquer & Zari Looms',
    region: 'Old Mysore',
    district: 'Ramanagara & Mysuru',
    traditionType: 'GI Material Craft',
    preservationNote:
      'Native Wrightia tinctoria timber groves support non-toxic botanical lac wood-turning workshops.',
    conservationLevel: 'Protected Craft',
    summary:
      'Botanical lac-dyed wooden crafts and pure mulberry silk weaves nurtured through artisan cooperatives across southern Karnataka.',
    linkedDestinationSlug: 'channapatna-artisan-guild',
    image: '/images/mysore-silk.jpg',
    imageKey: 'mysore-silk',
    altText: 'Traditional handloom Mysore silk sarees displaying mulberry silk weave and gold zari borders.',
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
      'Gravity-fed granite channels and terraced pushkaranis engineered to supply the medieval capital at Hampi.',
    linkedDestinationSlug: 'hampi-vittala-ensemble',
    image: '/images/hero-hampi.jpg',
    imageKey: 'hero-hampi',
    altText: 'Vittala Temple stone chariot and granite mandapa courtyard at Hampi.',
  },
  {
    id: 'chalukyan-rock-carving',
    title: 'Vatapi Sandstone Guilds',
    region: 'Kalyana & North',
    district: 'Bagalkot (Badami & Aihole)',
    traditionType: 'Early Deccan Stonecraft',
    preservationNote:
      'Conservation teams monitor monsoon seepage and protect traces of 6th-century mineral ceiling frescoes.',
    conservationLevel: 'Needs Documentation',
    summary:
      'Experimental temple workshops across Badami, Aihole, and Pattadakal where North and South Indian architectural forms converged.',
    linkedDestinationSlug: 'badami-rock-cut-caves',
    image: '/images/badami-caves.jpg',
    imageKey: 'badami-caves',
    altText: 'Rock-cut sandstone sanctuaries at Badami Cave Temples in Bagalkot.',
  },
  {
    id: 'devarakadu-sacred-groves',
    title: 'Devarakadu Sacred Groves',
    region: 'Malnad & Coast',
    district: 'Kodagu & Uttara Kannada',
    traditionType: 'Biocultural Sanctuary',
    preservationNote:
      'Community forest committees and the Karnataka Forest Department map and protect sacred grove boundaries.',
    conservationLevel: 'Needs Documentation',
    summary:
      'Living forest sanctuaries guarded by ancestral village customs that protect Western Ghats watersheds and stone shrines together.',
    linkedDestinationSlug: 'malnad-sacred-groves',
    image: '/images/malnad-groves.jpg',
    imageKey: 'malnad-groves',
    altText: 'Forested Western Ghats hillside view around Talakaveri in Kodagu district.',
  },
  {
    id: 'hoysala-signature-guilds',
    title: 'Signed Hoysala Sculptor Guilds',
    region: 'Old Mysore',
    district: 'Hassan (Belur & Halebidu)',
    traditionType: 'Soapstone Sculpture',
    preservationNote:
      'High-resolution documentation archives 12th-century Kannada epigraphs and individual sculptor signatures on temple friezes.',
    conservationLevel: 'Active Stewardship',
    summary:
      'Master craftsmen left signed inscriptions beneath intricate chloritic schist friezes at Belur and Halebidu.',
    linkedDestinationSlug: 'chennakesava-belur',
    image: '/images/halebidu-temple.jpg',
    imageKey: 'halebidu-temple',
    altText: 'Hoysaleswara Temple at Halebidu showing carved chloritic schist walls and entrance courtyard.',
  },
];

export const REGIONS: KarnatakaRegion[] = [
  'Deccan Plateau',
  'Old Mysore',
  'Malnad & Coast',
  'Kalyana & North',
];
