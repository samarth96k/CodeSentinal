import crypto from "crypto";

import { CONFIG } from "../config/runtimeConfig.js";

import type {
  RepositoryMemorySection,
} from "./wikiReviewTypes.js";

function buildMemoryHash(
  reason: string,
  content: string
): string {
  return crypto
    .createHash("sha256")
    .update(reason.trim())
    .update(content.trim())
    .digest("hex")
    .slice(0, 12);
}

function buildMemoryEntry(
  reason: string,
  content: string
): string {
  const memoryId =
    buildMemoryHash(reason, content);

  const timestamp =
    new Date().toISOString();

  return `
### Memory ID: ${memoryId}

Created At: ${timestamp}

**Reason**

${reason.trim()}

**Knowledge**

${content.trim()}

---
`;
}

export function memoryEntryExists(
  markdown: string,
  reason: string,
  content: string
): boolean {
  const memoryId =
    buildMemoryHash(reason, content);

  if (
    markdown.includes(
      `Memory ID: ${memoryId}`
    )
  ) {
    return true;
  }

  return markdown.includes(
    content.trim()
  );
}

function findSectionPosition(
  markdown: string,
  section: RepositoryMemorySection
): number {
  const header =
    `## ${section}`;

  const position =
    markdown.indexOf(header);

  if (position === -1) {
    throw new Error(
      `Repository memory section not found: ${section}`
    );
  }

  return position;
}

export function insertIntoRepositoryMemory(
  markdown: string,
  section: RepositoryMemorySection,
  reason: string,
  content: string
): string {
  if (
    memoryEntryExists(
      markdown,
      reason,
      content
    )
  ) {
    return markdown;
  }

  const position =
    findSectionPosition(
      markdown,
      section
    );

  const entry =
    buildMemoryEntry(
      reason,
      content
    );

  const nextSectionMatch =
    markdown
      .slice(position + 1)
      .match(/\n## /);

  if (!nextSectionMatch) {
    return (
      markdown.trimEnd() +
      "\n\n" +
      entry
    );
  }

  const insertPosition =
    position +
    1 +
    nextSectionMatch.index!;

  return (
    markdown.slice(
      0,
      insertPosition
    ) +
    "\n" +
    entry +
    markdown.slice(
      insertPosition
    )
  );
}

export function trimRepositoryMemorySection(
  markdown: string,
  section: RepositoryMemorySection
): string {
  const limit =
    CONFIG.wiki.maxRepositoryMemoryEntries;

  const header =
    `## ${section}`;

  const start =
    markdown.indexOf(header);

  if (start === -1) {
    return markdown;
  }

  const remainder =
    markdown.slice(start);

  const nextSectionMatch =
    remainder
      .slice(header.length)
      .match(/\n## /);

  const end =
    nextSectionMatch
      ? start +
        header.length +
        nextSectionMatch.index!
      : markdown.length;

  const sectionContent =
    markdown.slice(start, end);

  const entries =
    sectionContent.split(
      "### Memory ID:"
    );

  if (
    entries.length - 1 <= limit
  ) {
    return markdown;
  }

  const preservedHeader =
    entries[0];

  const trimmedEntries =
    entries
      .slice(-limit)
      .map(
        (entry) =>
          `### Memory ID:${entry}`
      );

  const rebuiltSection =
    preservedHeader +
    trimmedEntries.join("");

  return (
    markdown.slice(0, start) +
    rebuiltSection +
    markdown.slice(end)
  );
}