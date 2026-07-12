# Purpose
Handles communication with the language model and manages the construction and orchestration of prompts.

# Responsibilities
* Facilitates direct communication with the LLM.
* Orchestrates prompt generation.
* Defines and enforces type contracts for model interactions.

# Architectural Role
Acts as the AI Integration Layer for the repository.

# Critical Review Context
* **Prompt Correctness:** Ensure all generated prompts align with expected schema and intent.
* **Response Validation:** Verify that incoming model responses are validated against the defined type contracts.
* **Risk Mitigation:** Closely monitor error handling, specifically concerning environment variable reliance and JSON parsing.

# Related Components
* `src/config/runtimeConfig.js`
* `src/prompt.js`
* `src/wiki/wikiReviewTypes.js`

# Repository Memory
* **Environment Security:** The module relies on environment variables for configuration. Future PRs should verify that there is robust handling for missing or malformed secrets.
* **Parsing Safety:** Since the module parses JSON from model responses, reviewers must ensure that defensive coding practices are in place to handle invalid or malformed JSON payloads gracefully without crashing the integration layer.
