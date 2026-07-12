# Coding Rules & Review Expectations

This document outlines the standards for contributing to this repository. All contributors and maintainers must adhere to these rules to ensure security, maintainability, and code quality, especially given our integration of automated AI-driven review workflows.

---

## 1. Security & Safety First
Given the nature of our project (which handles AI interactions and GitHub automation), security is the highest priority.

*   **No `eval()` Usage:** The use of `eval()` is strictly prohibited. It introduces critical remote code execution vulnerabilities. Any use of `eval()` will result in an immediate PR rejection. Use safe alternatives like `new Function()` (with extreme caution) or formal JSON/expression parsers.
*   **Safe JSON Parsing:** Always use `try-catch` blocks when parsing JSON. Never assume the structure of external payloads (from OpenAI or GitHub API). Use **Zod** for schema validation at the boundaries of the application.
*   **PR Security (`pull_request_target`):** Workflows using `pull_request_target` operate with broader permissions. **Never** execute code directly from a PR branch in these workflows. Only use them for metadata processing or safe commenting.
*   **Secret Management:** Never log or expose environment variables. Use `process.env` safely. If a secret is missing, fail fast with a descriptive error message rather than proceeding with undefined values.

## 2. TypeScript & Type Safety
*   **Avoid `any`:** The usage of `any` is prohibited. If you do not know a type, use `unknown` and implement type guards or Zod schemas to narrow the type.
*   **Strict Mode:** Ensure `tsconfig.json` maintains strict mode settings. Do not bypass type errors with `// @ts-ignore`.
*   **Zod Integration:** Use Zod for runtime validation of API responses from OpenAI and GitHub. This ensures that our TypeScript interfaces match the actual data received.

## 3. GitHub Actions & Workflows
*   **Principle of Least Privilege:** GitHub Actions permissions must be scoped to the minimum required. Avoid `permissions: write-all`.
*   **Fork PR Safety:** When reviewing forks, assume untrusted input. Ensure that tokens are not leaked to external contributors via workflow logs or automated feedback comments.
*   **Documentation:** If adding a new workflow, you must provide a corresponding example in the `/examples` directory.

## 4. Code Quality & Maintenance
*   **Modularity:** Keep logic separated from workflow execution. Logic should exist in tested TypeScript modules, not buried in `.yml` files.
*   **Error Handling:** Every API call (GitHub Octokit or OpenAI) must be wrapped in error handling that differentiates between network issues, authentication failures, and rate limits.
*   **Maintainability:** All code must be readable. If a function exceeds 20 lines, consider decomposing it. Use descriptive variable names that reflect the intent of the AI-driven logic.

## 5. Review Checklist for Maintainers
Before merging any Pull Request, ensure the following has been verified:

- [ ] **Security:** No instances of `eval()` are present.
- [ ] **Types:** No `any` types were introduced.
- [ ] **Validation:** All external API inputs are validated using Zod schemas.
- [ ] **Secrets:** Environment variables are accessed safely; no sensitive data is logged.
- [ ] **Permissions:** GitHub Action workflows use granular permissions.
- [ ] **Robustness:** Added code handles invalid JSON/malformed responses gracefully.

---

*Failure to comply with these rules will result in a request for changes. We prioritize long-term project stability and security over quick merges.*
