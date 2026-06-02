# Purpose
To automate the maintenance, generation, and retrieval of repository knowledge via the LLM Wiki system, ensuring that project documentation remains synchronized with current codebase state.

# Responsibilities
*   Generating repository memory documents.
*   Managing the lifecycle of the internal Wiki.
*   Ensuring documentation remains accessible and actionable for LLM-based analysis.

# Architectural Role
Acts as the Repository Knowledge Layer, serving as the bridge between raw codebase state and structured, LLM-interpretable documentation.

# Critical Review Context
When reviewing PRs involving this component, focus on:
*   **Knowledge Consistency:** Ensure updates do not introduce contradictions between the Wiki and the actual repository state.
*   **Context Quality:** Verify that generated content provides high-utility information that reduces ambiguity for future developers and LLM agents.

# Related Components
*   The broader LLM Wiki system infrastructure.
*   Automated repository analysis tools that consume these memory files.

# Repository Memory
This component functions as the primary mechanism for codifying institutional knowledge. Changes to files under this category directly impact how the system "remembers" architectural decisions and component roles. Future PRs should verify if documentation updates are required to reflect systemic changes defined in the logic.
