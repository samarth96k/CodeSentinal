# Purpose
To serve as the core engine for the LLM Wiki system, enabling the automated generation, reading, and maintenance of repository-wide knowledge.

# Responsibilities
*   **Repository memory generation:** Constructing and updating structured documentation based on codebase analysis.
*   **Wiki lifecycle management:** Overseeing the creation and maintenance flow of wiki-related artifacts.
*   **LLM communication:** Managing the interface and transmission of data to/from the language model.
*   **Prompt orchestration:** Coordinating the sequence and structure of prompts to ensure accurate knowledge extraction and synthesis.

# Architectural Role
AI Integration Layer.

# Critical Review Context
When reviewing changes to this file, prioritize:
*   **Prompt correctness:** Ensure the underlying instruction sets are logically sound and effectively guide the LLM.
*   **Response validation:** Check that the mechanisms for parsing and verifying LLM outputs are robust.
*   **Knowledge consistency:** Verify that generated memory maintains a unified style and factual alignment with the codebase.
*   **Context quality:** Assess whether the provided prompts successfully supply the LLM with enough relevant information to produce high-fidelity documentation.

# Related Components
*   `src/config/runtimeConfig.js` (Configuration management)
*   `src/wiki/wikiTypes.js` (Type definitions for wiki artifacts)

# Repository Memory
This component functions as the primary bridge between the raw codebase and the high-level knowledge base. It is responsible for the automation of internal documentation. Changes here directly impact the quality and reliability of the `CodeSentinal` repository's self-generated intelligence. Future reviews should focus on how prompt variations affect the consistency of the stored knowledge.
