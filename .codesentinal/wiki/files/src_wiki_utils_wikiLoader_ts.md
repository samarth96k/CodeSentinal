# Purpose
The `wikiLoader.ts` module serves as a core component of the LLM Wiki system, facilitating the generation, reading, and maintenance of repository knowledge.

# Responsibilities
- Managing the lifecycle of wiki-based documentation.
- Handling the generation and retrieval of repository memory files to support LLM-driven knowledge management.

# Architectural Role
This module functions as the Repository Knowledge Layer within the system architecture.

# Critical Review Context
When reviewing changes to this file, focus on:
- **Knowledge Consistency:** Ensuring that the structures generated or maintained remain coherent across the repository.
- **Context Quality:** Verifying that the content generated is high-quality and suitable for informing LLM operations.

# Related Components
- `src/wiki/utils/fileHelpers.js`: Provides the underlying file system operations required for wiki management.

# Repository Memory
`wikiLoader.ts` is the primary interface for repository intelligence tasks. It acts as the gatekeeper for how information is persisted and read back into the system, directly impacting the accuracy of the LLM's understanding of the codebase.
