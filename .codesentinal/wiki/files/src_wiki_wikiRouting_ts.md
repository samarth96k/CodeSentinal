# Purpose

The `wikiRouting.ts` file acts as the primary interface for the LLM Wiki system, facilitating the generation, reading, and maintenance of repository knowledge.

# Responsibilities

- Coordinating the generation of repository memory.
- Managing the lifecycle of wiki documentation.
- Defining and enforcing the type contracts for wiki operations.

# Architectural Role

It functions as the Repository Knowledge Layer, providing the structural routing necessary for the system to access and update documentation regarding the codebase.

# Critical Review Context

When reviewing changes to this file, prioritize:
- **Knowledge Consistency:** Ensure that routing logic maintains the integrity of stored repository information.
- **Context Quality:** Verify that the routing mechanisms support high-quality documentation output suitable for LLM consumption.

# Related Components

- **Dependencies:** Relies on `src/wiki/utils/wikiWriter.js` for performing the underlying write operations for wiki content.

# Repository Memory

This component is the entry point for maintaining the "living documentation" of the repository. Changes here directly affect how future automated reviews access and interpret repository history and architectural intent. Modifications should be vetted to ensure they do not disrupt the automated retrieval or generation of wiki-based knowledge.
