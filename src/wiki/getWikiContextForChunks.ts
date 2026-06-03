import { readTextFile } from "./utils/fileHelpers.js";
import {getRelevantMemories,} from "./repositoryMemoryRetriever.js";
import {
  getCoreWikiPathsForReview,
  isSafeWikiMarkdownPath,
  sourcePathToWikiPath,
} from "./wikiPathMapper.js";
import { debugJson } from "./utils/debugLogger.js";
import { CONFIG } from "../config/runtimeConfig.js";

import type {
  ReviewChunkWithWikiContext,
  WikiContextDocument,
  ReviewPromptBundle
} from "./wikiReviewTypes.js";

import type { ReviewChunk } from "../chunk.js";

const MAX_DOC_CHARS =
  CONFIG.review.maxWikiDocumentChars;

const MAX_CONTEXT_CHARS =
  CONFIG.review.maxContextCharsPerChunk;

function trimContent(
  content: string,
  maxChars: number
): string {
  if (content.length <= maxChars) {
    return content;
  }

  return (
    content.slice(0, maxChars) +
    "\n\n<!-- trimmed -->"
  );
}

async function loadWikiDocument(
  wikiFilePath: string,
  reason: string
): Promise<WikiContextDocument | null> {
  if (!isSafeWikiMarkdownPath(wikiFilePath)) {
    return null;
  }

  const content =
    await readTextFile(wikiFilePath);

  if (!content.trim()) {
    return null;
  }

  return {
    wikiFilePath,
    reason,
    content: trimContent(
      content,
      MAX_DOC_CHARS
    ),
  };
}

function dedupeDocuments(
  docs: WikiContextDocument[]
): WikiContextDocument[] {
  const seen = new Set<string>();

  return docs.filter((doc) => {
    if (seen.has(doc.wikiFilePath)) {
      return false;
    }

    seen.add(doc.wikiFilePath);

    return true;
  });
}

function memoryToDocument(
  memory: Awaited<
    ReturnType<
      typeof getRelevantMemories
    >
  >[number]
): WikiContextDocument {
  return {
    wikiFilePath:
      `.codesentinal/wiki/repository-memory.md#${memory.memoryId}`,

    reason:
      `Repository memory match (score=${memory.score})`,

    content: `
Section: ${memory.section}

Reason:
${memory.reason}

Knowledge:
${memory.knowledge}
`.trim(),
  };
}

function buildWikiContextText(
  documents: WikiContextDocument[]
): string {
  let result = "";

  for (const doc of documents) {
    result += `
---
WIKI FILE: ${doc.wikiFilePath}
REASON: ${doc.reason}

${doc.content}
`;
  }

  return trimContent(
    result.trim(),
    MAX_CONTEXT_CHARS
  );
}

async function loadGlobalWikiDocuments(): Promise<
  WikiContextDocument[]
> {
  const docs: WikiContextDocument[] = [];

  for (const path of getCoreWikiPathsForReview()) {
    const doc =
      await loadWikiDocument(
        path,
        "Global repository review context."
      );

    if (doc) {
      docs.push(doc);
    }
  }

  return dedupeDocuments(docs);
}

export async function getWikiContextForChunks(
  chunks: ReviewChunk[]
): Promise<ReviewPromptBundle> {
  if (chunks.length === 0) {
    return {
      globalContext: "",
      chunks: [],
    };
  }

  const globalDocuments =
    await loadGlobalWikiDocuments();

  const globalContext =
    buildWikiContextText(
      globalDocuments
    );

  const results:
    ReviewChunkWithWikiContext[] = [];

  for (const chunk of chunks) {
    const docs: WikiContextDocument[] =
      [];

    const fileWikiPath =
      sourcePathToWikiPath(
        chunk.filename
      );

    const fileDoc =
      await loadWikiDocument(
        fileWikiPath,
        `File-level wiki context for ${chunk.filename}`
      );

    if (fileDoc) {
      docs.push(fileDoc);
    }

    const relevantMemories =
      await getRelevantMemories(
        chunk,
        CONFIG.review.maxRepositoryMemoriesPerChunk
      );

    CONFIG.debug.enabled &&
      console.log(
        JSON.stringify(
          {
            file:
              chunk.filename,

            selectedMemories:
              relevantMemories.map(
                (memory) => ({
                  memoryId:
                    memory.memoryId,

                  section:
                    memory.section,

                  score:
                    memory.score,
                })
              ),
          },
          null,
          2
        )
      );

    for (const memory of relevantMemories) {
      docs.push(
        memoryToDocument(
          memory
        )
      );
    }

    const uniqueDocs =
      dedupeDocuments(docs);

    const chunkSpecificContext =
      buildWikiContextText(
        uniqueDocs
      );

    results.push({
      ...chunk,

      wikiDocuments:
        uniqueDocs,

      wikiContext:
        chunkSpecificContext,
    });
  }

  debugJson(
    "WIKI_REVIEW_CONTEXT_STATS",
    {
      chunks:
        results.length,

      globalDocuments:
        globalDocuments.length,

      globalContextChars:
        globalContext.length,

      chunkContexts:
        results.map(
          (chunk) => ({
            file:
              chunk.filename,

            contextChars:
              chunk.wikiContext.length,
          })
        ),
    }
  );

  return {
    globalContext,
    chunks: results,
  };
}