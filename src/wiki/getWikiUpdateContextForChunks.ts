import { readTextFile } from "./utils/fileHelpers.js";

import type { ReviewChunk } from "../chunk.js";

import type {
  ReviewChunkWithWikiContext,
  WikiContextDocument,
} from "./wikiReviewTypes.js";

import { analyzeWikiImpact } from "./wikiImpactAnalyzer.js";

import { isSafeWikiMarkdownPath } from "./wikiPathMapper.js";

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
    const content = await readTextFile(path);

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

export async function getWikiUpdateContextForChunks(
  chunks: ReviewChunk[]
): Promise<ReviewChunkWithWikiContext[]> {
  const impact = analyzeWikiImpact(chunks);

  const documents: WikiContextDocument[] = [];

  for (const wikiFile of impact.affectedWikiFiles) {
    const document =
      await loadWikiDocument(
        wikiFile,
        "Selected by impact analysis."
      );

    if (document) {
      documents.push(document);
    }
  }

  const wikiContext = documents
    .map(
      (doc) =>
        `
---
WIKI FILE: ${doc.wikiFilePath}
REASON: ${doc.reason}

${doc.content}
`
    )
    .join("\n");

  return chunks.map((chunk) => ({
    ...chunk,
    wikiDocuments: documents,
    wikiContext,
  }));
}