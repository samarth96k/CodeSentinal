import { CONFIG } from "../config/runtimeConfig.js";
import type { FileAnalysis, RepositoryAnalysis } from "./wikiTypes.js";

function safeJoin(
  values: string[],
  fallback = "None"
): string {
  return values.length > 0
    ? values.join("\n")
    : fallback;
}

function getImportantFiles(
  analysis: RepositoryAnalysis
) {
  return analysis.fileAnalyses.slice(
    0,
    CONFIG.wiki.maxFilesPerBatch
  );
}

export function buildFileWikiPrompt(
  fileAnalysis: FileAnalysis
): string {
  return `
You are generating repository memory for CodeSentinal.

This markdown page will be used later during pull request review.

Goal:
Preserve repository knowledge that helps future reviews.

Generate markdown with these sections only:

# Purpose

# Responsibilities

# Architectural Role

# Critical Review Context

# Maintenance Notes

# Known Constraints

# Related Components

# Repository Memory

Rules:

- Do not invent facts.
- Do not output source code.
- Do not output imports.
- Do not output exports.
- Do not output symbols.
- Use only supplied repository intelligence.
- Optimize for future PR reviews.

Repository Intelligence

File:
${fileAnalysis.file.path}

Purpose:
${fileAnalysis.purpose}

Architectural Role:
${fileAnalysis.architecturalRole}

Responsibilities:
${safeJoin(
  fileAnalysis.inferredResponsibilities
)}

Review Focus Areas:
${safeJoin(
  fileAnalysis.reviewFocusAreas
)}

Risks:
${safeJoin(
  fileAnalysis.risks
)}

Dependencies:
${safeJoin(
  fileAnalysis.dependsOn
)}

Return markdown only.
`;
}

export function buildArchitectureWikiPrompt(
  analysis: RepositoryAnalysis
): string {
  const importantFiles =
    getImportantFiles(analysis);

  return `
Generate architecture.md.

Purpose:
Provide repository architecture context for future PR reviews.

Rules:

- Use only repository facts.
- Do not invent systems.
- Explain architecture.
- Explain major modules.
- Explain data flow.
- Explain review implications.
- Return markdown only.

Tech Stack:

${safeJoin(
  analysis.detectedTechStack
)}

Entrypoints:

${safeJoin(
  analysis.entrypoints
)}

Workflow Files:

${safeJoin(
  analysis.workflowFiles
)}

Configuration Files:

${safeJoin(
  analysis.configFiles
)}

Major Components:

${importantFiles
  .map(
    (f) => `
File: ${f.file.path}
Role: ${f.architecturalRole}
Purpose: ${f.purpose}
Responsibilities:
${safeJoin(
  f.inferredResponsibilities
)}
`
  )
  .join("\n")}
`;
}

export function buildDataContractsWikiPrompt(
  analysis: RepositoryAnalysis
): string {
  const contractFiles =
    analysis.fileAnalyses.filter(
      (item) => {
        const lower =
          item.file.path.toLowerCase();

        return (
          lower.includes("schema") ||
          lower.includes("type") ||
          lower.includes("interface") ||
          item.symbols.some(
            (s) =>
              s.type === "type" ||
              s.type === "interface"
          )
        );
      }
    );

  return `
Generate database-schema.md.

Purpose:
Describe important data contracts used by the repository.

Rules:

- Do not invent schemas.
- Focus on contracts.
- Focus on interfaces.
- Focus on validation structures.
- Focus on payload shapes.
- Return markdown only.

Contract Files:

${contractFiles
  .map(
    (item) => `
File:
${item.file.path}

Purpose:
${item.purpose}

Role:
${item.architecturalRole}
`
  )
  .join("\n")}
`;
}

export function buildCodingRulesWikiPrompt(
  analysis: RepositoryAnalysis
): string {
  return `
Generate coding-rules.md.

Purpose:
Define repository-specific review expectations.

Tech Stack:

${safeJoin(
  analysis.detectedTechStack
)}

Configuration Files:

${safeJoin(
  analysis.configFiles
)}

Workflow Files:

${safeJoin(
  analysis.workflowFiles
)}

Detected Risks:

${safeJoin(
  analysis.fileAnalyses.flatMap(
    (f) => f.risks
  )
)}
`;
}

export function buildReviewRulesWikiPrompt(
  analysis: RepositoryAnalysis
): string {
  const reviewRelevantFiles =
    analysis.fileAnalyses.filter(
      (f) =>
        [
          "review",
          "llm",
          "github",
          "octokit",
          "diff",
          "workflow",
        ].some((keyword) =>
          f.file.path
            .toLowerCase()
            .includes(keyword)
        )
    );

  return `
Generate review-rules.md.

Purpose:
Define how CodeSentinal should review pull requests.

Rules:

- Focus on correctness.
- Focus on security.
- Focus on architecture.
- Avoid style-only comments.
- Avoid formatting comments.
- Return markdown only.

Review-Relevant Components:

${reviewRelevantFiles
  .map(
    (f) => `
${f.file.path}
Role: ${f.architecturalRole}
Purpose: ${f.purpose}
`
  )
  .join("\n")}
`;
}

export function buildIndexWikiPrompt(
  analysis: RepositoryAnalysis,
  fileEntries: string[]
): string {
  return `
Generate index.md.

Purpose:
Serve as the entrypoint for the CodeSentinal wiki.

Repository Statistics

Total Files:
${analysis.files.length}

Source Files:
${analysis.files.filter(
  (f) => f.kind === "source"
).length}

Workflow Files:
${analysis.workflowFiles.length}

Config Files:
${analysis.configFiles.length}

Test Files:
${analysis.testFiles.length}

Tech Stack:

${safeJoin(
  analysis.detectedTechStack
)}

File Wiki Pages:

${safeJoin(fileEntries)}

Return markdown only.
`;
}