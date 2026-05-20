import type { WikiGenerationContext } from "../wikiTypes.js";

export function generateDatabaseSchema(context: WikiGenerationContext): string {
  const candidates = context.analysis.fileAnalyses.filter((item) => {
    const lower = item.file.path.toLowerCase();

    return (
      lower.includes("schema") ||
      lower.includes("model") ||
      lower.includes("types") ||
      lower.includes("interface") ||
      item.symbols.some((s) => s.type === "type" || s.type === "interface")
    );
  });

  const sections = candidates
    .map((item) => {
      const symbols = item.symbols
        .filter((s) => s.type === "type" || s.type === "interface" || s.type === "class")
        .map((s) => `- \`${s.name}\` — ${s.exported ? "exported" : "internal"} ${s.type}`)
        .join("\n");

      return `## ${item.file.path}

Purpose: ${item.purpose}

${symbols || "- No schema-like symbols detected."}`;
    })
    .join("\n\n");

  return `# Database Schema and Data Contracts

## Purpose

This file tracks database schemas, TypeScript types, interfaces, classes, API contracts, and important internal data structures.

For CodeSentinal, this is important because many bugs come from breaking object shapes used between:

- GitHub API response parsing
- diff parsing
- LLM response validation
- inline comment creation
- workflow configuration

## Detected Contract Files

${sections || "- No schema or contract files detected yet."}

## Review Guidance

When a PR changes these files, CodeSentinal should check:

- Whether required fields were removed or renamed.
- Whether API payload shapes changed.
- Whether downstream code still matches the new type.
- Whether LLM response validation schemas need updates.
- Whether GitHub inline comment payloads remain valid.
- Whether documentation or wiki files need regeneration.
`;
}