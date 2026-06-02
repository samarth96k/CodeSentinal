# Purpose
The `wikiReviewTypes.ts` file acts as the foundational type definition layer for the LLM Wiki system, which is designed to facilitate the generation, maintenance, and consumption of repository knowledge.

# Responsibilities
*   **Repository Memory Generation:** Providing the schema and structures required to document repository state.
*   **Wiki Lifecycle Management:** Defining the data contracts necessary for tracking the evolution of documentation.
*   **Pull Request Review Generation:** Supplying the formal structures needed to automate or assist in PR-related knowledge synthesis.
*   **Type Contract Definition:** Ensuring type safety across the knowledge management stack.

# Architectural Role
It serves as the **Repository Knowledge Layer**, functioning as the source of truth for the data shapes used by the LLM Wiki system to interact with repository intelligence.

# Critical Review Context
When reviewing changes related to this file, maintain focus on:
*   **Knowledge Consistency:** Ensure changes to types do not break the structural integrity of existing stored memory.
*   **Context Quality:** Verify that any adjustments to data schemas support the extraction of high-quality, relevant context for LLM consumption.

# Related Components
*   `src/chunk.js`: Primary dependency for data segmentation and handling.

# Repository Memory
This component establishes the interface boundaries for CodeSentinal's knowledge extraction and review processes. It is the primary file for managing how repository intelligence is structured before being utilized in automated PR review workflows.
