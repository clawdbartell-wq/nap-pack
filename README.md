# nap-pack

**Single-source-of-truth AEO/SEO directory submission pack generator.**

One YAML config → submission-ready data for 16+ platforms. NAP consistency checking. Zero API keys. Free. MIT.

**Created by [BTizzy](https://github.com/BTizzy) (Ryan Bartell)** — built using Garry Tan's [gstack](https://github.com/garrytan/gstack) methodology.

## Why

Submitting your business to 50+ directories is tedious and error-prone. NAP (Name, Address, Phone) inconsistencies tank your local SEO. Most tools that solve this cost $30-100/mo.

`nap-pack` is free, open source, and generates everything you need from one config file.

## Quick Start

```bash
# Install
bun install

# Generate a starter config
bun run src/cli.ts init my-business.yaml

# Edit the config with your real NAP data
# Then generate your submission pack
bun run src/cli.ts generate my-business.yaml -f markdown -o pack.md
bun run src/cli.ts generate my-business.yaml -f csv -o tracking.csv
```

## Commands

| Command | Description |
|---------|-------------|
| `init [output]` | Generate a starter YAML config |
| `generate <config>` | Generate submission pack (markdown, json, csv) |
| `check <canonical> <submitted>` | Check NAP consistency between two configs |

## Output Formats

- **markdown** — Human-readable submission guide with all fields per platform
- **csv** — Tracking sheet template (platform, status, date, verified NAP)
- **json** — Machine-readable pack for automation
- **all** — All three combined

## NAP Consistency Checker

```bash
# Check if a submitted listing matches your canonical NAP
bun run src/cli.ts check canonical.yaml submitted.yaml
```

Returns a consistency report with per-field diffs. Use this to audit existing listings.

## Platforms Included (16)

Easy (no login): UpCity, Manta, Foursquare, Trustpilot, MapQuest, LinkedIn, Indeed, Glassdoor

Medium (login required): Crunchbase, Yellow Pages, Bing Places, Clutch.co, GoodFirms, Apple Maps

Hard (manual review): Yelp, BBB, Seattle Chamber of Commerce

## Config Format

```yaml
nap:
  name: "Your Company"
  street: "123 Main St"
  city: "Seattle"
  region: "WA"
  postalCode: "98101"
  country: "US"
  phone: "(206) 555-0100"
  website: "https://example.com"
  email: "hello@example.com"

descriptions:
  long: "2000-5000 char description for Crunchbase, UpCity..."
  short: "Under 1000 chars for Foursquare, Yellow Pages..."
  tagline: "140 char tagline"

categories:
  primary: "Human Resources Consulting"
  secondary: ["Recruiting", "Business Consulting"]
  tertiary: ["HR Compliance", "Talent Acquisition"]

social:
  linkedin: "https://linkedin.com/company/yourco"
```

## License

MIT — use it, modify it, ship it.
