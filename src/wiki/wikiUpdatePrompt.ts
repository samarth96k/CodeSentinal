import type { ReviewChunkWithWikiContext } from "./wikiReviewTypes.js";

export function buildWikiUpdatePrompt(
  chunks: ReviewChunkWithWikiContext[]
): string {
  const compactChunks = chunks.map((chunk) => ({
    filename: chunk.filename,
    startLine: chunk.startLine,
    endLine: chunk.endLine,
    codeWithContext: chunk.codeWithContext,
    addedLines: chunk.addedLines,
    removedLines: chunk.removedLines,
    metadata: chunk.metadata,
    wikiDocuments: chunk.wikiDocuments.map((doc) => ({
      wikiFilePath: doc.wikiFilePath,
      reason: doc.reason,
      content: doc.content,
    })),
  }));

  return `
You are CodeSentinal's LLM Wiki maintenance engine.

Your task:
Analyze the pull request changes and decide whether any existing LLM Wiki markdown files need new appended information.

Important:
- You must ONLY suggest updates to .codesentinal/wiki/**/*.md files.
- Do NOT suggest changes to source code files.
- Do NOT suggest updates for formatting-only, whitespace-only, comment-only, or insignificant changes.
- Do NOT repeat existing wiki content.
- If the PR does not introduce meaningful architectural, data-contract, review-behavior, workflow, API, security, or file-responsibility changes, return updatesRequired=false.
- Prefer concise append-only updates.
- All needed wiki file updates must be returned in ONE JSON response.

Return JSON only.

Schema:
{
  "updatesRequired": true,
  "summary": "Short summary of why wiki updates are needed.",
  "updates": [
    {
      "wikiFilePath": ".codesentinal/wiki/files/src_index_ts.md",
      "changeType": "append",
      "reason": "Why this wiki file should be updated.",
      "contentToAppend": "Markdown content to append."
    }
  ]
}

If no update is needed:
{
  "updatesRequired": false,
  "summary": "No significant wiki update required.",
  "updates": []
}

Pull request chunks with related wiki context:
${JSON.stringify(compactChunks, null, 2)}
`;
}