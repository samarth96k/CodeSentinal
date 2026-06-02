# Purpose

`src/wiki/llmWikiGenerator.ts` serves as the core engine for the LLM Wiki system, enabling the automated generation, retrieval, and maintenance of repository documentation and knowledge bases.

# Responsibilities

- **Repository memory generation:** Orchestrates the process of documenting repository state and structure.
- **Wiki lifecycle management:** Handles the creation, reading, and ongoing maintenance of wiki-based knowledge assets.
- **LLM communication:** Acts as the interface layer for transmitting requests to and receiving data from integrated LLM services.
- **Prompt orchestration:** Manages the construction and execution of prompts necessary to elicit accurate repository information.

# Architectural Role

This component functions as the **AI Integration Layer**, bridging the gap between the raw repository data and the LLM services required to process and document that data.

# Critical Review Context

When reviewing changes to this file, focus on the following areas:

- **Prompt correctness:** Verify that prompt structures remain effective for the intended knowledge extraction tasks.
- **Response validation:** Ensure that the mechanisms for parsing and verifying LLM outputs are robust and error-resistant.
- **Knowledge consistency:** Confirm that generated documentation aligns with the current state of the repository and existing wiki standards.
- **Context quality:** Assess whether the data injected into prompts provides sufficient information for the LLM to generate high-quality, relevant documentation.

# Related Components

- `src/llm.js`: Provides the underlying infrastructure for interacting with LLM services.
- `src/wiki/wikiTypes.js`: Defines the data structures and type contracts used for wiki management.

# Repository Memory

- The generator is designed to be the primary point of contact for automated knowledge maintenance within the system.
- It relies on strict prompt orchestration to ensure the outputs are standardized and useful for future development and PR reviews.
- The lifecycle management logic is tightly coupled with the repository's documentation needs, requiring careful attention to how wiki state is persisted and retrieved.
