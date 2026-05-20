import type { WikiGenerationContext } from "../wikiTypes.js";

function lines(items: string[], empty: string): string {
  return items.length ? items.map((item) => `- \`${item}\``).join("\n") : `- ${empty}`;
}

export function generateArchitecture(context: WikiGenerationContext): string {
  const { analysis } = context;

  const importantModules = analysis.fileAnalyses
    .filter((item) =>
      ["index", "main", "github", "octokit", "diff", "review", "llm", "wiki"].some((key) =>
        item.file.path.toLowerCase().includes(key)
      )
    )
    .map((item) => item.file.path);

  return `# Architecture

## Purpose

This document describes the high-level architecture detected from the repository. It is generated from accepted main-branch code and used as persistent context for CodeSentinal's AI review system.

## Detected Tech Stack

${analysis.detectedTechStack.length ? analysis.detectedTechStack.map((s) => `- ${s}`).join("\n") : "- No major stack detected."}

## Entrypoints

${lines(analysis.entrypoints, "No obvious entrypoints detected.")}

## Workflow Files

${lines(analysis.workflowFiles, "No GitHub Actions workflows detected.")}

## Configuration Files

${lines(analysis.configFiles, "No major configuration files detected.")}

## Important Modules

${lines(importantModules, "No important modules detected.")}

## Repository Intelligence Flow

\`\`\`txt
Repository
→ Static repository analysis
→ Core wiki generation
→ File-level wiki generation
→ Persistent markdown knowledge base
→ PR review context retrieval
→ Context-aware AI review comments
\`\`\`

## LLM Wiki Architecture

\`\`\`txt
.codesentinal/wiki
│
├── index.md
├── architecture.md
├── database-schema.md
├── coding-rules.md
├── review-rules.md
│
└── files/
    └── one markdown file per analyzed repository file
\`\`\`

## PR Review Usage

During pull request review, CodeSentinal should not send only the raw diff to the LLM. It should combine:

- PR diff chunk
- architecture context
- review rules
- matching file wiki
- related file wiki pages

This allows the AI reviewer to reason with repository-level context instead of reviewing code blindly.

## Maintenance Rule

This architecture file should be regenerated after accepted changes are merged into main.
`;
}