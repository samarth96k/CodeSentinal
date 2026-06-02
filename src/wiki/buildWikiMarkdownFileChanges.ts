import { readTextFile } from "./utils/fileHelpers.js";
import { routeWikiUpdate } from "./wikiRouting.js";

import type {
  WikiMarkdownFileChange,
  WikiUpdatePlan,
} from "./wikiReviewTypes.js";

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

  const changes: WikiMarkdownFileChange[] = [];

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
    } catch {
      console.log(
        `[CodeSentinal Wiki] Unable to read wiki file: ${routedUpdate.wikiFilePath}`
      );
      continue;
    }

    const normalizedExisting =
      normalizeForComparison(existingContent);

    const normalizedNew =
      normalizeForComparison(
        routedUpdate.contentToAppend
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
        routedUpdate.reason,
        routedUpdate.contentToAppend
      );

    changes.push({
      path: routedUpdate.wikiFilePath,

      content:
        existingContent.trimEnd() +
        appendBlock,
    });
  }

  return changes;
}