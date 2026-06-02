import crypto from "crypto";

import { readTextFile } from "./utils/fileHelpers.js";

import { CONFIG } from "../config/runtimeConfig.js";

import { routeWikiUpdate } from "./wikiRouting.js";

import type {
  WikiMarkdownFileChange,
  WikiUpdatePlan,
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

function buildAppendBlock(
  reason: string,
  content: string
): string {
  const memoryId =
    buildMemoryHash(reason, content);

  const timestamp =
    new Date().toISOString();

  return `

---

## Repository Memory Entry

Memory ID: ${memoryId}

Created At: ${timestamp}

### Reason

${reason.trim()}

### Knowledge

${content.trim()}
`;
}

function extractExistingMemoryIds(
  markdown: string
): Set<string> {
  const ids = new Set<string>();

  const regex =
    /Memory ID:\s*([a-zA-Z0-9]+)/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdown))) {
    ids.add(match[1]);
  }

  return ids;
}

function trimRepositoryMemory(
  markdown: string
): string {
  const sections =
    markdown.split("\n---\n");

  const limit =
    CONFIG.wiki.maxRepositoryMemoryEntries;

  if (sections.length <= limit) {
    return markdown;
  }

  const preservedHeader =
    sections[0];

  const memoryEntries =
    sections.slice(1);

  const trimmedEntries =
    memoryEntries.slice(-limit);

  return [
    preservedHeader,
    ...trimmedEntries,
  ].join("\n---\n");
}

export async function buildWikiMarkdownFileChanges(
  plan: WikiUpdatePlan
): Promise<WikiMarkdownFileChange[]> {
  if (
    !plan.updatesRequired ||
    plan.updates.length === 0
  ) {
    return [];
  }

  const changes: WikiMarkdownFileChange[] =
    [];

  for (const update of plan.updates) {
    const routedUpdate =
      routeWikiUpdate(update);

    if (!routedUpdate) {
      console.log(
        "[CodeSentinal Wiki] Failed to route update."
      );

      continue;
    }

    let existingContent = "";

    try {
      existingContent =
        await readTextFile(
          routedUpdate.wikiFilePath
        );
    } catch (error) {
      console.log(
        `[CodeSentinal Wiki] Failed to read ${routedUpdate.wikiFilePath}`
      );

      console.log(error);

      continue;
    }

    const memoryId =
      buildMemoryHash(
        update.reason,
        update.contentToAppend
      );

    const existingIds =
      extractExistingMemoryIds(
        existingContent
      );

    if (
      existingIds.has(memoryId)
    ) {
      console.log(
        `[CodeSentinal Wiki] Duplicate memory entry skipped: ${routedUpdate.wikiFilePath}`
      );

      continue;
    }

    const appendBlock =
      buildAppendBlock(
        update.reason,
        update.contentToAppend
      );

    const mergedContent =
      existingContent.trimEnd() +
      appendBlock;

    const finalContent =
      trimRepositoryMemory(
        mergedContent
      );

    changes.push({
      path:
        routedUpdate.wikiFilePath,

      content: finalContent,
    });
  }

  return changes;
}