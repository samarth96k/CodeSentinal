# Architecture: CodeSentinal

CodeSentinal is a TypeScript-based GitHub Action designed to automate code reviews and maintain repository documentation (Wiki) using LLMs. The architecture is modular, separating infrastructure adapters (workflows) from core application logic and data processing.

## System Overview

The system operates as a set of GitHub Actions that ingest repository changes or PR diffs, process them through an LLM integration layer, and output insights, reviews, or updated documentation.

### Core Modules

1.  **Infrastructure Adapters (GitHub Actions Workflows):**
    *   `.github/workflows/codeSentinal.yml`: Manages the primary PR review lifecycle and GitHub API communication.
    *   `.github/workflows/codesentinal-wiki-*.yml`: Specialized adapters for managing the LLM-driven Wiki system, handling repository memory generation and Wiki lifecycle events.

2.  **Change Processing Layer (`src/diffParser.ts`):**
    *   Responsible for parsing raw git diffs into structured data.
    *   Extracts code changes and maps files to their respective languages.
    *   Utilizes type definitions from `src/chunk.ts` to ensure consistency across the pipeline.

3.  **Application Logic:**
    *   `src/index.ts`: The primary entrypoint for the Node.js application.
    *   `src/chunk.ts`: Defines the core data contracts (`ParsedFile`, `ParsedChange`, `AddedLine`) that drive the internal data structure.
    *   `src/config/runtimeConfig.ts`: Manages global configuration (`CONFIG`) parsed at runtime.
    *   `action.yml`: Defines the interface for the GitHub Action, exposing inputs and configuration to the repository environment.

4.  **Repository Knowledge Layer:**
    *   Represented by various YAML examples (e.g., `examples/codesentinal-wiki-update.yml`). These define the automation strategy for maintaining the "repository memory."

## Data Flow

1.  **Trigger:** A GitHub event (e.g., `pull_request`, `push`) triggers one of the configured workflows.
2.  **Input/Config:** The action consumes configuration via `action.yml` and `dotenv` variables.
3.  **Parsing:** `src/diffParser.ts` receives the raw diff from the GitHub API (via `octokit`) and produces an array of `ParsedFile` objects.
4.  **Processing:**
    *   **Review Mode:** The `Agent` (defined in `action-dist/669.index.js`) processes the parsed chunks via the OpenAI API to generate review comments.
    *   **Wiki Mode:** The system updates repository knowledge documentation based on the current state and recent history.
5.  **Output:** The Action interacts with the GitHub API to post review comments or commit documentation updates to the Wiki.

## Technology Stack

*   **Runtime:** Node.js (TypeScript)
*   **Infrastructure:** GitHub Actions, GitHub Octokit
*   **Intelligence:** OpenAI API
*   **Validation:** Zod (used for runtime schema validation)
*   **Configuration:** `dotenv`

## Review Implications

When reviewing PRs for this repository, consider the following:

*   **Type Safety:** Changes to `src/chunk.ts` significantly impact the parser and the LLM prompting logic. Ensure all `ParsedFile` or `ParsedChange` modifications are reflected in downstream logic.
*   **API Limits:** Changes affecting how frequently the `OpenAI API` is called must be evaluated against cost and rate limits (managed in `src/cost.ts`).
*   **Infrastructure Coupling:** Changes to `action.yml` or the workflow files directly alter how users interact with the tool. Ensure inputs remain backwards compatible with existing example files in the `examples/` directory.
*   **Dist Files:** The repository contains `action-dist/` files. Ensure that the source code (`src/`) is correctly transpiled and that manual changes are not inadvertently made to the `dist` files during reviews.
