import { readTextFile } from "./utils/fileHelpers.js";

import { CONFIG } from "../config/runtimeConfig.js";

import type { ReviewChunk } from "../chunk.js";

import type {
  ReviewChunkWithWikiContext,
  WikiContextDocument,
} from "./wikiReviewTypes.js";
import .js";

async function loadWikiDocument(
  path: string,
  reason: string
): Promise<WikiContextDocument | null> {
  if (
    path.startsWith(".codesentinal/wiki/") &&
    !isSafeWikiMarkdownPath(path)
  ) {
    return null;
  }

  try {
    const content =
      await readTextFile(path);

    if (!content.trim()) {
      return null;
    }

    return {
      wikiFilePath: path,
      reason,
      content,
    };
  } catch {
    return null;
  }
}

function buildWikiContext(
  docs: WikiContextDocument[]
): string {
  return docs
    .map(
      (doc) => `
---
WIKI FILE: ${doc.wikiFilePath}
REASON: ${doc.reason}

${doc.content}
`
    )
    .join("\n");
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

export async function getWikiUpdateContextForChunks(
  chunks: ReviewChunk[]
): Promise<
  ReviewChunkWithWikiContext[]
> {
  if (chunks.length === 0) {
    return [];
  }

  const impact =
    analyzeWikiImpact(chunks);

  const selectedDocuments =
    impact.impactedDocuments.slice(
      0,
      CONFIG.wiki.maxWikiDocsForUpdatePlanner
    );

  const documents: WikiContextDocument[] =
    [];

  const seen =
    new Set<string>();

  for (const impactedDoc of selectedDocuments) {
    if (
      seen.has(
        impactedDoc.path
      )
    ) {
      continue;
    }

    seen.add(
      impactedDoc.path
    );

    const document =
      await loadWikiDocument(
        impactedDoc.path,
        impactedDoc.reason
      );

    if (document) {
      documents.push(document);
    }
  }

  const memoryMap =
    new Map<
      string,
      ReturnType<
        typeof memoryToDocument
      >
    >();

  for (const chunk of chunks) {
    const memories =
      await getRelevantMemories(
        chunk,
        CONFIG.review
          .maxRepositoryMemoriesPerChunk
      );

    debugJson(
      "WIKI_UPDATE_MEMORY_RETRIEVAL",
      {
        file:
          chunk.filename,

        selectedMemories:
          memories.map(
            (memory) => ({
              memoryId:
                memory.memoryId,

              section:
                memory.section,

              score:
                memory.score,
            })
          ),
      }
    );

    for (const memory of memories) {
      memoryMap.set(
        memory.memoryId,
        memoryToDocument(memory)
      );
    }
  }

  documents.push(
    ...memoryMap.values()
  );

  const wikiContext =
    buildWikiContext(
      documents
    );

  debugJson(
    "WIKI_UPDATE_CONTEXT",
    {
      impactedDocuments:
        documents.map(
          (doc) => ({
            path:
              doc.wikiFilePath,

            reason:
              doc.reason,
          })
        ),
    }
  );

  return chunks.map(
    (chunk) => ({
      ...chunk,

      wikiDocuments:
        documents,

      wikiContext,
    })
  );
}