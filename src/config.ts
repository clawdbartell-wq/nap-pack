import { readFileSync } from "fs";
import { parse } from "yaml";
import type { BusinessConfig } from "./types.js";

export function loadConfig(path: string): BusinessConfig {
  const raw = readFileSync(path, "utf-8");
  const data = parse(raw) as Record<string, unknown>;

  if (!data.nap) throw new Error("Config missing 'nap' section");
  if (!data.descriptions) throw new Error("Config missing 'descriptions' section");
  if (!data.categories) throw new Error("Config missing 'categories' section");

  const nap = data.nap as Record<string, unknown>;
  const desc = data.descriptions as Record<string, unknown>;
  const cats = data.categories as Record<string, unknown>;
  const social = (data.social || {}) as Record<string, unknown>;

  return {
    nap: {
      name: String(nap.name || ""),
      street: String(nap.street || ""),
      city: String(nap.city || ""),
      region: String(nap.region || ""),
      postalCode: String(nap.postalCode || ""),
      country: String(nap.country || "US"),
      phone: String(nap.phone || ""),
      website: String(nap.website || ""),
      email: String(nap.email || ""),
      legalName: nap.legalName ? String(nap.legalName) : undefined,
      founded: nap.founded ? Number(nap.founded) : undefined,
      employees: nap.employees ? String(nap.employees) : undefined,
      hours: nap.hours ? String(nap.hours) : undefined,
    },
    descriptions: {
      long: String(desc.long || ""),
      short: String(desc.short || ""),
      tagline: String(desc.tagline || ""),
    },
    categories: {
      primary: String(cats.primary || ""),
      secondary: Array.isArray(cats.secondary) ? cats.secondary.map(String) : [],
      tertiary: Array.isArray(cats.tertiary) ? cats.tertiary.map(String) : [],
    },
    social: {
      linkedin: social.linkedin ? String(social.linkedin) : undefined,
      twitter: social.twitter ? String(social.twitter) : undefined,
      facebook: social.facebook ? String(social.facebook) : undefined,
      instagram: social.instagram ? String(social.instagram) : undefined,
      youtube: social.youtube ? String(social.youtube) : undefined,
      github: social.github ? String(social.github) : undefined,
    },
    founders: Array.isArray(data.founders)
      ? data.founders.map((f: Record<string, unknown>) => ({
          name: String(f.name || ""),
          title: String(f.title || ""),
          linkedin: f.linkedin ? String(f.linkedin) : undefined,
        }))
      : undefined,
    services: Array.isArray(data.services) ? data.services.map(String) : undefined,
  };
}

export function validateConfig(config: BusinessConfig): string[] {
  const errors: string[] = [];
  const nap = config.nap;

  if (!nap.name) errors.push("nap.name is required");
  if (!nap.street) errors.push("nap.street is required");
  if (!nap.city) errors.push("nap.city is required");
  if (!nap.region) errors.push("nap.region is required");
  if (!nap.postalCode) errors.push("nap.postalCode is required");
  if (!nap.phone) errors.push("nap.phone is required");
  if (!nap.website) errors.push("nap.website is required");
  if (!nap.email) errors.push("nap.email is required");
  if (!config.descriptions.long) errors.push("descriptions.long is required");
  if (!config.descriptions.short) errors.push("descriptions.short is required");
  if (!config.descriptions.tagline) errors.push("descriptions.tagline is required");
  if (!config.categories.primary) errors.push("categories.primary is required");

  // Phone format check (basic)
  if (nap.phone && !/[\d\-\(\)\s\+]{7,}/.test(nap.phone)) {
    errors.push("nap.phone doesn't look like a valid phone number");
  }

  // URL format check
  if (nap.website) {
    try {
      new URL(nap.website);
    } catch {
      errors.push("nap.website is not a valid URL");
    }
  }

  return errors;
}