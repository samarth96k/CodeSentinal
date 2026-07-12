# Purpose
The purpose of `src/wiki/updateWiki.ts` is to facilitate the maintenance, generation, and retrieval of repository knowledge within the LLM Wiki system. It serves as the primary mechanism for keeping the repository's internal documentation synchronized with its current state.

# Responsibilities
*   **Repository memory generation:** Automating the creation of knowledge artifacts based on the repository structure.
*   **Wiki lifecycle management:** Overseeing the updates, maintenance, and evolution of wiki content over time.

# Architectural Role
This module functions as the **Repository Knowledge Layer**. It acts as an intermediary that processes repository data to ensure the LLM-based documentation remains relevant and accurate.

# Critical Review Context
When reviewing changes to this file, maintain a strict focus on:
*   **Knowledge consistency:** Ensure that updates do not create conflicting information between different knowledge nodes.
*   **Context quality:** Verify that the logic used to generate documentation yields high-signal, relevant information for the LLM rather than noisy or redundant data.

# Related Components
*   `src/wiki/initWiki.js`: Handles the initial setup and configuration of the wiki environment.
*   `src/wiki/wikiTypes.js`: Defines the schema and data structures governing wiki entries.

# Repository Memory
The wiki system is designed as an LLM-driven documentation engine. Changes to the update logic directly impact the quality of the "repository brain." Future PRs should prioritize the integrity of the knowledge retrieval process to prevent the LLM from hallucinating outdated or incorrect repository architecture.
