import type { BusinessConfig, PlatformSubmission } from "./types.js";

interface PlatformDef {
  name: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  requiresPhoneVerification: boolean;
  estimatedMinutes: number;
  /** Function to generate platform-specific fields from business config */
  generateFields: (config: BusinessConfig) => Record<string, string>;
  notes: string[];
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

const PLATFORMS: PlatformDef[] = [
  {
    name: "Crunchbase",
    url: "https://www.crunchbase.com/add-new",
    difficulty: "medium",
    requiresPhoneVerification: false,
    estimatedMinutes: 15,
    generateFields: (c) => ({
      "Company Name": c.nap.name,
      "Website": c.nap.website,
      "Headquarters": `${c.nap.city}, ${c.nap.region}`,
      "Founded": String(c.nap.founded || ""),
      "Employees": c.nap.employees || "",
      "Categories": c.categories.primary,
      "Description": truncate(c.descriptions.long, 5000),
      "Short Description": truncate(c.descriptions.tagline, 140),
      "Founder Name": c.founders?.[0]?.name || "",
      "Founder Title": c.founders?.[0]?.title || "",
      "LinkedIn": c.social.linkedin || "",
      "Twitter": c.social.twitter || "",
    }),
    notes: [
      "Register with LinkedIn for faster auth",
      "Add founder with LinkedIn link",
      "Add all social links",
    ],
  },
  {
    name: "UpCity",
    url: "https://upcity.com/get-listed",
    difficulty: "easy",
    requiresPhoneVerification: false,
    estimatedMinutes: 10,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Categories": [c.categories.primary, ...c.categories.secondary].join(", "),
      "Description": truncate(c.descriptions.long, 2000),
      "Services": (c.services || []).join(", "),
    }),
    notes: ["Free listing. No credit card required."],
  },
  {
    name: "Manta",
    url: "https://www.manta.com",
    difficulty: "easy",
    requiresPhoneVerification: false,
    estimatedMinutes: 10,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Categories": c.categories.primary,
      "Description": truncate(c.descriptions.short, 500),
      "Keywords": [c.categories.primary, ...c.categories.secondary, ...c.categories.tertiary].join(", "),
    }),
    notes: ["Free listing. May require email verification."],
  },
  {
    name: "Foursquare",
    url: "https://foursquare.com/business",
    difficulty: "easy",
    requiresPhoneVerification: false,
    estimatedMinutes: 5,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Category": c.categories.primary,
      "Description": truncate(c.descriptions.short, 300),
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region}`,
    }),
    notes: ["Quick listing. Good for local SEO."],
  },
  {
    name: "Yellow Pages",
    url: "https://www.yellowpages.com",
    difficulty: "medium",
    requiresPhoneVerification: true,
    estimatedMinutes: 15,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Categories": [c.categories.primary, ...c.categories.secondary].join(", "),
      "Description": truncate(c.descriptions.short, 500),
      "Hours": c.nap.hours || "By appointment",
    }),
    notes: ["Phone verification required. May take 24-48h for approval."],
  },
  {
    name: "Bing Places",
    url: "https://www.bingplaces.com",
    difficulty: "medium",
    requiresPhoneVerification: true,
    estimatedMinutes: 10,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Categories": c.categories.primary,
      "Description": truncate(c.descriptions.short, 500),
    }),
    notes: ["Phone verification via PIN mailer (5-7 days) or instant phone call."],
  },
  {
    name: "Yelp",
    url: "https://biz.yelp.com/claim",
    difficulty: "hard",
    requiresPhoneVerification: true,
    estimatedMinutes: 20,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Categories": c.categories.primary,
      "Description": truncate(c.descriptions.short, 500),
      "Website": c.nap.website,
      "Hours": c.nap.hours || "By appointment",
    }),
    notes: [
      "Phone verification required.",
      "Yelp may reject if they can't verify the business.",
      "Consider skipping if not a consumer-facing business.",
    ],
  },
  {
    name: "Better Business Bureau",
    url: "https://www.bbb.org",
    difficulty: "hard",
    requiresPhoneVerification: false,
    estimatedMinutes: 30,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Legal Name": c.nap.legalName || c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Founded": String(c.nap.founded || ""),
      "Employees": c.nap.employees || "",
      "Description": truncate(c.descriptions.long, 1000),
    }),
    notes: [
      "Accreditation costs $500+/yr.",
      "Free listing available but limited.",
      "Consider if clients specifically look for BBB rating.",
    ],
  },
  {
    name: "Glassdoor",
    url: "https://www.glassdoor.com/employers",
    difficulty: "medium",
    requiresPhoneVerification: false,
    estimatedMinutes: 10,
    generateFields: (c) => ({
      "Company Name": c.nap.name,
      "Website": c.nap.website,
      "Industry": c.categories.primary,
      "Company Size": c.nap.employees || "",
      "Founded": String(c.nap.founded || ""),
      "Description": truncate(c.descriptions.long, 1000),
    }),
    notes: ["Good for employer brand. Free employer profile."],
  },
  {
    name: "Indeed",
    url: "https://www.indeed.com/hire",
    difficulty: "medium",
    requiresPhoneVerification: false,
    estimatedMinutes: 10,
    generateFields: (c) => ({
      "Company Name": c.nap.name,
      "Website": c.nap.website,
      "Industry": c.categories.primary,
      "Company Size": c.nap.employees || "",
      "Description": truncate(c.descriptions.short, 500),
    }),
    notes: ["Free company page. Good for recruiting credibility."],
  },
  {
    name: "LinkedIn Company",
    url: "https://www.linkedin.com/company/setup/new",
    difficulty: "easy",
    requiresPhoneVerification: false,
    estimatedMinutes: 5,
    generateFields: (c) => ({
      "Company Name": c.nap.name,
      "Website": c.nap.website,
      "Industry": c.categories.primary,
      "Company Size": c.nap.employees || "",
      "Description": truncate(c.descriptions.short, 2000),
    }),
    notes: ["Must have a personal LinkedIn account first."],
  },
  {
    name: "Clutch.co",
    url: "https://clutch.co",
    difficulty: "hard",
    requiresPhoneVerification: false,
    estimatedMinutes: 20,
    generateFields: (c) => ({
      "Company Name": c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.city}, ${c.nap.region}`,
      "Services": (c.services || []).join(", "),
      "Description": truncate(c.descriptions.long, 1000),
      "Min Project Size": "",
      "Hourly Rate": "",
    }),
    notes: [
      "B2B review platform. Requires client reviews for ranking.",
      "Free listing but takes time to get verified.",
    ],
  },
  {
    name: "GoodFirms",
    url: "https://www.goodfirms.co",
    difficulty: "medium",
    requiresPhoneVerification: false,
    estimatedMinutes: 15,
    generateFields: (c) => ({
      "Company Name": c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.city}, ${c.nap.region}`,
      "Categories": c.categories.primary,
      "Description": truncate(c.descriptions.long, 1000),
    }),
    notes: ["Free listing. B2B directory."],
  },
  {
    name: "Trustpilot",
    url: "https://www.trustpilot.com",
    difficulty: "easy",
    requiresPhoneVerification: false,
    estimatedMinutes: 5,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Categories": c.categories.primary,
    }),
    notes: ["Free business profile. Good for social proof."],
  },
  {
    name: "Apple Maps Connect",
    url: "https://mapsconnect.apple.com",
    difficulty: "medium",
    requiresPhoneVerification: true,
    estimatedMinutes: 10,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Categories": c.categories.primary,
      "Website": c.nap.website,
    }),
    notes: ["Phone verification via Apple. Important for Apple Maps presence."],
  },
  {
    name: "MapQuest",
    url: "https://www.mapquest.com",
    difficulty: "easy",
    requiresPhoneVerification: false,
    estimatedMinutes: 5,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Phone": c.nap.phone,
      "Website": c.nap.website,
      "Categories": c.categories.primary,
    }),
    notes: ["Free listing. Quick setup."],
  },
  {
    name: "Seattle Chamber of Commerce",
    url: "https://www.seattlechamber.com",
    difficulty: "hard",
    requiresPhoneVerification: false,
    estimatedMinutes: 20,
    generateFields: (c) => ({
      "Business Name": c.nap.name,
      "Website": c.nap.website,
      "Phone": c.nap.phone,
      "Address": `${c.nap.street}, ${c.nap.city}, ${c.nap.region} ${c.nap.postalCode}`,
      "Description": truncate(c.descriptions.short, 500),
      "Contact Email": c.nap.email,
    }),
    notes: [
      "Membership required ($300+/yr).",
      "Worth it for local B2B credibility in Seattle.",
    ],
  },
];

export function generateSubmissions(config: BusinessConfig): PlatformSubmission[] {
  return PLATFORMS.map((p) => ({
    platform: p.name,
    url: p.url,
    difficulty: p.difficulty,
    requiresPhoneVerification: p.requiresPhoneVerification,
    fields: p.generateFields(config),
    notes: p.notes,
    estimatedMinutes: p.estimatedMinutes,
  }));
}

export function getPlatforms(): string[] {
  return PLATFORMS.map((p) => p.name);
}

export { PLATFORMS };
export type { PlatformDef };