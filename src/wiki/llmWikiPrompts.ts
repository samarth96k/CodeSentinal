import type { FileAnalysis, RepositoryAnalysis } from "./wikiTypes.js";

export function buildFileWikiPrompt(fileAnalysis: FileAnalysis): string {
  const { file } = fileAnalysis;

  return `
You are generating an LLM Wiki markdown page for a code repository.

Write a clean, technical, factual markdown document for this file.

Rules:
- Do not invent facts.
- Use only the provided file content and extracted metadata.
- Be concise but useful for future AI code review.
- Explain what this file does, important functions, risks, and how PR changes should be reviewed.
- Return markdown only.

File path:
${file.path}

File kind:
${file.kind}

Imports:
${fileAnalysis.imports.join("\n") || "None"}

Exports:
${fileAnalysis.exports.join("\n") || "None"}

Symbols:
${fileAnalysis.symbols
  .map((s) => `${s.name} - ${s.type} - ${s.exported ? "exported" : "internal"}`)
  .join("\n") || "None"}

Detected local dependencies:
${fileAnalysis.dependsOn.join("\n") || "None"}

Static purpose guess:
${fileAnalysis.purpose}

Risk notes:
${fileAnalysis.risks.join("\n") || "None"}

File content:
\`\`\`
${file.content.slice(0, 9000)}
\`\`\`
`;
}

export function buildArchitectureWikiPrompt(analysis: RepositoryAnalysis): string {
  return `
You are generating architecture.md for an LLM Wiki.

This wiki will be used by an AI pull request reviewer to understand the repository before reviewing code.

Rules:
- Do not invent external systems.
- Use only the repository facts provided.
- Explain architecture, major modules, workflows, and data flow.
- Mention how this architecture should guide PR review.
- Return markdown only.

Detected tech stack:
${analysis.detectedTechStack.join("\n") || "None"}

Entrypoints:
${analysis.entrypoints.join("\n") || "None"}

Workflow files:
${analysis.workflowFiles.join("\n") || "None"}

Config files:
${analysis.configFiles.join("\n") || "None"}

Files and purposes:
${analysis.fileAnalyses
  .map((f) => `- ${f.file.path}: ${f.purpose}`)
  .join("\n")}
`;
}

export function buildDataContractsWikiPrompt(analysis: RepositoryAnalysis): string {
  const contractFiles = analysis.fileAnalyses.filter((item) => {
    const lower = item.file.path.toLowerCase();
    return (
      lower.includes("schema") ||
      lower.includes("type") ||
      lower.includes("interface") ||
      item.symbols.some((s) => s.type === "type" || s.type === "interface")
    );
  });

  return `
Generate database-schema.md for CodeSentinal's LLM Wiki.

Important:
This repo may not have a real database. In that case, treat this as "data contracts and internal object shapes".

Rules:
- Do not invent schemas.
- Focus on TypeScript types, interfaces, validation schemas, GitHub API payloads, LLM response shapes, and important object structures.
- Explain what PR reviewers should check when these contracts change.
- Return markdown only.

Contract-like files:
${contractFiles
  .map(
    (item) => `
File: ${item.file.path}
Purpose: ${item.purpose}
Symbols:
${item.symbols.map((s) => `- ${s.name}: ${s.type}`).join("\n") || "None"}
`
  )
  .join("\n")}
`;
}

export function buildCodingRulesWikiPrompt(analysis: RepositoryAnalysis): string {
  return `
Generate coding-rules.md for this repository's LLM Wiki.

Rules:
- Infer coding rules only from provided repository facts.
- Include TypeScript, GitHub Actions, LLM, security, and maintainability rules if relevant.
- These rules will guide an AI PR reviewer.
- Return markdown only.

Tech stack:
${analysis.detectedTechStack.join("\n") || "None"}

Config files:
${analysis.configFiles.join("\n") || "None"}

Workflow files:
${analysis.workflowFiles.join("\n") || "None"}

Risk patterns found:
${analysis.fileAnalyses
  .flatMap((f) => f.risks.map((risk) => `${f.file.path}: ${risk}`))
  .join("\n") || "None"}
`;
}

export function buildReviewRulesWikiPrompt(analysis: RepositoryAnalysis): string {
  return `
Generate review-rules.md for CodeSentinal.

This file defines how the AI reviewer should behave while reviewing pull requests.

Rules:
- Focus on meaningful review comments.
- Avoid noisy style-only comments.
- Include severity guidance.
- Include GitHub Actions security rules.
- Include LLM output validation rules.
- Include when wiki updates should be suggested.
- Return markdown only.

Repository facts:
Tech stack:
${analysis.detectedTechStack.join("\n") || "None"}

Important files:
${analysis.fileAnalyses
  .filter((f) =>
    ["review", "llm", "github", "octokit", "diff", "workflow"].some((k) =>
      f.file.path.toLowerCase().includes(k)
    )
  )
  .map((f) => `- ${f.file.path}: ${f.purpose}`)
  .join("\n") || "None"}
`;
}

export function buildIndexWikiPrompt(
  analysis: RepositoryAnalysis,
  fileEntries: string[]
): string {
  return `
Generate index.md for CodeSentinal's LLM Wiki.

Rules:
- This is the entry point for the wiki.
- Explain what this wiki is.
- Link to core wiki pages.
- Include file-by-file wiki entries.
- Return markdown only.

Stats:
Total files: ${analysis.files.length}
Source files: ${analysis.files.filter((f) => f.kind === "source").length}
Workflow files: ${analysis.workflowFiles.length}
Config files: ${analysis.configFiles.length}
Test files: ${analysis.testFiles.length}

Tech stack:
${analysis.detectedTechStack.join("\n") || "None"}

File wiki entries:
${fileEntries.join("\n")}
`;
}