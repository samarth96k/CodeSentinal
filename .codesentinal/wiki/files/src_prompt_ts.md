# Purpose
`src/prompt.ts` is responsible for generating the structured prompts used by CodeSentinal to conduct automated pull request reviews.

# Responsibilities
- Implementing the `buildReviewPrompt` function to consolidate instructions and context into a format suitable for the LLM.

# Architectural Role
Application Component.

# Critical Review Context
The logic within `buildReviewPrompt` is fundamental to the quality of the generated reviews. Future reviewers should verify that any changes to this file do not inadvertently alter the tone, focus, or instructions provided to the underlying model.

# Related Components
- `src/config/runtimeConfig.js`: Provides runtime configuration settings used during prompt construction.
- `src/wiki/wikiReviewTypes.js`: Defines the structured types that shape the review output format.

# Repository Memory
- The prompt construction logic serves as the central point for adjusting the "review personality" and evaluation criteria of CodeSentinal.
- Ensure that updates to the prompt remain compatible with the schema definitions found in `wikiReviewTypes.js`.
