import { readTextFile } from "./utils/fileHelpers.js";
import { isSafeWikiMarkdownPath } from "./wikiPathMapper.js";
import type {
  WikiMarkdownFileChange,
  WikiUpdatePlan,
} from "./wikiReviewTypes.js";

function buildAppendBlock(reason: string, content: string): string {
  return `

---

## CodeSentinal Wiki Update

**Reason:** ${reason}

${content.trim()}
`;
}

export async function buildWikiMarkdownFileChanges(
  plan: WikiUpdatePlan
): Promise<WikiMarkdownFileChange[]> {
  if (!plan.updatesRequired || plan.updates.length === 0) {
    return [];
  }

  const changes: WikiMarkdownFileChange[] = [];

  for (const update of plan.updates) {
    if (!isSafeWikiMarkdownPath(update.wikiFilePath)) {
      console.log(
        "[CodeSentinal Wiki] Unsafe wiki path skipped:",
        update.wikiFilePath
      );
      continue;
    }

    const existingContent = await readTextFile(update.wikiFilePath);

    const appendBlock = buildAppendBlock(
      update.reason,
      update.contentToAppend
    );

    if (existingContent.includes(update.contentToAppend.trim())) {
      console.log(
        "[CodeSentinal Wiki] Duplicate wiki update skipped:",
        update.wikiFilePath
      );
      continue;
    }

    changes.push({
      path: update.wikiFilePath,
      content: existingContent.trimEnd() + appendBlock,
    });
  }

  return changes;
}