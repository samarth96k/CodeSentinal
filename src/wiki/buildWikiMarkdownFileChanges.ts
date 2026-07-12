import { readTextFile } from "./utils/fileHelpers.js";
import { routeWikiUpdate } from "./wikiRouting.js";
import { debugJson } from "./utils/debugLogger.js";

import type {
  WikiMarkdownFileChange,
  WikiUpdatePlan,
} from "./wikiReviewTypes.js";

import {
  insertIntoRepositoryMemory,
  trimRepositoryMemorySection,
  memoryEntryExists,
} from "./repositoryMemoryWriter.js";

function buildAppendBlock(
  reason: string,
  content: string
): string {
  return `

---

## CodeSentinal Wiki Update

**Reason:** ${reason}

${content.trim()}
`;
}

function normalizeForComparison(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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

  const workingFiles =
    new Map<string, string>();

  for (const update of plan.updates) {
    const routedUpdate =
      routeWikiUpdate(update);

    if (!routedUpdate) {
      console.log(
        "[CodeSentinal Wiki] Failed to route update."
      );

      continue;
    }

    let currentContent =
      workingFiles.get(
        routedUpdate.wikiFilePath
      );

    if (
      currentContent === undefined
    ) {
      try {
        currentContent =
          await readTextFile(
            routedUpdate.wikiFilePath
          );
      } catch {
        console.log(
          `[CodeSentinal Wiki] Unable to read wiki file: ${routedUpdate.wikiFilePath}`
        );

        continue;
      }
    }

    let finalContent =
      currentContent;

    if (
      update.target ===
        "repository-memory" &&
      update.memorySection
    ) {
      if (
        memoryEntryExists(
          finalContent,
          update.reason,
          update.contentToAppend
        )
      ) {
        console.log(
          `[CodeSentinal Wiki] Duplicate memory skipped: ${routedUpdate.wikiFilePath}`
        );

        continue;
      }

      finalContent =
        insertIntoRepositoryMemory(
          finalContent,
          update.memorySection,
          update.reason,
          update.contentToAppend
        );

      finalContent =
        trimRepositoryMemorySection(
          finalContent,
          update.memorySection
        );
    } else {
      const normalizedExisting =
        normalizeForComparison(
          finalContent
        );

      const normalizedNew =
        normalizeForComparison(
          update.contentToAppend
        );

      if (
        normalizedExisting.includes(
          normalizedNew
        )
      ) {
        console.log(
          `[CodeSentinal Wiki] Duplicate update skipped: ${routedUpdate.wikiFilePath}`
        );

        continue;
      }

      const appendBlock =
        buildAppendBlock(
          update.reason,
          update.contentToAppend
        );

      finalContent =
        finalContent.trimEnd() +
        appendBlock;
    }

    workingFiles.set(
      routedUpdate.wikiFilePath,
      finalContent
    );
  }

  const changes =
    Array.from(
      workingFiles.entries()
    ).map(
      ([path, content]) => ({
        path,
        content,
      })
    );

  debugJson(
    "WIKI_MARKDOWN_CHANGES",
    changes
  );

  return changes;
}