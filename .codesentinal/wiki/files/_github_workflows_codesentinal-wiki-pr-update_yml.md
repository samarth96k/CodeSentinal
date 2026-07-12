# `.github/workflows/codesentinal-wiki-pr-update.yml`

This GitHub Actions workflow is triggered when a pull request is opened, synchronized, or reopened. Its primary purpose is to update LLM Wiki markdown files based on changes within the pull request. This workflow is a component of the CodeSentinal system for managing repository knowledge.

## Purpose

The workflow executes a Node.js script (`dist/index.js`) with the argument `wiki-update`. This script is responsible for interacting with LLM Wiki content, likely to incorporate changes from the pull request into the wiki's knowledge base.

## Important Functions/Steps

*   **`Checkout PR branch`**: Uses `actions/checkout@v4` to fetch the specific branch associated with the pull request. `persist-credentials: true` is used to maintain credentials for subsequent operations.
*   **`Setup Node.js`**: Configures the Node.js environment to version 24.
*   **`Install dependencies`**: Installs project dependencies using `npm ci`.
*   **`Build TypeScript`**: Compiles TypeScript code using `npm run build`. This is necessary to produce the `dist/index.js` executable.
*   **`Update LLM Wiki Markdown Files`**: This is the core step. It runs the compiled Node.js script.
    *   It is configured with two environment variables:
        *   `GITHUB_TOKEN`: Provided by GitHub Actions, used for authentication with the GitHub API.
        *   `GEMINI_API_KEY`: A secret that likely contains an API key for Google's Gemini models, suggesting that LLM generation or processing is involved in the wiki update.

## Risks and Security Considerations

*   **`GITHUB_TOKEN` Permissions**: The workflow has `contents: write` and `pull-requests: write` permissions.
    *   `contents: write`: Allows the workflow to push changes back to the repository. This should be carefully reviewed to ensure the script only makes intended modifications and doesn't introduce unintended data or code.
    *   `pull-requests: write`: Grants permission to modify pull requests, which might be used for adding comments or status checks.
    *   **Fork PR Safety**: The `if: github.event.pull_request.head.repo.full_name == github.event.pull_request.base.repo.full_name` condition is crucial. It ensures this workflow only runs on pull requests where the head repository is the same as the base repository (i.e., not from forks). This prevents untrusted code from executing with write permissions on the main repository.
*   **Workflow File Permissions**: The overall workflow file should have minimal permissions necessary for its function. Any unnecessary broad permissions increase the attack surface.
*   **Secret Management**: The reliance on `GEMINI_API_KEY` as a secret means it should be managed securely within GitHub's secrets store. Unauthorized access to this secret could compromise the LLM service.

## Pull Request Review Guidelines

When reviewing changes to this workflow:

1.  **Trigger Conditions**: Verify that the `on.pull_request.types` correctly capture the desired events for wiki updates.
2.  **Permissions**: Scrutinize the `permissions` block. Ensure that `contents: write` and `pull-requests: write` are absolutely necessary and that no broader permissions are granted.
3.  **Branch Protection**: Confirm that this workflow is protected by branch protection rules to prevent it from being bypassed.
4.  **Node.js Script Logic**: Pay close attention to any changes in the `npm run build` command or the Node.js script itself (`dist/index.js`). The logic within this script is critical for determining what gets updated in the LLM Wiki.
5.  **Environment Variables**: Ensure that new secrets are not introduced without proper justification and security review. Verify that the existing secrets (`GITHUB_TOKEN`, `GEMINI_API_KEY`) are used in a secure and intended manner.
6.  **Fork PR Safeguard**: Reaffirm the presence and correctness of the `if` condition that prevents execution on forks.
