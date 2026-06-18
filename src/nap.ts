import type { NAP, NAPConsistencyResult } from "./types.js";

/**
 * Normalize a phone number for comparison.
 * Removes all non-digit characters and keeps the last 10 digits (US format).
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Normalize a URL for comparison.
 * - Lowercases the host
 * - Removes trailing slash
 * - Removes common tracking params
 */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hostname = u.hostname.toLowerCase();
    let s = `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/$/, "");
    return s;
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, "");
  }
}

/**
 * Normalize a name for comparison.
 * - Lowercases
 * - Removes punctuation
 * - Trims whitespace
 * - Collapses internal spaces
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check NAP consistency between canonical and submitted values.
 */
export function checkConsistency(
  field: keyof NAP,
  canonical: string,
  submitted: string | undefined,
): NAPConsistencyResult {
  if (submitted === undefined || submitted === null || submitted === "") {
    return { field, canonical, submitted, consistent: false, diff: "missing" };
  }

  let normalizedCanonical = canonical;
  let normalizedSubmitted = submitted;

  switch (field) {
    case "phone":
      normalizedCanonical = normalizePhone(canonical);
      normalizedSubmitted = normalizePhone(submitted);
      break;
    case "website":
      normalizedCanonical = normalizeUrl(canonical);
      normalizedSubmitted = normalizeUrl(submitted);
      break;
    case "name":
    case "legalName":
      normalizedCanonical = normalizeName(canonical);
      normalizedSubmitted = normalizeName(submitted);
      break;
    case "email":
      normalizedCanonical = canonical.toLowerCase().trim();
      normalizedSubmitted = submitted.toLowerCase().trim();
      break;
    case "city":
    case "region":
    case "country":
      normalizedCanonical = canonical.toLowerCase().trim();
      normalizedSubmitted = submitted.toLowerCase().trim();
      break;
    case "postalCode":
      normalizedCanonical = canonical.replace(/\s+/g, "").toUpperCase();
      normalizedSubmitted = submitted.replace(/\s+/g, "").toUpperCase();
      break;
    default:
      // street — do basic trim/whitespace normalization
      normalizedCanonical = canonical.replace(/\s+/g, " ").trim();
      normalizedSubmitted = submitted.replace(/\s+/g, " ").trim();
  }

  const consistent = normalizedCanonical === normalizedSubmitted;
  return {
    field,
    canonical,
    submitted,
    consistent,
    diff: consistent ? undefined : `expected "${canonical}", got "${submitted}"`,
  };
}

/**
 * Run all NAP consistency checks.
 */
export function checkNAPConsistency(
  canonical: NAP,
  submitted: Partial<NAP>,
): NAPConsistencyResult[] {
  const results: NAPConsistencyResult[] = [];
  for (const field of Object.keys(canonical) as Array<keyof NAP>) {
    if (field === "legalName" || field === "founded" || field === "employees" || field === "hours") {
      continue;
    }
    results.push(checkConsistency(field, canonical[field] as string, submitted[field] as string | undefined));
  }
  return results;
}

/**
 * Format NAP as a single-line address (US-style).
 */
export function formatAddress(nap: NAP, format: "one-line" | "multi" = "one-line"): string {
  if (format === "multi") {
    return `${nap.name}\n${nap.street}\n${nap.city}, ${nap.region} ${nap.postalCode}\n${nap.country}`;
  }
  return `${nap.street}, ${nap.city}, ${nap.region} ${nap.postalCode}`;
}