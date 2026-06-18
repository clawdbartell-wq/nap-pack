import { generateSubmissions } from "./platforms.js";
import { checkNAPConsistency } from "./nap.js";
import type { BusinessConfig, PlatformSubmission, OutputFormat } from "./types.js";

export interface PackResult {
  generatedAt: string;
  totalPlatforms: number;
  totalEstimatedMinutes: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  requiresPhoneVerification: string[];
  submissions: PlatformSubmission[];
}

export function generatePack(config: BusinessConfig): PackResult {
  const submissions = generateSubmissions(config);
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const requiresPhoneVerification: string[] = [];
  let totalEstimatedMinutes = 0;

  for (const s of submissions) {
    byDifficulty[s.difficulty]++;
    totalEstimatedMinutes += s.estimatedMinutes;
    if (s.requiresPhoneVerification) {
      requiresPhoneVerification.push(s.platform);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalPlatforms: submissions.length,
    totalEstimatedMinutes,
    byDifficulty,
    requiresPhoneVerification,
    submissions,
  };
}

export function formatMarkdown(pack: PackResult): string {
  const lines: string[] = [];
  lines.push(`# NAP Pack — Generated ${pack.generatedAt}`);
  lines.push("");
  lines.push(`**Platforms:** ${pack.totalPlatforms}`);
  lines.push(`**Estimated time:** ${pack.totalEstimatedMinutes} minutes`);
  lines.push(`**Difficulty:** ${pack.byDifficulty.easy} easy, ${pack.byDifficulty.medium} medium, ${pack.byDifficulty.hard} hard`);
  lines.push("");

  if (pack.requiresPhoneVerification.length > 0) {
    lines.push("## ⚠️ Phone Verification Required");
    lines.push("");
    for (const p of pack.requiresPhoneVerification) {
      lines.push(`- ${p}`);
    }
    lines.push("");
  }

  // Group by difficulty
  for (const difficulty of ["easy", "medium", "hard"] as const) {
    const items = pack.submissions.filter((s) => s.difficulty === difficulty);
    if (items.length === 0) continue;

    lines.push(`## ${difficulty.toUpperCase()} (${items.length} platforms)`);
    lines.push("");

    for (const s of items) {
      lines.push(`### ${s.platform}`);
      lines.push("");
      lines.push(`**URL:** ${s.url}`);
      lines.push(`**Est. time:** ${s.estimatedMinutes} min`);
      if (s.requiresPhoneVerification) lines.push("**⚠️ Phone verification required**");
      lines.push("");
      lines.push("| Field | Value |");
      lines.push("|-------|-------|");
      for (const [key, value] of Object.entries(s.fields)) {
        lines.push(`| ${key} | ${value} |`);
      }
      lines.push("");
      if (s.notes.length > 0) {
        lines.push("**Notes:**");
        for (const note of s.notes) {
          lines.push(`- ${note}`);
        }
        lines.push("");
      }
      lines.push("---");
      lines.push("");
    }
  }

  // Tracking sheet
  lines.push("## Tracking Sheet");
  lines.push("");
  lines.push("| Platform | Status | Date | Verified NAP | Notes |");
  lines.push("|----------|--------|------|--------------|-------|");
  for (const s of pack.submissions) {
    lines.push(`| ${s.platform} | ⬜ Pending | | | |`);
  }
  lines.push("");

  return lines.join("\n");
}

export function formatCSV(pack: PackResult): string {
  const lines: string[] = [];
  lines.push("platform,url,difficulty,estimated_minutes,requires_phone_verification,status,date_submitted,verified_nap,notes");
  for (const s of pack.submissions) {
    const notes = s.notes.join("; ").replace(/,/g, ";");
    lines.push(
      `"${s.platform}","${s.url}","${s.difficulty}",${s.estimatedMinutes},${s.requiresPhoneVerification},"pending",,"","${notes}"`,
    );
  }
  return lines.join("\n");
}

export function formatJSON(pack: PackResult): string {
  return JSON.stringify(pack, null, 2);
}

export function outputPack(pack: PackResult, format: OutputFormat): string {
  switch (format) {
    case "markdown":
      return formatMarkdown(pack);
    case "csv":
      return formatCSV(pack);
    case "json":
      return formatJSON(pack);
    case "all":
      return JSON.stringify(
        {
          markdown: formatMarkdown(pack),
          csv: formatCSV(pack),
          json: pack,
        },
        null,
        2,
      );
    default:
      return formatMarkdown(pack);
  }
}