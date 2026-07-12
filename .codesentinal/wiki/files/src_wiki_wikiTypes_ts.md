# Purpose
The `wikiTypes.ts` file serves as the foundational type contract for the LLM Wiki system, which is responsible for generating, reading, and maintaining repository-level knowledge.

# Responsibilities
- Definition of type contracts for the Wiki system.
- Standardizing the structure for repository memory generation.
- Managing the lifecycle and format requirements for knowledge stored within the repository.

# Architectural Role
It acts as the Repository Knowledge Layer, ensuring that all documentation and context extracted for LLM consumption adheres to a consistent schema.

# Critical Review Context
When reviewing PRs affecting this file, focus on:
- **Knowledge Consistency:** Ensure that changes to type definitions do not break the schema required by the knowledge generation logic.
- **Context Quality:** Verify that any updates to the types support high-quality, actionable documentation for downstream LLM processes.

# Related Components
- LLM Wiki generation modules.
- Repository knowledge extraction services.
- Documentation maintenance utilities.

# Repository Memory
This file establishes the structural constraints for how the codebase represents itself to LLMs. Changes here have systemic impact on how repository memory is indexed and retrieved. It is intended to be the source of truth for the shape of all stored repository knowledge.
