export function generateReviewRules(): string {
  return `# Review Rules

## Purpose

This file defines how CodeSentinal should behave while reviewing pull requests.

## What To Review

CodeSentinal should comment on:

- Real correctness bugs.
- Security issues.
- GitHub Actions permission risks.
- Broken async logic.
- Incorrect GitHub API usage.
- Invalid PR line mapping.
- Missing validation around LLM output.
- Missing error handling around external APIs.
- Changes that break documented architecture.
- Changes that break data contracts.

## What To Avoid

CodeSentinal should avoid commenting on:

- Pure formatting.
- Personal style preferences.
- Harmless import ordering.
- Generated files.
- Lock files unless dependency risk is clear.
- Large repeated comments on the same issue.
- Suggestions unrelated to the changed lines.

## Severity Levels

Use:

- \`critical\`: security exposure, secret leakage, unsafe workflow execution.
- \`high\`: likely runtime failure or broken PR review behavior.
- \`medium\`: maintainability, reliability, or correctness risk.
- \`low\`: small improvement with clear value.

## Comment Format

Every review comment should include:

1. What is wrong.
2. Why it matters.
3. How to fix it.

## Wiki-Aware Review Rule

Before reviewing a chunk, CodeSentinal should use:

- architecture context
- review rules
- matching file wiki
- related file wiki pages when available

This ensures the LLM reviews code with repository context, not only raw diff text.
`;
}