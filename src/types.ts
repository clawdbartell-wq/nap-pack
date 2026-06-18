export interface NAP {
  name: string;
  street: string;
  city: string;
  region: string; // State/Province
  postalCode: string;
  country: string;
  phone: string;
  website: string;
  email: string;
  /** Optional alternate legal name (LLC, Inc) */
  legalName?: string;
  /** Founding year */
  founded?: number;
  /** Employee count (range string like "2-10") */
  employees?: string;
  /** Hours of operation text */
  hours?: string;
}

export interface Descriptions {
  /** Long form (2000-5000 chars) — Crunchbase, UpCity, Manta */
  long: string;
  /** Short form (under 1000 chars) — Foursquare, Yellow Pages, Bing */
  short: string;
  /** 140 char tagline — meta descriptions */
  tagline: string;
}

export interface Categories {
  primary: string;
  secondary: string[];
  tertiary: string[];
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

export interface BusinessConfig {
  nap: NAP;
  descriptions: Descriptions;
  categories: Categories;
  social: SocialLinks;
  /** Optional founders / key people */
  founders?: Array<{
    name: string;
    title: string;
    linkedin?: string;
  }>;
  /** Optional services list — for service-specific platforms */
  services?: string[];
}

export type OutputFormat = "json" | "markdown" | "csv" | "all";

export interface PlatformSubmission {
  platform: string;
  url: string;
  /** Difficulty: easy (no login), medium (login required), hard (manual review) */
  difficulty: "easy" | "medium" | "hard";
  /** Fields to fill in this platform */
  fields: Record<string, string>;
  /** Free-form notes for the human filling this out */
  notes: string[];
  /** Estimated time in minutes */
  estimatedMinutes: number;
  /** Whether SMS / phone verification is needed */
  requiresPhoneVerification: boolean;
}

export interface NAPConsistencyResult {
  /** Field that was checked */
  field: string;
  /** Canonical value */
  canonical: string;
  /** Submitted value (if any) */
  submitted: string | undefined;
  /** True if matches canonical */
  consistent: boolean;
  /** Difference (if inconsistent) */
  diff?: string;
}