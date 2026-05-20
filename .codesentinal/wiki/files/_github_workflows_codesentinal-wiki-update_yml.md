# `.github/workflows/codesentinal-wiki-update.yml`

This workflow is triggered on pull request events (`opened`, `synchronize`, `reopened`) to update the LLM Wiki documentation for the repository.

## Purpose

The primary purpose of this workflow is to automate the process of updating the LLM Wiki based on changes in the repository's code. It appears to be a component of a larger system named "CodeSentinal" for managing repository knowledge.

## Important Functions/Steps

1.  **Checkout PR branch**: Checks out the specific branch associated with the incoming pull request using `actions/checkout@v4`.
2.  **Setup Node**: Configures the Node.js environment to version 20 using `actions/setup-node@v4`.
3.  **Install dependencies**: Installs project dependencies using `npm ci`.
4.  **Build project**: Executes the project's build script using `npm run build`.
5.  **Update LLM Wiki**: Runs a Node.js script (`dist/wiki/updateWiki.js`) to generate or update the LLM Wiki content.
6.  **Commit updated wiki files**:
    *   Configures Git user credentials for `codesentinal-bot`.
    *   Stages changes in the `.codesentinal/wiki` directory.
    *   If there are staged changes (i.e., the wiki has been updated), it commits these changes with the message "docs: update CodeSentinal LLM wiki".
    *   Pushes the committed changes back to the repository.

## Risks

*   **Permissions**: The workflow has `contents: write` and `pull-requests: write` permissions. Ensure these are the minimum necessary permissions to prevent unintended modifications to the repository or pull requests.
*   **Trigger Usage**: The workflow is triggered by all `opened`, `synchronize`, and `reopened` events for pull requests. Depending on the volume of PRs, this could lead to frequent executions.

## PR Changes Review

When reviewing pull requests that modify this workflow file, consider the following:

*   **Security**: Verify that no malicious code is introduced, especially in the `npm ci`, `npm run build`, and `node dist/wiki/updateWiki.js` steps.
*   **Permissions**: Scrutinize any changes to the `permissions` block to ensure they adhere to the principle of least privilege.
*   **Workflow Logic**: Understand how changes to this file might alter the wiki update process, such as:
    *   Changes to the Node.js version.
    *   Modifications to dependency installation or build commands.
    *   Alterations to the wiki update script (`dist/wiki/updateWiki.js`) or its execution.
    *   Changes to the commit message or the target directory for wiki updates.
*   **Trigger Conditions**: Review any modifications to the `on:` block to ensure the workflow is triggered as intended.
*   **Branch Management**: Confirm that the checkout step (`ref: ${{ github.head_ref }}`) correctly targets the PR branch.
