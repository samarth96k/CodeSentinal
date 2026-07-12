# Purpose
The `wikiConfig.ts` file defines the foundational configuration for the LLM Wiki system, which is responsible for generating, reading, and maintaining structured repository knowledge.

# Responsibilities
*   **Repository memory generation:** Managing the parameters and logic required to extract and synthesize repository information into readable formats.
*   **Wiki lifecycle management:** Controlling the operational phases of the wiki system, from initial generation to ongoing maintenance of the knowledge base.

# Architectural Role
It serves as the Repository Knowledge Layer, acting as the configuration authority for how the system documents and preserves technical context within the codebase.

# Critical Review Context
When reviewing PRs related to this file, focus on:
*   **Knowledge consistency:** Ensuring that configuration changes do not lead to fragmented or contradictory documentation across different parts of the repository.
*   **Context quality:** Verifying that settings promote the generation of high-signal, relevant information rather than noise.

# Related Components
*   LLM Wiki generation modules.
*   Knowledge storage/retrieval systems dependent on wiki metadata.

# Repository Memory
This configuration file is the control plane for the wiki system. Modifications here directly impact the depth and accuracy of the repository's self-documentation. Future reviews should treat changes to this file as high-impact, as they determine the quality of the "memory" available to the LLM during subsequent development or review tasks.
