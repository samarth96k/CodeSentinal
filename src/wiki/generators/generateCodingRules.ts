import type { WikiGenerationContext } from "../wikiTypes.js";

export function generateCodingRules(context: WikiGenerationContext): string {
  const { analysis } = context;

  const hasTypeScript = analysis.files.some((f) => f.extension === ".ts" || f.extension === ".tsx");
  const hasGitHubActions = analysis.workflowFiles.length > 0;
  const hasLLMCode = analysis.files.some((f) => f.path.toLowerCase().includes("llm"));

  return `# Coding Rules

## Purpose

This file defines repository-specific coding rules that CodeSentinal should use while reviewing pull requests.

## Detected Project Characteristics

${hasTypeScript ? "- TypeScript project detected." : "- TypeScript not strongly detected."}
${hasGitHubActions ? "- GitHub Actions workflow detected." : "- No GitHub Actions workflow detected."}
${hasLLMCode ? "- LLM integration code detected." : "- LLM integration code not strongly detected."}

## General Rules

CodeSentinal should prefer:

- Small focused functions.
- Clear error handling.
- Explicit input/output types for exported functions.
- Stable public interfaces.
- Safe file system operations.
- No hardcoded secrets.
- No unnecessary workflow write permissions.
- No unvalidated LLM responses.

## TypeScript Rules

CodeSentinal should check:

- Avoid unnecessary \`any\`.
- Avoid unused types/functions.
- Validate parsed JSON before using it.
- Keep imports accurate after refactors.
- Preserve ESM-compatible \`.js\` import paths when required by the project.
- Avoid frontend-only types in Node.js action code.

## GitHub Actions Rules

CodeSentinal should check:

- Use minimum required permissions.
- Avoid unsafe use of \`pull_request_target\`.
- Do not expose secrets to forked pull requests.
- Do not auto-push to contributor branches unless explicitly configured.
- Prefer runtime context generation during PR review.

## LLM Integration Rules

CodeSentinal should check:

- Prompts should be structured and bounded.
- LLM output should be validated before posting comments.
- Large files should be chunked.
- Wiki context should be relevant, not blindly full-repo.
- Review comments should be actionable and mapped to valid PR lines.
`;
}