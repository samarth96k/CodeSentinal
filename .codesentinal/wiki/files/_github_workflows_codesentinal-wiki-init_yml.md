# CodeSentinal Wiki Init Workflow

This workflow, `.github/workflows/codesentinal-wiki-init.yml`, is responsible for initializing and updating the LLM Wiki for the repository. It triggers automatically when a new branch is created in the repository.

## Purpose

The primary purpose of this workflow is to leverage an LLM (presumably Gemini, given the `GEMINI_API_KEY` secret) to generate and maintain a wiki for the codebase. This involves checking out the created branch, building the project, running an initialization script for the wiki, and then committing any generated wiki files back to the same branch.

## Important Functions/Steps

1.  **`Checkout created branch`**: Uses `actions/checkout@v4` to fetch the code from the newly created branch.
2.  **`Setup Node`**: Configures Node.js version 20 for subsequent script execution.
3.  **`Install dependencies`**: Runs `npm ci` to install project dependencies.
4.  **`Build project`**: Executes `npm run build` to compile the project, likely preparing the necessary JavaScript files for the wiki initialization.
5.  **`Initialize LLM Wiki`**: This is the core step. It runs `node dist/wiki/initWiki.js`. This script is responsible for interacting with the LLM using the `GEMINI_API_KEY` and potentially using a configuration value `CODE_SENTINAL_MAX_WIKI_FILES` to generate wiki content.
6.  **`Commit wiki files`**: Configures Git credentials for a bot user, stages any changes within the `.codesentinal/wiki` directory, commits them with a message "docs: initialize CodeSentinal LLM wiki" if there are modifications, and finally pushes these changes back to the branch that triggered the workflow.

## Risks

*   **Workflow File Modification**: As a workflow file, any changes to this file could alter the repository's CI/CD pipeline. It is crucial to ensure minimal permissions are granted and that triggers are used safely.
*   **Secret Management**: The workflow relies on `secrets.GEMINI_API_KEY`. Unauthorized access to this secret could lead to misuse of the Gemini API.
*   **Uncontrolled Wiki Generation**: If the LLM or the `initWiki.js` script has unintended behavior, it could lead to the generation of inaccurate or unwanted wiki content. The `CODE_SENTINAL_MAX_WIKI_FILES` parameter is a potential control, but its effectiveness depends on the script's implementation.
*   **Accidental Commits/Pushes**: Improper handling of Git operations within the workflow could lead to unintended commits or pushes, especially if the `git add .codesentinal/wiki` and subsequent commit/push logic is flawed.

## Pull Request Review Guidance

When reviewing changes to this file, consider the following:

*   **Trigger Logic**: Ensure the `on: create:` trigger is appropriate and that the `if: github.event.ref_type == 'branch'` condition correctly filters for branch creation events.
*   **Permissions**: Verify that the `permissions: contents: write` are strictly necessary and not overly permissive.
*   **Dependencies and Build Steps**: Confirm that any changes to `npm ci` or `npm run build` are valid and do not introduce vulnerabilities or errors.
*   **LLM Interaction Script**: Scrutinize any modifications to the `Initialize LLM Wiki` step, particularly changes to the `dist/wiki/initWiki.js` script, environment variables (`GEMINI_API_KEY`, `CODE_SENTINAL_MAX_WIKI_FILES`), or how they are used. The logic for generating wiki content should be reviewed for correctness and safety.
*   **Git Commit and Push Logic**: Carefully examine the `Commit wiki files` step. Ensure the Git configuration, staging (`git add`), commit message, and push commands are robust and correctly implemented to prevent unintended side effects.
*   **Bot Identity**: Confirm the bot user (`codesentinal-bot`) and its email are configured appropriately.
*   **Potential for Infinite Loops**: Although not immediately apparent, consider if any logic could lead to a recursive trigger or an uncontrolled series of wiki updates.
