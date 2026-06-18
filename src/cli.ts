#!/usr/bin/env bun
import { Command } from "commander";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { loadConfig, validateConfig } from "./config.js";
import { generatePack, outputPack } from "./generator.js";
import { checkNAPConsistency } from "./nap.js";
import type { OutputFormat } from "./types.js";

const program = new Command();

program
  .name("nap-pack")
  .description("AEO/SEO directory submission pack generator — single source of truth for NAP consistency")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate submission pack from config")
  .argument("<config>", "Path to YAML config file")
  .option("-f, --format <format>", "Output format: json, markdown, csv, all", "markdown")
  .option("-o, --output <file>", "Output file path (default: stdout)")
  .option("--diff <submitted>", "Path to submitted NAP YAML to diff against canonical")
  .action((configPath: string, options: { format: string; output?: string; diff?: string }) => {
    if (!existsSync(configPath)) {
      console.error(`Config file not found: ${configPath}`);
      process.exit(1);
    }

    const config = loadConfig(configPath);
    const errors = validateConfig(config);
    if (errors.length > 0) {
      console.error("Config validation errors:");
      for (const e of errors) console.error(`  - ${e}`);
      process.exit(1);
    }

    const pack = generatePack(config);
    const format = options.format as OutputFormat;
    const output = outputPack(pack, format);

    if (options.output) {
      const dir = options.output.split("/").slice(0, -1).join("/");
      if (dir) mkdirSync(dir, { recursive: true });
      writeFileSync(options.output, output);
      console.error(`Wrote ${options.output}`);
    } else {
      console.log(output);
    }

    // Diff mode
    if (options.diff) {
      if (!existsSync(options.diff)) {
        console.error(`Submitted NAP file not found: ${options.diff}`);
        process.exit(1);
      }
      const submitted = loadConfig(options.diff);
      const results = checkNAPConsistency(config.nap, submitted.nap);
      console.error("\n--- NAP Consistency Check ---");
      let inconsistent = 0;
      for (const r of results) {
        const status = r.consistent ? "✅" : "❌";
        console.error(`${status} ${r.field}: "${r.canonical}" vs "${r.submitted || "(missing)"}"`);
        if (!r.diff) inconsistent++;
      }
      console.error(`\n${results.length - inconsistent}/${results.length} fields consistent`);
    }
  });

program
  .command("check")
  .description("Check NAP consistency between canonical and submitted")
  .argument("<canonical>", "Path to canonical NAP YAML config")
  .argument("<submitted>", "Path to submitted NAP YAML config")
  .action((canonicalPath: string, submittedPath: string) => {
    if (!existsSync(canonicalPath)) {
      console.error(`Canonical file not found: ${canonicalPath}`);
      process.exit(1);
    }
    if (!existsSync(submittedPath)) {
      console.error(`Submitted file not found: ${submittedPath}`);
      process.exit(1);
    }

    const canonical = loadConfig(canonicalPath);
    const submitted = loadConfig(submittedPath);
    const results = checkNAPConsistency(canonical.nap, submitted.nap);

    console.log("# NAP Consistency Report\n");
    let consistent = 0;
    for (const r of results) {
      const status = r.consistent ? "✅" : "❌";
      console.log(`${status} **${r.field}**: "${r.canonical}" → "${r.submitted || "(missing)"}"`);
      if (r.diff) console.log(`   ${r.diff}`);
      if (r.consistent) consistent++;
    }
    console.log(`\n**Score: ${consistent}/${results.length} fields consistent**`);

    if (consistent < results.length) {
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Generate a starter YAML config file")
  .argument("[output]", "Output file path", "nap-config.yaml")
  .action((output: string) => {
    if (existsSync(output)) {
      console.error(`File already exists: ${output}`);
      process.exit(1);
    }
    const template = `# NAP Pack Configuration
# Single source of truth for your business NAP + descriptions
# Used to generate consistent submissions across 50+ platforms

nap:
  name: "Your Company Name"
  street: "123 Main St, Suite 100"
  city: "Seattle"
  region: "WA"
  postalCode: "98101"
  country: "US"
  phone: "(206) 555-0100"
  website: "https://www.yourcompany.com"
  email: "hello@yourcompany.com"
  legalName: "Your Company Name LLC"  # optional
  founded: 2024                        # optional
  employees: "2-10"                    # optional
  hours: "Mon-Fri 9am-5pm"            # optional

descriptions:
  long: |
    Your Company is a Seattle-based consulting firm serving small professional
    services firms with 5-25 employees. We help law firms, accounting firms,
    consultancies, and financial advisory practices build, scale, and manage
    their teams through HR systems implementation, talent acquisition strategy,
    fractional HR leadership, and compliance.
  short: |
    Seattle-based consulting firm helping small professional services firms
    build and scale their teams through HR systems, recruiting, and compliance.
  tagline: "Seattle talent strategy & consulting for small professional services firms"

categories:
  primary: "Human Resources Consulting"
  secondary:
    - "Recruiting"
    - "Business Consulting"
    - "Professional Services"
  tertiary:
    - "HR Compliance"
    - "Talent Acquisition"
    - "Fractional HR"

social:
  linkedin: "https://linkedin.com/company/yourcompany"
  twitter: "https://twitter.com/yourcompany"
  facebook: ""
  instagram: ""
  youtube: ""

founders:
  - name: "Founder Name"
    title: "Founder & CEO"
    linkedin: "https://linkedin.com/in/founder"

services:
  - "HR Consulting"
  - "Recruiting"
  - "HR Compliance"
  - "Talent Acquisition"
  - "Onboarding"
`;
    writeFileSync(output, template);
    console.log(`Created ${output}`);
    console.log("Edit the file, then run: nap-pack generate nap-config.yaml");
  });

program.parse();