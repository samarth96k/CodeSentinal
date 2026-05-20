import type { WikiGenerationContext } from "../wikiTypes.js";

export function generateIndex(context: WikiGenerationContext): string {
  const { analysis, fileWikiPages } = context;

  const fileEntries = fileWikiPages
    .map((page) => {
      const relativeWikiPath = page.wikiFilePath.replace(".codesentinal/wiki/", "");
      return `- [${page.sourceFilePath}](${relativeWikiPath}) — ${page.summary}`;
    })
    .join("\n");

  return `# CodeSentinal LLM Wiki

## Purpose

This wiki is a persistent repository knowledge base generated from the accepted main branch.

It helps CodeSentinal produce more context-aware pull request reviews by giving the LLM structured knowledge about:

- architecture
- data contracts
- coding rules
- review rules
- file-level responsibilities
- important imports, exports, and risks

## Repository Summary

- Total analyzed files: ${analysis.files.length}
- Source files: ${analysis.files.filter((f) => f.kind === "source").length}
- Workflow files: ${analysis.workflowFiles.length}
- Config files: ${analysis.configFiles.length}
- Test files: ${analysis.testFiles.length}

## Detected Tech Stack

${analysis.detectedTechStack.length ? analysis.detectedTechStack.map((s) => `- ${s}`).join("\n") : "- No major stack detected."}

## Core Wiki Pages

- [Architecture](architecture.md)
- [Database Schema and Data Contracts](database-schema.md)
- [Coding Rules](coding-rules.md)
- [Review Rules](review-rules.md)

## File-by-File Wiki

${fileEntries || "- No file wiki pages generated."}

## How CodeSentinal Uses This Wiki

\`\`\`txt
PR chunk
→ identify changed filename
→ load matching file wiki
→ load architecture and review rules
→ optionally load related file wiki
→ send context + chunk to LLM
→ post context-aware review comment
\`\`\`

## Maintenance

This wiki should be regenerated after code is merged into main.
`;
}