# CodeSentinal Review Rules

These rules define the standard for CodeSentinal's automated pull request reviews. The AI must prioritize high-impact feedback while ignoring superficial concerns.

## Core Directives
- **Correctness:** Identify logical flaws, race conditions, edge-case failures, and incorrect API usage.
- **Security:** Detect vulnerabilities such as improper input sanitization, insecure dependency usage, and credential exposure.
- **Architecture:** Ensure changes align with the modular design of CodeSentinal (e.g., preserving the separation between Infrastructure Adapters and the AI Integration Layer).
- **Strictly No Style/Formatting:** Never provide feedback on indentation, whitespace, naming conventions, or linting-only issues.

---

## Component-Specific Review Focus

### 1. Change Processing Layer (`src/diffParser.ts`, `src/types/parse-diff.d.ts`)
*   **Focus:** Ensure the integrity of the diff parsing. Look for regressions in chunk boundary detection or potential data loss when processing multi-file changes.

### 2. AI Integration Layer (`src/llm.ts`, `src/wiki/llmWikiGenerator.ts`, `src/wiki/llmWikiPrompts.ts`)
*   **Focus:** Validate prompt construction logic. Ensure that the communication with the LLM is robust and that token constraints or context window limitations are handled gracefully.

### 3. Repository Knowledge Layer (`src/wiki/reviewDeduplicator.ts`, `src/wiki/wikiReviewTypes.ts`)
*   **Focus:** Verify the logic behind deduplication and knowledge synthesis. Ensure that "repository memory" is updated reliably and that stale information is correctly discarded.

### 4. Infrastructure Adapter (`.github/workflows/*.yml`, `src/github.ts`, `src/githubRetry.ts`)
*   **Focus:** Validate API interaction patterns. Ensure that retry logic in `githubRetry.ts` is resilient and that GitHub Actions workflows follow security best practices (e.g., token scoping and environment variable handling).

### 5. Review Engine (`examples/mantainer-codesentinal-fork-review-only.yml`)
*   **Focus:** Ensure the review generation logic effectively interprets the input from the Change Processing Layer and that the feedback loop remains objective and actionable.

---

## Output Standards
- **Format:** Return all reviews in valid Markdown.
- **Tone:** Professional, objective, and concise.
- **Actionability:** Every comment must explain the *why* behind the potential issue and provide a concrete suggestion for resolution if the problem is non-obvious.

---

## Repository Memory Entry

Memory ID: cdf8cf931808

Created At: 2026-06-02T10:22:42.569Z

### Reason

Improved auditability of repair operations.

### Knowledge

Wiki repair logs now include execution duration (ms). Future reviewers should ensure that repair performance metrics are preserved in log outputs for monitoring purposes.
