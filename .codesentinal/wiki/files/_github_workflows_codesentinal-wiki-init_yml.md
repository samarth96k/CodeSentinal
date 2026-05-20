# Workflow: `.github/workflows/codesentinal-wiki-init.yml`

This workflow is triggered on the `create` event, specifically when a new branch is created in the repository. Its primary purpose is to initialize the LLM Wiki for the repository using the CodeSentinal system.

## Purpose

The workflow automates the process of setting up the initial structure and content for the LLM Wiki. It checks out the newly created branch, installs Node.js dependencies, builds the project, and then runs a Node.js script (`dist/wiki/initWiki.js`) to generate the initial wiki files. Finally, it commits these generated wiki files back to the repository.

## Important Functions/Steps

1.  **`actions/checkout@v4`**: Checks out the content of the newly created branch.
2.  **`actions/setup-node@v4`**: Sets up the Node.js environment (version 20) to run the wiki initialization script.
3.  **`npm ci`**: Installs project dependencies.
4.  **`npm run build`**: Builds the project, likely compiling TypeScript or other code needed for the wiki initialization script.
5.  **`node dist/wiki/initWiki.js`**: This is the core step that initializes the LLM Wiki. It utilizes `GEMINI_API_KEY` (retrieved from GitHub secrets) and `CODE_SENTINAL_MAX_WIKI_FILES` environment variables.
6.  **Commit wiki files**: Configures Git with bot credentials, stages the generated wiki files located in `.codesentinal/wiki`, and commits them with a descriptive message. If there are changes, it pushes them back to the newly created branch.

## Risks

*   **Workflow File Permissions**: The `permissions: contents: write` grants the workflow the ability to write to the repository. This is necessary for committing the wiki files, but should be carefully monitored to ensure it's not exploited.
*   **Trigger Usage**: The workflow is triggered on `create`. This means it will run every time a new branch is created. If this is not the intended behavior for all branch creations, the `if` condition or trigger might need refinement.
*   **Secret Management**: The workflow relies on `secrets.GEMINI_API_KEY`. Ensure this secret is properly secured and only accessible to authorized personnel.

## Pull Request Review Guidance

When reviewing changes to this workflow file, consider the following:

*   **Trigger Logic**: Does the `on: create:` trigger align with the intended use case? Are there any unintended consequences for specific branch naming conventions or creation scenarios?
*   **Permissions**: Verify that the granted `permissions` are strictly necessary for the workflow's function. `contents: write` is required for committing, but ensure no broader permissions are inadvertently granted.
*   **Dependencies**: Check if any new dependencies are introduced by `npm ci` that might pose a security risk.
*   **Build and Script Execution**: Ensure that the `npm run build` command and the `node dist/wiki/initWiki.js` script are functioning as expected and not introducing vulnerabilities.
*   **Environment Variables**: Confirm that `GEMINI_API_KEY` and `CODE_SENTINAL_MAX_WIKI_FILES` are being used appropriately and securely.
*   **Commit Logic**: Review the Git commit and push commands to ensure they are correctly adding, committing, and pushing only the intended wiki files to the correct branch. The commit message should be informative.
*   **Error Handling**: While not explicitly present, consider if any basic error handling would be beneficial in case the wiki initialization fails.
