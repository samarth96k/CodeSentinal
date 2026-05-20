import { readTextFile } from "./utils/fileHelpers.js";
import {
  getCoreWikiPathsForReview,
  isSafeWikiMarkdownPath,
  sourcePathToWikiPath,
} from "./wikiPathMapper.js";
import type {
  ReviewChunkWithWikiContext,
  WikiContextDocument,
} from "./wikiReviewTypes.js";
import type { ReviewChunk } from "../chunk.js";

const MAX_DOC_CHARS = 3500;
const MAX_CONTEXT_CHARS_PER_CHUNK = 12000;

function trimContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;

  return (
    content.slice(0, maxChars) +
    "\n\n<!-- CodeSentinal: content trimmed for token safety -->"
  );
}

async function loadWikiDocument(
  wikiFilePath: string,
  reason: string
): Promise<WikiContextDocument | null> {
  if (!isSafeWikiMarkdownPath(wikiFilePath)) return null;

  const content = await readTextFile(wikiFilePath);

  if (!content.trim()) return null;

  return {
    wikiFilePath,
    reason,
    content: trimContent(content, MAX_DOC_CHARS),
  };
}

function dedupeDocuments(
  documents: WikiContextDocument[]
): WikiContextDocument[] {
  const seen = new Set<string>();
  const result: WikiContextDocument[] = [];

  for (const doc of documents) {
    if (seen.has(doc.wikiFilePath)) continue;
    seen.add(doc.wikiFilePath);
    result.push(doc);
  }

  return result;
}

function buildWikiContextText(documents: WikiContextDocument[]): string {
  let output = "";

  for (const doc of documents) {
    output += `\n\n---\nWIKI FILE: ${doc.wikiFilePath}\nREASON: ${doc.reason}\n\n${doc.content}`;
  }

  return trimContent(output.trim(), MAX_CONTEXT_CHARS_PER_CHUNK);
}

export async function getWikiContextForChunks(
  chunks: ReviewChunk[]
): Promise<ReviewChunkWithWikiContext[]> {
  const enrichedChunks: ReviewChunkWithWikiContext[] = [];

  for (const chunk of chunks) {
    const documents: WikiContextDocument[] = [];

    for (const corePath of getCoreWikiPathsForReview()) {
      const doc = await loadWikiDocument(
        corePath,
        "Core repository-level wiki context for PR review."
      );

      if (doc) documents.push(doc);
    }

    const matchingFileWikiPath = sourcePathToWikiPath(chunk.filename);

    const fileDoc = await loadWikiDocument(
      matchingFileWikiPath,
      `File-level wiki context for changed file ${chunk.filename}.`
    );

    if (fileDoc) documents.push(fileDoc);

    const uniqueDocuments = dedupeDocuments(documents);

    enrichedChunks.push({
      ...chunk,
      wikiDocuments: uniqueDocuments,
      wikiContext: buildWikiContextText(uniqueDocuments),
    });
  }

  return enrichedChunks;
}