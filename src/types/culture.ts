export type CulturalCategorySlug =
  | 'festivals-celebrations'
  | 'traditional-arts'
  | 'folk-music-dance'
  | 'historical-monuments'
  | 'food-cuisine'
  | 'handicrafts-textiles'
  | 'customs-traditions';

export interface CulturalCategoryResource {
  slug: CulturalCategorySlug;
  indexNumber: string;
  title: string;
  subtitle: string;
  description: string;
  imageKey: string;
  altText: string;
}

export interface KarnatakaDistrictResource {
  name: string;
  division: 'Bengaluru' | 'Belagavi' | 'Kalaburagi' | 'Mysuru';
  region: 'Deccan Plateau' | 'Old Mysore' | 'Malnad & Coast' | 'Kalyana & North';
}

export interface CulturalSourceReference {
  title: string;
  organization: string;
  referenceId: string;
  url: string;
}

export interface CulturalRecord {
  id: string;
  slug: string;
  title: string;
  categorySlug: CulturalCategorySlug;
  district: string;
  region: 'Deccan Plateau' | 'Old Mysore' | 'Malnad & Coast' | 'Kalyana & North';
  recognitionOrEra: string;
  summary: string;
  description: string;
  verifiedFacts: string[];
  preservationNote: string;
  imageKey: string;
  altText: string;
  sources: CulturalSourceReference[];
}
