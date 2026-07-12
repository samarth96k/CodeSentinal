# Purpose
The `wikiPatchApplier.ts` module serves as a core component of the LLM Wiki system, specifically designed to automate the generation, reading, and maintenance of repository knowledge.

# Responsibilities
*   **Repository memory generation:** Orchestrating the creation and updates of documentation files that encapsulate repository state.
*   **Wiki lifecycle management:** Overseeing the systematic maintenance and evolution of stored knowledge assets within the system.

# Architectural Role
It acts as the Repository Knowledge Layer, serving as the bridge between the LLM’s understanding of the codebase and the persistent documentation stored within the repository.

# Critical Review Context
When reviewing changes to this file, focus on:
*   **Knowledge consistency:** Ensuring that the logic for applying patches does not introduce contradictions or malformed data into the repository knowledge base.
*   **Context quality:** Verifying that the generated or modified documentation maintains a high standard of utility for future LLM-based analysis and human oversight.

# Related Components
*   `src/config/runtimeConfig.js`: Provides the necessary environment and configuration settings for patch application.
*   `src/wiki/utils/fileHelpers.js`: Supplies the low-level utility functions required for file I/O operations.
*   `src/wiki/wikiPathMapper.js`: Manages the resolution of paths for wiki-related files, ensuring patches are applied to the correct locations.

# Repository Memory
This component is the primary engine for updating the repository's self-documentation. Changes here directly impact the accuracy and reliability of the "knowledge" the LLM uses to understand the repository during subsequent tasks. Ensure that any modifications to the patch application logic preserve the integrity of the existing documentation structure.
