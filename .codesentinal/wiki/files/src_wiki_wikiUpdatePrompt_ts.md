# Purpose
The `wikiUpdatePrompt.ts` file serves as a core component of the LLM-driven Wiki system, responsible for generating, reading, and maintaining repository-level knowledge.

# Responsibilities
- Generation of repository memory documentation.
- Management of the Wiki lifecycle within the codebase.

# Architectural Role
Repository Knowledge Layer

# Critical Review Context
When reviewing changes to this file, focus on:
- **Knowledge Consistency:** Ensure that the generated memory remains accurate, up-to-date, and aligned with the actual repository state.
- **Context Quality:** Evaluate whether the prompts produce high-fidelity documentation that provides sufficient depth for future development or PR reviews.

# Related Components
- `src/config/runtimeConfig.js`: Provides necessary configuration settings required for the Wiki system's operation.

# Repository Memory
- This module acts as the interface between the LLM and the repository's documentation generation process.
- It is designed to be the primary driver for creating and updating the markdown-based "Repository Memory" documentation used during pull request reviews.
