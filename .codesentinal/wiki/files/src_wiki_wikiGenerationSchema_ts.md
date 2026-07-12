# Purpose

To serve as the definitive type contract and structural definition for the LLM-powered Wiki system, enabling the automated generation, reading, and maintenance of repository knowledge.

# Responsibilities

- Defining the structural schema for repository memory.
- Establishing type contracts for knowledge ingestion and retrieval.
- Managing the lifecycle and consistency requirements of Wiki-based documentation.

# Architectural Role

Repository Knowledge Layer: Acts as the foundational data schema that informs how the system interprets and stores repository intelligence for use by LLM agents.

# Critical Review Context

- **Knowledge Consistency:** Ensure that any modifications to the schema do not break the contract required by the Wiki generation and reading utilities.
- **Context Quality:** Evaluate whether changes to the schema support or degrade the LLM's ability to retrieve high-quality, actionable repository insights.

# Related Components

- LLM Wiki generation modules.
- Repository intelligence storage/retrieval systems.

# Repository Memory

This file is the single source of truth for the Wiki system's data structure. When reviewing PRs that touch this file, verify that the schema remains extensible yet strictly typed to prevent "knowledge drift" where repository documentation becomes disconnected from the actual codebase structure.
